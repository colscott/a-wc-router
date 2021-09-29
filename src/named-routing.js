// /@ts-check
/**
 * @typedef {Object} Assignment
 * @property {string} name of item the assignment is targeting
 * @property {string} url fragment to be assigned to the item
 */
/**
 * @typedef {Object} ParseNamedOutletAssignment
 * @property {string} elementTag
 * @property {Map} data
 * @property {Object} options
 * @property {string} options.import
 */

/**
 * @typedef {Object} NamedMatch
 * @property {string} name of the route or outlet to assign to
 * @property {string} url - The assignment url that was matched and consumed
 * @property {string} urlEscaped - The url that was matched and consumed escaped of certain characters that will break the url on servers.
 * @property {boolean} cancelled - If a failed attempt at assignment was made
 * @property {ParseNamedOutletAssignment} namedOutlet - Any named outlet assignments found
 */
/**
 * Registry for named routers and outlets.
 * Simplifies nested routing by being able to target specific routers and outlets in a link.
 * Can act as a message bus of sorts. Named items being the handlers and assignments as the messages.
 */
export class NamedRouting {
  /**
   * Adds a router or outlet to the registry
   * @param {import('./models').NamedRoutingHandler} item to add
   */
  static async addNamedItem(item) {
    const name = item.getName();

    if (name) {
      if (NamedRouting.registry[name]) {
        throw Error(`Error adding named item ${name}, item with that name already registered`);
      }

      NamedRouting.registry[name] = item;

      const assignment = NamedRouting.getAssignment(name);

      if (assignment && item.canLeave(assignment.url)) {
        await item.processNamedUrl(assignment.url);
      }
    }
  }

  /** Removes an item by name from the registry if it exists. */
  static removeNamedItem(name) {
    if (NamedRouting.registry[name]) {
      delete NamedRouting.registry[name];
    }
  }

  /** Gets an item by name from the registry */
  static getNamedItem(name) {
    return NamedRouting.registry[name];
  }

  /** Gets an assignment from the registry */
  static getAssignment(name) {
    return NamedRouting.assignments[name];
  }

  /**
   * Add an assignment to the registry. Will override an assignment if one already exists with the same name.
   * @param {string} name the name of the named item to target with the assignment
   * @param {string} url to assign to the named item
   * @returns {Promise<import('./routes-route').Match|boolean>} when assignment is completed. false is returned if the assignment was cancelled for some reason.
   */
  static async addAssignment(name, url) {
    const lastAssignment = NamedRouting.assignments[name];
    NamedRouting.assignments[name] = { name, url };
    const namedItem = NamedRouting.getNamedItem(name);
    if (namedItem) {
      if (namedItem.canLeave(url) === false) {
        NamedRouting.assignments[name] = lastAssignment;
        return false;
      }

      await namedItem.processNamedUrl(url);
    }
    return true;
  }

  /** Removes an assignment from the registry */
  static removeAssignment(name) {
    if (NamedRouting.assignments[name]) {
      delete NamedRouting.assignments[name];
      return true;
    }
    return false;
  }

  /** @returns {string} Serializes the current assignments into URL representation. */
  static generateNamedItemsUrl() {
    return Object.values(NamedRouting.assignments).reduce(
      (url, assignment) => `${url.length ? '::' : ''}${NamedRouting.generateUrlFragment(assignment)}`,
      '',
    );
  }

  /** Serializes an assignment for URL. */
  static generateUrlFragment(assignment) {
    // Polymer server does not like the period in the import statement
    return `(${assignment.name}:${assignment.url.replace(/\./g, '_dot_')})`;
  }

  /**
   * Parses a URL section and tries to get a named item from it.
   * @param {string} url containing the assignment and the named item
   * @param {boolean} [suppressAdding] of the assignment and only return the match in a dry run
   * @returns {Promise<NamedMatch|null>} null if not able to parse. If we are adding the named item then the promise is resolved when item is added and any routing has taken place.
   */
  static async parseNamedItem(url, suppressAdding) {
    let _url = url;
    if (_url[0] === '/') {
      _url = _url.substr(1);
    }

    if (_url[0] === '(') {
      _url = _url.substr(1, _url.length - 2);
    }

    const match = _url.match(/^\/?\(?([\w_-]+)\:(.*)\)?/);
    if (match) {
      // Polymer server does not like the period in the import statement
      const urlEscaped = match[2].replace(/_dot_/g, '.');
      let cancelled = false;
      if (suppressAdding !== true) {
        if ((await NamedRouting.addAssignment(match[1], urlEscaped)) === false) {
          cancelled = true;
        }
      }
      return {
        name: match[1],
        url: match[2],
        urlEscaped,
        cancelled,
        namedOutlet: NamedRouting.parseNamedOutletUrl(match[2]),
      };
    }

    return null;
  }

