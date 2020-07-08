///@ts-check
import { NamedRouting } from "./named-routing.js";

/**
   * @typedef {Object} Match
   * @property {string} url - The url that was matched and consumed by this route. The match.url and the match.remainder will together equal the URL that the route originally matched against.
   * @property {string} remainder - If the route performed a partial match, the remainder of the URL that was not atched is stored in this property.
   * @property {Object} data - Any data found and matched in the URL.
   * @property {?string} redirect - A URL to redirect to.
   * @property {boolean} useCache - Indicator as to wether the current HTML content can be reused.
   */

export class RouteElement extends HTMLElement {

  connectedCallback(){
    if (!this.created) {
      this.created = true;
      this.style.display = 'none';
      const baseElement = document.head.querySelector('base');
      this.baseUrl = baseElement && baseElement.getAttribute('href');
    }

    if (this.isConnected) {

      let onRouteAdded = new CustomEvent('onRouteAdded', {
        bubbles: true,
        composed: true,
        detail: {
          route: this
        }
      });

      this.dispatchEvent(onRouteAdded);

      const lazyLoad = (this.getAttribute('lazyload')||'').toLowerCase() === 'true' || this.hasAttribute('lazy-load');

      if (lazyLoad === false) {
        let importAttr = this.getAttribute('import');
        let tagName = this.getAttribute('element');
        NamedRouting.prefetchImport(importAttr, tagName);
      }
    }
  }

  disconnectedCallback() {
    
  }

  constructor() {
    super();

    this.canLeave = NamedRouting.canLeave.bind(this);
  }

  _createPathSegments(url) {
    return url.replace(/(^\/+|\/+$)/g, '').split('/');
  }

  /**
   * Performs matching and partial matching. In order to successfully match, a RouteElement elements path attribute must match from the start of the URL. A full match would completely match the URL. A partial match would return from the start.
   * @fires RouteElement#onROuteMatch
   * @param {string} url - The url to perform matching against
   * @returns {Match} match - The resulting match. Null will be returned if no match was made.
   */
  match(url) {    
    const urlSegments = this._createPathSegments(url);

    const path = this.getAttribute('path');
    if (!path) {
      console.info("route must contain a path");
      throw 'Route has no path defined. Add a path attribute to route';
    } 

    let match = null;
    let fullMatch = {
      url: url,
      remainder: '',
      data: null,
      redirect: null,
      useCache: false
    };

    if (path === '*') {
      match = fullMatch;
    } else if (path === url) {
      match = fullMatch;
    } else {
      const pathSegments = this._createPathSegments(path);
      //console.info(urlSegments, pathSegments);
      const data = new Map();

      let max = Math.max(urlSegments.length, pathSegments.length);
      let ret;
      for (let i = 0; i < max; i++) {
        if (pathSegments[i] && pathSegments[i].charAt(0) === ':') {
            let param = pathSegments[i].replace(/(^\:|[+*?]+$)/g, '');
            let flags = (pathSegments[i].match(/[+*?]+$/) || [])[0] || '';
            let plus = ~flags.indexOf('+');
            let star = ~flags.indexOf('*');
            let val = urlSegments[i] || '';
            if (!val && !star && (flags.indexOf('?') < 0 || plus)) {
              match = null;
              break;
            }
            data.set(param, decodeURIComponent(val));
            if (plus || star) {
              data.set(param, urlSegments.slice(i).map(decodeURIComponent).join('/'));
              match = match || fullMatch;
              match.data = data;
              break;
            }
        }
        else if (pathSegments[i] !== urlSegments[i]) {
          if (i > 0 && !this.hasAttribute('fullmatch')) {
            match = match || fullMatch;
            match.data = data;
            match.url = urlSegments.slice(0, i).join('/');
            match.remainder = urlSegments.slice(i).join('/');
          }
          break;
        }
        
        if (i === max - 1) {
          match = match || fullMatch;
          match.data = data;
        }
      }
    }

    if (match !== null) {
      /**
       * Route Match event that fires after a route has performed successful matching. The event can be cancelled to prevent the match.
       * @event RouteElement#onRouteMatch
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.route - The RouteElement that performed the match.
       * @property {Match} details.match - The resulting match. Warning, modifications to the Match will take effect.
       * @property {string} details.path - The RouteElement path attribute value that was matched against.
       */
      var routeMatchedEvent = new CustomEvent(
        'onRouteMatch',
        { bubbles: true, cancelable: true, composed: true, detail: { route: this, match: match, path: path }});
      this.dispatchEvent(routeMatchedEvent);

      if (routeMatchedEvent.defaultPrevented) {
        match = null;
      }

      if (this.hasAttribute('redirect')) {
        match.redirect = this.getAttribute('redirect');
      }
    }

    if (match) {
      let useCache = this.lastMatch && this.lastMatch.url === match.url && !this.hasAttribute('disableCache');
      match.useCache = useCache;
    }

    this.lastMatch = match;

    return match;
  }

  clearLastMatch() {
    this.lastMatch = null;
  }

  /**
   * Generates content for this route.
   * @param {Object} attributes - Object of properties that will be applied to the content. Only applies if the content was not generated form a Template.
   * @returns {Promise<string|DocumentFragment|Node>} - The resulting generated content.
   */
  async getContent(attributes = {}) {
    let content = this.content;

    if (!content) {
      let importAttr = this.getAttribute('import');
      let tagName = this.getAttribute('element');

      await NamedRouting.importCustomElement(importAttr, tagName);

      if (tagName) {
        // TODO support if tagName is a function that is called and will return the content
        // content = tagName(attributes);
        content = document.createElement(tagName);
        if (customElements.get(tagName) === undefined) {
          console.error(`Custom Element not found: ${tagName}. Are you missing an import or mis-spelled tag name?`);
        }
      }

      let template = this.children[0];
      if (template && template instanceof HTMLTemplateElement) {
        return template.content.cloneNode(true);
      }
    }

    if (attributes) {
      RouteElement.setData(content, attributes);
    }

    return this.content = content;
  }

  static setData(target, data) {
    data.forEach((v,k) => {
        if (k[0] === '.') {
          target[k.substr(1)] = v;
        } else {
          target.setAttribute(k, v);
        }
      });
  }
}

window.customElements.define('a-route', RouteElement);