///@ts-check
import { NamedRouting } from './named-routing.js'

export class RouterElement extends HTMLElement {
  /**
   * Event handler for handling when child router is added.
   * This function is called in the scope of RouterElement for the top level collection of routers and instacnes of RotuerElement for nested router collections.
   * Used to link up RouterElements with child RouterElements even through Shadow DOM.
   * @param {CustomEvent} event - routerAdded event
   */
  static handlerAddRouter(event) {
    RouterElement.addRouter.call(this, event.detail.router);
    event.stopPropagation();
    event.detail.parentRouter = this;
  }

  static handlerRouterLinksAdded(event) {
    if (event.detail.links) {
      event.detail.onRegistered = RouterElement.registerLinks(event.detail.links);
    }
  }

  static handlerNavigate(event) {
    if (event.detail.href) {
      event.detail.onNavigated = RouterElement.navigate(event.detail.href);
    }
  }

  /** 
   * Used to link up RouterElements with child RouterElements even through Shadow DOM.
   * @param {RouterElement} router - routerElement to add. RouterElement after the first can be thought of as auxilary RouterElements
   */
  static addRouter(router) {
    this._routers.push(router);
  }

  /**
   * Removes a RouterElement from the routing process.
   * @param {RouterElement} routerElement 
   */
  static removeRouter(routerElement) {
    var routerIndex = this._routers.indexOf(routerElement);
    if (routerIndex > -1) {
      this._routers.splice(routerIndex, 1);
    }
  }

  /**
   * Global handler for hash changes
   */
  static changeHash() {
    // TODO
    // let hash = RouterElement._getHash();
    // RouterElement.dispatch(_changeHash(hash));
  }

  /**
   * Global handler for url changes.
   * Should be called if the user changes the URL via the URL bar or navigating history
   */
  static async changeUrl() {
    let hash = RouterElement._getHash();
    let path = decodeURIComponent(window.location.pathname);
    let query = window.location.search.substring(1);

    let oldRoute = RouterElement._route;
    if (!RouterElement._initialized) {
      return false;
    }

    if (oldRoute.path === path && oldRoute.query === query && oldRoute.hash === hash) {
      // Nothing to do, the current URL is a representation of our properties.
      return false;
    }

    var newUrl = RouterElement._getUrl(window.location);
    await RouterElement.dispatch(newUrl, true);
  }
  
  /**
   * Global handler for page clicks. Filters out and handles clicks from links.
   * @param {(MouseEvent|HTMLAnchorElement|string)} navigationSource - The source of the new url to navigate to. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
   */
  static async navigate(navigationSource) {
    let event = null;
    let anchor = null;

    if (navigationSource instanceof Event) {
      event = navigationSource;

      // If already handled and canceled
      if (event.defaultPrevented) {
        return;
      }
    } else if (typeof navigationSource !== 'string') {
      anchor = navigationSource;
    }
    
    var href = RouterElement._getSameOriginLinkHref(navigationSource);

    if (href === null) {
      return;
    }

    if (!href) {
      let target = ((event && event.target) || anchor);
      if (target) {
        /**
         * Event that fires if a link is not handled due to it not being same origin or base url.
         * @event RouterElement#onRouteCancelled
         * @type CustomEvent
         * @property {Object} details - The event details
         * @property {RouteElement} details.url - The url that was trying to be matched.
         */
        target.dispatchEvent(
          new CustomEvent(
            'onRouteNotHandled',
            {
              bubbles: true,
              composed: true,
              detail: { href }}));
      }
      return;
    }

    event && event.preventDefault();

    // If the navigation is to the current page we shouldn't add a history
    // entry or fire a change event.
    if (href === window.location.href) {
      return;
    }

    let url = new URL(href);
    var newUrl = RouterElement._getUrl(url);
    await RouterElement.dispatch(newUrl);
  }

