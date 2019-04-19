///@ts-check
import { NamedRouting } from './named-routing.js'
import { RouterElement } from './routes-router.js'
import { RouteElement } from './routes-route.js'

export class OutletElement extends HTMLElement {

  connectedCallback() {
    if (this.isConnected) {
      if (!this.created) {
        this.created = true;
        // var p = document.createElement('p');
        // p.textContent = 'Please add your routes!';
        // this.appendChild(p);

        NamedRouting.addNamedItem(this);
      }
      RouterElement.initialize();
    }
  }

  disconnectedCallback() {
    if (this.getName()) {
      NamedRouting.removeNamedItem(this.getName());
    }
  }

  constructor() {
    super();

    this.canLeave = NamedRouting.canLeave.bind(this);
  }

  getName() {
    if (this.outletName === undefined) {
      this.outletName = this.getAttribute('name')
    }
    return this.outletName;
  }

  _createPathSegments(url) {
    return url.replace(/(^\/+|\/+$)/g, '').split('/');
  }

  /**
   * Replaces the content of this outlet with the supplied new content
   * @fires OutletElement#onOutletUpdated
   * @param {string|DocumentFragment|HTMLElement} content - Content that will replace the current content of the outlet
   */
  renderOutletContent(content) {
    this.innerHTML = '';
    // console.log('outlet rendered: ' + this.outletName, content);

    if (typeof content === 'string') {
      this.innerHTML = content;
    } else {
      this.appendChild(content);
    }

    this.dispatchOuletUpdated();
  }

  /**
   * Takes in a url that contains named outlet data and renders the outlet using the information
   * @param {string} url
   * @param {boolean} supressUrlGeneration
   */
  async processNamedUrl(url, supressUrlGeneration) {
    let details = NamedRouting.parseNamedOutletUrl(url);
    let options = details.options || {import: null};
    let data = details.data || new Map();

    if (data instanceof Map === false) {
      data = new Map(Object.entries(data || {}));
    }

    // If same tag name then just set the data
    if (this.children && this.children[0] && this.children[0].tagName.toLowerCase() == details.elementTag) {
      RouteElement.setData(this.children[0], data || {});
      this.dispatchOuletUpdated();
      return this.children[0];  
    }

    await NamedRouting.importCustomElement(options.import, details.elementTag);

    let element = document.createElement(details.elementTag);
    RouteElement.setData(element, data || {});

    if (customElements.get(details.elementTag) === undefined) {
      console.error(`Custom Element not found ${details.elementTag}. Are you missing an import?`);
    }

    this.renderOutletContent(element);

    if (!supressUrlGeneration) {
      RouterElement.updateHistory('');
    }

    return element;
  }

  dispatchOuletUpdated() {
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

window.customElements.define('an-outlet', OutletElement);