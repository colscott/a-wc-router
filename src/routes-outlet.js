class OutletElement extends HTMLElement {

  connectedCallback(){
    if (!this.created) {
      this.created = true;
      var p = document.createElement('p');
      p.textContent = 'Please add your routes!';
      this.appendChild(p);
    }

    if (this.isConnected) {
      // TODO Support named outlets that do not require routers. They are simply fed cstom elements.
    }
  }

  constructor() {
    super();
  }

  /**
   * Replaces the content of this outlet with the supplied new content
   * @fires OutletElement#onOutletUpdated
   * @param {string|DocumentFragement|HTMLElement} content - Content that will replace the current content of the outlet
   */
  renderContent(content) {
    this.innerHTML = '';
    console.log('outlet rendered: ' + this.id);

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
}

window.customElements.define('a-outlet', OutletElement);