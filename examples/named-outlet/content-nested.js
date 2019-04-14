import { ContentBasicElement } from './content-basic.js';

class ContentNestedElement extends ContentBasicElement {

    constructor() {
        super();
        this.description = `
        <p>
            
        </p>
        `;
    }
}

customElements.define('content-nested', ContentNestedElement);