import './content-nested-viewone-example.js';
import './content-nested-viewtwo-example.js';

class ContentNested extends HTMLElement {
    
    connectedCallback() {
        this.innerHTML = `
        <p>
        This view contains a nested router. There are two links below. Both links have the full URL specified to target the nested router.
        <pre class="ui segment">
&lt;a is="router-link" href="/routing-wc/examples/router/nested/view_one"&gt;Nested View 1&lt;/a&gt;
&lt;a is="router-link" href="/routing-wc/examples/router/nested/view_two"&gt;Nested View 2&lt;/a&gt;
        </pre>
        The href is made up of BaseUrl + ParentRouterUrl + NestedRouterUrl.<br>
        You can have as many levels of nestings as you require.
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