///@ts-check
import {RouterElement} from './routes-router.js';

class RouterLinkElement extends HTMLAnchorElement {
  connectedCallback() {

    super.connectedCallback && super.connectedCallback();

    RouterElement.initialize();

    window.dispatchEvent(
      new CustomEvent(
          'routerLinksAdded', {
              detail: {
                  links: [this] }}));
  }

  constructor() {
    super();
  }
}

window.customElements.define('router-link', RouterLinkElement, { extends: 'a' });