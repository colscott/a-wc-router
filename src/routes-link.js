import { RouterElement } from './routes-router.js';

/** */
class RouterLinkElement extends HTMLAnchorElement {
  /** @inheritdoc */
  connectedCallback() {
    RouterElement.initialize();
    this.register();
  }

  /** @inheritdoc */
  static get observedAttributes() {
    return ['href'];
  }

  /**
   * @inheritdoc
   * Listens for href attribute changing. If it does then it re-registers the link.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'href') {
      if (oldValue && newValue) {
        this.register();
      }
    }
  }

  /** @inheritdoc */
  constructor() {
    super();
  }

  /** Helper to dispatch events that will signal the registering of links. */
  register() {
    window.dispatchEvent(
      new CustomEvent('routerLinksAdded', {
        detail: {
          links: [this],
        },
      }),
    );
  }
}

window.customElements.define('router-link', RouterLinkElement, { extends: 'a' });
