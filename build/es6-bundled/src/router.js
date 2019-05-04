///@ts-check
/**
  * @typedef ParseNamedOutletAsignment
  * @property {string} elementTag
  * @property {Map} data
  * @property {Object} options
  * @property {string} options.import
  */ /**
       * @typedef {Object} NamedMatch
       * @property {string} name of the route or outlet to assign to
       * @property {string} url - The assignment url that was matched and consumed
       * @property {string} urlEscaped - The url that was matched and consumed escaped of certain characters that will break the url on servers.
       * @property {boolean} cancelled - If a failed attempt at assignment was made
       * @property {ParseNamedOutletAsignment} namedOutlet - Any named outlet assignments found
       */ /** 
           * Regestry for named routers and outlets. 
           * Simplifies nested routing by being able to target specific routers and outlets in a link. 
           * Can act as a message bus of sorts. Named items being the handlers and assignments as the messages.
           */class NamedRouting{/**Adds a router or outlet to the registry */static async addNamedItem(name,item){if(item===void 0){item=name;name=""}if(!name){name=item.getName()}if(name){if(NamedRouting.registry[name]){throw`Error adding named item ${name}, item with that name already registered`}NamedRouting.registry[name]=item;let assignment=NamedRouting.getAssignment(name);if(assignment&&item.canLeave(assignment.url)){await item.processNamedUrl(assignment.url)}}}/**Removes an item by name from the registry if it exists. */static removeNamedItem(name){if(NamedRouting.registry[name]){delete NamedRouting.registry[name]}}/**Gets an item by name from the registry */static getNamedItem(name){return NamedRouting.registry[name]}/**Retrieves and removes an assignment from the registry */static consumeAssignement(name){let assignment=NamedRouting.getAssignment(name);if(assignment){NamedRouting.removeAssignment(name)}return assignment}/**Gets an assignment from the registry */static getAssignment(name){return NamedRouting.assignments[name]}/**
     * Add an assignment to the registry. Will override an assignement if one already exists with the same name.
     * @param {string} name the name of the named item to target with the assignment
     * @param {string} url to assign to the named item
     * @returns {Promise<import('./routes-route').Match|boolean>} when assignment is completed. false is returned if the assignment was cancelled for some reason.
     */static async addAssignment(name,url){let lastAssignment=NamedRouting.assignments[name];NamedRouting.assignments[name]={name,url};let namedItem=NamedRouting.getNamedItem(name);if(namedItem){if(!1===namedItem.canLeave(url)){NamedRouting.assignments[name]=lastAssignment;return!1}await namedItem.processNamedUrl(url)}}/**Removes an assignment from the registry */static removeAssignment(name){if(NamedRouting.assignments[name]){delete NamedRouting.assignments[name];return!0}return!1}/**Serializes the current assignements for URL. */static generateNamedItemsUrl(){let url="",assignments=NamedRouting.assignments;for(let itemName in assignments){if(url.length){url+="::"}url+=NamedRouting.generateUrlFragment(assignments[itemName])}return url}/**Serializes an assignment for URL. */static generateUrlFragment(assignment){// Polymer server does not like the period in the import statement
return`(${assignment.name}:${assignment.url.replace(/\./g,"_dot_")})`}/**
     * Parses a URL section and tries to get a named item from it.
     * @param {string} url containing the assignment and the named item
     * @param {boolean} [supressAdding]
     * @returns {Promise<NamedMatch|null>} null if not able to parse. If we are adding the named item then the promise is resolved when item is added and any routing has taken place.
     */static async parseNamedItem(url,supressAdding){if("/"===url[0]){url=url.substr(1)}if("("===url[0]){url=url.substr(1,url.length-2)}let match=url.match(/^\/?\(?([\w_-]+)\:(.*)\)?/);if(match){// Polymer server does not like the period in the import statement
let urlEscaped=match[2].replace(/_dot_/g,"."),routeCancelled=!1;if(!0!==supressAdding){if(!1===(await NamedRouting.addAssignment(match[1],urlEscaped))){routeCancelled=!0}}return{name:match[1],url:match[2],urlEscaped:urlEscaped,cancelled:routeCancelled,namedOutlet:NamedRouting.parseNamedOutletUrl(match[2])}}return null}/**
     * Takes a url for a named outlet assignment and parses
     * @param {string} url
     * @returns {ParseNamedOutletAsignment|null} null is returned if the url could not be parsed into a named outlet assignment
     */static parseNamedOutletUrl(url){let match=url.match(/^([/\w-]+)(\(.*?\))?(?:\:(.+))?/);if(match){var data=new Map;if(match[3]){for(var keyValues=match[3].split("&"),i=0,iLen=keyValues.length;i<iLen;i++){let keyValue=keyValues[i].split("=");data.set(decodeURIComponent(keyValue[0]),decodeURIComponent(keyValue[1]))}}let elementTag=match[1],importPath=match[2]&&match[2].substr(1,match[2].length-2),inferredElementTag=NamedRouting.inferCustomElementTagName(elementTag);if(null===inferredElementTag){return null}if(!importPath){importPath=NamedRouting.inferCustomElementImportPath(elementTag,inferredElementTag)}let options={import:importPath};return{elementTag:inferredElementTag,data,options}}return null}/**
     * @param {string} importStyleTagName
     * @param {string} elementTag
     * @returns {string} the custom element import path infered from the import style string
     */static inferCustomElementImportPath(importStyleTagName,elementTag){if(customElements.get(elementTag)!==void 0){// tag is loaded. no need for import.
return void 0}let inferredPath=importStyleTagName,lastForwardSlash=inferredPath.lastIndexOf("/");if(-1===lastForwardSlash){inferredPath="/"+inferredPath}let dotIndex=inferredPath.indexOf(".");if(-1===dotIndex){inferredPath+=".js"}return inferredPath}/**
     * @param {string} elementTag
     * @returns {string} the custom element tag name infered from import style string
     */static inferCustomElementTagName(elementTag){let inferredTagName=elementTag,lastForwardSlash=inferredTagName.lastIndexOf("/");// get class name from path
if(-1<lastForwardSlash){inferredTagName=inferredTagName.substring(lastForwardSlash+1)}// get class name from file name
let dotIndex=inferredTagName.indexOf(".");if(-1<dotIndex){inferredTagName=inferredTagName.substring(0,dotIndex-1)}// to kebab case
inferredTagName=inferredTagName.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();if(-1===inferredTagName.indexOf("-")){inferredTagName=null}return inferredTagName}/**
     * Prefetches an import module so that it is available when the link is activated
     * @param {NamedMatch} namedAssignment item assignment
     * @returns {Promise} resolves when the import is completed
     */static async prefetchNamedOutletImports(namedAssignment){if(namedAssignment.namedOutlet&&namedAssignment.namedOutlet.options&&namedAssignment.namedOutlet.options.import){await NamedRouting.pageReady();await NamedRouting.importCustomElement(namedAssignment.namedOutlet.options.import,namedAssignment.namedOutlet.elementTag)}}/**
     * Imports a script for a customer element once the page has loaded
     * @param {string} importSrc 
     * @param {string} tagName 
     */static async prefetchImport(importSrc,tagName){await NamedRouting.pageReady();await NamedRouting.importCustomElement(importSrc,tagName)}/**
     * Imports a script for a customer element
     * @param {string} importSrc 
     * @param {string} tagName 
     */static async importCustomElement(importSrc,tagName){if(importSrc&&customElements.get(tagName)===void 0){await import(importSrc)}}/**
     * 
     */static pageReady(){if(!NamedRouting.pageReadyPromise){NamedRouting.pageReadyPromise="complete"===document.readyState?Promise.resolve():new Promise((resolve,reject)=>{let callback=()=>{if("complete"===document.readyState){document.removeEventListener("readystatechange",callback);resolve()}};document.addEventListener("readystatechange",callback)})}return NamedRouting.pageReadyPromise}/**
     * Called just before leaving for another route.
     * Fires an event 'routeOnLeave' that can be cancelled by preventing default on the event.
     * @fires RouteElement#onRouteLeave
     * @param {*} newRoute - the new route being navigated to
     * @returns bool - if the currently active route can be left
     */static canLeave(newRoute){/**
       * Event that can be cancelled to prevent this route from being navigated away from.
       * @event RouteElement#onRouteLeave
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.route - The RouteElement that performed the match.
       */var canLeaveEvent=new CustomEvent("onRouteLeave",{bubbles:!0,cancelable:!0,composed:!0,detail:{route:newRoute}});// @ts-ignore
// This method is designed to be bound to a Custom Element instance. It located in here for general visibility.
this.dispatchEvent(canLeaveEvent);return!canLeaveEvent.defaultPrevented}}NamedRouting.pageReadyPromise=void 0;NamedRouting.registry={};NamedRouting.assignments={};var namedRouting={NamedRouting:NamedRouting};///@ts-check
class RouterElement extends HTMLElement{/** 
   * Event handler for handling when child router is added.
   * This function is called in the scope of RouterElement for the top level collection of routers and instacnes of RotuerElement for nested router collections.
   * Used to link up RouterElements with child RouterElements even through Shadow DOM.
   * @param {CustomEvent} event - routerAdded event
   */static handlerAddRouter(event){RouterElement.addRouter.call(this,event.detail.router);event.stopPropagation();event.detail.parentRouter=this}static handlerRouterLinksAdded(event){if(event.detail.links){event.detail.onRegistered=RouterElement.registerLinks(event.detail.links)}}static handlerNavigate(event){if(event.detail.href){event.detail.onNavigated=RouterElement.navigate(event.detail.href)}}/** 
     * Used to link up RouterElements with child RouterElements even through Shadow DOM.
     * @param {RouterElement} router - routerElement to add. RouterElement after the first can be thought of as auxilary RouterElements
     */static addRouter(router){this._routers.push(router)}/**
     * Removes a RouterElement from the routing process.
     * @param {RouterElement} routerElement 
     */static removeRouter(routerElement){var routerIndex=this._routers.indexOf(routerElement);if(-1<routerIndex){this._routers.splice(routerIndex,1)}}/**
     * Global handler for hash changes
     */static changeHash(){}// TODO
// let hash = RouterElement._getHash();
// RouterElement.dispatch(_changeHash(hash));
/**
   * Global handler for url changes.
   * Should be called if the user changes the URL via the URL bar or navigating history
   */static async changeUrl(){let hash=RouterElement._getHash(),path=decodeURIComponent(window.location.pathname),query=window.location.search.substring(1),oldRoute=RouterElement._route;if(!RouterElement._initialized){return!1}if(oldRoute.path===path&&oldRoute.query===query&&oldRoute.hash===hash){// Nothing to do, the current URL is a representation of our properties.
return!1}var newUrl=RouterElement._getUrl(window.location);await RouterElement.dispatch(newUrl,!0)}/**
     * Global handler for page clicks. Filters out and handles clicks from links.
     * @param {(MouseEvent|HTMLAnchorElement|string)} navigationSource - The source of the new url to navigate to. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
     */static async navigate(navigationSource){let event=null,anchor=null;if(navigationSource instanceof Event){event=navigationSource;// If already handled and canceled
if(event.defaultPrevented){return}}else if("string"!==typeof navigationSource){anchor=navigationSource}var href=RouterElement._getSameOriginLinkHref(navigationSource);if(null===href){return}if(!href){let target=event&&event.target||anchor;if(target){/**
         * Event that fires if a link is not handled due to it not being same origin or base url.
         * @event RouterElement#onRouteCancelled
         * @type CustomEvent
         * @property {Object} details - The event details
         * @property {RouteElement} details.url - The url that was trying to be matched.
         */target.dispatchEvent(new CustomEvent("onRouteNotHandled",{bubbles:!0,composed:!0,detail:{href}}))}return}event&&event.preventDefault();// If the navigation is to the current page we shouldn't add a history
// entry or fire a change event.
if(href===window.location.href){return}let url=new URL(href);var newUrl=RouterElement._getUrl(url);await RouterElement.dispatch(newUrl)}/**
     * Clears all current match information for all available routers.
     * This initializes ready for the next matching.
     */static prepareRoutersForDispatch(routers){routers=routers||RouterElement._routers;if(routers){for(let i=0,iLen=routers.length,router;i<iLen;i++){router=routers[i];router.clearCurrentMatch();let childRouters=router._routers;this.prepareRoutersForDispatch(childRouters)}}}/**
     * Common entry point that starts the routing process.
     * @param {string} url
     * @param {boolean} [skipHistory]
     * @fires RouterElement#onRouteCancelled
     */static async dispatch(url,skipHistory){// console.info('dispatch: ' + url);
let basePath=RouterElement.baseUrlSansHost(),shortUrl=url.substr(basePath.length);RouterElement._route={url:shortUrl// Check if all current routes wil let us navigate away
};if(RouterElement._activeRouters.length&&!1===RouterElement._activeRouters.every(r=>r.route.canLeave(RouterElement._route))){/**
       * Event that fires if a RouteElement refuses to let us perform routing.
       * @event RouterElement#onRouteCancelled
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */RouterElement._activeRouters[0].router.dispatchEvent(new CustomEvent("onRouteCancelled",{bubbles:!0,composed:!0,detail:{shortUrl}}));return}RouterElement._activeRouters=[];this.prepareRoutersForDispatch();if((await RouterElement.performMatchOnRouters(shortUrl,RouterElement._routers))&&!0!==skipHistory){RouterElement.updateHistory(url);RouterElement.updateAnchorsStatus()}}/** Updates the location history with the new href */static updateHistory(href){let urlState=RouterElement.getUrlState(),url=urlState;if(2===url.length){url=href}else{url=document.baseURI+url}// Need to use a full URL in case the containing page has a base URI.
let fullNewUrl=new URL(url,window.location.protocol+"//"+window.location.host).href,oldRoute=RouterElement._route,now=window.performance.now(),shouldReplace=oldRoute._lastChangedAt+RouterElement._dwellTime>now;oldRoute._lastChangedAt=now;if(shouldReplace){window.history.replaceState({},"",fullNewUrl)}else{window.history.pushState({},"",fullNewUrl)}}/**
     * Sets the active status of any registered links based on the current URL
     * @param {string} [url] url to match against for link status
     * @param {any[]} [links] optional list of links to update the status for
     * @returns {Promise} Named items require parsing and processing prior to being analyzed. Resolved when named items are finished parsed and processed.
     */static async updateAnchorsStatus(url,links){url=url||RouterElement.getUrlState();console.log("updateAnchorsStatus",url);let currentAnchors=links||RouterElement._anchors,nextAnchors=[];// Tidy up any unconnected anchors
for(let i=0,iLen=currentAnchors.length;i<iLen;i++){if(!0===currentAnchors[i].a.isConnected){let link=currentAnchors[i];nextAnchors[nextAnchors.length]=link;link.a.classList.remove(link.a.activeClassName||"active")}}let urlFragments=url.split("::");nextUrlFragment:for(let j=0,jLen=urlFragments.length;j<jLen;j++){let urlFragment=urlFragments[j],urlFragNamedItemMatch=await NamedRouting.parseNamedItem(urlFragment,!0);nextLink:for(let i=0,iLen=nextAnchors.length,link;i<iLen;i++){link=nextAnchors[i];if(link&&link.a.classList.contains(link.a.activeClassName||"active")){continue nextLink}if(link){if(link.routerMatches){let named=link.routerMatches.named,routes=link.routerMatches.routes;if(urlFragNamedItemMatch){for(let k=0,kLen=named.length;k<kLen;k++){if(named[k].name==urlFragNamedItemMatch.name){// TODO strip import out of both before compare
if(named[k].url==urlFragNamedItemMatch.urlEscaped){// full match on named item
link.a.classList.add(link.a.activeClassName||"active");link=null;continue nextLink}else//Check if it's a mtch upto data portion of url
if(0===urlFragNamedItemMatch.urlEscaped.indexOf(named[k].url)){// full match on named item
link.a.classList.add(link.a.activeClassName||"active");link=null;continue nextLink}}}}urlFragment="/"===urlFragment[0]?urlFragment.substr(1):urlFragment;for(let k=0,kLen=routes.length,routeUrl;k<kLen;k++){routeUrl="/"===routes[k][0]?routes[k].substr(1):routes[k];if(urlFragment==routeUrl){// full match on route
link.a.classList.add(link.a.activeClassName||"active");link=null;continue nextLink}else if(0===urlFragment.indexOf(routeUrl)){// partial match on route
link.a.classList.add(link.a.activeClassName||"active");link=null;continue nextLink}}}}}}/**
       * Event that fires when HTMLAnchorElement active statuses are being updated as part of a routing.
       * @event RouterElement#onRouteCancelled
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */window.dispatchEvent(new CustomEvent("onLinkActiveStatusUpdated",{bubbles:!0,composed:!0,detail:{links:nextAnchors}}));return null}/** Gets the current URL state based on currently active routers and outlets. */static getUrlState(routers){let url=NamedRouting.generateNamedItemsUrl();routers=routers||RouterElement._routers;if(routers){for(let i=0,iLen=routers.length,router;i<iLen;i++){router=routers[i];var nextFrag=router.generateUrlFragment();if(nextFrag){if(url.length){url+="::"}url+=nextFrag;let childRouters=router._routers;if(childRouters&&childRouters.length){if(1===childRouters.length){url+="/"+this.getUrlState(childRouters)}else{url+="/("+this.getUrlState(childRouters)+")"}}}}}return url}/**
     * Iterates over each child RouterElement and calls it to match it portion of the current URL.
     * @param {string} url - While URL. Will be parsed for individual router URLs.
     * @param {RouterElement[]} routers
     * @returns {Promise<boolean>} resolves when matching is complete. false if matching was cancelled.
     */static async performMatchOnRouters(url,routers){// console.info('performMatchOnRouters: ' + url);
// TODO query string data should be placed on RouterElement so it's accessible across all outlets. It's regarded as shared data across the routers.
// TODO Maybe have a way to regiser for changes to query string so routes can react
// TODO auxilary routers - start unit testing
if("("===url[0]){url=url.substr(1,url.length-2)}let urls=RouterElement.splitUrlIntoRouters(url),urlsWithoutNamedOutlets=[];for(let i=0,iLen=urls.length,match;i<iLen;i++){match=await NamedRouting.parseNamedItem(urls[i]);if(match&&match.cancelled){return!1}if(!match){urlsWithoutNamedOutlets.push(urls[i])}}let i=0;for(let iLen=routers.length,router;i<iLen;i++){router=routers[i];if(urlsWithoutNamedOutlets[i]){await router.performMatchOnRouter(urlsWithoutNamedOutlets[i]||"")}}RouterElement.updateAnchorsStatus();return!0}static splitUrlIntoRouters(url){for(var urls=[],skip=0,i=0,lastI=i,iLen=url.length;i<iLen;i++){const char=url[i];if("("===char){skip++}else if(")"===char){skip--}else if(":"===char&&":"===url[i+1]&&0===skip){urls.push(url.substring(lastI+(":"===url[lastI]?1:0),i));i++;lastI=i}}if("("===url[lastI]||")"===url[lastI]||":"===url[lastI]){lastI++}if(i>lastI){urls.push(url.substr(lastI))}for(let j=0,jLen=urls.length;j<jLen;j++){if("/"===urls[j][0]){urls[j]=urls[j].substr(1)}if("("===urls[j][0]&&")"===urls[j][urls[j].length-1]){urls[j]=urls[j].substr(1,urls[j].length-2)}}return urls}/**
     * Registers HTMLAnchorElements so that they become candidates route status styling.
     * @param {HTMLAnchorElement[]} links 
     * @param {string} activeClassName 
     */static async registerLinks(links,activeClassName){// console.info('registerLinks');
RouterElement.removeDisconnectedAnchors();const newAnchors=[];// Add the new anchors
for(let i=0,iLen=links.length;i<iLen;i++){if(links[i].href){let matches=await RouterElement.sanitizeLinkHref(links[i]);if(matches){newAnchors[newAnchors.length]={a:links[i],activeClassName:activeClassName,routerMatches:matches};for(let j=0,jLen=matches.named.length;j<jLen;j++){NamedRouting.prefetchNamedOutletImports(matches.named[j])}}}}RouterElement._anchors=RouterElement._anchors.concat(newAnchors);RouterElement.updateAnchorsStatus(void 0,newAnchors)}static removeDisconnectedAnchors(){const currentAnchors=RouterElement._anchors,nextAnchors=[];// Tidy up any unconnected anchors
for(let i=0,iLen=currentAnchors.length;i<iLen;i++){if(!0===currentAnchors[i].a.isConnected){nextAnchors[nextAnchors.length]=currentAnchors[i]}}// Do this after pushing history location state
RouterElement._anchors=nextAnchors}/**
     * @typedef {Object} AssignmentMatches
     * @property {string[]} routes - Assignments of type router
     * @property {import('./named-routing').NamedMatch[]} named - Assignments of type namedItems
     */ /**
         * 
         * @param {(MouseEvent|HTMLAnchorElement|string)} hrefSource - The source of the new url to handle. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
         * @returns {Promise<AssignmentMatches>} assignmentMatches
         * 
         */static async sanitizeLinkHref(hrefSource){console.info(hrefSource&&hrefSource);let href=RouterElement._getSameOriginLinkHref(hrefSource);console.info(href);let url=new URL(href),hash=RouterElement._getHash(),path=decodeURIComponent(url.pathname),query=url.search.substring(1),basePathLength=RouterElement.baseUrlSansHost().length,urlStr=path.substr(basePathLength);if("("===urlStr[0]){urlStr=urlStr.substr(1,urlStr.length-2)}let urls=RouterElement.splitUrlIntoRouters(urlStr),namedMatches=[],routerMatches=[];for(let i=0,iLen=urls.length,namedMatch;i<iLen;i++){namedMatch=await NamedRouting.parseNamedItem(urls[i],!0);if(namedMatch){namedMatches.push(namedMatch)}else{routerMatches.push(urls[i])}}return{named:namedMatches,routes:routerMatches}}disconnectedCallback(){RouterElement.removeRouter.call(this._parentRouter,this);this.removeEventListener("onRouterAdded",this.handlerAddRouter,!1);this.removeEventListener("onRouteAdded",this.handlerAddRoute,!1);if(this.getName()){NamedRouting.removeNamedItem(this.getName())}}async connectedCallback(){if(!this.created){this.created=!0;// IE workaround for the lack of document.baseURI property
let baseURI=document.baseURI;if(baseURI===void 0){let baseTags=document.getElementsByTagName("base");baseURI=baseTags.length?baseTags[0].href:document.URL;// @ts-ignore
document.baseURI=baseURI}this._routers=[];RouterElement.initialize()}if(this.isConnected){/**
       * Internal event used to plumb together the routers. Do not interfer with.
       * @event RouterElement#onRouterAdded
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */var routerAddedEvent=new CustomEvent("onRouterAdded",{bubbles:!0,cancelable:!0,composed:!0,detail:{router:this}});this.dispatchEvent(routerAddedEvent);this._parentRouter=routerAddedEvent.detail.parentRouter;this.addEventListener("onRouterAdded",this.handlerAddRouter=RouterElement.handlerAddRouter.bind(this),!1);this.addEventListener("onRouteAdded",this.handlerAddRoute=this.handlerAddRoute.bind(this),!1);await NamedRouting.addNamedItem(this)}}constructor(){super();/**
              * @type import('./routes-route').Match
              */this._currentMatch=null;this.canLeave=NamedRouting.canLeave.bind(this)}/**
     * Global initialization
     */static async initialize(){if(!RouterElement._initialized){RouterElement._initialized=!0;//RouterElement.whiteListRegEx = this.getAttribute('base-white-list') || '';
window.addEventListener("popstate",RouterElement.changeUrl,!1);window.addEventListener("click",RouterElement.navigate,!1);// Listen for top level routers being added
window.addEventListener("onRouterAdded",RouterElement.handlerAddRouter.bind(RouterElement),!1);// Listen for link registration
window.addEventListener("routerLinksAdded",RouterElement.handlerRouterLinksAdded.bind(RouterElement),!1);// Listen for navigate requests
window.addEventListener("navigate",RouterElement.handlerNavigate.bind(RouterElement),!1);await RouterElement.changeUrl()}}getName(){if(this.routerName===void 0){this.routerName=this.getAttribute("name")}return this.routerName}getCurrentMatch(){if(!this._currentMatch&&this._parentRouter._currentMatch){this._currentMatch={data:null,redirect:null,url:"",useCache:!1,remainder:this._parentRouter._currentMatch.remainder};// TODO get remainder from parent but ony take this routers url from it
// e.g. split :: and take the firs put the rest back
// TODO if we support adding a router name to the URL this is where we would check for it: (myRouter:users/main) --> target router named myRouter with url users/main
let remainder=this._currentMatch.remainder;if(remainder&&"("===remainder[0]){let remainderArray=RouterElement.splitUrlIntoRouters(remainder.substring(1,remainder.length-2));this._currentMatch.remainder=remainderArray.shift();// The next line is done in in the postProcessMatch
// this._parentRouter._currentMatch.remainder = '(' + remainder.join('::') + ')';
}this._currentMatch.url=this._currentMatch.remainder}return this._currentMatch}clearCurrentMatch(){this._currentMatch=null}/** 
     * Event handler for handling when child route is added.
     * Used to link up RouterElements with child RouteElements even through Shadow DOM.
     * @param {CustomEvent} event - routeAdded event
     */handlerAddRoute(event){event.stopPropagation();event.detail.router=this;event.detail.onRouteAdded=this.addRoute(event.detail.route)}/**
     * Performs matching for nested routes as they connect.
     * @param {import('./routes-route').RouteElement} routeElement
     * @returns {Promise}
     */async addRoute(routeElement){// console.info('route added: ' + routeElement.getAttribute('path'));
if(!this.hasMatch){let currentMatch=this.getCurrentMatch();if(currentMatch){if(currentMatch.remainder){await this.performMatchOnRoute(currentMatch.remainder,routeElement)}}}}/**
     * Takes in a url that contains named router data and renders the router using the information
     * @param {string} url to process as a named item
     * @returns {Promise<import('./routes-route.js').Match>}
     */async processNamedUrl(url){return await this.performMatchOnRouter(url)}/**
     * Performs route matching by iterating through routes looking for matches
     * @param {String} url  
     * @returns {Promise<import('./routes-route.js').Match>}
     */async performMatchOnRouter(url){// console.group('performMatchOnRouter: ' + url);
this.hasMatch=!1;this._currentMatch={remainder:url,data:null,redirect:null,url:"",useCache:!1};let routeElements=this.getRouteElements(),outletElement=this.getOutletElement(),match=null,i=0,iLen=routeElements.length;for(;i<iLen;i++){let routeElement=routeElements[i];match=await this.performMatchOnRoute(url,routeElement);if(null!=match){// console.info('route matched -> ', routeElement.getAttribute('path'));
i++;break}}// clear cache of remaining routes
for(;i<iLen;i++){let routeElement=routeElements[i];routeElement.clearLastMatch()}if(null===match){if(outletElement.renderOutletContent){outletElement.renderOutletContent("No matching route for url "+url+" \r\nTo replace this message add a 404 catch all route\r\n &lt;a-route path='*'>&lt;template&gt;catach all - NotFound&lt;/template&gt;&lt;/a-route&gt;");console&&console.error&&console.error("404 - Route not found for url "+url)}return null}// console.log('leaving performMatchOnRouter ' + url);
// console.groupEnd();
return match}/**
     * Tries to invoke matching of a url to a {RouteElement}
     * @param {string} url to match
     * @param {import('./routes-route').RouteElement} routeElement to match against
     * @returns {Promise<import('./routes-route.js').Match>}
     */async performMatchOnRoute(url,routeElement){// RouteElement not connected yet
if(!routeElement.match){return null}let match=routeElement.match(url)||null;if(null!=match){this.postProcessMatch();if(match.redirect){// TODO If the route being redirected to comes after then it might not have loaded yet
return await this.performMatchOnRouter(match.redirect)}let activeRouters=RouterElement._activeRouters;activeRouters.push({route:routeElement,router:this,match:match});this._currentMatch=match;if(!match.useCache){let outletElement=this.getOutletElement(),content=await routeElement.getContent(match.data);/**
                                                      * @param {string | HTMLElement | DocumentFragment} content
                                                      */outletElement.renderOutletContent(content)}if(this._routers&&match.remainder){await RouterElement.performMatchOnRouters(match.remainder,this._routers)}}return match}postProcessMatch(){this.hasMatch=!0;if(this._parentRouter._currentMatch){let parentMatch=this._parentRouter._currentMatch,remainder=parentMatch.remainder;// TODO get remainder from parent but ony take this routers url from it
// e.g. split :: and take the first put the rest back
// TODO if we support adding a router name to the URL this is where we would check for it: (myRouter:users/main) --> target router named myRouter with url users/main
if(remainder&&"("===remainder[0]){remainder=remainder.substring(1,remainder.length-2)}remainder=RouterElement.splitUrlIntoRouters(remainder);remainder.shift();// this._currentMatch.remainder = remainder.shift();
if(1<remainder.length){this._parentRouter._currentMatch.remainder="("+remainder.join("::")+")"}else if(1===remainder.length){this._parentRouter._currentMatch.remainder=remainder[0]}else{this._parentRouter._currentMatch.remainder=""}}}generateUrlFragment(){let match=this._currentMatch;if(!match){return""}let urlFrag=match.url;if(match.remainder){urlFrag+="/"+match.remainder}// TODO test if this is required. It might be duplicating routes.
// if (this._routers && this._routers.length) {
//   urlFrag += '/(';
//   for (let i = 0, iLen = this._routers.length; i < iLen; i++) {
//     if (i > 0) {
//       urlFrag += '::';
//     }
//     urlFrag += this._routers[i].generateUrlFragment();
//   }
//   urlFrag += ')';
// }
return urlFrag}/**
     * @returns {import('./routes-outlet').OutletElement}
     */getOutletElement(){// @ts-ignore
return this._getRouterElements("an-outlet")[0]}/**
     * @returns {import('./routes-route').RouteElement[]}
     */getRouteElements(){// @ts-ignore
return this._getRouterElements("a-route")}/**
     * Finds immediate child route elements
     */_getRouterElements(tagName){let routeElements=[];tagName=tagName.toLowerCase();for(var i=0,iLen=this.children.length;i<iLen;i++){let elem=this.children[i];if(elem.tagName.toLowerCase()===tagName){routeElements.push(elem)}}return routeElements}/**
     * Returns the absolute URL of the link (if any) that this click event is clicking on, if we can and should override the resulting full page navigation. Returns null otherwise.
     * @param {(MouseEvent|HTMLAnchorElement|string)} hrefSource - The source of the new url to handle. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
     * @return {string?} Returns the absolute URL of the link (if any) that this click event is clicking on, if we can and should override the resulting full page navigation. Returns null if click should not be consumed.
     */static _getSameOriginLinkHref(hrefSource){let href=null,anchor=null;if(hrefSource instanceof Event){let event=hrefSource;// We only care about left-clicks.
if(0!==event.button){return null}// We don't want modified clicks, where the intent is to open the page
// in a new tab.
if(event.metaKey||event.ctrlKey){return null}// @ts-ignore
let eventPath=event.path;for(var i=0;i<eventPath.length;i++){let element=eventPath[i];if("A"===element.tagName&&element.href){anchor=element;break}}// If there's no link there's nothing to do.
if(!anchor){return null}}else if("string"===typeof hrefSource){href=hrefSource}else{anchor=hrefSource}if(anchor){// Target blank is a new tab, don't intercept.
if("_blank"===anchor.target){return""}// If the link is for an existing parent frame, don't intercept.
if(("_top"===anchor.target||"_parent"===anchor.target)&&window.top!==window){return""}// If the link is a download, don't intercept.
if(anchor.download){return""}href=anchor.href}// If link is different to base path, don't intercept.
if(0!==href.indexOf(document.baseURI)){return""}let hrefEsacped=href.replace(/::/g,"$_$_"),url;// It only makes sense for us to intercept same-origin navigations.
// pushState/replaceState don't work with cross-origin links.
if(null!=document.baseURI){url=new URL(hrefEsacped,document.baseURI)}else{url=new URL(hrefEsacped)}let origin;// IE Polyfill
if(window.location.origin){origin=window.location.origin}else{origin=window.location.protocol+"//"+window.location.host}let urlOrigin;if(url.origin&&"null"!==url.origin){urlOrigin=url.origin}else{// IE always adds port number on HTTP and HTTPS on <a>.host but not on
// window.location.host
let urlHost=url.host,urlPort=url.port,urlProtocol=url.protocol,isExtraneousHTTPS="https:"===urlProtocol&&"443"===urlPort,isExtraneousHTTP="http:"===urlProtocol&&"80"===urlPort;if(isExtraneousHTTPS||isExtraneousHTTP){urlHost=url.hostname}urlOrigin=urlProtocol+"//"+urlHost}if(urlOrigin!==origin){return""}let normalizedHref=url.pathname.replace(/\$_\$_/g,"::")+url.search.replace(/\$_\$_/g,"::")+url.hash.replace(/\$_\$_/g,"::");// pathname should start with '/', but may not if `new URL` is not supported
if("/"!==normalizedHref[0]){normalizedHref="/"+normalizedHref}// If we've been configured not to handle this url... don't handle it!
// let urlSpaceRegExp = RouterElement._makeRegExp(RouterElement.whiteListRegEx);
// if (urlSpaceRegExp && !urlSpaceRegExp.test(normalizedHref)) {
//   return '';
// }
// Need to use a full URL in case the containing page has a base URI.
let fullNormalizedHref=new URL(normalizedHref,window.location.href).href;return fullNormalizedHref}// static _makeRegExp(urlSpaceRegex) {
//   return RegExp(urlSpaceRegex);
// }
// ---------- Action helpers ----------
// Much of this code was taken from the Polymer project iron elements
static _getHash(){return decodeURIComponent(window.location.hash.substring(1))}static baseUrlSansHost(){let host=window.location.protocol+"//"+window.location.host;return document.baseURI.substr(host.length+1)}static _getUrl(url){url=url||window.location;let path=decodeURIComponent(url.pathname),query=url.search.substring(1),hash=RouterElement._getHash(),partiallyEncodedPath=encodeURI(path).replace(/\#/g,"%23").replace(/\?/g,"%3F"),partiallyEncodedQuery="";if(query){partiallyEncodedQuery="?"+query.replace(/\#/g,"%23");if(RouterElement._encodeSpaceAsPlusInQuery){partiallyEncodedQuery=partiallyEncodedQuery.replace(/\+/g,"%2B").replace(/ /g,"+").replace(/%20/g,"+")}else{// required for edge
partiallyEncodedQuery=partiallyEncodedQuery.replace(/\+/g,"%2B").replace(/ /g,"%20")}}var partiallyEncodedHash="";if(hash){partiallyEncodedHash="#"+encodeURI(hash)}return partiallyEncodedPath+partiallyEncodedQuery+partiallyEncodedHash}}RouterElement._routers=[];RouterElement._route={};RouterElement._initialized=!1;RouterElement._activeRouters=[];RouterElement._dwellTime=2e3;RouterElement._anchors=[];RouterElement._encodeSpaceAsPlusInQuery=!1;RouterElement.assignedOutlets={};window.customElements.define("a-router",RouterElement);var routesRouter={RouterElement:RouterElement};///@ts-check
class RouteElement extends HTMLElement{connectedCallback(){if(!this.created){this.created=!0;this.style.display="none";const baseElement=document.head.querySelector("base");this.baseUrl=baseElement&&baseElement.getAttribute("href")}if(this.isConnected){let onRouteAdded=new CustomEvent("onRouteAdded",{bubbles:!0,composed:!0,detail:{route:this}});this.dispatchEvent(onRouteAdded);if(!this.hasAttribute("lazyload")||"true"!==this.getAttribute("lazyload").toLowerCase()){let importAttr=this.getAttribute("import"),tagName=this.getAttribute("element");NamedRouting.prefetchImport(importAttr,tagName)}}}disconnectedCallback(){}constructor(){super();this.canLeave=NamedRouting.canLeave.bind(this)}_createPathSegments(url){return url.replace(/(^\/+|\/+$)/g,"").split("/")}/**
     * Performs matching and partial matching. In order to successfully match, a RouteElement elements path attribute must match from the start of the URL. A full match would completely match the URL. A partial match would return from the start.
     * @fires RouteElement#onROuteMatch
     * @param {string} url - The url to perform matching against
     * @returns {Match} match - The resulting match. Null will be returned if no match was made.
     */match(url){const urlSegments=this._createPathSegments(url),path=this.getAttribute("path");if(!path){console.info("route must contain a path");throw"Route has no path defined. Add a path attribute to route"}let match=null,fullMatch={url:url,remainder:"",data:null,redirect:null,useCache:!1};if("*"===path){match=fullMatch}else if(path===url){match=fullMatch}else{const pathSegments=this._createPathSegments(path),data=new Map;//console.info(urlSegments, pathSegments);
let max=Math.max(urlSegments.length,pathSegments.length),ret;for(let i=0;i<max;i++){if(pathSegments[i]&&":"===pathSegments[i].charAt(0)){let param=pathSegments[i].replace(/(^\:|[+*?]+$)/g,""),flags=(pathSegments[i].match(/[+*?]+$/)||[])[0]||"",plus=~flags.indexOf("+"),star=~flags.indexOf("*"),val=urlSegments[i]||"";if(!val&&!star&&(0>flags.indexOf("?")||plus)){match=null;break}data.set(param,decodeURIComponent(val));if(plus||star){data.set(param,urlSegments.slice(i).map(decodeURIComponent).join("/"));match=match||fullMatch;match.data=data;break}}else if(pathSegments[i]!==urlSegments[i]){if(0<i&&!this.hasAttribute("fullmatch")){match=match||fullMatch;match.data=data;match.url=urlSegments.slice(0,i).join("/");match.remainder=urlSegments.slice(i).join("/")}break}if(i===max-1){match=match||fullMatch;match.data=data}}}if(null!==match){/**
       * Route Match event that fires after a route has performed successful matching. The event can be cancelled to prevent the match.
       * @event RouteElement#onRouteMatch
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.route - The RouteElement that performed the match.
       * @property {Match} details.match - The resulting match. Warning, modifications to the Match will take effect.
       * @property {string} details.path - The RouteElement path attribute value that was matched against.
       */var routeMatchedEvent=new CustomEvent("onRouteMatch",{bubbles:!0,cancelable:!0,composed:!0,detail:{route:this,match:match,path:path}});this.dispatchEvent(routeMatchedEvent);if(routeMatchedEvent.defaultPrevented){match=null}if(this.hasAttribute("redirect")){match.redirect=this.getAttribute("redirect")}}if(match){let useCache=this.lastMatch&&this.lastMatch.url===match.url&&!this.hasAttribute("disableCache");match.useCache=useCache}this.lastMatch=match;return match}clearLastMatch(){this.lastMatch=null}/**
     * Generates content for this route.
     * @param {Object} attributes - Object of properties that will be applied to the content. Only applies if the content was not generated form a Template.
     * @returns {Promise<string|DocumentFragment|Node>} - The resulting generated content.
     */async getContent(attributes={}){let content=this.content;if(!content){let importAttr=this.getAttribute("import"),tagName=this.getAttribute("element");await NamedRouting.importCustomElement(importAttr,tagName);if(tagName){// TODO support if tagName is a function that is called and will return the content
// content = tagName(attributes);
content=document.createElement(tagName);if(customElements.get(tagName)===void 0){console.error(`Custom Element not found: ${tagName}. Are you missing an import or mis-spelled tag name?`)}}let template=this.children[0];if(template&&template instanceof HTMLTemplateElement){return template.content.cloneNode(!0)}}if(attributes){RouteElement.setData(content,attributes)}return this.content=content}static setData(target,data){data.forEach((v,k)=>{if("."===k[0]){target[k.substr(1)]=v}else{target.setAttribute(k,v)}})}}window.customElements.define("a-route",RouteElement);var routesRoute={RouteElement:RouteElement};///@ts-check
class OutletElement extends HTMLElement{async connectedCallback(){if(this.isConnected){if(!this.created){this.created=!0;// var p = document.createElement('p');
// p.textContent = 'Please add your routes!';
// this.appendChild(p);
await NamedRouting.addNamedItem(this)}await RouterElement.initialize()}}disconnectedCallback(){if(this.getName()){NamedRouting.removeNamedItem(this.getName())}}constructor(){super();this.canLeave=NamedRouting.canLeave.bind(this)}getName(){if(this.outletName===void 0){this.outletName=this.getAttribute("name")}return this.outletName}_createPathSegments(url){return url.replace(/(^\/+|\/+$)/g,"").split("/")}/**
     * Replaces the content of this outlet with the supplied new content
     * @fires OutletElement#onOutletUpdated
     * @param {string|DocumentFragment|Node} content - Content that will replace the current content of the outlet
     */renderOutletContent(content){this.innerHTML="";// console.info('outlet rendered: ' + this.outletName, content);
if("string"===typeof content){this.innerHTML=content}else{this.appendChild(content)}this.dispatchOuletUpdated()}/**
     * Takes in a url that contains named outlet data and renders the outlet using the information
     * @param {string} url
     * @param {Promise<boolean>} supressUrlGeneration
     */async processNamedUrl(url,supressUrlGeneration){let details=NamedRouting.parseNamedOutletUrl(url),options=details.options||{import:null},data=details.data||new Map;if(!1===data instanceof Map){data=new Map(Object.entries(data||{}))}// If same tag name then just set the data
if(this.children&&this.children[0]&&this.children[0].tagName.toLowerCase()==details.elementTag){RouteElement.setData(this.children[0],data||{});this.dispatchOuletUpdated();return this.children[0]}await NamedRouting.importCustomElement(options.import,details.elementTag);let element=document.createElement(details.elementTag);RouteElement.setData(element,data||{});if(customElements.get(details.elementTag)===void 0){console.error(`Custom Element not found: ${details.elementTag}. Are you missing an import or mis-spelled tag name?`)}this.renderOutletContent(element);if(!supressUrlGeneration){RouterElement.updateHistory("")}return element}dispatchOuletUpdated(){/**
     * Outlet updated event that fires after an Outlet replaces it's content.
     * @event OutletElement#onOutletUpdated
     * @type CustomEvent
     * @property {any} - Currently no information is passed in the event.
     */this.dispatchEvent(new CustomEvent("onOutletUpdated",{bubbles:!0,composed:!0,detail:{}}))}}window.customElements.define("an-outlet",OutletElement);var routesOutlet={OutletElement:OutletElement};///@ts-check
class RouterLinkElement extends HTMLAnchorElement{connectedCallback(){RouterElement.initialize();window.dispatchEvent(new CustomEvent("routerLinksAdded",{detail:{links:[this]}}))}constructor(){super()}}window.customElements.define("router-link",RouterLinkElement,{extends:"a"});export{namedRouting as $namedRouting,routesOutlet as $routesOutlet,routesRoute as $routesRoute,routesRouter as $routesRouter,NamedRouting,OutletElement,RouteElement,RouterElement};