  /**
   * Clears all current match information for all available routers.
   * This initializes ready for the next matching.
   */
  static prepareRoutersForDispatch(routers) {
    routers = routers || RouterElement._routers;
    if (routers) {
      for (let i = 0, iLen = routers.length; i < iLen; i++) {
        let router = routers[i];
        
        router.clearCurrentMatch();

        let childRouters = router._routers;
        this.prepareRoutersForDispatch(childRouters);
      }
    }
  }

  /**
   * Common entry point that starts the routing process.
   * @param {string} url
   * @param {boolean} [skipHistory]
   * @fires RouterElement#onRouteCancelled
   */
  static async dispatch(url, skipHistory) {
    // console.info('dispatch: ' + url);
    let basePath = RouterElement.baseUrlSansHost();
    let shortUrl = url.substr(basePath.length);
    RouterElement._route = {
      url: shortUrl
    }

    // Check if all current routes wil let us navigate away
    if (RouterElement._activeRouters.length && RouterElement._activeRouters.every((r) => r.route.canLeave(RouterElement._route)) === false) {
      /**
       * Event that fires if a RouteElement refuses to let us perform routing.
       * @event RouterElement#onRouteCancelled
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */
      RouterElement._activeRouters[0].router.dispatchEvent(
        new CustomEvent(
          'onRouteCancelled',
          {
            bubbles: true,
            composed: true,
            detail: { shortUrl }}));
      return;
    }

    RouterElement._activeRouters = [];

    this.prepareRoutersForDispatch();

    if (await RouterElement.performMatchOnRouters(shortUrl, RouterElement._routers) && skipHistory !== true) {
      RouterElement.updateHistory(url);
      RouterElement.updateAnchorsStatus();
    }
  }

  /** Updates the location history with the new href */
  static updateHistory(href) {
    let urlState = RouterElement.getUrlState();
    let url = urlState;

    if (url.length === 2) {
      url = href;
    } else {
      url = document.baseURI + url;
    }

    // Need to use a full URL in case the containing page has a base URI.
    let fullNewUrl = new URL(url, window.location.protocol + '//' + window.location.host).href;
    let oldRoute = RouterElement._route;
    let now = window.performance.now();
    let shouldReplace = oldRoute._lastChangedAt + RouterElement._dwellTime > now;
    oldRoute._lastChangedAt = now;

    if (shouldReplace) {
      window.history.replaceState({}, '', fullNewUrl);
    } else {
      window.history.pushState({}, '', fullNewUrl);
    }
  }

