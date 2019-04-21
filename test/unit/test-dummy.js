
class TestDummyElement extends HTMLElement {

  render() {
    this.innerHTML = `<p>Test Element${this.getRequiredParam()}</p>`;
  }

  getRequiredParam() {
    if (this.hasAttribute('requiredParam')) {
      return ' ' + this.getAttribute('requiredParam');
    }

    return '';
  }

  static get observedAttributes() { return ['requiredparam']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'requiredparam') {
      this.render();
    }
  }

  // TODO test fails because same element instance is reused but the attributes are not ebing rendered after beind dynamically changed.

  connectedCallback() {
    this.render();
  }

  constructor() {
    super(); 
  }
}

window.customElements.define('test-dummy', TestDummyElement);