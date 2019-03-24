class RouterLinkElement extends HTMLAnchorElement {
  connectedCallback() {
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