  /**
   * Sets the active status of any registered links based on the current URL
   * @param {string} [url] url to match against for link status
   * @param {any[]} [links] optional list of links to update the status for
   * @returns {Promise} Named items require parsing and processing prior to being analyzed. Resolved when named items are finished parsed and processed.
   */
  static async updateAnchorsStatus(url, links) {
    url = url || RouterElement.getUrlState();
    let currentAnchors = links || RouterElement._anchors;
    let nextAnchors = [];

    // Tidy up any unconnected anchors
    for (let i = 0, iLen = currentAnchors.length; i < iLen; i++) {
      if (currentAnchors[i].a.isConnected === true) {
        let link = currentAnchors[i];
        nextAnchors[nextAnchors.length] = link;
        link.a.classList.remove(link.a.getAttribute('activeclassname') || link.a.activeClassName || 'active');
      }
    }

    let urlFragments = url.split('::');
    nextUrlFragment:
    for (let j = 0, jLen = urlFragments.length; j < jLen; j++) {
      let urlFragment = urlFragments[j];
      let urlFragNamedItemMatch = await NamedRouting.parseNamedItem(urlFragment, true);
      nextLink:
      for (let i = 0, iLen = nextAnchors.length; i < iLen; i++) {
        let link = nextAnchors[i];
        if (link && link.a.classList.contains(link.a.getAttribute('activeclassname') || link.a.activeClassName || 'active')) {
          continue nextLink;
        }
        if (link) {
          if (link.routerMatches) {
            let named = link.routerMatches.named;
            let routes = link.routerMatches.routes;
            if (urlFragNamedItemMatch) {
              for (let k = 0, kLen = named.length; k < kLen; k++) {
                if (named[k].name == urlFragNamedItemMatch.name) {
                  // TODO strip import out of both before compare
                  if (named[k].url == urlFragNamedItemMatch.urlEscaped) {
                    // full match on named item
                    link.a.classList.add(link.a.getAttribute('activeclassname') || link.a.activeClassName || 'active');
                    link = null;
                    continue nextLink;
                  } else 
                  //Check if it's a mtch upto data portion of url
                  if (urlFragNamedItemMatch.urlEscaped.indexOf(named[k].url) === 0) {
                    // full match on named item
                    link.a.classList.add(link.a.getAttribute('activeclassname') || link.a.activeClassName || 'active');
                    link = null;
                    continue nextLink;
                  }
                }
              }
            }
            urlFragment = urlFragment[0] === '/' ? urlFragment.substr(1) : urlFragment;
            for (let k = 0, kLen = routes.length; k < kLen; k++) {
              let routeUrl = routes[k][0] === '/' ? routes[k].substr(1) : routes[k];

              if (urlFragment == routeUrl) {
                // full match on route
                link.a.classList.add(link.a.getAttribute('activeclassname') || link.a.activeClassName || 'active');
                link = null;
                continue nextLink;
              } else if (urlFragment.indexOf(routeUrl) === 0) {
                // partial match on route
                link.a.classList.add(link.a.getAttribute('activeclassname') || link.a.activeClassName || 'active');
                link = null;
                continue nextLink;
              }
            }
          }
        }
      }
    }

    /**
     * Event that fires when HTMLAnchorElement active statuses are being updated as part of a routing.
     * @event RouterElement#onRouteCancelled
     * @type CustomEvent
     * @property {Object} details - The event details
     * @property {RouteElement} details.url - The url that was trying to be matched.
     */
    window.dispatchEvent(
      new CustomEvent(
        'onLinkActiveStatusUpdated',
        {
          bubbles: true,
          composed: true,
          detail: { links: nextAnchors }}));
          
    return null;
  }

  /**
   * Gets the current URL state based on currently active routers and outlets.
   * @param {RouterElement[]} [routers]
   */
  static getUrlState(routers) {
    let url = NamedRouting.generateNamedItemsUrl();
    routers = routers || RouterElement._routers;
    if (routers) {
      for (let i = 0, iLen = routers.length; i < iLen; i++) {
        let router = routers[i];
        var nextFrag = router.generateUrlFragment();
        if (nextFrag) {
          if (url.length) {
            url += '::';
          }
          url += nextFrag;
          let childRouters = router._routers;
          if (childRouters && childRouters.length) {
            if (childRouters.length === 1) {
              url += ('/' + this.getUrlState(childRouters));
            } else {
              url += ('/(' + this.getUrlState(childRouters) + ')');
            }
          }
        }
      }
    }
    return url;
  }

  /**
   * Iterates over each child RouterElement and calls it to match it portion of the current URL.
   * @param {string} url - While URL. Will be parsed for individual router URLs.
   * @param {RouterElement[]} routers
   * @returns {Promise<boolean>} resolves when matching is complete. false if matching was cancelled.
   */
  static async performMatchOnRouters(url, routers) {
    // console.info('performMatchOnRouters: ' + url);
    // TODO query string data should be placed on RouterElement so it's accessible across all outlets. It's regarded as shared data across the routers.
    // TODO Maybe have a way to regiser for changes to query string so routes can react
    // TODO auxilary routers - start unit testing
    if (url[0] === '(') {
      url = url.substr(1,url.length - 2);
    }
    let urls = RouterElement.splitUrlIntoRouters(url);
    let urlsWithoutNamedOutlets = [];

    for(let i = 0, iLen = urls.length; i < iLen; i++) {
      let match = await NamedRouting.parseNamedItem(urls[i]);
      if (match && match.cancelled) {
        return false;
      }
      if(!match) {
        urlsWithoutNamedOutlets.push(urls[i]);
      }
    }

    let i = 0;
    for (let iLen = routers.length; i < iLen; i++) {
      let router = routers[i];
      if (urlsWithoutNamedOutlets[i]) {
        await router.performMatchOnRouter(urlsWithoutNamedOutlets[i] || '');
      }
    }
    RouterElement.updateAnchorsStatus();
    return true;
  }

