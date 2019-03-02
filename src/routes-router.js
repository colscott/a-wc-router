import { NamedRouting } from './named-routing.js'
export class RouterElement extends HTMLElement {
  /** 
   * Event handler for handling when child router is added.
   * This function is called in the scope of RouterElement for the top level collection of routers and instacnes of RotuerElement for nested router collections.
   * Used to link up RouterElements with child RouterElements even through Shadow DOM.
   * @param {CustomEvent} - routerAdded event
   */
  static handlerAddRouter(event) {
    RouterElement.addRouter.call(this, event.detail.router);
    event.stopPropagation();
    event.detail.parentRouter = this;
  }

  /** 
   * Used to link up RouterElements with child RouterElements even through Shadow DOM.
   * @param {RouterElement} - routerElement to add. RouterElement after the first can be thought of as auxilary RouterElements
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
    let hash = RouterElement._getHash();
    RouterElement.dispatch(_changeHash(hash));
  }

  /**
   * Global handler for url changes.
   * Should be called if the user changes the URL via the URL bar or navigating history
   */
  static changeUrl() {
    let hash = RouterElement._getHash();
    let path = window.decodeURIComponent(window.location.pathname);
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
    RouterElement.dispatch(newUrl);
  }

  /**
   * Global handler for page clicks. Filters out and handles clicks from links.
   * @param {MouseEvent} event - the mouse click event
   */
  static handleClicks(event) {
    // If already handled and canceled
    if (event.defaultPrevented) {
      return;
    }
    
    var href = RouterElement._getSameOriginLinkHref(event);

    if (!href) {
      /**
       * Event that fires if a link is not handled due to it not being same origin or base url.
       * @event RouterElement#onRouteCancelled
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */
      event.target.dispatchEvent(
        new CustomEvent(
          'onRouteNotHandled',
          {
            bubbles: true,
            composed: true,
            detail: { href }}));
      return;
    }

    event.preventDefault();

    // If the navigation is to the current page we shouldn't add a history
    // entry or fire a change event.
    if (href === window.location.href) {
      return;
    }

    let url = new URL(href);
    var newUrl = RouterElement._getUrl(url);
    RouterElement.dispatch(newUrl);
  }

  /**
   * Common entry point that starts the routing process.
   * @param {String} url
   * @fires RouterElement#onRouteCancelled
   */
  static dispatch(url) {
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

    RouterElement.performMatchOnRouters(shortUrl, RouterElement._routers);
    RouterElement.updateHistory(url);
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

    RouterElement.updateAnchorsStatus(urlState);
  }

