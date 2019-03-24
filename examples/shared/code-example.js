export class CodeExampleElement extends HTMLElement {

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
        let html = `
            <style>
                code-example {
                    display: block;
                }

                code-example pre.ui.placeholder.segment {
                    overflow: auto;
                }
            </style>
            `;
        let codeBlocks = document.querySelectorAll('[code-example]');

        for(let i = 0, iLen = codeBlocks.length; i < iLen; i++) {
            html += `
                <div>
                    <h2>${codeBlocks[i].getAttribute('code-example')}</h2>
                    <pre class="ui placeholder segment">${prepareHtml(codeBlocks[i].innerHTML)}</pre>
                </div>
            `
        }

        this.innerHTML = html;
    }
}

function prepareHtml(htmlStr) {
    htmlStr = htmlStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return htmlStr;
}

customElements.define('code-example', CodeExampleElement);