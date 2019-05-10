///@ts-check
import {RouterElement} from './routes-router.js';

/** Helper to dispatch events that will signal the registering of links. */
const dispatchRegisterLink = function(link) {
  window.dispatchEvent(
    new CustomEvent(
        'routerLinksAdded', {
            detail: {
                links: [link] }}));
}

class RouterLinkElement extends HTMLAnchorElement {
  /** @inheritdoc */
  connectedCallback() {
    RouterElement.initialize();
    dispatchRegisterLink(this);
    
  }

  /** @inheritdoc */
  static get observedAttributes() { return ['href']; }

  /**
   * @inheritdoc
   * Listens for href attribute changing. If it does then it re-regesters the link.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'href') {
      if (oldValue && newValue) {
        dispatchRegisterLink(this);
      }
    }
  }

  /** @inheritdoc */
  constructor() {
    super();
  }
}

window.customElements.define('router-link', RouterLinkElement, { extends: 'a' });