class ContenNestedViewoneExample extends HTMLElement {
    
    connectedCallback() {
        this.innerHTML = `
            <p>
                <h2>View One - targeted via a named router</h2>
                Example of a named nested routing. Only the path of the route being targeted is required as the router is targeted by name.<br>
                In this case:<br>
                Router Name -> nestedrouter
                Route -> view_one
                So the link was -> href="(nestedrouter:view_one)"
            </p>
        `;
    }
    
    constructor() {
        super();
    }
}

customElements.define('content-nested-named-viewone-example', ContenNestedViewoneExample);