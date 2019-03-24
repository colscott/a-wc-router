// import { RouterElement } from '../../build/es6-bundled/src/router.js'
// import '../../src/routes-link.js';
import '../../src/routes-outlet.js';

import './../shared/main-menu.js';
import './../shared/code-example.js';
import './../shared/common-styles.js';

import './../shared/example-content-one.js';
import './../shared/example-content-two.js';

class NamedOutletNestedExampleElement extends HTMLElement {
    
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
<div class="ui segment" code-example="Link and Named Outlet definition">
    <h1 class="ui header">Example</h1>
    <div class="ui four item menu">
        <a class="item" is="router-link" href="/app/examples/named-outlet-nested/main:example-content-one">Editorials</a>
        <a class="item" is="router-link" href="/app/examples/named-outlet-nested/main:example-content-two:title=Reviews">Reviews</a>
    </div>
    <an-outlet name="main" class="ui segment" style="display: block;"><p>Some initial content.<br><br>Please click a link.</p></an-outlet>
</div>
        <code-example class="ui segment"></code-example>
    </div>
</div>
        `;
    }
}

customElements.define('named-oulet-nested-example', NamedOutletNestedExampleElement);