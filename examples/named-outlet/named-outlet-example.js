// import { RouterElement } from '../../build/es6-bundled/src/router.js'
// import '../../src/routes-link.js';
import '../../src/routes-outlet.js';

import './../shared/main-menu.js';
import './../shared/code-example.js';

import './content-overview.js';
import './content-basic.js';
import './content-attr-params.js';
import './content-prop-params.js';

class NamedOutletExampleElement extends HTMLElement {
    
    connectedCallback() {
        if (!this._initialized) {
            this._initialized = true;
            this.render();
            
            // Register links so they can have active state for styling
            // RouterElement.registerLinks(this.querySelectorAll('.ui.menu a'));
            window.dispatchEvent(
                new CustomEvent(
                    'routerLinksAdded', {
                        detail: {
                            links: this.querySelectorAll('[code-example] a') }}));
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
        <div class="ui segment" code-example="Code to output links and outlet above">
            <div class="ui six item menu">
                <a class="item" is="router-link" href="./main:content-overview">Overview</a>
                <a class="item" is="router-link" href="./main:content-basic">Basic Outlet Assignment</a>
                <a class="item" is="router-link" href="./main:content-import(/routing-wc/examples/named-outlet/content-import.js)">Import<br>Code Splitting<br>Lazy Loading</a>
                <a class="item" is="router-link" href="./main:content-attr-params:param1=i&param2=ii">Passing HTML Attribute Params</a>
                <a class="item" is="router-link" href="./main:content-prop-params:.param3=x&.param4=y">Passing Object property Params</a>
                <a class="item" is="router-link" href="./main:content-import(/routing-wc/examples/named-outlet/content-import.js):param1=attr1&param2=attr2&.param3=prop3&.param4=prop4">Import with property and attribute Params</a>
            </div>
            <an-outlet name="main" style="display: block;"><p>Outlet not assigned yet.<br><br>Please click a link above to assign content to this outlet.</p></an-outlet>
        </div>
        <code-example class="ui segment"></code-example>
    </div>
</div>
        `;
    }
}

customElements.define('named-oulet-example', NamedOutletExampleElement);