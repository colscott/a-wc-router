///@ts-check
/**
  * @typedef ParseNamedOutletAsignment
  * @property {string} elementTag
  * @property {Map} data
  * @property {Object} options
  * @property {string} options.import
  */
/**
  * @typedef {Object} NamedMatch
  * @property {name} name of the route or outlet to assign to
  * @property {string} url - The assignment url
  * @property {string} urlEscaped - The assignment url escaped
  * @property {boolean} cancelled - If a failed attempt at assignment was made
  * @property {ParseNamedOutletAsignment} namedOutlet - Any named outlet assignments found
  */
/** 
 * Regestry for named routers and outlets. 
 * Simplifies nested routing by being able to target specific routers and outlets in a link. 
 * Can act as a message bus of sorts. Named items being the handlers and assignments as the messages.
 */
export class NamedRouting {
  /**Adds a router or outlet to the registry */
  static addNamedItem(name, item) {
    if (item === undefined) {
      item = name;
      name = '';
    }

    if (!name) {
      name = item.getName();
    }

    if (name) {
      if (NamedRouting.registry[name]) {
        throw `Error adding named item ${name}, item with that name already registered`;
      }

      NamedRouting.registry[name] = item;

      let assignment = NamedRouting.getAssignment(name);

      if (assignment && item.canLeave(assignment.url)) {
        item.processNamedUrl(assignment.url)
      }
    }
  }

  /**Removes an item by name from the registry if it exists. */
  static removeNamedItem(name) {
    if (NamedRouting.registry[name]) {
      delete NamedRouting.registry[name];
    }
  }

  /**Gets an item by name from the registry */
  static getNamedItem(name) {
    return NamedRouting.registry[name];
  }

  /**Retrieves and removes an assignment from the registry */
  static consumeAssignement(name) {
    let assignment = NamedRouting.getAssignment(name);
    if (assignment) {
      NamedRouting.removeAssignment(name);
    }

    return assignment;
  }

  /**Gets an assignment from the registry */
  static getAssignment(name) {
    return NamedRouting.assignments[name];
  }

  /**Add an assignment to the registry. Will override an assignement if one already exists with the same name. */
  static addAssignment(name, url) {
    let lastAssignment = NamedRouting.assignments[name];
    NamedRouting.assignments[name] = {name, url};
    let namedItem = NamedRouting.getNamedItem(name);
    if (namedItem) {
      if (namedItem.canLeave(url) === false) {
        NamedRouting.assignments[name] = lastAssignment;
        return false;
      }

      namedItem.processNamedUrl(url);
    }
  }

  /**Removes an assignment from the registry */
  static removeAssignment(name) {
    if (NamedRouting.assignments[name]) {
      delete NamedRouting.assignments[name];
      return true;
    }
    return false;
  }

  /**Serializes the current assignements for URL. */
  static generateNamedItemsUrl() {
    let url = '';
    let assignments = NamedRouting.assignments;
    for (let itemName in assignments) {
      if (url.length) {
        url += '::';
      }
      url += NamedRouting.generateUrlFragment(assignments[itemName]);
    }
    return url;
  }

  /**Serializes an assignment for URL. */
  static generateUrlFragment(assignment) {
    // Polymer server does not like the period in the import statement
    return `(${assignment.name}:${assignment.url.replace(/\./g, '_dot_')})`;
  }

  /**
   * Parses a URL section and tries to get a named item from it.
   * @param {string} url
   * @param {boolean} [supressAdding]
   * @returns {object} null if not able to parse
   */
  static parseNamedItem(url, supressAdding) {
    if (url[0] === '/') {
      url = url.substr(1);
    }

    if (url[0] === '(') {
      url = url.substr(1, url.length - 2);
    }

    let match = url.match(/^\/?\(?([\w_-]+)\:(.*)\)?/);
    if (match) {
      // Polymer server does not like the period in the import statement
      let urlEscaped = match[2].replace(/_dot_/g, '.');
      let routeCancelled = false;
      if (supressAdding !== true) {
        if(NamedRouting.addAssignment(match[1], urlEscaped) === false) {
          routeCancelled = true;
        }
      }
      return {
        name: match[1],
        url: match[2],
        urlEscaped: urlEscaped,
        cancelled: routeCancelled,
        namedOutlet: NamedRouting.parseNamedOutletUrl(match[2])
      };
    }

    return null;
  }

