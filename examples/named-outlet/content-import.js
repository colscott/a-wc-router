import { ContentBasicElement } from './content-basic.js';

class ContentImportElement extends ContentBasicElement {

    constructor() {
        super();

        this.description = `
            Example showing how to defer loading the script defing the custom element until it is rendered for the first time.
            Note that absolute paths must be used. This is due to the import being performed in the router code so the relative path will be relative to the location of the router script. 
        `;
    }
}

customElements.define('content-import', ContentImportElement);