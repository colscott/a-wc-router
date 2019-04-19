class ContenNestedViewtwoExample extends HTMLElement {
    
    connectedCallback() {
        this.innerHTML = `
            <p>
                <h2>View Two - targeted via a named router</h2>
                Example of a named nested routing. Only the path of the route being targeted is required as the router is targeted by name.<br>
                In this case:<br>
                Router Name -> nestedrouter
                Route -> view_two
                So the link was -> href="(nestedrouter:view_two)"
            </p>
        `;
    }
    
    constructor() {
        super();
    }
}

customElements.define('content-nested-named-viewtwo-example', ContenNestedViewtwoExample);