  static splitUrlIntoRouters(url) {
    var urls = [];
    var skip = 0;
    for (var i = 0, lastI = i, iLen = url.length; i < iLen; i++) {
      const char = url[i];
      if (char === '(') {
        skip++;
      } else if (char === ')') {
        skip--;
      } else if (char === ':' && url[i+1] === ':' && skip === 0) {
        urls.push(url.substring(lastI + (url[lastI] === ':' ? 1 : 0), i));
        i++;
        lastI = i;
      }
    }
    if (url[lastI] === '(' || url[lastI] === ')' || url[lastI] === ':') {
      lastI++;
    }
    if (i > lastI) {
      urls.push(url.substr(lastI));
    }

    for (let j = 0, jLen = urls.length; j < jLen; j++) {
      if (urls[j][0] === '/') {
        urls[j] = urls[j].substr(1);
      }
      if (urls[j][0] === '(' && urls[j][urls[j].length-1] === ')') {
        urls[j] = urls[j].substr(1, urls[j].length - 2);
      }
    }

    return urls;
  }

  /**
   * Registers HTMLAnchorElements so that they become candidates route status styling.
   * @param {HTMLAnchorElement[]} links 
   * @param {string} [activeClassName]
   */
  static async registerLinks(links, activeClassName) {
    // console.info('registerLinks');
    RouterElement.removeDisconnectedAnchors();

    const newAnchors = [];

    // Add the new anchors
    for (let i = 0, iLen = links.length; i < iLen; i++) {
      const link = links[i];
      if (link.href) {
        let matches = await RouterElement.sanitizeLinkHref(link);
        if (matches) {
          if (activeClassName && !link.hasAttribute('activeclassname')) {
            link.setAttribute('activeclassname', activeClassName);
          }
          newAnchors[newAnchors.length] = {
            a: link,
            routerMatches: matches
          };
          for (let j = 0, jLen = matches.named.length; j < jLen; j++) {
            NamedRouting.prefetchNamedOutletImports(matches.named[j]);
          }
        }
      }
    }

    RouterElement._anchors = RouterElement._anchors.concat(newAnchors);

    RouterElement.updateAnchorsStatus(undefined, newAnchors);
  }

  static removeDisconnectedAnchors() {
    const currentAnchors = RouterElement._anchors;
    const nextAnchors = [];

    // Tidy up any unconnected anchors
    for (let i = 0, iLen = currentAnchors.length; i < iLen; i++) {
      if (currentAnchors[i].a.isConnected === true) {
        nextAnchors[nextAnchors.length] = currentAnchors[i];
      }
    }

    // Do this after pushing history location state
    RouterElement._anchors = nextAnchors;
  }

  /**
   * @typedef {Object} AssignmentMatches
   * @property {string[]} routes - Assignments of type router
   * @property {import('./named-routing').NamedMatch[]} named - Assignments of type namedItems
   */
  /**
   * 
   * @param {(MouseEvent|HTMLAnchorElement|string)} hrefSource - The source of the new url to handle. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
   * @returns {Promise<AssignmentMatches>} assignmentMatches
   * 
   */
  static async sanitizeLinkHref(hrefSource) {
    let href = RouterElement._getSameOriginLinkHref(hrefSource);
    let url = new URL(href);
    let hash = RouterElement._getHash();
    let path = decodeURIComponent(url.pathname);
    let query = url.search.substring(1);
    let basePathLength = RouterElement.baseUrlSansHost().length;
    let urlStr = path.substr(basePathLength);
    if (urlStr[0] === '(') {
      urlStr = urlStr.substr(1, urlStr.length - 2);
    }
    let urls = RouterElement.splitUrlIntoRouters(urlStr);
    let namedMatches = [];
    let routerMatches = [];
    for(let i = 0, iLen = urls.length; i < iLen; i++) {
      let namedMatch = await NamedRouting.parseNamedItem(urls[i], true);
      if(namedMatch) {
        namedMatches.push(namedMatch);
      } else {
        routerMatches.push(urls[i]);
      }
    }

    return { named: namedMatches, routes: routerMatches };
  }