  /**
   * Takes a url for a named outlet assignment and parses
   * @param {string} url
   * @returns {ParseNamedOutletAssignment|null} null is returned if the url could not be parsed into a named outlet assignment
   */
  static parseNamedOutletUrl(url) {
    const match = url.match(/^([/\w-]+)(\(.*?\))?(?:\:(.+))?/);
    if (match) {
      const data = new Map();

      if (match[3]) {
        const keyValues = match[3].split('&');
        for (let i = 0, iLen = keyValues.length; i < iLen; i++) {
          const keyValue = keyValues[i].split('=');
          data.set(decodeURIComponent(keyValue[0]), decodeURIComponent(keyValue[1]));
        }
      }
      const elementTag = match[1];
      let importPath = match[2] && match[2].substr(1, match[2].length - 2);

      const inferredElementTag = NamedRouting.inferCustomElementTagName(elementTag);
      if (inferredElementTag === null) {
        return null;
      }

      if (!importPath) {
        importPath = NamedRouting.inferCustomElementImportPath(elementTag, inferredElementTag);
      }

      const options = { import: importPath };
      return {
        elementTag: inferredElementTag,
        data,
        options,
      };
    }
    return null;
  }

  /**
   * @param {string} importStyleTagName
   * @param {string} elementTag
   * @returns {string} the custom element import path inferred from the import style string
   */
  static inferCustomElementImportPath(importStyleTagName, elementTag) {
    if (customElements.get(elementTag) !== undefined) {
      // tag is loaded. no need for import.
      return undefined;
    }

    let inferredPath = importStyleTagName;

    const lastForwardSlash = inferredPath.lastIndexOf('/');
    if (lastForwardSlash === -1) {
      inferredPath = `/${inferredPath}`;
    }

    const dotIndex = inferredPath.indexOf('.');
    if (dotIndex === -1) {
      inferredPath += '.js';
    }

    return inferredPath;
  }

  /**
   * @param {string} elementTag
   * @returns {string} the custom element tag name inferred from import style string
   */
  static inferCustomElementTagName(elementTag) {
    let inferredTagName = elementTag;

    // get class name from path
    const lastForwardSlash = inferredTagName.lastIndexOf('/');
    if (lastForwardSlash > -1) {
      inferredTagName = inferredTagName.substring(lastForwardSlash + 1);
    }

    // get class name from file name
    const dotIndex = inferredTagName.indexOf('.');
    if (dotIndex > -1) {
      inferredTagName = inferredTagName.substring(0, dotIndex - 1);
    }

    // to kebab case
    inferredTagName = inferredTagName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    if (inferredTagName.indexOf('-') === -1) {
      inferredTagName = null;
    }

    return inferredTagName;
  }

  /**
   * Pre-fetches an import module so that it is available when the link is activated
   * @param {NamedMatch} namedAssignment item assignment
   * @returns {Promise} resolves when the import is completed
   */
  static async prefetchNamedOutletImports(namedAssignment) {
    if (
      namedAssignment.namedOutlet &&
      namedAssignment.namedOutlet.options &&
      namedAssignment.namedOutlet.options.import
    ) {
      await NamedRouting.pageReady();
      await NamedRouting.importCustomElement(
        namedAssignment.namedOutlet.options.import,
        namedAssignment.namedOutlet.elementTag,
      );
    }
  }

  /**
   * Imports a script for a customer element once the page has loaded
   * @param {string} importSrc
   * @param {string} tagName
   */
  static async prefetchImport(importSrc, tagName) {
    await NamedRouting.pageReady();
    await NamedRouting.importCustomElement(importSrc, tagName);
  }

  /**
   * Imports a script for a customer element
   * @param {string} importSrc
   * @param {string} tagName
   */
  static async importCustomElement(importSrc, tagName) {
    if (importSrc && customElements.get(tagName) === undefined) {
      // @ts-ignore
      await import(/* webpackIgnore: true */ importSrc);
    }
  }

  /**
   *
   */
  static pageReady() {
    if (!NamedRouting.pageReadyPromise) {
      NamedRouting.pageReadyPromise =
        document.readyState === 'complete'
          ? Promise.resolve()
          : new Promise((resolve, reject) => {
              /** handle readystatechange callback */
              const callback = () => {
                if (document.readyState === 'complete') {
                  document.removeEventListener('readystatechange', callback);
                  resolve();
                }
              };
              document.addEventListener('readystatechange', callback);
            });
    }

    return NamedRouting.pageReadyPromise;
  }

  /**
   * Called just before leaving for another route.
   * Fires an event 'routeOnLeave' that can be cancelled by preventing default on the event.
   * @fires RouteElement#onRouteLeave
   * @param {*} newRoute - the new route being navigated to
   * @returns bool - if the currently active route can be left
   */
  static canLeave(newRoute) {
    /**
     * Event that can be cancelled to prevent this route from being navigated away from.
     * @event RouteElement#onRouteLeave
     * @type CustomEvent
     * @property {Object} details - The event details
     * @property {RouteElement} details.route - The RouteElement that performed the match.
     */
    const canLeaveEvent = new CustomEvent('onRouteLeave', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { route: newRoute },
    });
    // @ts-ignore
    // This method is designed to be bound to a Custom Element instance. It located in here for general visibility.
    this.dispatchEvent(canLeaveEvent);
    return !canLeaveEvent.defaultPrevented;
  }
}

NamedRouting.pageReadyPromise = undefined;
NamedRouting.registry = {};
/** @type {{[k: string]: Assignment}} */
NamedRouting.assignments = {};
