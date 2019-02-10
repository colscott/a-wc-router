
class TestDummyElement extends HTMLElement {

  connectedCallback(){
    if (!this.created) {
      this.created = true;
      var p = document.createElement('p');
      var content = 'Test Element';
      
      if (this.hasAttribute('requiredParam')) {
        content += ' ' + this.getAttribute('requiredParam');
      }

      p.textContent = content;
      this.appendChild(p);
    }
  }

  constructor() {
    super(); 
  }
}

window.customElements.define('test-dummy', TestDummyElement);