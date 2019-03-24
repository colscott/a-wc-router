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
            <p>
            The syntax of the named outlet href is as follows:
            <p>
                Basic Example: <br>
                &lt;a href="outlet-name:your-tag" &gt;link&lt;/a&gt;
            </p>
            <p>
                Complete Example:<br>
                &lt;a href="outlet-name:your-tag(/path/to/script.js)):attr-name=attrValue&.propName=propValue" &gt;link&lt;/a&gt;
            </p>
            <p>
                Syntax: <br>
                &lt;a href="{outlet-name}:{tag}[{(import-path)}]:[attr-name=attrValue&.prop-name=propValue...]" &gt;
            </p>
            <table class="ui very basic collapsing celled table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Required</th>
                        <th>Description</th>
                        <th>Example</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>outlet-name</td>
                        <td>Required</td>
                        <td>The name of the outlet whoes content will be replaced with the custom element.</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>tag</td>
                        <td>Required</td>
                        <td>The tag name to insert into the named outlet</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>import-path</td>
                        <td>Optional</td>
                        <td>Configure if the script that defines the custom element is to be loaded on demand. Path should be absolute and wrapped in parentheses</td>
                        <td>(/full/path/yourelement.js)</td>
                    </tr>
                    <tr>
                        <td>Parameters</td>
                        <td>Optional</td>
                        <td>Parameters to be set on the custom element. Can be HTML attributes or JavaScript instance properties. NOTE: the outlet rendering will not replace the content if it is being replaced with the same custom element tag. Instead it will update the paramters. Make your custom element tracks attribute and property changes and performs rendering.</td>
                        <td>my-attribute=value1&.myProperty=value2</td>
                    </tr>
                </tbody>
            </table>
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