  /** Sets the active status of any registered links based on the current URL */
  static updateAnchorsStatus(url) {
    url = url || RouterElement.getUrlState();
    let currentAnchors = RouterElement._anchors;
    let nextAnchors = [];

    // Tidy up any unconnected anchors
    for (let i = 0, iLen = currentAnchors.length; i < iLen; i++) {
      if (currentAnchors[i].a.isConnected === true) {
        let link = currentAnchors[i];
        nextAnchors[nextAnchors.length] = link;
        link.a.classList.remove(link.a.activeClassName || 'active');
      }
    }

    let urlFragments = url.split('::');
    nextUrlFragment:
    for (let j = 0, jLen = urlFragments.length; j < jLen; j++) {
      let urlFragment = urlFragments[j];
      let urlFragNamedItemMatch = NamedRouting.parseNamedItem(urlFragment, true);
      nextLink:
      for (let i = 0, iLen = nextAnchors.length; i < iLen; i++) {
        let link = nextAnchors[i];
        if (link && link.a.classList.contains(link.a.activeClassName || 'active')) {
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
                    link.a.classList.add(link.a.activeClassName || 'active');
                    link = null;
                    continue nextLink;
                  } else 
                  //Check if it's a mtch upto data portion of url
                  if (urlFragNamedItemMatch.urlEscaped.indexOf(named[k].url) === 0) {
                    // full match on named item
                    link.a.classList.add(link.a.activeClassName || 'active');
                    link = null;
                    continue nextLink;
                  }
                }
              }
            }
            for (let k = 0, kLen = routes.length; k < kLen; k++) {
              if (urlFragment == routes[k]) {
                // full match on route
                link.a.classList.add(link.a.activeClassName || 'active');
                link = null;
                continue nextLink;
              } else if (routes[k].indexOf(urlFragment) === 0) {
                // partial match on route
                link.a.classList.add(link.a.activeClassName || 'active');
                link = null;
                continue nextLink;
              }
            }
          }
        }
      }
    }
    return null;
  }

  /** Gets the current URL state based on currently active routers and outlets. */
  static getUrlState() {
    let url = NamedRouting.generateNamedItemsUrl();

    if (RouterElement._routers) {
      for (let i = 0, iLen = RouterElement._routers.length; i < iLen; i++) {
        var nextFrag = RouterElement._routers[i].generateUrlFragment();
        if (nextFrag) {
          if (url.length) {
            url += '::';
          }
          url += nextFrag;
        }
      }
    }
    return url;
  }

  /**
   * Iterates over each child RouterElement and calls it to match it portion of the current URL.
   * @param {string} url - While URL. Will be parsed for individual router URLs.
   * @param {RouterElement[]} routers
   */
  static performMatchOnRouters(url, routers) {
    // TODO query string data should be placed on RouterElement so it's accessible across all outlets. It's regarded as shared data across the routers.
    // TODO Maybe have a way to regiser for changes to query string so routes can react
    // TODO auxilary routers - start unit testing
    if (url[0] === '(') {
      url = url.substr(1,url.length - 2);
    }
    let urls = RouterElement.splitUrlIntoRouters(url);
    let urlsWithoutNamedOutlets = [];

    for(let i = 0, iLen = urls.length; i < iLen; i++) {
      if(!NamedRouting.parseNamedItem(urls[i])) {
        urlsWithoutNamedOutlets.push(urls[i]);
      }
    }

    let i = 0;
    for (let iLen = routers.length; i < iLen; i++) {
      let router = routers[i];
      if (urlsWithoutNamedOutlets[i]) {
        router.performMatchOnRouter(urlsWithoutNamedOutlets[i] || '');
      }
    }
  }

  //TODO Unit test
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

  static registerLinks(links, activeClassName) {
    let currentAnchors = RouterElement._anchors;

    let nextAnchors = [];

    // Tidy up any unconnected anchors
    for (let i = 0, iLen = currentAnchors.length; i < iLen; i++) {
      if (currentAnchors[i].a.isConnected === true) {
        nextAnchors[nextAnchors.length] = currentAnchors[i];
      }
    }

    // Add the new anchors
    for (let i = 0, iLen = links.length; i < iLen; i++) {
      let matches = RouterElement.sanitizeLinkHref(links[i]);
      if (matches) {
        nextAnchors[nextAnchors.length] = {
          a: links[i],
          activeClassName: activeClassName,
          routerMatches: matches
        };
      }
    }

    // Do this after pushing history location state
    RouterElement._anchors = nextAnchors;

    RouterElement.updateAnchorsStatus();
  }

  static sanitizeLinkHref(linkElement) {
    let href = RouterElement._getSameOriginLinkHref(linkElement);
    let url = new URL(href);
    let hash = RouterElement._getHash();
    let path = window.decodeURIComponent(url.pathname);
    let query = url.search.substring(1);
    let basePathLength = RouterElement.baseUrlSansHost().length;
    url = path.substr(basePathLength);
    if (url[0] === '(') {
      url = url.substr(1,url.length - 2);
    }
    let urls = RouterElement.splitUrlIntoRouters(url);
    let namedMatches = [];
    let routerMatches = [];
    for(let i = 0, iLen = urls.length; i < iLen; i++) {
      let namedMatch = NamedRouting.parseNamedItem(urls[i], true);
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
    this.removeEventListener('routerAdded', this.addRouter, false);
    if (this.getName()) {
      NamedRouting.removeNamedItem(this.getName());
    }
  }

  connectedCallback(){
    if (!this.created) {
      this.created = true;

      // IE workaround for the lack of document.baseURI property
      let baseURI = document.baseURI;
      if (baseURI === undefined)
      {
        let baseTags = document.getElementsByTagName("base");
        baseURI = baseTags.length ? baseTags[0].href : document.URL;
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

      NamedRouting.addNamedItem(this);
    }
  }

  constructor() {
    super();
  }

  /**
   * Global initialization
   */
  static initialize() {
    if (!RouterElement._initialized) {
      RouterElement._initialized = true;
      RouterElement._activeRouters = [];
      RouterElement._anchors = [];
      RouterElement._route = {};
      RouterElement._routers = [];
      RouterElement._encodeSpaceAsPlusInQuery = false;
      RouterElement._dwellTime = 2000;
      //RouterElement.whiteListRegEx = this.getAttribute('base-white-list') || '';

      window.addEventListener("popstate", RouterElement.changeUrl, false);
      window.addEventListener('click', RouterElement.handleClicks, false);

      // Listen for top level routers being added
      window.addEventListener('onRouterAdded', RouterElement.handlerAddRouter.bind(RouterElement), false);

      RouterElement.changeUrl(decodeURIComponent(location.pathname));
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
      this._currentMatch = { remainder: this._parentRouter._currentMatch.remainder };
      // TODO get remainder from parent but ony take this routers url from it
      // e.g. split :: and take the firs put the rest back
      // TODO if we support adding a router name to the URL this is where we would check for it: (myRouter:users/main) --> target router named myRouter with url users/main
      let remainder = this._currentMatch.remainder;
      if (remainder && remainder[0] === '(') {
        remainder = RouterElement.splitUrlIntoRouters(remainder.substring(1, remainder.length - 2));
        this._currentMatch.remainder = remainder.shift();
        // The next line is done in in the postProcessMatch
        // this._parentRouter._currentMatch.remainder = '(' + remainder.join('::') + ')';
      }
      this._currentMatch.url = this._currentMatch.remainder;
    }
    return this._currentMatch;
  }

  /**
   * Performs matching for nested routes as they connect.
   * @param {RouteElement} routeElement 
   */
  addRoute(routeElement) {
    console.log('route added: ' + routeElement.getAttribute('path'));
    
    if (!this.hasMatch) {
      let currentMatch = this.getCurrentMatch();
      if (currentMatch){
        if(currentMatch.remainder) {
            this.performMatchOnRoute(currentMatch.remainder, routeElement);
        }
      } else {
        this.performMatchOnRoute(RouterElement._route.url, routeElement);
      }
    }
  }

  // TODO 
  // go (url)
  // {
  //   let match = this.performMatchOnRouter(url);
  //   if (match) {
  //     // push new history
  //   }
  // }

  /**Takes in a url that contains named router data and renders the router using the information */
  processNamedUrl(url) {
    return this.performMatchOnRouter(url);
  }

  /**
   * Performs route matching by iterating through routes looking for matches
   * @param {String} url  
   */
  performMatchOnRouter(url) {
    this.hasMatch = false;
    this._currentMatch = { remainder: url };
    let routeElements = this._getRouterElements('a-route');
    let outletElement = this._getRouterElements('a-outlet')[0];
    let match = null;

    for(let i = 0, iLen = routeElements.length; i < iLen; i++) {
      let routeElement = routeElements[i];
      match = this.performMatchOnRoute(url, routeElement)
      if (match != null) {
        console.log('route matched -> ', routeElement.getAttribute('path'));
        break;
      }      
    }

    if (match === null) {
      if (outletElement.renderContent) {
        outletElement.renderContent("No matching route for url " + url + " \r\nTo replace this message add a 404 catch all route\r\n <a-route path='*'><template>catach all - NotFound</template></a-route>");
        console && console.error &&  console.error("404 - Route not found for url " + url);
      }
      return null;
    }
    
    return match;
  }

  performMatchOnRoute(url, routeElement) {
    // RouteElement not connected yet
    if (!routeElement.match) {
      return null;
    }

    let match = routeElement.match(url) || null;
    if (match != null) {
      if (match.redirect) {
        // TODO If the route being redirected to comes after then it might not have loaded yet
        return this.performMatchOnRouter(match.redirect)
      }
      let activeRouters = RouterElement._activeRouters;
      activeRouters.push({route: routeElement, router: this, match: match});
      this._currentMatch = match;

      if (match.useCache) {
        // Content is already loaded so addRoute will not get called. Start the matching for children manually.
        if (this._routers && match.remainder) {
          RouterElement.performMatchOnRouters(match.remainder, this._routers);
        }
      } else {
        let outletElement = this._getRouterElements('a-outlet')[0];
        routeElement.getContent(match.data)
          .then((content) => outletElement.renderContent(content));
      }

      this.postProcessMatch();
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

    if (this._routers && this._routers.length) {
      urlFrag += '/(';
      for (let i = 0, iLen = this._routers.length; i < iLen; i++) {
        if (i > 0) {
          urlFrag += '::';
        }
        urlFrag += this._routers[i].generateUrlFragment();
      }
      urlFrag += ')';
    }

    return urlFrag;
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
   * Returns the absolute URL of the link (if any) that this click event
   * is clicking on, if we can and should override the resulting full
   * page navigation. Returns null otherwise.
   *
   * @param {MouseEvent} event .
   * @return {string?} .
   */
  static _getSameOriginLinkHref(event) {
    let anchor = null;
    if (event instanceof Event) {
      // We only care about left-clicks.
      if (event.button !== 0) {
        return null;
      }

      // We don't want modified clicks, where the intent is to open the page
      // in a new tab.
      if (event.metaKey || event.ctrlKey) {
        return null;
      }

      let eventPath = event.path;
      

      for (var i = 0; i < eventPath.length; i++) {
        let element = eventPath[i];

        if (element.tagName === 'A' && element.href) {
          anchor = element;
          break;
        }
      }
    } else {
      anchor = event;
    }

    // If there's no link there's nothing to do.
    if (!anchor) {
      return null;
    }

    // Target blank is a new tab, don't intercept.
    if (anchor.target === '_blank') {
      return null;
    }

    // If the link is for an existing parent frame, don't intercept.
    if ((anchor.target === '_top' || anchor.target === '_parent') &&
        window.top !== window) {
      return null;
    }

    // If the link is a download, don't intercept.
    if (anchor.download) {
      return null;
    }

    let href = anchor.href;
    // If link is different to base path, don't intercept.
    if (href.indexOf(document.baseURI) !== 0) {
      return null;
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
      return null;
    }

    let normalizedHref = url.pathname.replace(/\$_\$_/g, '::') + url.search.replace(/\$_\$_/g, '::') + url.hash.replace(/\$_\$_/g, '::');

    // pathname should start with '/', but may not if `new URL` is not supported
    if (normalizedHref[0] !== '/') {
      normalizedHref = '/' + normalizedHref;
    }

    // If we've been configured not to handle this url... don't handle it!
    let urlSpaceRegExp = RouterElement._makeRegExp(RouterElement.whiteListRegEx);
    if (urlSpaceRegExp && !urlSpaceRegExp.test(normalizedHref)) {
      return null;
    }

    // Need to use a full URL in case the containing page has a base URI.
    let fullNormalizedHref = new URL(normalizedHref, window.location.href).href;
    return fullNormalizedHref;
  }

  static _makeRegExp(urlSpaceRegex) {
    return RegExp(urlSpaceRegex);
  }

  // ---------- Action helpers ----------
  // Much of this code was taken from the Polymer project iron elements

  static _getHash() {
    return window.decodeURIComponent(window.location.hash.substring(1));
  }

  static baseUrlSansHost() {
    let host = window.location.protocol + '//' + window.location.host;
    return document.baseURI.substr(host.length+1);
  }

  static _getUrl(url) {
    url = url || window.location;
    let path = window.decodeURIComponent(url.pathname);
    let query = url.search.substring(1);
    let hash = RouterElement._getHash(url);
    let partiallyEncodedPath = window.encodeURI(path).replace(/\#/g, '%23').replace(/\?/g, '%3F');
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
      partiallyEncodedHash = '#' + window.encodeURI(hash);
    }
    return (partiallyEncodedPath + partiallyEncodedQuery + partiallyEncodedHash);
  }
}

RouterElement.assignedOutlets = {};

window.customElements.define('a-router', RouterElement);