  disconnectedCallback(){
    RouterElement.removeRouter.call(this._parentRouter, this);
    this.removeEventListener('onRouterAdded', this.handlerAddRouter, false);
    this.removeEventListener('onRouteAdded', this.handlerAddRoute, false);
    if (this.getName()) {
      NamedRouting.removeNamedItem(this.getName());
    }
  }

  async connectedCallback(){
    if (!this.created) {
      this.created = true;

      // IE workaround for the lack of document.baseURI property
      let baseURI = document.baseURI;
      if (baseURI === undefined)
      {
        let baseTags = document.getElementsByTagName("base");
        baseURI = baseTags.length ? baseTags[0].href : document.URL;
        // @ts-ignore
        document.baseURI = baseURI;
      }

      this._routers = [];

      RouterElement.initialize();
    }

    if (this.isConnected) {
      /**
       * Internal event used to plumb together the routers. Do not interfer with.
       * @event RouterElement#onRouterAdded
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */
      var routerAddedEvent = new CustomEvent(
        'onRouterAdded',
        { bubbles: true, cancelable: true, composed: true, detail: { router: this }});
      this.dispatchEvent(routerAddedEvent);
      this._parentRouter = routerAddedEvent.detail.parentRouter;
      this.addEventListener('onRouterAdded', (this.handlerAddRouter = RouterElement.handlerAddRouter.bind(this)), false);
      this.addEventListener('onRouteAdded', (this.handlerAddRoute = this.handlerAddRoute.bind(this)), false);

      await NamedRouting.addNamedItem(this);
    }
  }

  constructor() {
    super();

    /**
     * @type import('./routes-route').Match
     */
    this._currentMatch = null;

    this.canLeave = NamedRouting.canLeave.bind(this);
  }

  /**
   * Global initialization
   */
  static async initialize() {
    if (!RouterElement._initialized) {
      RouterElement._initialized = true;
      //RouterElement.whiteListRegEx = this.getAttribute('base-white-list') || '';

      window.addEventListener("popstate", RouterElement.changeUrl, false);
      window.addEventListener('click', RouterElement.navigate, false);

      // Listen for top level routers being added
      window.addEventListener('onRouterAdded', RouterElement.handlerAddRouter.bind(RouterElement), false);

      // Listen for link registration
      window.addEventListener('routerLinksAdded', RouterElement.handlerRouterLinksAdded.bind(RouterElement), false);

      // Listen for navigate requests
      window.addEventListener('navigate', RouterElement.handlerNavigate.bind(RouterElement), false);

      await RouterElement.changeUrl();
    }
  }

  getName() {
    if (this.routerName === undefined) {
      this.routerName = this.getAttribute('name')
    }
    return this.routerName;
  }

  getCurrentMatch() {
    if (!this._currentMatch && this._parentRouter._currentMatch) {
      this._currentMatch =
      {
        data: null,
        redirect: null,
        url: '',
        useCache: false,
        remainder: this._parentRouter._currentMatch.remainder
      };
      // TODO get remainder from parent but ony take this routers url from it
      // e.g. split :: and take the firs put the rest back
      // TODO if we support adding a router name to the URL this is where we would check for it: (myRouter:users/main) --> target router named myRouter with url users/main
      let remainder = this._currentMatch.remainder;
      if (remainder && remainder[0] === '(') {
        let remainderArray = RouterElement.splitUrlIntoRouters(remainder.substring(1, remainder.length - 2));
        this._currentMatch.remainder = remainderArray.shift();
        // The next line is done in in the postProcessMatch
        // this._parentRouter._currentMatch.remainder = '(' + remainder.join('::') + ')';
      }
      this._currentMatch.url = this._currentMatch.remainder;
    }
    return this._currentMatch;
  }

  clearCurrentMatch() {
    this._currentMatch = null;
  }

