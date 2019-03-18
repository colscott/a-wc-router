// import '../../build/es6-bundled/src/router.js'
import '../../src/routes-outlet.js';

import './../shared/example-content-one.js';
import './../shared/example-content-two.js';

class NamedOutletExampleElement extends HTMLElement {
    
    connectedCallback() {
        if (!this._initialized) {
            this._initialized = true;
            this.render();
            
            // Register links so they can have active state for styling
            // RouterElement.registerLinks(this.querySelectorAll('.ui.menu a'));
            
        }
    }
    
    constructor(){
        super();
    }

    render() {
        this.innerHTML = `
            <link rel="stylesheet" href="/examples/assets/styles/menu.min.css">
            <link rel="stylesheet" href="/examples/assets/styles/segment.min.css">

            <div class="ui three item menu">
                <a class="item" href="/app/examples/named-outlet/main:example-content-one">Editorials</a>
                <a class="item" href="/app/examples/named-outlet/main:example-content-two:title=Reviews">Reviews</a>
                <a class="item" href="/app/examples/named-outlet/main:example-content-three(/examples/shared/example-content-three.js):title=UpcomingEvents&param1=a&param2=b">Upcoming Events</a>
            </div>
            <an-outlet name="main" class="ui segment" style="display: block;"><p>Some initial content.<br><br>Please click a link.</p></an-outlet>
        `;
    }
}

customElements.define('named-oulet-example', NamedOutletExampleElement);