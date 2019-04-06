import { ContentBasicElement } from './content-basic.js';

class ContentImportElement extends ContentBasicElement {

    constructor() {
        super();

        this.description = `
            <p>
                Note that absolute paths must be used. This is due to the import being performed in the router code so the relative path will be relative to the location of the router script.
                <pre class="ui segment">(/routing-wc/examples/named-outlet/content-import.js)</pre><br>
                The placement of the import source comes just after the tag name in the url.
            </p>
            <p>
                Example of defered importing (upfront and pre-cache). This helps users implement the PRPL pattern.<br>
                We want the first page of a web application to load as fast as possible. In order to do this we want to only load the resources required to render the first page and do so as fast as possible and defer everything that's not required for first render.<br>
                Importing a custom element script allows us to defer the loading of the script.
            </p>
            <p>
                Named outlets automatically provide two types of defered importing:
                <ol>
                <li>
                    The import is required immediately in order to render the page. The custom element script is imported as soon as possbile.<br>
                    In the screen grab below, the last script was done via an import and was loaded BEFORE the page load because it was needed to render the page.
                    <div style="text-align: center;">
                        <img src="/routing-wc/examples/assets/images/import-immediate-fetch.png" style="width: 80%"></img>
                    </div>
                </li>
                <li>
                    The import is not currently required to render the page but a link exists on the page containing the import. Here we pre-cache the script so when the user clicks the link the script is already downloaded. However, the import is not critical so the import is made after the first page load but before the user can click the link. This is part of PRPL design.<br>
                    In the screen grab below, the last script was done via an import and was loaded AFTER the page load because it was not needed to render the page but it was still loaded so it is ready if the user clocks the link for that page.

                    <div style="text-align: center;">
                        <img src="/routing-wc/examples/assets/images/import-pre-fetch.png" style="width: 80%"></img>
                    </div>
                </li>
                </ol>
            </p>
            <p>
                Here is how the network time line would look if we used the import feature for all of the links on this page:
                <div style="text-align: center;">
                    <img src="/routing-wc/examples/assets/images/import-all.png" style="width: 80%"></img>
                </div>
                The current page being loaded was the Basic Outlet Assignment page. You can see that the content-basic.js was loaded as soon as possible. The other scripts used for the pages not rendered were loaded after the page was ready.
            </p>
        `;
    }
}

customElements.define('content-import', ContentImportElement);