  /** 
   * Event handler for handling when child route is added.
   * Used to link up RouterElements with child RouteElements even through Shadow DOM.
   * @param {CustomEvent} event - routeAdded event
   */
  handlerAddRoute(event) {
    event.stopPropagation();
    event.detail.router = this;
    event.detail.onRouteAdded = this.addRoute(event.detail.route);
  }

  /**
   * Performs matching for nested routes as they connect.
   * @param {import('./routes-route').RouteElement} routeElement
   * @returns {Promise}
   */
  async addRoute(routeElement) {
    // console.info('route added: ' + routeElement.getAttribute('path'));
    
    if (!this.hasMatch) {
      let currentMatch = this.getCurrentMatch();
      if (currentMatch){
        if(currentMatch.remainder) {
            await this.performMatchOnRoute(currentMatch.remainder, routeElement);
        }
      }
    }
  }

  /**
   * Takes in a url that contains named router data and renders the router using the information
   * @param {string} url to process as a named item
   * @returns {Promise<import('./routes-route.js').Match>}
   */
  async processNamedUrl(url) {
    return await this.performMatchOnRouter(url);
  }

  /**
   * Performs route matching by iterating through routes looking for matches
   * @param {String} url  
   * @returns {Promise<import('./routes-route.js').Match>}
   */
  async performMatchOnRouter(url) {
    // console.group('performMatchOnRouter: ' + url);
    this.hasMatch = false;
    this._currentMatch = {
      remainder: url,
      data: null,
      redirect: null,
      url: '',
      useCache: false
    };
    let routeElements = this.getRouteElements();
    let outletElement = this.getOutletElement();
    let match = null;
    let i = 0;
    let iLen = routeElements.length;
    for(; i < iLen; i++) {
      let routeElement = routeElements[i];
      match = await this.performMatchOnRoute(url, routeElement);
      if (match != null) {
        // console.info('route matched -> ', routeElement.getAttribute('path'));
        i++;
        break;
      }
    }

    // clear cache of remaining routes
    for(; i < iLen; i++) {
      let routeElement = routeElements[i];
      routeElement.clearLastMatch();
    }

    if (match === null) {
      if (outletElement.renderOutletContent) {
        outletElement.renderOutletContent("No matching route for url " + url + " \r\nTo replace this message add a 404 catch all route\r\n &lt;a-route path='*'>&lt;template&gt;catach all - NotFound&lt;/template&gt;&lt;/a-route&gt;");
        console && console.error &&  console.error("404 - Route not found for url " + url);
      }
      return null;
    }
    // console.log('leaving performMatchOnRouter ' + url);
    // console.groupEnd();
    
    return match;
  }

  /**
   * Tries to invoke matching of a url to a {RouteElement}
   * @param {string} url to match
   * @param {import('./routes-route').RouteElement} routeElement to match against
   * @returns {Promise<import('./routes-route.js').Match>}
   */
  async performMatchOnRoute(url, routeElement) {
    // RouteElement not connected yet
    if (!routeElement.match) {
      return null;
    }

    let match = routeElement.match(url) || null;
    if (match != null) {
      this.postProcessMatch();
      if (match.redirect) {
        // TODO If the route being redirected to comes after then it might not have loaded yet
        return await this.performMatchOnRouter(match.redirect)
      }
      let activeRouters = RouterElement._activeRouters;
      activeRouters.push({route: routeElement, router: this, match: match});
      this._currentMatch = match;

      if (!match.useCache) {
        let outletElement = this.getOutletElement();
        /**
         * @param {string | HTMLElement | DocumentFragment} content
         */
        let content = await routeElement.getContent(match.data);
        outletElement.renderOutletContent(content);
      }

      if (this._routers && match.remainder) {
        await RouterElement.performMatchOnRouters(match.remainder, this._routers);
      }
    }
    return match;
  }

