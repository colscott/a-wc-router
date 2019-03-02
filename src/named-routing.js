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

      if (assignment) {
        item.processNamedUrl(assignment.url);
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
    NamedRouting.assignments[name] = {name, url};
    let namedItem = NamedRouting.getNamedItem(name);
    if (namedItem) {
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
      if (supressAdding !== true) {
        NamedRouting.addAssignment(match[1], urlEscaped);
      }
      return {
        name: match[1],
        url: match[2],
        urlEscaped: urlEscaped
      };
    }

    return null;
  }
}

NamedRouting.registry = {};
NamedRouting.assignments = {};