export class NestedOutletContentOneElement extends HTMLElement {

    connectedCallback() {
        if (!this._initialized) {
            this._initialized = true;
            this.render();
        }
    }

    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            <p>Hello example ${this.getAttribute('title') || 'Editorials'}!</p>
            <p>Param1 - ${this.getAttribute('param1') || 'not set'}<p>
            <p>Param2 - ${this.getAttribute('param2') || 'not set'}<p>
        `;
    }
}

customElements.define('nested-outlet-content-one', NestedOutletContentOneElement);