  /**
   * Takes a url for a named outlet assignment and parses
   * @param {string} url
   * @returns {ParseNamedOutletAsignment|null} null is returned if the url could not be parsed into a named outlet assignment
   */
  static parseNamedOutletUrl(url) {
    let match = url.match(/^([/\w-]+)(\(.*?\))?(?:\:(.+))?/);
    if (match) {
      var data = new Map();
      
      if (match[3]) {
        var keyValues = match[3].split('&');
        for (var i = 0, iLen = keyValues.length; i < iLen; i++) {
          let keyValue = keyValues[i].split('=');
          data.set(decodeURIComponent(keyValue[0]), decodeURIComponent(keyValue[1]));
        }
      }
      let elementTag = match[1];
      let importPath = match[2] && match[2].substr(1, match[2].length - 2);

      let inferredElementTag = NamedRouting.inferCustomElementTagName(elementTag);
      if (!importPath) {
        importPath = NamedRouting.inferCustomElementImportPath(elementTag, inferredElementTag);
      }

      let options = { import: importPath };
      return {
        elementTag: inferredElementTag,
        data,
        options
      };
    }
    return null;
  }

  /**
   * @param {string} importStyleTagName
   * @param {string} elementTag
   * @returns {string} the custom element import path infered from the import style string
   */
  static inferCustomElementImportPath(importStyleTagName, elementTag) {
    if (customElements.get(elementTag) !== undefined) {
      // tag is loaded. no need for import.
      return undefined;
    }

    let inferredPath = importStyleTagName;

    let lastForwardSlash = inferredPath.lastIndexOf('/');
    if (lastForwardSlash === -1) {
      inferredPath = '/' + inferredPath;
    }

    let dotIndex = inferredPath.indexOf('.');
    if (dotIndex === -1) {
      inferredPath += '.js';
    }

    return inferredPath;
  }

  /**
   * @param {string} elementTag
   * @returns {string} the custom element tag name infered from import style string
   */
  static inferCustomElementTagName(elementTag) {
    let inferredTagName = elementTag;
    
    // get class name from path
    let lastForwardSlash = inferredTagName.lastIndexOf('/');
    if (lastForwardSlash > -1) {
      inferredTagName = inferredTagName.substring(lastForwardSlash + 1);
    }

    // get class name from file name
    let dotIndex = inferredTagName.indexOf('.');
    if (dotIndex > -1) {
      inferredTagName = inferredTagName.substring(0, dotIndex - 1);
    }

    // to kebab case
    inferredTagName = inferredTagName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    return inferredTagName;
  }

  /**
   * Prefetches an import module so that it is available when the link is activated
   * @param {NamedMatch} namedAssignment item assignment
   */
  static prefetchNamedOutletImports(namedAssignment) {
    if (namedAssignment.namedOutlet && namedAssignment.namedOutlet.options && namedAssignment.namedOutlet.options.import) {
      NamedRouting.pageReady().then(() => NamedRouting.importCustomElement(namedAssignment.namedOutlet.options.import, namedAssignment.namedOutlet.elementTag));
    }
  }

  /**
   * Imports a script for a customer element once the page has loaded
   * @param {string} importSrc 
   * @param {string} tagName 
   */
  static prefetchImport(importSrc, tagName) {
    NamedRouting.pageReady().then(() => NamedRouting.importCustomElement(importSrc, tagName));
  }

  /**
   * Imports a script for a customer element
   * @param {string} importSrc 
   * @param {string} tagName 
   */
  static async importCustomElement(importSrc, tagName) {
    if (importSrc && customElements.get(tagName) === undefined) {
      await import(importSrc);
    }
  }

  /**
   * 
   */
  static pageReady() { 
    if (!NamedRouting.pageReadyPromise) {
      NamedRouting.pageReadyPromise = document.readyState === 'complete'
      ? Promise.resolve()  
      : new Promise((resolve, reject) => {
        let callback = () => {
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
 static canLeave (newRoute)
 {
   /**
      * Event that can be cancelled to prevent this route from being navigated away from.
      * @event RouteElement#onRouteLeave
      * @type CustomEvent
      * @property {Object} details - The event details
      * @property {RouteElement} details.route - The RouteElement that performed the match.
      */
   var canLeaveEvent = new CustomEvent(
     'onRouteLeave',
     {
       bubbles: true,
       cancelable: true,
       composed: true,
       detail: { route: newRoute }});
   // @ts-ignore
   // This method is designed to be bound to a Custom Element instance. It located in here for general visibility.
   this.dispatchEvent(canLeaveEvent); 
   return !canLeaveEvent.defaultPrevented;
 }
}

NamedRouting.pageReadyPromise = undefined;
NamedRouting.registry = {};
NamedRouting.assignments = {};