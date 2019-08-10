# AWC Router
[![Build Status](https://dev.azure.com/colscott/a-wc-router/_apis/build/status/colscott.a-wc-router?branchName=master)](https://dev.azure.com/colscott/a-wc-router/_build/latest?definitionId=1&branchName=master)
## Features
- Web Component
- Code spltting/lazy loading
- Declarative routing
- Nested routing
- Named/auxiliary routing and outlets
- Path params
- Guards
- Works with regular anchor tags for links
- Automatically styling active links
- Zero dependenies

## Examples
Examples and further documentation can be found in the examples folder and are hosted [here](https://colscott.github.io/a-wc-router/examples/)

To run the examples locally run:

    node exampleServer.js

Then enter this url in the browser:

    http://localhost:3000/a-wc-router/examples/router/

# Install

    npm i a-wc-router

# Usage
## With HTML

    <!DOCTYPE html>
    <html>
        <head>
            <base href="/app/">
            <script type="module" src="/node_modules/a-wc-router/build/es6-bundled/src/router.js"></script>
            <script type="module" src="/src/my-page1.js"></script>
        </head>
        <body>
            <a is="router-link" href="/app/page1">Page 1</a>
            <a is="router-link" href="/app/page2">Page 2</a>
            <a-router  style="display: block;">
                <an-outlet>This content never shows because of the last catch all route</an-outlet>
                <a-route path="/page1" element="my-page1"></a-route>
                <a-route path="/page2" element="my-page2" import="/src/my-page2.js"></a-route>
                <a-route path="*"><template>Page not found</template></a-route>
            </a-router>
        </body>
    </html>
    
## With Custom Element

    import '../node_modules/a-wc-router/build/es6-bundled/src/router.js';
    import './my-page1.js';

    class MyApp extends HTMLElement {
        connectedCallback() {
            if (this.isConnected) {
                this.innerHTML =   `
                    <a is="router-link" href="/app/page1">Page 1</a>
                    <a is="router-link" href="/app/page2">Page 2</a>
                    <a-router  style="display: block;">
                        <an-outlet>This content never shows because of the last catch all route</an-outlet>
                        <a-route path="/page1" element="my-page1"></a-route>
                        <a-route path="/page2" element="my-page2" import="/src/my-page2.js"></a-route>
                        <a-route path="*"><template>Page not found</template></a-route>
                    </a-router>
                `;
            }
        }
    }

    customElements.define('my-app', MyApp);

# Routing
## Routing using a router, outlet, routes and HTML anchors

    <a-router>
        <an-outlet>Please click a link</an-outlet>
        <a-route path="/user" import="./userBundle.js" element="user-main"></a-route>
        <a-route path="/item" import="./itemsBundle.js" element="item-main"></a-route>
        <a-route path="/template"><template>Hello Template</template></a-route>
        <a-route path="*"><template></template></a-route>
    <a-router>
    ....
    <a href='user'>click for user-main custom element</a>
    <a href='item'>click for item-main custom element</a>

## Passing data to routes

    <a-route path="/user1/:requiredParam" element="user-main"></a-route>
    <a-route path="/user2/:optionalParam?" element="user-main"></a-route>
    <a-route path="/user3/:atLeastOneParam+" element="user-main"></a-route>
    <a-route path="/user4/:anyNumOfParam*" element="user-main"></a-route>
    <a-route path="/user5/:firstParam/:secondParam" element="user-main"></a-route>
    ....
    <a href="user1/12">click for user with required param</a>
    <a href="user2">click for user with optional param</a>
    <a href="user3/12/tom">click for user with at least one param</a>
    <a href="user4/12/tom">click for user any number of params</a>
    <a href="user5/12/tom">click for user with two named params</a>

## Code splitting and eager loading modules for routes

    <a-route path="/user" import="/path-to/user-main.js" element="user-main"></a-route>

## Code splitting and lazy loading modules for routes

    <a-route path="/user" import="/path-to/user-main.js" lazyload="true" element="user-main"></a-route>

## Nested Routing

    <a-router>
        <an-outlet></an-outlet>
        <a-route path="/user" import="./userBundle.js" element="user-main"></a-route>
        <a-route path="/item" import="./itemsBundle.js" element="item-main"></a-route>
        <a-route path="*"><template></template></a-route>
    <a-router>

    // Code snippet from user-main with nested routing
    connectedCallback() {
        if (this.connected && !this.innerHTML) {
            this.innerHTML = `
                <a-router>
                    <an-outlet></an-outlet>
                    <a-route path="/details" element="user-detials"></a-route>
                    <a-route path="/edit" element="user-edit"></a-route>
                </a-route>
                `;
        }
    }
    ....
    <a href='/user/details'>Navigate to the nested route</a>

## Base URL
Routing only takes place if a url also matches the document.baseURI.

    <base href="/MyAppRoot/">

    <a href='/user'>Wont route</a>
    <a href='/MyAppRoot/user'>Will route</a>

# Named outlets (no router or routes requried)
## Routing using named outlets and HTML anchors
    
    <an-outlet name="main">Please click a link</an-outlet>
    ....
    <a href="/(main:user-main)">Assign <user-main> element to outlet main</a>
    <a href="/(main:item-main)">Assign <item-main> element to outlet</a>

## Passing data to named outlets
    
    <an-outlet name="main">Please click a link</an-outlet>
    ....
    <a href="/(main:user-main:userId=2&userName=tom)">Assign <user-main userId="2" userName="tom"> to outlet</a>

## Code splitting and eager loading modules for named outlets
    
    <an-outlet name="main">Please click a link</an-outlet>
    ....
    <a class="item" is="router-link" href="(main:user-main(/path-to/user-main.js))">Load <user-main> from /path-to/user-main.js</a>
    <a class="item" is="router-link" href="(main:/path-to/user-main)">Load <user-main> from /path-to/user-main.js</a>

# General to Routing and Named Outlets
## Styling link matching the active routes
    
    <style>
        a.active {
            color: red;
        }
    </style>

    <a class="item" href="/user/123">Regular anchor - will route but wont get active status styling</a>
    <a is="router-link" class="item" href="/user/123">Router link - will route and get active status styling</a>

## Navigating using HTML anchors
    <a class="item" href="/user/123">Regular anchor - will route but wont get active status styling</a>
    <a is="router-link" class="item" href="/user/123">outer link - will route and get active status styling</a>

## Navigating using events
    window.dispatchEvent(
        new CustomEvent(
            'navigate', {
                detail: {
                    href: '/(user/123' }}));

## Navigating using RouterElement
    RouterElement.navigate('myUrl');
    RouterElement.navigate('/user/123');

## Guards
    window.addEventListener('onRouteLeave', guard);

    guard(event) {
        if (document.getElementById('guard').checked) {
            // preventDefault to prevent the navigation
            event.preventDefault();
        }
    }

## Lifecycle Events
### onRouterAdded
### onRouteMatch
### onRouteLeave
### onRouteNotHandled
### onRouteCancelled
### onLinkActiveStatusUpdated
### onOutletUpdated

## Testing
To run tests:

    npm test