  postProcessMatch() {
    this.hasMatch = true;
    if (this._parentRouter._currentMatch)
    {
      let parentMatch = this._parentRouter._currentMatch;
      // TODO get remainder from parent but ony take this routers url from it
      // e.g. split :: and take the first put the rest back
      // TODO if we support adding a router name to the URL this is where we would check for it: (myRouter:users/main) --> target router named myRouter with url users/main
      let remainder = parentMatch.remainder;
      if (remainder && remainder[0] === '(') {
        remainder = remainder.substring(1, remainder.length - 2);
      }
      remainder = RouterElement.splitUrlIntoRouters(remainder);
      remainder.shift();
      // this._currentMatch.remainder = remainder.shift();
      if (remainder.length > 1) {
        this._parentRouter._currentMatch.remainder = '(' + remainder.join('::') + ')';
      } else if (remainder.length === 1) {
        this._parentRouter._currentMatch.remainder = remainder[0];
      } else {
        this._parentRouter._currentMatch.remainder = '';
      }
    }
  }

  generateUrlFragment() {
    let match = this._currentMatch;
    if (!match) {
      return '';
    }

    let urlFrag = match.url;
    
    if (match.remainder) {
      urlFrag += '/' + match.remainder;
    }

    // TODO test if this is required. It might be duplicating routes.
    // if (this._routers && this._routers.length) {
    //   urlFrag += '/(';
    //   for (let i = 0, iLen = this._routers.length; i < iLen; i++) {
    //     if (i > 0) {
    //       urlFrag += '::';
    //     }
    //     urlFrag += this._routers[i].generateUrlFragment();
    //   }
    //   urlFrag += ')';
    // }

    return urlFrag;
  }

  /**
   * @returns {import('./routes-outlet').OutletElement}
   */
  getOutletElement() {
    // @ts-ignore
    return this._getRouterElements('an-outlet')[0];
  }

  /**
   * @returns {import('./routes-route').RouteElement[]}
   */
  getRouteElements() {
    // @ts-ignore
    return this._getRouterElements('a-route');
  }

  /**
   * Finds immediate child route elements
   */
  _getRouterElements(tagName) {
    let routeElements = [];
    tagName = tagName.toLowerCase();
    for (var i = 0, iLen = this.children.length; i < iLen; i++) {
      let elem = this.children[i];
      if (elem.tagName.toLowerCase() === tagName) {
        routeElements.push(elem);
      }
    }
    return routeElements;
  }

