# A-router web-component
## Basic Routing
## Base URL
## Nested Routing and Code Splitting
Since &lt;a-router&gt;s can be declared anywhere, they can also exist in child content that is lazy loaded from imported script. This makes the routing dynamic and avoids an all knowing monolithic application routing declaration. Instead each router knows about it's own routes and that's it. Other routes can exist and still work as normal (grandchild routing, auxiliary routing, etc.).

For example:
    // Main router
    <a-router>
        <a-outlet></a-outlet>
        <a-route path="/user" import="./userBundle.js" element="user-main"></a-route>
        <a-route path="/item" import="./itemsBundle.js" element="item-main"></a-route>
        <a-route path="*"><template></template></a-route>
    <a-router>

    // Code snippet from user-main with nested routing
    connectedCallback() {
        this.innerHTML = `
            <a-router>
                <a-outlet></a-outlet>
                <a-route path="/userDetails" element="user-detials"></a-route>
                <a-route path="/userEdit" element="user-edit"></a-route>
            </a-route>
            `;
    }

By default, a routes import is eagerly fetched before the route is used. If for some reason you want to lazy load the import only when it is first required then confiure the route with the lazyload="true" attribute.

    <a-route path="/user" import="./userBundle.js" lazyload="true"></a-route>

## Auxillary Routing
TBD
## Data Params
## Route Guards
## Modifying Routes
&lt;a-router&gt; can be modified to add or remove &a-route&gt; at anytime. This allows it to be changed to meet dynamic routing needs.
You can even add or remove routers themselves.
## Lifecycle Events
### onRouterAdded
### onRouteMatch
### onRouteLeave
## The Elements
### &lt;a-router&gt;
The parent element that organizes child routes.

#### Attributes
| Name | Value | Description |
|------|-------|-------------|
| base-white-list | string RegExp | Expicitly white lists URL that the router should route. If this is set it everything that does not match will not be routed. |

#### Events
| Name | Value | Description |
|------|-------|-------------|
|onRouterAdded|Reference to the router element|Used internally to communicate to a parent router that a child router has been added to the DOM.|
|onRouteCancelled|url that never got routed|Fires if routing was cancelled as a result of the cancelling of a onRouteLeave event|

### &lt;a-route&gt;
A route entry in the router. performs matching logic.
#### Atributes
| Name | Value | Description |
|------|-------|-------------|
| path | string | The path to match against. TODO expand on allowed path syntax. |
| fullmatch | N/A | If the route should only match if it matches the full URL. Should be set on routes that have no, and are never expected to have, childern. Can be modified at any point. |
| import | string | A JavaScript bundle to load. Used with the 'element' attribute to load the JavaScript that defines the required Element. |
| element | string | The element tag name to output when this route matches. Use the 'import' attribute to code split. |
| lazyload | boolean | Default false. Whether to load imports straight away or wait until a match is made. Default 'false' load right away. Set to 'true' to load import when first match is made.
#### Events
| Name | Value | Description |
|------|-------|-------------|
| onRouteMatch | remainder | The remainder of the URL that was not matched. Typically used for child router. Can be cancelled with event.preventDefalt() in which case routing will continue by matching aginst the next route. |
| | data | Map of data found in the section of url that was matched. |
| onRouteLeave| newRoute | Fired before matching occurs. Every active route fires the event. If any events are prevented from defualt action then the routing is preventde. It's a chance to prevent the router from leaving the current route. For example: data maybe lost if the user leaves the current route. Stop routing by event.preventDefualt(); |

### &lt;a-outlet&gt;
Place holder content outlet for the &lt;a-router&gt; it is in.

## Testing
To run tests, install polymer cli.
    polymer serve
And navigate to:
    /components/routing-web-component/test/unit/index.html