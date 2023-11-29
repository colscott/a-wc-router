import { NamedRouting } from './named-routing.js';

/** @typedef {Map<string, string>|HTMLOrSVGElement['dataset']} MatchData */
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

    this.data = null;
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

    const fullMatch = {
      url,
      remainder: '',
      data: new Map(),
      redirect: null,
      useCache: false,
    };

    let match = fullMatch;

    if (path === '*') {
      match = fullMatch;
    } else if (path === url) {
      match = fullMatch;
    } else {
      const pathSegments = this._createPathSegments(path);
      // console.info(urlSegments, pathSegments);
      const data = match.data;

      const max = pathSegments.length;
      let i = 0;
      for (; i < max; i++) {
        if (pathSegments[i] && pathSegments[i].charAt(0) === ':') {
          // Handle bound values
          const paramName = pathSegments[i].replace(/(^\:|[+*?]+\S*$)/g, '');
          const flags = (pathSegments[i].match(/([+*?])\S*$/) || [])[1] || '';
          const oneOrMore = flags.includes('+');
          const anyNumber = flags.includes('*');
          const oneOrNone = flags.includes('?');
          const defaultValue = oneOrNone && (pathSegments[i].match(/[+*?]+(\S+)$/) || [])[1] || '';
          let value = urlSegments[i] || '';
          const required = !anyNumber && !oneOrNone;
          if (!value && defaultValue) {
            value = defaultValue;
          }
          if (!value && required) {
            match = null;
            break;
          }
          data.set(paramName, decodeURIComponent(value));
          if (oneOrMore || anyNumber) {
            data.set(
              paramName,
              urlSegments
                .slice(i)
                .map(decodeURIComponent)
                .join('/'),
            );
            // increase i so that we know later that we have consumed all of the url segments when we're checking if we have a full match.
            i = urlSegments.length;
            break;
          }
        } else if (pathSegments[i] !== urlSegments[i]) {
          // Handle path segment
          match = null;
          break;
        }
      }

      // Check all required path segments were fulfilled
      if (match) {
        if (i >= urlSegments.length) {
          // Full match
        } else if (this.hasAttribute('fullmatch')) {
          // Partial match but needed full match
          match = null;
        } else if (i === max) {
          // Partial match
          match = match || fullMatch;
          match.data = data;
          match.url = urlSegments.slice(0, i).join('/');
          match.remainder = urlSegments.slice(i).join('/'); 
        } else {
          // No match
          match = null;
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
   * @param {Map<string, string>} [attributes] - Object of properties that will be applied to the content. Only applies if the content was not generated form a Template.
   * @returns {Promise<string|DocumentFragment|Node>} - The resulting generated content.
   */
  async getContent(attributes) {
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

    if (this.data && content instanceof HTMLElement) {
      Object.entries(this.data).forEach(([name, value]) => {
        content[name] = value;
      });
    }

    RouteElement.setData(content, this.dataset);

    this.content = content;
    return this.content;
  }

  /**
   * @param {string|DocumentFragment|Node} target element to set the data on
   * @param {MatchData} data to set on the element
   */
  static setData(target, data) {
    if (data && target instanceof Element) {
      /**
       * @param {string} key property name to set the value for
       * @param {unknown} value value to set
       */
      const setProperty = (key, value) => {
        if (key[0] === '.') {
          target[key.substring(1)] = value;
        } else {
          target.setAttribute(key, value.toString());
        }
      }

      if (data instanceof Map) {
        data.forEach(((value, key) => setProperty(key, value)));
      } else {
        Object.entries(data).forEach(([key, value]) => setProperty(key, value));
      }
    }
  }
}

window.customElements.define('a-route', RouteElement);
