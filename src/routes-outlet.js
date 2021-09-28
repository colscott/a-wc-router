import { NamedRouting } from './named-routing.js';
import { RouterElement } from './routes-router.js';
import { RouteElement } from './routes-route.js';

/** */
export class OutletElement extends HTMLElement {
  /** Initialize */
  async connectedCallback() {
    if (this.isConnected) {
      if (!this.created) {
        this.created = true;
        // var p = document.createElement('p');
        // p.textContent = 'Please add your routes!';
        // this.appendChild(p);

        await NamedRouting.addNamedItem(this);
      }
      await RouterElement.initialize();
    }
  }

  /** Dispose */
  disconnectedCallback() {
    if (this.getName()) {
      NamedRouting.removeNamedItem(this.getName());
    }
  }

  /** Initialize */
  constructor() {
    super();

    this.canLeave = NamedRouting.canLeave.bind(this);
  }

  /** @returns {string} value of the attribute called name. Can not be changed was set. */
  getName() {
    if (this.outletName === undefined) {
      this.outletName = this.getAttribute('name');
    }
    return this.outletName;
  }

  /**
   * @private
   * @param {string} url to parse
   * @returns url broken into segments
   */
  _createPathSegments(url) {
    return url.replace(/(^\/+|\/+$)/g, '').split('/');
  }

  /**
   * Replaces the content of this outlet with the supplied new content
   * @fires OutletElement#onOutletUpdated
   * @param {string|DocumentFragment|Node} content - Content that will replace the current content of the outlet
   */
  renderOutletContent(content) {
    this.innerHTML = '';
    // console.info('outlet rendered: ' + this.outletName, content);

    if (typeof content === 'string') {
      this.innerHTML = content;
    } else {
      this.appendChild(content);
    }

    this.dispatchOutletUpdated();
  }

  /**
   * Takes in a url that contains named outlet data and renders the outlet using the information
   * @param {string} url to parse and create outlet content for
   * @returns {Promise<void>} that was added to the outlet as a result of processing the named url
   */
  async processNamedUrl(url) {
    const details = NamedRouting.parseNamedOutletUrl(url);
    const options = details.options || { import: null };
    let data = details.data || new Map();

    if (data instanceof Map === false) {
      data = new Map(Object.entries(data || {}));
    }

    // If same tag name then just set the data
    if (this.children && this.children[0] && this.children[0].tagName.toLowerCase() === details.elementTag) {
      RouteElement.setData(this.children[0], data);
      this.dispatchOutletUpdated();
      return;
    }

    await NamedRouting.importCustomElement(options.import, details.elementTag);

    const element = document.createElement(details.elementTag);
    RouteElement.setData(element, data);

    if (customElements.get(details.elementTag) === undefined) {
      console.error(
        `Custom Element not found: ${details.elementTag}. Are you missing an import or mis-spelled tag name?`,
      );
    }

    this.renderOutletContent(element);
  }

  /** Dispatch the onOutletUpdate event */
  dispatchOutletUpdated() {
    /**
     * Outlet updated event that fires after an Outlet replaces it's content.
     * @event OutletElement#onOutletUpdated
     * @type CustomEvent
     * @property {any} - Currently no information is passed in the event.
     */
    this.dispatchEvent(
      new CustomEvent('onOutletUpdated', {
        bubbles: true,
        composed: true,
        detail: {},
      }),
    );
  }
}

window.customElements.define('a-outlet', OutletElement);
window.customElements.define('an-outlet', class extends OutletElement {});
