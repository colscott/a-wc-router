import './content-nested-viewone-example.js';
import './content-nested-viewtwo-example.js';

class ContentNested extends HTMLElement {
    
    connectedCallback() {
        this.innerHTML = `
            <p>
                This view contains a nested router. There are two links below. The first link is an absolute path specifying both parent route and child route:
                <pre class="ui segment">
&lt;a is="router-link" href="/nested/view-one"&gt;Nested View 1 absolute path&lt;/a&gt;
                </pre>
                The router also has a name. The second link uses the name o the router to target it. Now the second link can use a relative url.
                <pre class="ui segment">
&lt;a is="router-link" href="nested1:webcomponent"&gt;Nested View 2 relative path&lt;/a&gt;
                </pre>
                <div class="ui two item menu">
                    <a  class="item" is="router-link" href="/routing-wc/examples/router/nested/view_one">Nested View 1</a>
                    <a  class="item" is="router-link" href="/routing-wc/examples/router/nested/view_two">Nested View 2</a>
                </div>
<div code-example="Code to output links and outlet below">
    <a-router>
        <an-outlet></an-outlet>
        <a-route path="/view_one" element="content-nested-viewone-example"></a-route>
        <a-route path="/view_two" element="content-nested-viewtwo-example"></a-route>
        <a-route path='*'></a-route>
    </a-router>
</div>
            </p>
        `;
    }
    
    constructor() {
        super();
    }
}

customElements.define('content-nested', ContentNested);