class ContenNestedExample extends HTMLElement {
    
    connectedCallback() {
        this.innerHTML = `
            <p>
                Content ${this.getAttribute('pagenum')}
            </p>
        `;
    }
    
    constructor() {
        super();
    }
}

customElements.define('content-nested-example', ContenNestedExample);