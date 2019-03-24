import { ContentBasicElement } from './content-basic.js';

class ContentTwoElement extends ContentBasicElement {

    constructor() {
        super();
        this.description = `
            Extends the previous exmaple by passing parameters (HTML attributes) to the customer element assigned to the outlet.
        `;
    }
}

customElements.define('content-attr-params', ContentTwoElement);