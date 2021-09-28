import { NamedRouting } from './named-routing.js';

/** @typedef {Map<string, string>} MatchData */
/**
 * @typedef {Object} Match
 * @property {string} url - The url that was matched and consumed by this route. The match.url and the match.remainder will together equal the URL that the route originally matched against.
 * @property {string} remainder - If the route performed a partial match, the remainder of the URL that was not attached is stored in this property.
 * @property {Map<string, string>} data - Any data found and matched in the URL.
 * @property {?string} redirect - A URL to redirect to.
 * @property {boolean} useCache - Indicator as to wether the current HTML content can be reused.
 */

/**  */
export class RouteElement extends HTMLElement {
  /** Initialize */
  connectedCallback() {
    if (!this.created) {
      this.created = true;
      this.style.display = 'none';
      const baseElement = document.head.querySelector('base');
      this.baseUrl = baseElement && baseElement.getAttribute('href');
    }

    if (this.isConnected) {
      const onRouteAdded = new CustomEvent('onRouteAdded', {
        bubbles: true,
        composed: true,
        detail: {
          route: this,
        },
      });

      this.dispatchEvent(onRouteAdded);

      const lazyLoad = (this.getAttribute('lazyload') || '').toLowerCase() === 'true' || this.hasAttribute('lazy-load');

      if (lazyLoad === false) {
        const importAttr = this.getAttribute('import');
        const tagName = this.getAttribute('element');
        NamedRouting.prefetchImport(importAttr, tagName);
      }
    }
  }

  /** Initialize */
  constructor() {
    super();

    this.canLeave = NamedRouting.canLeave.bind(this);

    /** @type {string|DocumentFragment|Node} */
    this.content = null;
  }

  /**
   * @private
   * @param {string} url to break into segments
   * @returns {Array<string>} string broken into segments
   */
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
      console.info('route must contain a path');
      throw new Error('Route has no path defined. Add a path attribute to route');
    }

    let match = null;
    const fullMatch = {
      url,
      remainder: '',
      data: new Map(),
      redirect: null,
      useCache: false,
    };

    if (path === '*') {
      match = fullMatch;
    } else if (path === url) {
      match = fullMatch;
    } else {
      const pathSegments = this._createPathSegments(path);
      // console.info(urlSegments, pathSegments);
      const data = new Map();

      const max = Math.max(urlSegments.length, pathSegments.length);
      for (let i = 0; i < max; i++) {
        if (pathSegments[i] && pathSegments[i].charAt(0) === ':') {
          const param = pathSegments[i].replace(/(^\:|[+*?]+$)/g, '');
          const flags = (pathSegments[i].match(/[+*?]+$/) || [])[0] || '';
          const plus = flags.includes('+');
          const star = flags.includes('*');
          const val = urlSegments[i] || '';
          if (!val && !star && (flags.indexOf('?') < 0 || plus)) {
            match = null;
            break;
          }
          data.set(param, decodeURIComponent(val));
          if (plus || star) {
            data.set(
              param,
              urlSegments
                .slice(i)
                .map(decodeURIComponent)
                .join('/'),
            );
            match = match || fullMatch;
            match.data = data;
            break;
          }
        } else if (pathSegments[i] !== urlSegments[i]) {
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
      const routeMatchedEvent = new CustomEvent('onRouteMatch', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: { route: this, match, path },
      });
      this.dispatchEvent(routeMatchedEvent);

      if (routeMatchedEvent.defaultPrevented) {
        match = null;
      }

      if (this.hasAttribute('redirect')) {
        match.redirect = this.getAttribute('redirect');
      }
    }

    if (match) {
      const useCache = this.lastMatch && this.lastMatch.url === match.url && !this.hasAttribute('disableCache');
      match.useCache = !!useCache;
    }

    this.lastMatch = match;

    return match;
  }

  /** Clear the last match which will reset cache state */
  clearLastMatch() {
    this.lastMatch = null;
  }

  /**
   * Generates content for this route.
   * @param {Object} attributes - Object of properties that will be applied to the content. Only applies if the content was not generated form a Template.
   * @returns {Promise<string|DocumentFragment|Node>} - The resulting generated content.
   */
  async getContent(attributes = {}) {
    let { content } = this;

    if (!content) {
      const importAttr = this.getAttribute('import');
      const tagName = this.getAttribute('element');

      await NamedRouting.importCustomElement(importAttr, tagName);

      if (tagName) {
        // TODO support if tagName is a function that is called and will return the content
        // content = tagName(attributes);
        content = document.createElement(tagName);
        if (customElements.get(tagName) === undefined) {
          console.error(`Custom Element not found: ${tagName}. Are you missing an import or mis-spelled the tag name?`);
        }
      }

      const template = this.children[0];
      if (template && template instanceof HTMLTemplateElement) {
        return template.content.cloneNode(true);
      }
    }

    if (attributes) {
      RouteElement.setData(content, attributes);
    }

    this.content = content;
    return this.content;
  }

  /**
   * @param {string|DocumentFragment|Node} target element to set the data on
   * @param {MatchData} data to set on the element
   */
  static setData(target, data) {
    if (data && target instanceof Element) {
      data.forEach((v, k) => {
        if (k[0] === '.') {
          target[k.substr(1)] = v;
        } else {
          target.setAttribute(k, v);
        }
      });
    }
  }
}

window.customElements.define('a-route', RouteElement);
