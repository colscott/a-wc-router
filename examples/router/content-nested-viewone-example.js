class ContenNestedViewoneExample extends HTMLElement {
    
    connectedCallback() {
        this.innerHTML = `
            <p>
                <h2>Nested View One</h2>
                Example of a nested routing. The full URL most be supplied that includes any parent routes.<br>
                In this case:<br>
                Base URL -> /a-wc-router/examples/router/
                Parent route -> /nested<br>
                Child route -> /viewone<br>
                So the link was -> /a-wc-router/examples/router/nested/viewone
            </p>
        `;
    }
    
    constructor() {
        super();
    }
}

customElements.define('content-nested-viewone-example', ContenNestedViewoneExample);