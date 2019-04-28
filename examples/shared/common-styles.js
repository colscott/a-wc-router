export class CommonStylesElement extends HTMLElement {

    connectedCallback() {
        if (!this._initialized) {
            this._initialized = true;
            this.render();
        }
    }

    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            <link rel="stylesheet" href="/a-wc-router/examples/assets/styles/reset.min.css">
            <link rel="stylesheet" href="/a-wc-router/examples/assets/styles/site.min.css">
            <link rel="stylesheet" href="/a-wc-router/examples/assets/styles/menu.min.css">
            <link rel="stylesheet" href="/a-wc-router/examples/assets/styles/segment.min.css">
            <link rel="stylesheet" href="/a-wc-router/examples/assets/styles/grid.min.css">
            <link rel="stylesheet" href="/a-wc-router/examples/assets/styles/item.min.css">
            <link rel="stylesheet" href="/a-wc-router/examples/assets/styles/table.min.css">
            <link rel="stylesheet" href="/a-wc-router/examples/assets/styles/header.min.css">
            <link rel="stylesheet" href="/a-wc-router/examples/assets/styles/checkbox.min.css">
            <style>
                pre { overflow: auto; }
            </style>
        `;
    }
}

customElements.define('common-styles', CommonStylesElement);