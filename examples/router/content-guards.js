import { ContentBasicElement } from './../named-outlet/content-basic.js';

class ContentGuardsElement extends ContentBasicElement {

    connectedCallback() {
        super.connectedCallback && super.connectedCallback();

        window.addEventListener('onRouteLeave', this.guard);
    }

    disconnectedCallback() {
        super.disconnectedCallback && super.disconnectedCallback();

        window.removeEventListener('onRouteLeave', this.guard);
    }

    constructor() {
        super();

        this.guard = this.guard.bind(this);

        this.description = `
        <div class="ui toggle checkbox">
            <input type="checkbox" id="guard" name="guard" checked>
            <label>Disbable this check box to allow navigation away.</label>
        </div><br><br>
        <p>
        Will not be able to leave this route whilst checkbox is enabled.
        </p>
        <h2>Guard code</h2>
<pre class="ui segment">
window.addEventListener('onRouteLeave', guard);

guard(event) {
    if (document.getElementById('guard').checked) {
        event.preventDefault();
    }
}
</pre>
        `;
    }

    guard(event) {
        if (document.getElementById('guard').checked) {
            event.preventDefault();
        }
    }
}

customElements.define('content-guards', ContentGuardsElement);