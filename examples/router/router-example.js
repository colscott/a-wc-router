// import { RouterElement } from '../../build/es6-bundled/src/router.js'
import '../../src/routes-outlet.js';
import '../../src/routes-link.js';

import './../shared/main-menu.js';
import './../shared/code-example.js';

import './content-overview.js';
import './content-nested.js';
import './content-named.js';
import './content-guards.js'

class RouterExampleElement extends HTMLElement {
    
    connectedCallback() {
        if (!this._initialized) {
            this._initialized = true;
            this.render();
        }
    }
    
    constructor(){
        super();
    }

    render() {
        this.innerHTML = `
<common-styles></common-styles>
<div class="ui grid">
    <div class="four wide column">
        <main-menu></main-menu>
    </div>
    <div class="eleven wide column">
        <code-example class="ui segment"></code-example>
        <div class="ui segment" code-example="Code to output links and outlet below">
<div class="ui four item menu">
    <a  class="item" is="router-link" href="/a-wc-router/examples/router/webcomponent">Overiew</a>
    <a  class="item" is="router-link" href="/a-wc-router/examples/router/nested">Nested routers</a>
    <a  class="item" is="router-link" href="/a-wc-router/examples/router/named">Named routers</a>
    <a  class="item" is="router-link" href="/a-wc-router/examples/router/guards">Guards</a>
</div>
<a-router  style="display: block;">
    <!-- Outlet definition is first -->
    <an-outlet>This content never shows because of the last catch all route</an-outlet>
    <!-- Route definitions are next. There are a variety of examples below.  -->
    <a-route path="/webcomponent" element="content-overview"></a-route>
    <a-route path="/webcomponent/import" import='/components/a-wc-router/src/test-dummy.js' element="content-web-component-import"></a-route>
    <a-route path="/nested" element="content-nested"></a-route>
    <a-route path="/named" element="content-named"></a-route>
    <a-route path="/guards" element="content-guards"></a-route>
    <a-route path="/content/import/webcomponent/data1/:requiredParam" element="content-params"></a-route>
    <a-route path="/webcomponent-data2/:optionalParam?"  element="content-params"></a-route>
    <a-route path="/webcomponent-data3/:atLeastOneParam+"  element="content-params"></a-route>
    <a-route path="/webcomponent-data4/:anyNumOfParam*"  element="content-params"></a-route>
    <a-route path="/webcomponent-data5/:firstParam/:secondParam"  element="content-params"></a-route>
    <a-route path="/template"><template>Hello Template</template></a-route>
    <a-route path='*' redirect="/webcomponent">This route redirects to the Overview route.</a-route>
</a-router>
        </div>
    </div>
</div>
        `;
    }
}

customElements.define('router-example', RouterExampleElement);