  /**
   * Returns the absolute URL of the link (if any) that this click event is clicking on, if we can and should override the resulting full page navigation. Returns null otherwise.
   * @param {(MouseEvent|HTMLAnchorElement|string)} hrefSource - The source of the new url to handle. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
   * @return {string?} Returns the absolute URL of the link (if any) that this click event is clicking on, if we can and should override the resulting full page navigation. Returns null if click should not be consumed.
   */
  static _getSameOriginLinkHref(hrefSource) {
    let href = null;
    let anchor = null;
    if (hrefSource instanceof Event) {
      let event = hrefSource;
      // We only care about left-clicks.
      if (event.button !== 0) {
        return null;
      }

      // We don't want modified clicks, where the intent is to open the page
      // in a new tab.
      if (event.metaKey || event.ctrlKey) {
        return null;
      }

      // @ts-ignore
      let eventPath = event.path;
      for (var i = 0; i < eventPath.length; i++) {
        let element = eventPath[i];

        if (element.tagName === 'A' && element.href) {
          anchor = element;
          break;
        }
      }

      // If there's no link there's nothing to do.
      if (!anchor) {
        return null;
      }
    } else if (typeof hrefSource === 'string') {
      href = hrefSource;
    } else {
      anchor = hrefSource;
    }

    if (anchor) {
      // Target blank is a new tab, don't intercept.
      if (anchor.target === '_blank') {
        return '';
      }

      // If the link is for an existing parent frame, don't intercept.
      if ((anchor.target === '_top' || anchor.target === '_parent') &&
          window.top !== window) {
        return '';
      }

      // If the link is a download, don't intercept.
      if (anchor.download) {
        return '';
      }

      href = anchor.href;
    }

    // If link is different to base path, don't intercept.
    if (href.indexOf(document.baseURI) !== 0) {
      return '';
    }

    let hrefEsacped = href.replace(/::/g, '$_$_');

    // It only makes sense for us to intercept same-origin navigations.
    // pushState/replaceState don't work with cross-origin links.
    let url;

    if (document.baseURI != null) {
      url = new URL(hrefEsacped, document.baseURI);
    } else {
      url = new URL(hrefEsacped);
    }

    let origin;

    // IE Polyfill
    if (window.location.origin) {
      origin = window.location.origin;
    } else {
      origin = window.location.protocol + '//' + window.location.host;
    }

    let urlOrigin;

    if (url.origin && url.origin !== 'null') {
      urlOrigin = url.origin;
    } else {
      // IE always adds port number on HTTP and HTTPS on <a>.host but not on
      // window.location.host
      let urlHost = url.host;
      let urlPort = url.port;
      let urlProtocol = url.protocol;
      let isExtraneousHTTPS = urlProtocol === 'https:' && urlPort === '443';
      let isExtraneousHTTP = urlProtocol === 'http:' && urlPort === '80';

      if (isExtraneousHTTPS || isExtraneousHTTP) {
        urlHost = url.hostname;
      }
      urlOrigin = urlProtocol + '//' + urlHost;
    }

    if (urlOrigin !== origin) {
      return '';
    }

    let normalizedHref = url.pathname.replace(/\$_\$_/g, '::') + url.search.replace(/\$_\$_/g, '::') + url.hash.replace(/\$_\$_/g, '::');

    // pathname should start with '/', but may not if `new URL` is not supported
    if (normalizedHref[0] !== '/') {
      normalizedHref = '/' + normalizedHref;
    }

    // If we've been configured not to handle this url... don't handle it!
    // let urlSpaceRegExp = RouterElement._makeRegExp(RouterElement.whiteListRegEx);
    // if (urlSpaceRegExp && !urlSpaceRegExp.test(normalizedHref)) {
    //   return '';
    // }

    // Need to use a full URL in case the containing page has a base URI.
    let fullNormalizedHref = new URL(normalizedHref, window.location.href).href;
    return fullNormalizedHref;
  }

  // static _makeRegExp(urlSpaceRegex) {
  //   return RegExp(urlSpaceRegex);
  // }

  // ---------- Action helpers ----------
  // Much of this code was taken from the Polymer project iron elements

  static _getHash() {
    return decodeURIComponent(window.location.hash.substring(1));
  }

  static baseUrlSansHost() {
    const host = window.location.protocol + '//' + window.location.host;
    return document.baseURI.substr(host.length+1);
  }

  static _getUrl(url) {
    url = url || window.location;
    let path = decodeURIComponent(url.pathname);
    let query = url.search.substring(1);
    let hash = RouterElement._getHash();
    let partiallyEncodedPath = encodeURI(path).replace(/\#/g, '%23').replace(/\?/g, '%3F');
    let partiallyEncodedQuery = '';
    if (query) {
      partiallyEncodedQuery = '?' + query.replace(/\#/g, '%23');
      if (RouterElement._encodeSpaceAsPlusInQuery) {
        partiallyEncodedQuery = partiallyEncodedQuery.replace(/\+/g, '%2B')
                                    .replace(/ /g, '+')
                                    .replace(/%20/g, '+');
      } else {
        // required for edge
        partiallyEncodedQuery =
            partiallyEncodedQuery.replace(/\+/g, '%2B').replace(/ /g, '%20');
      }
    }
    var partiallyEncodedHash = '';
    if (hash) {
      partiallyEncodedHash = '#' + encodeURI(hash);
    }
    return (partiallyEncodedPath + partiallyEncodedQuery + partiallyEncodedHash);
  }
}


RouterElement._routers = [];
RouterElement._route = {};
RouterElement._initialized = false;
RouterElement._activeRouters = [];
RouterElement._dwellTime = 2000;
RouterElement._anchors = [];
RouterElement._encodeSpaceAsPlusInQuery = false;
RouterElement.assignedOutlets = {};

window.customElements.define('a-router', RouterElement);