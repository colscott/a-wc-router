import { ContentBasicElement } from './content-basic.js';

class ContentOverviewElement extends ContentBasicElement {

    constructor() {
        super();
        this.description = `
        <p>
            The syntax of a links href attribute targeting named outlets as follows:
            <p>
                Basic Example: <br>
                &lt;a href="(outlet-name:your-tag)" &gt;link&lt;/a&gt;
            </p>
            <p>
                Complete Example:<br>
                <pre class="ui segment">&lt;a href="(outlet-name:your-tag(/path/to/script.js):attr-name=attrValue&.propName=propValue)" &gt;link&lt;/a&gt;</pre>
            </p>
            <p>
                Syntax: <br>
                <div class="ui segment">
                &lt;a href="({outlet-name}:{tag}[{(import-path)}]:[attr-name=attrValue&.prop-name=propValue...])" &gt;
                </div>
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
                        <td>The name of the outlet whose content will be replaced with the custom element.</td>
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
}

customElements.define('content-overview', ContentOverviewElement);