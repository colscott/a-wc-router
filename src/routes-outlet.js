class OutletElement extends HTMLElement {

  connectedCallback() {
    if (this.isConnected) {
      if (!this.created) {
        this.created = true;
        // var p = document.createElement('p');
        // p.textContent = 'Please add your routes!';
        // this.appendChild(p);

        if (this.hasAttribute('name')) {
          OutletElement.namedOutletRegistry = OutletElement.namedOutletRegistry || {};
          this.outletName = this.getAttribute('name');
          
          if (OutletElement.namedOutletRegistry[this.outletName]) {
            throw 'Found existing route named ' + this.outletName + ' when trying to add outlet of same name';
          }

          OutletElement.namedOutletRegistry[this.outletName] = this;

          if (OutletElement.assignedOutlets && OutletElement.assignedOutlets[outletName]) {
            let assignedOutlet = OutletElement.assignedOutlets[outletName];
            OutletElement.setOutlet(outletName, assignedOutlet.elementTag, assignedOutlet.data, assignedOutlet.options);
          }
        }
      }
    }
  }

  disconnectedCallback() {
    if (OutletElement.namedOutletRegistry[this.outletName]) {
      delete OutletElement.namedOutletRegistry[this.outletName];
    }
  }

  /**
   * Assigns a custom element to a named OutletElement
   * @param {string} outletName - Name of the outlet to render the custom element in
   * @param {string} elementTag - Tag name of the custom element to render
   * @param {object} data - Data to pass to the custom element. Data entries are set to attributes unless the first character of the name portion starts with a period '.'. In this case it is regarded as a property.
   * @param {object} options - 
   * @property {string} options.import - A module to load that contains the custom element definition. Only used if the custom element has not bee registered already.
   */
  static async setOutlet(outletName, elementTag, data, options) {
    options = options || {};

    let namedOutlet = (OutletElement.namedOutletRegistry || {})[outletName];
    if (!namedOutlet) {
      // Outlet does not exist yet. Assignment will be made whenoutlet with name is available.
      return false;
    }

    await RouteElement.importCustomElement(options.import, elementTag);

    let element = document.createElement(elementTag);
    RouteElement.setData(element, data || {});

    namedOutlet.renderContent(element);

    //TODO change the URL

    return element;
  }

  constructor() {
    super();
  }

  _createPathSegments(url) {
    return url.replace(/(^\/+|\/+$)/g, '').split('/');
  }

  /**
   * Replaces the content of this outlet with the supplied new content
   * @fires OutletElement#onOutletUpdated
   * @param {string|DocumentFragement|HTMLElement} content - Content that will replace the current content of the outlet
   */
  renderContent(content) {
    this.innerHTML = '';
    console.log('outlet rendered: ' + this.id);

    if (typeof content === 'string' || content instanceof String) {
      this.innerHTML = content;
    } else {
      this.appendChild(content);
    }
    
    /**
     * Outlet updated event that fires after an Outlet replaces it's content.
     * @event OutletElement#onOutletUpdated
     * @type CustomEvent
     * @property {any} - Currently no information is passed in the event.
     */
    this.dispatchEvent(
      new CustomEvent(
        'onOutletUpdated',
        {
          bubbles: true,
          composed: true,
          detail: { }}));
  }
}

window.customElements.define('a-outlet', OutletElement);