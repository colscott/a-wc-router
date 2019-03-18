import { ExampleContentOneElement } from './example-content-one.js';

class ExampleContentTwoElement extends ExampleContentOneElement {

    constructor() {
        super();
    }
}

customElements.define('example-content-two', ExampleContentTwoElement);