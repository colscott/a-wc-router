import { NamedRouting } from './named-routing.js'
import { RouterElement } from './routes-router.js'
import { RouteElement } from './routes-route.js'

class OutletElement extends HTMLElement {

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

  static deserializeDataFromUrl(urlData) {
    let match = urlData.match(/^([\w-]+)(\(.*?\))?(?:\:(.+))?/);
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
      let options = { import: importPath };
      return {
        elementTag,
        data,
        options
      };
    }
  }

  constructor() {
    super();
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
   * @param {string|DocumentFragement|HTMLElement} content - Content that will replace the current content of the outlet
   */
  renderContent(content) {
    this.innerHTML = '';
    console.log('outlet rendered: ' + this.outletName, content);

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

  /**Takes in a url that contains named outlet data and renders the outlet using the information */
  async processNamedUrl(url, supressUrlGeneration) {
    let details = OutletElement.deserializeDataFromUrl(url);
    let options = details.options || {};
    let data = details.data || new Map();

    if (data instanceof Map === false) {
      data = new Map(Object.entries(data || {}));
    }

    // If same tag name then just set the data
    if (this.children && this.children[0] && this.children[0].tagName.toLowerCase() == details.elementTag) {
      RouteElement.setData(this.children[0], data || {});
      return this.children[0];  
    }

    await RouteElement.importCustomElement(options.import, details.elementTag);

    let element = document.createElement(details.elementTag);
    RouteElement.setData(element, data || {});

    this.renderContent(element);

    if (!supressUrlGeneration) {
      RouterElement.updateHistory('');
    }

    return element;
  }
}

window.customElements.define('a-outlet', OutletElement);