import './content-nested-named-viewone-example.js';
import './content-nested-named-viewtwo-example.js';

class ContentNamed extends HTMLElement {
    
    connectedCallback() {
        this.innerHTML = `
        <p>
            This view contains a named router. There are two links below. Both links use named relative URLs to target the nested router.
            <pre class="ui segment">
&lt;a is="router-link" href="(nestedrouter:/view_one)"&gt;Nested View 1&lt;/a&gt;
&lt;a is="router-link" href="(nestedrouter:/view_two)"&gt;Nested View 2&lt;/a&gt;
            </pre>
            The href is made up of (RouterName:/RoutePath).<br>
            You can have as many levels of nestings as you require.<br>
            Using named routers is a good way to have Routers on different parts of the page (auxiliary reouters).
            <div class="ui two item menu">
                <a  class="item" is="router-link" href="(nestedrouter:view_one)">Nested View 1</a>
                <a  class="item" is="router-link" href="(nestedrouter:view_two)">Nested View 2</a>
            </div>
    <div code-example="Code to output links and outlet below">
<a-router name="nestedrouter">
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

customElements.define('content-named', ContentNamed);