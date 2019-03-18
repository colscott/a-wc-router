import { ExampleContentOneElement } from './example-content-one.js';

class ExampleContentThreeElement extends ExampleContentOneElement {

    constructor() {
        super();
    }
}

customElements.define('example-content-three', ExampleContentThreeElement);