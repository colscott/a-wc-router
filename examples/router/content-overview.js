import { ContentBasicElement } from './../named-outlet/content-basic.js';

class ContentOverviewElement extends ContentBasicElement {

    constructor() {
        super();
        this.description = `
        <p>
            If a URL starts with the base URL of the page then it is a candidate for client side routing.
            Routes are set up like in the code above. You can have as many routes as required.
            URL are tested against the routes in the order the routes appear in the DOM. Once a match is found route matching is stopped. If part of the url has still to be matched then child routes are matched against the remainder url. The process continues through subsequent child routes until the url is consumed.
        </p>
        <div class="ui header">Route composition</div>
        <table class="ui basic table">
            <tr>
                <th>Attribute</th>
                <th>Description</th>
                <th>Example</th>
            <tr>
            <tr>
                <td>path</td>
                <td>Required - The path that will activate this route if matched against the url. TBD data params</td>
                <td>element="my-custom-element"</td>
            </tr>
            <tr>
                <td>fullmatch</td>
                <td>Optional - This route must fully match the url without remiander to successfully match.
                <td>fullmatch</td>
            </tr>
            <tr>
                <td>element</td>
                <td>Optional - Specifies the custom element tag to populate the outlet with for this route.</td>
                <td>element="my-custom-element"</td>
            </tr>
            <tr>
                <td>import</td>
                <td>Optional - Imports an absolute path to the script that contains the custom element to render. The import will be loaded which ever is sooner: i) when route is rendered ii) when the page has loaded</td>
                <td>import="/path/to/my-custom-element.js"</td>
            </tr>
            <tr>
                <td>lazyload</td>
                <td>Optional - Instead of loading the import after page load, it will only load te import whe it is required for the first time (when user clicks a link that requires the custom element).
                <td>lazyload="true"</td>
            </tr>
            <tr>
                <td>redirect</td>
                <td>Optional - This route willperform a redirect.
                <td>redirect="/users"</td>
            </tr>
            <tr>
                <td>disablecache</td>
                <td>Optional - If one URL matches a route and then another identical URL matches the same route the route contents are not reevaluated. Adding the disablecache will force the route to be evaluated and rend even if the same URL is macthed.
                <td>disablecache</td>
            </tr>
        </table>

        <table class="ui basic table">
            <tr>
                <th>Event Name</th>
                <th>Description</th>
                <th>preventDefault</th>
                <th>event.detail</td>
            </tr>
            <tr>
                <td>onRouteLeave</td>
                <td>Event that can be cancelled to prevent navigation away from a route. Can be used as a guard.</td>
                <td>Stops the routing from taking place</td>
                <td>
                    <table class="ui basic table">
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>route</td>
                            <td>The new RouteElement being navigated to</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>onRouteMatch</td>
                <td></td>
                <td>Will prevent the match for this route. Preventing the match is just like the route not matching in the first place. The router will continue trying to match against other routes.</td>
                <td>
                    <table class="ui basic table">
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>route</td>
                            <td>The RouteElement that made the match</td>
                        </tr>
                        <tr>
                            <td>match</td>
                            <td>The match object. Ant modifications made to the match will take effect. e.g. if you add the redirect property to the match then a redirect will occur.</td>
                        </tr>
                        <tr>
                            <td>path</td>
                            <td>The RouteElement path attribute value that had th esuccessful match.</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>onRouteNotHandled</td>
                <td>Fire when a url is handled due to it not being the same origin or base url</td>
                <td>No effect</td>
                <td>
                    <table class="ui basic table">
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>href</td>
                            <td>The href that is not being handled due to it not being the same origin or base url</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>onRouteCancelled</td>
                <td>Fires when a routing process was cancelled</td>
                <td>No effect</td>
                <td>
                    <table class="ui basic table">
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>shortUrl</td>
                            <td>The url being matched sans base url</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>onLinkActiveStatusUpdated</td>
                <td>Fires when HTMLAnchorElement active statuses are being updated as part of a routing</td>
                <td>No effect</td>
                <td>
                    <table class="ui basic table">
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>links</td>
                            <td>Array of all of the HTMLAnchorElement that are currently registered as router links</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>onRouterAdded</td>
                <td>Fires when a router is added. Internal event used to plumb together the routers. Do not interfer with.</td>
                <td>No effect</td>
                <td>
                    <table class="ui basic table">
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>router</td>
                            <td>The child RouterElement being added</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>onOutletUpdated</td>
                <td>Fire when an OutletElement is updated with a new route or assignment.</td>
                <td>No effect</td>
                <td></td>
            </tr>
        </table>
        `;
    }
}

customElements.define('content-overview', ContentOverviewElement);