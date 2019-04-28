import { ContentBasicElement } from './content-basic.js';

class ContentImportByConventionElement extends ContentBasicElement {

    constructor() {
        super();

        this.description = `
            <p>
                So far we've seen import links where the url explicitly defines the names of the custom element and the optional script file to import that contains the custom element. This can get a little much to type. Consider the following:
            </p>
            <pre class="ui segment">&lt;a is="router-link" href="(main:content-import-byconvention(/a-wc-router/examples/named-outlet/content-import-byconvention.js))"&gt;Import By Convention&lt;/a&gt;</pre><br>
            <p>
                This can be simplified. You can also create links that import custom elements by using a convention based approach. This is an optional opinionated approach but is more terse.<br>
                This will work with kebab case script names that are exactly the same as the custom element they define (with the .js extension).
            </p>
            <pre class="ui segment">&lt;a is="router-link" href="(main:/a-wc-router/examples/named-outlet/content-import-byconvention)"&gt;Import By Convention&lt;/a&gt;</pre><br>
            <p>
                With some creative routing to the script files on the server, you could end up with something like:
            </p>
            <pre class="ui segment">&lt;a is="router-link" href="(main:/admin/user-details:id=3)"&gt;Import By Convention&lt;/a&gt;</pre><br>
        `;
    }
}

customElements.define('content-import-byconvention', ContentImportByConventionElement);