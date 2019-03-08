# web-component-router
## Basic Routing

## Named Outlets
You can also target outlets without using routing at all. This is an extreamly simple way to create a scalable routing application.

The format of the links href is as follows:

    <a href="(myOutletName:my-web-component(./import/script.js):htmlAttr1=value1&htmlAttr2=value2)">
                
myOutletName ==> The name of the outlet to populate 

my-web-component ==> The tage name of the Web Component to put in the outlet

(./import/script.js) ==> Optional script to load that contains the Web Component

htmlAttr1=value1&htmlAttr2=value2 ==> HTML attributes and values to set on the Web Component

Example:

    // Defined the outlet somewhere
    <a-outlet name="account-details">Please select an account</a-outlet>

    // Define the link anywhere in the application
    // This example also passes a HTTML attribute 'accountNumber' to the wc-account-details Web Component
    <a class="item" href="/(account-details:wc-account-details/accountNumber=${account.number})">


## Named Routers
Just like you can target outlets by name, you can also target routers by name. This lets you target auxiliary routers or target child routers without having to include the parent route in the link href.

e.g. if you name a child router you can target like this:

    <a href="(childRouterName:userDetails)"></a>

Rather than the full href:

    <a href="main/admin/user/userDetails"></a>

## Styling Active Routes
You can style links that partially match the current url. This is implemented by adding class names to registered links that have a href that starts with a current valid match. The match could be a route, named outlet or named route.

To give a link the ability to be marked active, you must register it first. Link that have not been registered will not participate in this logic.

Named outlet example:

    // Defined the outlet somewhere
    <a-outlet name="account-details">Please select an account</a-outlet>

    // Define the link anywhere in the application
    <a class="item" href="/(account-details:wc-account-details/accountNumber=${account.number})">

    // Register the link somewhere (could be after you generate the link itself)
    RouterElement.registerLinks(this.querySelectorAll('a'));

Normal routes and named routes are handled the same way.

## Base URL
Routing only takes place if a url also matches the document.baseURI.
The document.baseURI is commonly used in Single Page Application frameworks to distiguish between a url that is meant for the client app and a url that is meant to be sent to the server, like a REST API call.
To set the document.baseURI set a BASE tag to the root of the client app.

    <base href="/MyAppRoot/">

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
        if (this.connected && !this.innerHTML) {
            this.innerHTML = `
                <a-router>
                    <a-outlet></a-outlet>
                    <a-route path="/userDetails" element="user-detials"></a-route>
                    <a-route path="/userEdit" element="user-edit"></a-route>
                </a-route>
                `;
        }
    }

By default, a routes import is eagerly fetched before the route is used. If for some reason you want to lazy load the import only when it is first required then confiure the route with the lazyload="true" attribute.

    <a-route path="/user" import="./userBundle.js" lazyload="true"></a-route>

## Data Params
### In Named Outlets
For named outlets, there are no routes so the only place to defined he data to pass is in the link:

    <a href=(myOutletName:my-web-component-tag:html-attr1=value1&html-attr2=value2)>

html-attr1 attribute will be set to value1 and html-attr2 attribute will be set to value2 on the my-web-component that gets rendered in the outlet.

### In Routes
If your using routes then you define the available data that can be passed through on the path. This is done like so:

    <a-route path="/webcomponent-data1/:requiredParam" import='./test-dummy.js' element="test-dummy"></a-route>
    <a-route path="/webcomponent-data2/:optionalParam?" import='./test-dummy.js' element="test-dummy"></a-route>
    <a-route path="/webcomponent-data3/:atLeastOneParam+" import='./test-dummy.js' element="test-dummy"></a-route>
    <a-route path="/webcomponent-data4/:anyNumOfParam*" import='./test-dummy.js' element="test-dummy"></a-route>
    <a-route path="/webcomponent-data5/:firstParam/:secondParam" import='./test-dummy.js' element="test-dummy"></a-route>

You then include the data in the link href:

    <a href="/webcomponent-data1/myRequiredValue">

## Route Guards
The route tag emits a onRouteLeave event that preventDefault can be set to true to cancel the current route match.
Another option is to listen to the onRouteMatch event and set preventDefault to true. This will prevent the current route match. However, the next route will be tesged for a match.

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
    /components/a-wc-router/test/unit/index.html