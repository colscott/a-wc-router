// import { RouterElement } from '../../build/es6-bundled/src/router.js'
import '../../src/routes-outlet.js';
import '../../src/routes-link.js';

import './../shared/main-menu.js';
import './../shared/code-example.js';

import './content-overview.js';

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
<div class="ui one item menu">
    <a  class="item" is="router-link" href="webcomponent">Overiew</a>
</div>
<a-router  style="display: block;">
    <an-outlet>Please click a link above.</an-outlet>
    <a-route path="/webcomponent" element="content-overview"></a-route>
    <a-route path="/webcomponent/import" import='/components/routing-wc/src/test-dummy.js' element="content-web-component-import"></a-route>
    <a-route path="/nested" element="content-nested"></a-route>
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