export class ContentBasicElement extends HTMLElement {

    connectedCallback() {
        if (!this._initialized) {
            this._initialized = true;
            this.render();
        }
    }

    static get observedAttributes() { return ['param1', 'param2']; }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    constructor() {
        super();

        this.description = `
            <p>
            A simple example that assigns/injects a native custom element into a named outlet.
            If the named outlet exists the custom element will be rendered in th eoutlet.
            If the outlet does not exist the assignment is still made and if/when the named outlet first added to the DOM it the assignment will take place. The assignment will wait for the named outlet to exist.
            </p>
        `;
    }

    render() {
        this.innerHTML = `
            <div class="ui segment">
                <div class="ui header">Description</div>
                ${this.description}
            </div>
            
            <div class="ui segment">
                <div class="ui header">
                    Paramters Passed
                </div>
                <table class="ui very basic collapsing celled table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td data-label="Type">HTML Attribute</td>
                            <td data-label="Name">param1</td>
                            <td data-label="Value">${this.getAttribute('param1') || 'not set'}</td>
                        </tr>
                        <tr>
                            <td data-label="Type">HTML Attribute</td>
                            <td data-label="Name">param2</td>
                            <td data-label="Value">${this.getAttribute('param2') || 'not set'}</td>
                        </tr>
                        <tr>
                            <td data-label="Type">Object Instance property</td>
                            <td data-label="Name">param3</td>
                            <td data-label="Value">${this.param3 || 'not set'}</td>
                        </tr>
                        <tr>
                            <td data-label="Type">Object Instance property</td>
                            <td data-label="Name">param4</td>
                            <td data-label="Value">${this.param4 || 'not set'}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>

        `;
    }
}

customElements.define('content-basic', ContentBasicElement);