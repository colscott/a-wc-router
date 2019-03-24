import { ContentBasicElement } from './content-basic.js';

class ContentPropParamsElement extends ContentBasicElement {

    constructor() {
        super();
        this.description = `
            Extends the previous exmaple by passing parameters (Object properties) to the customer element assigned to the outlet.
        `;
    }
}

customElements.define('content-prop-params', ContentPropParamsElement);