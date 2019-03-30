import { ContentBasicElement } from './content-basic.js';

class ContentImportElement extends ContentBasicElement {

    constructor() {
        super();

        this.description = `
            <p>
                Example showing how to defer loading the script defing the custom element until it is rendered for the first time.
                Note that absolute paths must be used. This is due to the import being performed in the router code so the relative path will be relative to the location of the router script. 
            </p>
            <p>
                Note the full absolute path to the custom element script in the url:
                <pre class="ui segment">(/routing-wc/examples/named-outlet/content-import_dot_js)</pre><br>
                The placement of the import source comes just after the tag name in the url.
        `;
    }
}

customElements.define('content-import', ContentImportElement);