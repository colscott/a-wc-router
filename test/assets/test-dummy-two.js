
class TestDummyTwoElement extends HTMLElement {

  connectedCallback(){
    if (!this.created) {
      this.created = true;
      var p = document.createElement('p');
      var content = 'Test Element Two';

      p.textContent = content;
      this.appendChild(p);
    }
  }

  constructor() {
    super(); 
  }
}

window.customElements.define('test-dummy-two', TestDummyTwoElement);