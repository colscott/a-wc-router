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
           */var NamedRouting=/*#__PURE__*/function(){function NamedRouting(){babelHelpers.classCallCheck(this,NamedRouting)}babelHelpers.createClass(NamedRouting,null,[{key:"addNamedItem",/**Adds a router or outlet to the registry */value:function(){var _addNamedItem=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee(name,item){var assignment;return regeneratorRuntime.wrap(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:if(item===void 0){item=name;name=""}if(!name){name=item.getName()}if(!name){_context.next=10;break}if(!NamedRouting.registry[name]){_context.next=5;break}throw"Error adding named item ".concat(name,", item with that name already registered");case 5:NamedRouting.registry[name]=item;assignment=NamedRouting.getAssignment(name);if(!(assignment&&item.canLeave(assignment.url))){_context.next=10;break}_context.next=10;return item.processNamedUrl(assignment.url);case 10:case"end":return _context.stop();}}},_callee)}));function addNamedItem(_x,_x2){return _addNamedItem.apply(this,arguments)}return addNamedItem}()/**Removes an item by name from the registry if it exists. */},{key:"removeNamedItem",value:function removeNamedItem(name){if(NamedRouting.registry[name]){delete NamedRouting.registry[name]}}/**Gets an item by name from the registry */},{key:"getNamedItem",value:function getNamedItem(name){return NamedRouting.registry[name]}/**Retrieves and removes an assignment from the registry */},{key:"consumeAssignement",value:function consumeAssignement(name){var assignment=NamedRouting.getAssignment(name);if(assignment){NamedRouting.removeAssignment(name)}return assignment}/**Gets an assignment from the registry */},{key:"getAssignment",value:function getAssignment(name){return NamedRouting.assignments[name]}/**
     * Add an assignment to the registry. Will override an assignement if one already exists with the same name.
     * @param {string} name the name of the named item to target with the assignment
     * @param {string} url to assign to the named item
     * @returns {Promise<import('./routes-route').Match|boolean>} when assignment is completed. false is returned if the assignment was cancelled for some reason.
     */},{key:"addAssignment",value:function(){var _addAssignment=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee2(name,url){var lastAssignment,namedItem;return regeneratorRuntime.wrap(function _callee2$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:lastAssignment=NamedRouting.assignments[name];NamedRouting.assignments[name]={name:name,url:url};namedItem=NamedRouting.getNamedItem(name);if(!namedItem){_context2.next=9;break}if(!(!1===namedItem.canLeave(url))){_context2.next=7;break}NamedRouting.assignments[name]=lastAssignment;return _context2.abrupt("return",!1);case 7:_context2.next=9;return namedItem.processNamedUrl(url);case 9:case"end":return _context2.stop();}}},_callee2)}));function addAssignment(_x3,_x4){return _addAssignment.apply(this,arguments)}return addAssignment}()/**Removes an assignment from the registry */},{key:"removeAssignment",value:function removeAssignment(name){if(NamedRouting.assignments[name]){delete NamedRouting.assignments[name];return!0}return!1}/**Serializes the current assignements for URL. */},{key:"generateNamedItemsUrl",value:function generateNamedItemsUrl(){var url="",assignments=NamedRouting.assignments;for(var itemName in assignments){if(url.length){url+="::"}url+=NamedRouting.generateUrlFragment(assignments[itemName])}return url}/**Serializes an assignment for URL. */},{key:"generateUrlFragment",value:function generateUrlFragment(assignment){// Polymer server does not like the period in the import statement
return"(".concat(assignment.name,":").concat(assignment.url.replace(/\./g,"_dot_"),")")}/**
     * Parses a URL section and tries to get a named item from it.
     * @param {string} url containing the assignment and the named item
     * @param {boolean} [supressAdding]
     * @returns {Promise<NamedMatch|null>} null if not able to parse. If we are adding the named item then the promise is resolved when item is added and any routing has taken place.
     */},{key:"parseNamedItem",value:function(){var _parseNamedItem=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee3(url,supressAdding){var match,urlEscaped,routeCancelled;return regeneratorRuntime.wrap(function _callee3$(_context3){while(1){switch(_context3.prev=_context3.next){case 0:if("/"===url[0]){url=url.substr(1)}if("("===url[0]){url=url.substr(1,url.length-2)}match=url.match(/^\/?\(?([\w_-]+)\:(.*)\)?/);if(!match){_context3.next=13;break}// Polymer server does not like the period in the import statement
urlEscaped=match[2].replace(/_dot_/g,".");routeCancelled=!1;if(!(!0!==supressAdding)){_context3.next=12;break}_context3.next=9;return NamedRouting.addAssignment(match[1],urlEscaped);case 9:_context3.t0=_context3.sent;if(!(!1===_context3.t0)){_context3.next=12;break}routeCancelled=!0;case 12:return _context3.abrupt("return",{name:match[1],url:match[2],urlEscaped:urlEscaped,cancelled:routeCancelled,namedOutlet:NamedRouting.parseNamedOutletUrl(match[2])});case 13:return _context3.abrupt("return",null);case 14:case"end":return _context3.stop();}}},_callee3)}));function parseNamedItem(_x5,_x6){return _parseNamedItem.apply(this,arguments)}return parseNamedItem}()/**
     * Takes a url for a named outlet assignment and parses
     * @param {string} url
     * @returns {ParseNamedOutletAsignment|null} null is returned if the url could not be parsed into a named outlet assignment
     */},{key:"parseNamedOutletUrl",value:function parseNamedOutletUrl(url){var match=url.match(/^([/\w-]+)(\(.*?\))?(?:\:(.+))?/);if(match){var data=new Map;if(match[3]){for(var keyValues=match[3].split("&"),i=0,iLen=keyValues.length,keyValue;i<iLen;i++){keyValue=keyValues[i].split("=");data.set(decodeURIComponent(keyValue[0]),decodeURIComponent(keyValue[1]))}}var elementTag=match[1],importPath=match[2]&&match[2].substr(1,match[2].length-2),inferredElementTag=NamedRouting.inferCustomElementTagName(elementTag);if(null===inferredElementTag){return null}if(!importPath){importPath=NamedRouting.inferCustomElementImportPath(elementTag,inferredElementTag)}var options={import:importPath};return{elementTag:inferredElementTag,data:data,options:options}}return null}/**
     * @param {string} importStyleTagName
     * @param {string} elementTag
     * @returns {string} the custom element import path infered from the import style string
     */},{key:"inferCustomElementImportPath",value:function inferCustomElementImportPath(importStyleTagName,elementTag){if(customElements.get(elementTag)!==void 0){// tag is loaded. no need for import.
return void 0}var inferredPath=importStyleTagName,lastForwardSlash=inferredPath.lastIndexOf("/");if(-1===lastForwardSlash){inferredPath="/"+inferredPath}var dotIndex=inferredPath.indexOf(".");if(-1===dotIndex){inferredPath+=".js"}return inferredPath}/**
     * @param {string} elementTag
     * @returns {string} the custom element tag name infered from import style string
     */},{key:"inferCustomElementTagName",value:function inferCustomElementTagName(elementTag){var inferredTagName=elementTag,lastForwardSlash=inferredTagName.lastIndexOf("/");// get class name from path
if(-1<lastForwardSlash){inferredTagName=inferredTagName.substring(lastForwardSlash+1)}// get class name from file name
var dotIndex=inferredTagName.indexOf(".");if(-1<dotIndex){inferredTagName=inferredTagName.substring(0,dotIndex-1)}// to kebab case
inferredTagName=inferredTagName.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();if(-1===inferredTagName.indexOf("-")){inferredTagName=null}return inferredTagName}/**
     * Prefetches an import module so that it is available when the link is activated
     * @param {NamedMatch} namedAssignment item assignment
     * @returns {Promise} resolves when the import is completed
     */},{key:"prefetchNamedOutletImports",value:function(){var _prefetchNamedOutletImports=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee4(namedAssignment){return regeneratorRuntime.wrap(function _callee4$(_context4){while(1){switch(_context4.prev=_context4.next){case 0:if(!(namedAssignment.namedOutlet&&namedAssignment.namedOutlet.options&&namedAssignment.namedOutlet.options.import)){_context4.next=5;break}_context4.next=3;return NamedRouting.pageReady();case 3:_context4.next=5;return NamedRouting.importCustomElement(namedAssignment.namedOutlet.options.import,namedAssignment.namedOutlet.elementTag);case 5:case"end":return _context4.stop();}}},_callee4)}));function prefetchNamedOutletImports(_x7){return _prefetchNamedOutletImports.apply(this,arguments)}return prefetchNamedOutletImports}()/**
     * Imports a script for a customer element once the page has loaded
     * @param {string} importSrc 
     * @param {string} tagName 
     */},{key:"prefetchImport",value:function(){var _prefetchImport=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee5(importSrc,tagName){return regeneratorRuntime.wrap(function _callee5$(_context5){while(1){switch(_context5.prev=_context5.next){case 0:_context5.next=2;return NamedRouting.pageReady();case 2:_context5.next=4;return NamedRouting.importCustomElement(importSrc,tagName);case 4:case"end":return _context5.stop();}}},_callee5)}));function prefetchImport(_x8,_x9){return _prefetchImport.apply(this,arguments)}return prefetchImport}()/**
     * Imports a script for a customer element
     * @param {string} importSrc 
     * @param {string} tagName 
     */},{key:"importCustomElement",value:function(){var _importCustomElement=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee6(importSrc,tagName){return regeneratorRuntime.wrap(function _callee6$(_context6){while(1){switch(_context6.prev=_context6.next){case 0:if(!(importSrc&&customElements.get(tagName)===void 0)){_context6.next=3;break}_context6.next=3;return import(importSrc);case 3:case"end":return _context6.stop();}}},_callee6)}));function importCustomElement(_x10,_x11){return _importCustomElement.apply(this,arguments)}return importCustomElement}()/**
     * 
     */},{key:"pageReady",value:function pageReady(){if(!NamedRouting.pageReadyPromise){NamedRouting.pageReadyPromise="complete"===document.readyState?Promise.resolve():new Promise(function(resolve,reject){var callback=function callback(){if("complete"===document.readyState){document.removeEventListener("readystatechange",callback);resolve()}};document.addEventListener("readystatechange",callback)})}return NamedRouting.pageReadyPromise}/**
     * Called just before leaving for another route.
     * Fires an event 'routeOnLeave' that can be cancelled by preventing default on the event.
     * @fires RouteElement#onRouteLeave
     * @param {*} newRoute - the new route being navigated to
     * @returns bool - if the currently active route can be left
     */},{key:"canLeave",value:function canLeave(newRoute){/**
       * Event that can be cancelled to prevent this route from being navigated away from.
       * @event RouteElement#onRouteLeave
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.route - The RouteElement that performed the match.
       */var canLeaveEvent=new CustomEvent("onRouteLeave",{bubbles:!0,cancelable:!0,composed:!0,detail:{route:newRoute}});// @ts-ignore
// This method is designed to be bound to a Custom Element instance. It located in here for general visibility.
this.dispatchEvent(canLeaveEvent);return!canLeaveEvent.defaultPrevented}}]);return NamedRouting}();NamedRouting.pageReadyPromise=void 0;NamedRouting.registry={};NamedRouting.assignments={};var namedRouting={NamedRouting:NamedRouting},RouterElement=/*#__PURE__*/function(_HTMLElement){babelHelpers.inherits(RouterElement,_HTMLElement);babelHelpers.createClass(RouterElement,[{key:"disconnectedCallback",value:function disconnectedCallback(){RouterElement.removeRouter.call(this._parentRouter,this);this.removeEventListener("onRouterAdded",this.handlerAddRouter,!1);this.removeEventListener("onRouteAdded",this.handlerAddRoute,!1);if(this.getName()){NamedRouting.removeNamedItem(this.getName())}}},{key:"connectedCallback",value:function(){var _connectedCallback=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee7(){var baseURI,baseTags,routerAddedEvent;return regeneratorRuntime.wrap(function _callee7$(_context7){while(1){switch(_context7.prev=_context7.next){case 0:if(!this.created){this.created=!0;// IE workaround for the lack of document.baseURI property
baseURI=document.baseURI;if(baseURI===void 0){baseTags=document.getElementsByTagName("base");baseURI=baseTags.length?baseTags[0].href:document.URL;// @ts-ignore
document.baseURI=baseURI}this._routers=[];RouterElement.initialize()}if(!this.isConnected){_context7.next=9;break}/**
       * Internal event used to plumb together the routers. Do not interfer with.
       * @event RouterElement#onRouterAdded
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */routerAddedEvent=new CustomEvent("onRouterAdded",{bubbles:!0,cancelable:!0,composed:!0,detail:{router:this}});this.dispatchEvent(routerAddedEvent);this._parentRouter=routerAddedEvent.detail.parentRouter;this.addEventListener("onRouterAdded",this.handlerAddRouter=RouterElement.handlerAddRouter.bind(this),!1);this.addEventListener("onRouteAdded",this.handlerAddRoute=this.handlerAddRoute.bind(this),!1);_context7.next=9;return NamedRouting.addNamedItem(this);case 9:case"end":return _context7.stop();}}},_callee7,this)}));function connectedCallback(){return _connectedCallback.apply(this,arguments)}return connectedCallback}()}],[{key:"handlerAddRouter",/**
   * Event handler for handling when child router is added.
   * This function is called in the scope of RouterElement for the top level collection of routers and instacnes of RotuerElement for nested router collections.
   * Used to link up RouterElements with child RouterElements even through Shadow DOM.
   * @param {CustomEvent} event - routerAdded event
   */value:function handlerAddRouter(event){RouterElement.addRouter.call(this,event.detail.router);event.stopPropagation();event.detail.parentRouter=this}},{key:"handlerRouterLinksAdded",value:function handlerRouterLinksAdded(event){if(event.detail.links){event.detail.onRegistered=RouterElement.registerLinks(event.detail.links)}}},{key:"handlerNavigate",value:function handlerNavigate(event){if(event.detail.href){event.detail.onNavigated=RouterElement.navigate(event.detail.href)}}/** 
     * Used to link up RouterElements with child RouterElements even through Shadow DOM.
     * @param {RouterElement} router - routerElement to add. RouterElement after the first can be thought of as auxilary RouterElements
     */},{key:"addRouter",value:function addRouter(router){this._routers.push(router)}/**
     * Removes a RouterElement from the routing process.
     * @param {RouterElement} routerElement 
     */},{key:"removeRouter",value:function removeRouter(routerElement){var routerIndex=this._routers.indexOf(routerElement);if(-1<routerIndex){this._routers.splice(routerIndex,1)}}/**
     * Global handler for hash changes
     */},{key:"changeHash",value:function changeHash(){}// TODO
// let hash = RouterElement._getHash();
// RouterElement.dispatch(_changeHash(hash));
/**
   * Global handler for url changes.
   * Should be called if the user changes the URL via the URL bar or navigating history
   */},{key:"changeUrl",value:function(){var _changeUrl=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee8(){var hash,path,query,oldRoute,newUrl;return regeneratorRuntime.wrap(function _callee8$(_context8){while(1){switch(_context8.prev=_context8.next){case 0:hash=RouterElement._getHash();path=decodeURIComponent(window.location.pathname);query=window.location.search.substring(1);oldRoute=RouterElement._route;if(RouterElement._initialized){_context8.next=6;break}return _context8.abrupt("return",!1);case 6:if(!(oldRoute.path===path&&oldRoute.query===query&&oldRoute.hash===hash)){_context8.next=8;break}return _context8.abrupt("return",!1);case 8:newUrl=RouterElement._getUrl(window.location);_context8.next=11;return RouterElement.dispatch(newUrl,!0);case 11:case"end":return _context8.stop();}}},_callee8)}));function changeUrl(){return _changeUrl.apply(this,arguments)}return changeUrl}()/**
     * Global handler for page clicks. Filters out and handles clicks from links.
     * @param {(MouseEvent|HTMLAnchorElement|string)} navigationSource - The source of the new url to navigate to. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
     */},{key:"navigate",value:function(){var _navigate=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee9(navigationSource){var event,anchor,href,target,url,newUrl;return regeneratorRuntime.wrap(function _callee9$(_context9){while(1){switch(_context9.prev=_context9.next){case 0:event=null;anchor=null;if(!babelHelpers.instanceof(navigationSource,Event)){_context9.next=8;break}event=navigationSource;// If already handled and canceled
if(!event.defaultPrevented){_context9.next=6;break}return _context9.abrupt("return");case 6:_context9.next=9;break;case 8:if("string"!==typeof navigationSource){anchor=navigationSource}case 9:href=RouterElement._getSameOriginLinkHref(navigationSource);if(!(null===href)){_context9.next=12;break}return _context9.abrupt("return");case 12:if(href){_context9.next=16;break}target=event&&event.target||anchor;if(target){/**
         * Event that fires if a link is not handled due to it not being same origin or base url.
         * @event RouterElement#onRouteCancelled
         * @type CustomEvent
         * @property {Object} details - The event details
         * @property {RouteElement} details.url - The url that was trying to be matched.
         */target.dispatchEvent(new CustomEvent("onRouteNotHandled",{bubbles:!0,composed:!0,detail:{href:href}}))}return _context9.abrupt("return");case 16:event&&event.preventDefault();// If the navigation is to the current page we shouldn't add a history
// entry or fire a change event.
if(!(href===window.location.href)){_context9.next=19;break}return _context9.abrupt("return");case 19:url=new URL(href);newUrl=RouterElement._getUrl(url);_context9.next=23;return RouterElement.dispatch(newUrl);case 23:case"end":return _context9.stop();}}},_callee9)}));function navigate(_x12){return _navigate.apply(this,arguments)}return navigate}()/**
     * Clears all current match information for all available routers.
     * This initializes ready for the next matching.
     */},{key:"prepareRoutersForDispatch",value:function prepareRoutersForDispatch(routers){routers=routers||RouterElement._routers;if(routers){for(var i=0,iLen=routers.length,router;i<iLen;i++){router=routers[i];router.clearCurrentMatch();var childRouters=router._routers;this.prepareRoutersForDispatch(childRouters)}}}/**
     * Common entry point that starts the routing process.
     * @param {string} url
     * @param {boolean} [skipHistory]
     * @fires RouterElement#onRouteCancelled
     */},{key:"dispatch",value:function(){var _dispatch=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee10(url,skipHistory){var basePath,shortUrl;return regeneratorRuntime.wrap(function _callee10$(_context10){while(1){switch(_context10.prev=_context10.next){case 0:// console.info('dispatch: ' + url);
basePath=RouterElement.baseUrlSansHost();shortUrl=url.substr(basePath.length);RouterElement._route={url:shortUrl// Check if all current routes wil let us navigate away
};if(!(RouterElement._activeRouters.length&&!1===RouterElement._activeRouters.every(function(r){return r.route.canLeave(RouterElement._route)}))){_context10.next=6;break}/**
       * Event that fires if a RouteElement refuses to let us perform routing.
       * @event RouterElement#onRouteCancelled
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */RouterElement._activeRouters[0].router.dispatchEvent(new CustomEvent("onRouteCancelled",{bubbles:!0,composed:!0,detail:{shortUrl:shortUrl}}));return _context10.abrupt("return");case 6:RouterElement._activeRouters=[];this.prepareRoutersForDispatch();if(!(0===RouterElement._routers.length)){_context10.next=13;break}this._currentMatch={remainder:shortUrl,data:null,redirect:null,url:"",useCache:!1};this.hasMatch=!1;_context10.next=21;break;case 13:_context10.next=15;return RouterElement.performMatchOnRouters(shortUrl,RouterElement._routers);case 15:_context10.t0=_context10.sent;if(!_context10.t0){_context10.next=18;break}_context10.t0=!0!==skipHistory;case 18:if(!_context10.t0){_context10.next=21;break}RouterElement.updateHistory(url);RouterElement.updateAnchorsStatus();case 21:case"end":return _context10.stop();}}},_callee10,this)}));function dispatch(_x13,_x14){return _dispatch.apply(this,arguments)}return dispatch}()/** Updates the location history with the new href */},{key:"updateHistory",value:function updateHistory(href){var urlState=RouterElement.getUrlState(),url=urlState;if(2===url.length){url=href}else if("/"===url){url=document.baseURI}else{url=document.baseURI+url}// Need to use a full URL in case the containing page has a base URI.
var fullNewUrl=new URL(url,window.location.protocol+"//"+window.location.host).href,oldRoute=RouterElement._route,now=window.performance.now(),shouldReplace=oldRoute._lastChangedAt+RouterElement._dwellTime>now;oldRoute._lastChangedAt=now;if(shouldReplace){window.history.replaceState({},"",fullNewUrl)}else{window.history.pushState({},"",fullNewUrl)}}/**
     * Sets the active status of any registered links based on the current URL
     * @param {string} [url] url to match against for link status
     * @param {any[]} [links] optional list of links to update the status for
     * @returns {Promise} Named items require parsing and processing prior to being analyzed. Resolved when named items are finished parsed and processed.
     */},{key:"updateAnchorsStatus",value:function(){var _updateAnchorsStatus=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee11(url,links){var currentAnchors,nextAnchors,i,iLen,link,urlFragments,j,jLen,urlFragment,urlFragNamedItemMatch,_i,_iLen,_link,named,routes,k,kLen,_k,_kLen,routeUrl;return regeneratorRuntime.wrap(function _callee11$(_context11){while(1){switch(_context11.prev=_context11.next){case 0:url=url||RouterElement.getUrlState();currentAnchors=links||RouterElement._anchors;nextAnchors=[];// Tidy up any unconnected anchors
for(i=0,iLen=currentAnchors.length;i<iLen;i++){if(!0===currentAnchors[i].a.isConnected){link=currentAnchors[i];nextAnchors[nextAnchors.length]=link;link.a.classList.remove(link.a.getAttribute("activeclassname")||link.a.activeClassName||"active")}}urlFragments=url.split("::");j=0,jLen=urlFragments.length;case 6:if(!(j<jLen)){_context11.next=60;break}urlFragment=urlFragments[j];_context11.next=10;return NamedRouting.parseNamedItem(urlFragment,!0);case 10:urlFragNamedItemMatch=_context11.sent;_i=0,_iLen=nextAnchors.length;case 12:if(!(_i<_iLen)){_context11.next=57;break}_link=nextAnchors[_i];if(!(_link&&_link.a.classList.contains(_link.a.getAttribute("activeclassname")||_link.a.activeClassName||"active"))){_context11.next=16;break}return _context11.abrupt("continue",54);case 16:if(!_link){_context11.next=54;break}if(!_link.routerMatches){_context11.next=54;break}named=_link.routerMatches.named;routes=_link.routerMatches.routes;if(!urlFragNamedItemMatch){_context11.next=37;break}k=0,kLen=named.length;case 22:if(!(k<kLen)){_context11.next=37;break}if(!(named[k].name==urlFragNamedItemMatch.name)){_context11.next=34;break}if(!(named[k].url==urlFragNamedItemMatch.urlEscaped)){_context11.next=30;break}// full match on named item
_link.a.classList.add(_link.a.getAttribute("activeclassname")||_link.a.activeClassName||"active");_link=null;return _context11.abrupt("continue",54);case 30:if(!(0===urlFragNamedItemMatch.urlEscaped.indexOf(named[k].url))){_context11.next=34;break}// full match on named item
_link.a.classList.add(_link.a.getAttribute("activeclassname")||_link.a.activeClassName||"active");_link=null;return _context11.abrupt("continue",54);case 34:k++;_context11.next=22;break;case 37:urlFragment="/"===urlFragment[0]?urlFragment.substr(1):urlFragment;_k=0,_kLen=routes.length;case 39:if(!(_k<_kLen)){_context11.next=54;break}routeUrl="/"===routes[_k][0]?routes[_k].substr(1):routes[_k];if(!(urlFragment==routeUrl)){_context11.next=47;break}// full match on route
_link.a.classList.add(_link.a.getAttribute("activeclassname")||_link.a.activeClassName||"active");_link=null;return _context11.abrupt("continue",54);case 47:if(!(0===urlFragment.indexOf(routeUrl))){_context11.next=51;break}// partial match on route
_link.a.classList.add(_link.a.getAttribute("activeclassname")||_link.a.activeClassName||"active");_link=null;return _context11.abrupt("continue",54);case 51:_k++;_context11.next=39;break;case 54:_i++;_context11.next=12;break;case 57:j++;_context11.next=6;break;case 60:/**
       * Event that fires when HTMLAnchorElement active statuses are being updated as part of a routing.
       * @event RouterElement#onRouteCancelled
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */window.dispatchEvent(new CustomEvent("onLinkActiveStatusUpdated",{bubbles:!0,composed:!0,detail:{links:nextAnchors}}));return _context11.abrupt("return",null);case 62:case"end":return _context11.stop();}}},_callee11)}));function updateAnchorsStatus(_x15,_x16){return _updateAnchorsStatus.apply(this,arguments)}return updateAnchorsStatus}()/**
     * Gets the current URL state based on currently active routers and outlets.
     * @param {RouterElement[]} [routers]
     */},{key:"getUrlState",value:function getUrlState(routers){var url=NamedRouting.generateNamedItemsUrl();routers=routers||RouterElement._routers;if(routers){for(var i=0,iLen=routers.length;i<iLen;i++){var router=routers[i],nextFrag=router.generateUrlFragment();if(nextFrag){if(url.length){url+="::"}url+=nextFrag;var childRouters=router._routers;if(childRouters&&childRouters.length){if(1===childRouters.length){url+="/"+this.getUrlState(childRouters)}else{url+="/("+this.getUrlState(childRouters)+")"}}}}}return url}/**
     * Iterates over each child RouterElement and calls it to match it portion of the current URL.
     * @param {string} url - While URL. Will be parsed for individual router URLs.
     * @param {RouterElement[]} routers
     * @returns {Promise<boolean>} resolves when matching is complete. false if matching was cancelled.
     */},{key:"performMatchOnRouters",value:function(){var _performMatchOnRouters=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee12(url,routers){var urls,urlsWithoutNamedOutlets,_i2,iLen,match,i,_iLen2,router;return regeneratorRuntime.wrap(function _callee12$(_context12){while(1){switch(_context12.prev=_context12.next){case 0:// console.info('performMatchOnRouters: ' + url);
// TODO query string data should be placed on RouterElement so it's accessible across all outlets. It's regarded as shared data across the routers.
// TODO Maybe have a way to regiser for changes to query string so routes can react
// TODO auxilary routers - start unit testing
if("("===url[0]){url=url.substr(1,url.length-2)}urls=RouterElement.splitUrlIntoRouters(url);urlsWithoutNamedOutlets=[];_i2=0,iLen=urls.length;case 4:if(!(_i2<iLen)){_context12.next=14;break}_context12.next=7;return NamedRouting.parseNamedItem(urls[_i2]);case 7:match=_context12.sent;if(!(match&&match.cancelled)){_context12.next=10;break}return _context12.abrupt("return",!1);case 10:if(!match){urlsWithoutNamedOutlets.push(urls[_i2])}case 11:_i2++;_context12.next=4;break;case 14:i=0;_iLen2=routers.length;case 16:if(!(i<_iLen2)){_context12.next=24;break}router=routers[i];if(!urlsWithoutNamedOutlets[i]){_context12.next=21;break}_context12.next=21;return router.performMatchOnRouter(urlsWithoutNamedOutlets[i]||"");case 21:i++;_context12.next=16;break;case 24:RouterElement.updateAnchorsStatus();return _context12.abrupt("return",!0);case 26:case"end":return _context12.stop();}}},_callee12)}));function performMatchOnRouters(_x17,_x18){return _performMatchOnRouters.apply(this,arguments)}return performMatchOnRouters}()},{key:"splitUrlIntoRouters",value:function splitUrlIntoRouters(url){if("/"===url){return["/"]}for(var urls=[],skip=0,i=0,lastI=i,iLen=url.length,char;i<iLen;i++){char=url[i];if("("===char){skip++}else if(")"===char){skip--}else if(":"===char&&":"===url[i+1]&&0===skip){urls.push(url.substring(lastI+(":"===url[lastI]?1:0),i));i++;lastI=i}}if("("===url[lastI]||")"===url[lastI]||":"===url[lastI]){lastI++}if(i>lastI){urls.push(url.substr(lastI))}for(var j=0,jLen=urls.length;j<jLen;j++){if("/"===urls[j][0]){urls[j]=urls[j].substr(1)}if("("===urls[j][0]&&")"===urls[j][urls[j].length-1]){urls[j]=urls[j].substr(1,urls[j].length-2)}}return urls}/**
     * Registers HTMLAnchorElements so that they become candidates route status styling.
     * @param {HTMLAnchorElement[]} links 
     * @param {string} [activeClassName]
     */},{key:"registerLinks",value:function(){var _registerLinks=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee13(links,activeClassName){var newAnchors,i,iLen,link,matches,j,jLen;return regeneratorRuntime.wrap(function _callee13$(_context13){while(1){switch(_context13.prev=_context13.next){case 0:// console.info('registerLinks');
RouterElement.removeDisconnectedAnchors();newAnchors=[];// Add the new anchors
i=0,iLen=links.length;case 3:if(!(i<iLen)){_context13.next=13;break}link=links[i];if(!link.href){_context13.next=10;break}_context13.next=8;return RouterElement.sanitizeLinkHref(link);case 8:matches=_context13.sent;if(matches){if(activeClassName&&!link.hasAttribute("activeclassname")){link.setAttribute("activeclassname",activeClassName)}newAnchors[newAnchors.length]={a:link,routerMatches:matches};for(j=0,jLen=matches.named.length;j<jLen;j++){NamedRouting.prefetchNamedOutletImports(matches.named[j])}}case 10:i++;_context13.next=3;break;case 13:RouterElement._anchors=RouterElement._anchors.concat(newAnchors);RouterElement.updateAnchorsStatus(void 0,newAnchors);case 15:case"end":return _context13.stop();}}},_callee13)}));function registerLinks(_x19,_x20){return _registerLinks.apply(this,arguments)}return registerLinks}()},{key:"removeDisconnectedAnchors",value:function removeDisconnectedAnchors(){// Tidy up any unconnected anchors
for(var currentAnchors=RouterElement._anchors,nextAnchors=[],i=0,iLen=currentAnchors.length;i<iLen;i++){if(!0===currentAnchors[i].a.isConnected){nextAnchors[nextAnchors.length]=currentAnchors[i]}}// Do this after pushing history location state
RouterElement._anchors=nextAnchors}/**
     * @typedef {Object} AssignmentMatches
     * @property {string[]} routes - Assignments of type router
     * @property {import('./named-routing').NamedMatch[]} named - Assignments of type namedItems
     */ /**
         * 
         * @param {(MouseEvent|HTMLAnchorElement|string)} hrefSource - The source of the new url to handle. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
         * @returns {Promise<AssignmentMatches>} assignmentMatches
         * 
         */},{key:"sanitizeLinkHref",value:function(){var _sanitizeLinkHref=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee14(hrefSource){var href,url,hash,path,query,basePathLength,urlStr,urls,namedMatches,routerMatches,i,iLen,namedMatch;return regeneratorRuntime.wrap(function _callee14$(_context14){while(1){switch(_context14.prev=_context14.next){case 0:href=RouterElement._getSameOriginLinkHref(hrefSource);url=new URL(href);hash=RouterElement._getHash();path=decodeURIComponent(url.pathname);query=url.search.substring(1);basePathLength=RouterElement.baseUrlSansHost().length;urlStr=path.substr(basePathLength);if("("===urlStr[0]){urlStr=urlStr.substr(1,urlStr.length-2)}urls=RouterElement.splitUrlIntoRouters(urlStr);namedMatches=[];routerMatches=[];i=0,iLen=urls.length;case 12:if(!(i<iLen)){_context14.next=20;break}_context14.next=15;return NamedRouting.parseNamedItem(urls[i],!0);case 15:namedMatch=_context14.sent;if(namedMatch){namedMatches.push(namedMatch)}else{routerMatches.push(urls[i])}case 17:i++;_context14.next=12;break;case 20:return _context14.abrupt("return",{named:namedMatches,routes:routerMatches});case 21:case"end":return _context14.stop();}}},_callee14)}));function sanitizeLinkHref(_x21){return _sanitizeLinkHref.apply(this,arguments)}return sanitizeLinkHref}()}]);function RouterElement(){var _this;babelHelpers.classCallCheck(this,RouterElement);_this=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(RouterElement).call(this));/**
              * @type import('./routes-route').Match
              */_this._currentMatch=null;_this.canLeave=NamedRouting.canLeave.bind(babelHelpers.assertThisInitialized(_this));return _this}/**
     * Global initialization
     */babelHelpers.createClass(RouterElement,[{key:"getName",value:function getName(){if(this.routerName===void 0){this.routerName=this.getAttribute("name")}return this.routerName}},{key:"getCurrentMatch",value:function getCurrentMatch(){if(!this._currentMatch&&this._parentRouter._currentMatch){this._currentMatch={data:null,redirect:null,url:"",useCache:!1,remainder:this._parentRouter._currentMatch.remainder};// TODO get remainder from parent but ony take this routers url from it
// e.g. split :: and take the firs put the rest back
// TODO if we support adding a router name to the URL this is where we would check for it: (myRouter:users/main) --> target router named myRouter with url users/main
var remainder=this._currentMatch.remainder;if(remainder&&"("===remainder[0]){var remainderArray=RouterElement.splitUrlIntoRouters(remainder.substring(1,remainder.length-2));this._currentMatch.remainder=remainderArray.shift();// The next line is done in in the postProcessMatch
// this._parentRouter._currentMatch.remainder = '(' + remainder.join('::') + ')';
}this._currentMatch.url=this._currentMatch.remainder}return this._currentMatch}},{key:"clearCurrentMatch",value:function clearCurrentMatch(){this._currentMatch=null}/** 
     * Event handler for handling when child route is added.
     * Used to link up RouterElements with child RouteElements even through Shadow DOM.
     * @param {CustomEvent} event - routeAdded event
     */},{key:"handlerAddRoute",value:function handlerAddRoute(event){event.stopPropagation();event.detail.router=this;event.detail.onRouteAdded=this.addRoute(event.detail.route)}/**
     * Performs matching for nested routes as they connect.
     * @param {import('./routes-route').RouteElement} routeElement
     * @returns {Promise}
     */},{key:"addRoute",value:function(){var _addRoute=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee15(routeElement){var currentMatch;return regeneratorRuntime.wrap(function _callee15$(_context15){while(1){switch(_context15.prev=_context15.next){case 0:if(this.hasMatch){_context15.next=6;break}currentMatch=this.getCurrentMatch();if(!currentMatch){_context15.next=6;break}if(!currentMatch.remainder){_context15.next=6;break}_context15.next=6;return this.performMatchOnRoute(currentMatch.remainder,routeElement);case 6:case"end":return _context15.stop();}}},_callee15,this)}));function addRoute(_x22){return _addRoute.apply(this,arguments)}return addRoute}()/**
     * Takes in a url that contains named router data and renders the router using the information
     * @param {string} url to process as a named item
     * @returns {Promise<import('./routes-route.js').Match>}
     */},{key:"processNamedUrl",value:function(){var _processNamedUrl=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee16(url){return regeneratorRuntime.wrap(function _callee16$(_context16){while(1){switch(_context16.prev=_context16.next){case 0:_context16.next=2;return this.performMatchOnRouter(url);case 2:return _context16.abrupt("return",_context16.sent);case 3:case"end":return _context16.stop();}}},_callee16,this)}));function processNamedUrl(_x23){return _processNamedUrl.apply(this,arguments)}return processNamedUrl}()/**
     * Performs route matching by iterating through routes looking for matches
     * @param {String} url  
     * @returns {Promise<import('./routes-route.js').Match>}
     */},{key:"performMatchOnRouter",value:function(){var _performMatchOnRouter=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee17(url){var routeElements,outletElement,match,i,iLen,routeElement,_routeElement;return regeneratorRuntime.wrap(function _callee17$(_context17){while(1){switch(_context17.prev=_context17.next){case 0:// console.group('performMatchOnRouter: ' + url);
this.hasMatch=!1;this._currentMatch={remainder:url,data:null,redirect:null,url:"",useCache:!1};routeElements=this.getRouteElements();outletElement=this.getOutletElement();match=null;i=0;iLen=routeElements.length;case 7:if(!(i<iLen)){_context17.next=18;break}routeElement=routeElements[i];_context17.next=11;return this.performMatchOnRoute(url,routeElement);case 11:match=_context17.sent;if(!(null!=match)){_context17.next=15;break}// console.info('route matched -> ', routeElement.getAttribute('path'));
i++;return _context17.abrupt("break",18);case 15:i++;_context17.next=7;break;case 18:// clear cache of remaining routes
for(;i<iLen;i++){_routeElement=routeElements[i];_routeElement.clearLastMatch()}if(!(null===match)){_context17.next=22;break}if(outletElement.renderOutletContent){outletElement.renderOutletContent("No matching route for url "+url+" \r\nTo replace this message add a 404 catch all route\r\n &lt;a-route path='*'>&lt;template&gt;catach all - NotFound&lt;/template&gt;&lt;/a-route&gt;");console&&console.error&&console.error("404 - Route not found for url "+url)}return _context17.abrupt("return",null);case 22:return _context17.abrupt("return",match);case 23:case"end":return _context17.stop();}}},_callee17,this)}));function performMatchOnRouter(_x24){return _performMatchOnRouter.apply(this,arguments)}return performMatchOnRouter}()/**
     * Tries to invoke matching of a url to a {RouteElement}
     * @param {string} url to match
     * @param {import('./routes-route').RouteElement} routeElement to match against
     * @returns {Promise<import('./routes-route.js').Match>}
     */},{key:"performMatchOnRoute",value:function(){var _performMatchOnRoute=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee18(url,routeElement){var match,activeRouters,outletElement,content;return regeneratorRuntime.wrap(function _callee18$(_context18){while(1){switch(_context18.prev=_context18.next){case 0:if(routeElement.match){_context18.next=2;break}return _context18.abrupt("return",null);case 2:match=routeElement.match(url)||null;if(!(null!=match)){_context18.next=21;break}this.postProcessMatch();if(!match.redirect){_context18.next=9;break}_context18.next=8;return this.performMatchOnRouter(match.redirect);case 8:return _context18.abrupt("return",_context18.sent);case 9:activeRouters=RouterElement._activeRouters;activeRouters.push({route:routeElement,router:this,match:match});this._currentMatch=match;if(match.useCache){_context18.next=18;break}outletElement=this.getOutletElement();/**
                                                      * @param {string | HTMLElement | DocumentFragment} content
                                                      */_context18.next=16;return routeElement.getContent(match.data);case 16:content=_context18.sent;outletElement.renderOutletContent(content);case 18:if(!(this._routers&&match.remainder)){_context18.next=21;break}_context18.next=21;return RouterElement.performMatchOnRouters(match.remainder,this._routers);case 21:return _context18.abrupt("return",match);case 22:case"end":return _context18.stop();}}},_callee18,this)}));function performMatchOnRoute(_x25,_x26){return _performMatchOnRoute.apply(this,arguments)}return performMatchOnRoute}()},{key:"postProcessMatch",value:function postProcessMatch(){this.hasMatch=!0;if(this._parentRouter._currentMatch){var parentMatch=this._parentRouter._currentMatch,remainder=parentMatch.remainder;// TODO get remainder from parent but ony take this routers url from it
// e.g. split :: and take the first put the rest back
// TODO if we support adding a router name to the URL this is where we would check for it: (myRouter:users/main) --> target router named myRouter with url users/main
if(remainder&&"("===remainder[0]){remainder=remainder.substring(1,remainder.length-2)}remainder=RouterElement.splitUrlIntoRouters(remainder);remainder.shift();// this._currentMatch.remainder = remainder.shift();
if(1<remainder.length){this._parentRouter._currentMatch.remainder="("+remainder.join("::")+")"}else if(1===remainder.length){this._parentRouter._currentMatch.remainder=remainder[0]}else{this._parentRouter._currentMatch.remainder=""}}}},{key:"generateUrlFragment",value:function generateUrlFragment(){var match=this._currentMatch;if(!match){return""}var urlFrag=match.url;if(match.remainder){urlFrag+="/"+match.remainder}// TODO test if this is required. It might be duplicating routes.
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
     */},{key:"getOutletElement",value:function getOutletElement(){// @ts-ignore
return this._getRouterElements("an-outlet")[0]}/**
     * @returns {import('./routes-route').RouteElement[]}
     */},{key:"getRouteElements",value:function getRouteElements(){// @ts-ignore
return this._getRouterElements("a-route")}/**
     * Finds immediate child route elements
     */},{key:"_getRouterElements",value:function _getRouterElements(tagName){var routeElements=[];tagName=tagName.toLowerCase();for(var i=0,iLen=this.children.length,elem;i<iLen;i++){elem=this.children[i];if(elem.tagName.toLowerCase()===tagName){routeElements.push(elem)}}return routeElements}/**
     * Returns the absolute URL of the link (if any) that this click event is clicking on, if we can and should override the resulting full page navigation. Returns null otherwise.
     * @param {(MouseEvent|HTMLAnchorElement|string)} hrefSource - The source of the new url to handle. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
     * @return {string?} Returns the absolute URL of the link (if any) that this click event is clicking on, if we can and should override the resulting full page navigation. Returns null if click should not be consumed.
     */}],[{key:"initialize",value:function(){var _initialize=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee19(){return regeneratorRuntime.wrap(function _callee19$(_context19){while(1){switch(_context19.prev=_context19.next){case 0:if(RouterElement._initialized){_context19.next=9;break}RouterElement._initialized=!0;//RouterElement.whiteListRegEx = this.getAttribute('base-white-list') || '';
window.addEventListener("popstate",RouterElement.changeUrl,!1);window.addEventListener("click",RouterElement.navigate,!1);// Listen for top level routers being added
window.addEventListener("onRouterAdded",RouterElement.handlerAddRouter.bind(RouterElement),!1);// Listen for link registration
window.addEventListener("routerLinksAdded",RouterElement.handlerRouterLinksAdded.bind(RouterElement),!1);// Listen for navigate requests
window.addEventListener("navigate",RouterElement.handlerNavigate.bind(RouterElement),!1);_context19.next=9;return RouterElement.changeUrl();case 9:case"end":return _context19.stop();}}},_callee19)}));function initialize(){return _initialize.apply(this,arguments)}return initialize}()},{key:"_getSameOriginLinkHref",value:function _getSameOriginLinkHref(hrefSource){var href=null,anchor=null;if(babelHelpers.instanceof(hrefSource,Event)){var event=hrefSource;// We only care about left-clicks.
if(0!==event.button){return null}// We don't want modified clicks, where the intent is to open the page
// in a new tab.
if(event.metaKey||event.ctrlKey){return null}// @ts-ignore
for(var eventPath=event.path,i=0,element;i<eventPath.length;i++){element=eventPath[i];if("A"===element.tagName&&element.href){anchor=element;break}}// If there's no link there's nothing to do.
if(!anchor){return null}}else if("string"===typeof hrefSource){href=hrefSource}else{anchor=hrefSource}if(anchor){// Target blank is a new tab, don't intercept.
if("_blank"===anchor.target){return""}// If the link is for an existing parent frame, don't intercept.
if(("_top"===anchor.target||"_parent"===anchor.target)&&window.top!==window){return""}// If the link is a download, don't intercept.
if(anchor.download){return""}href=anchor.href}// If link is different to base path, don't intercept.
if(0!==href.indexOf(document.baseURI)){return""}var hrefEsacped=href.replace(/::/g,"$_$_"),url;// It only makes sense for us to intercept same-origin navigations.
// pushState/replaceState don't work with cross-origin links.
if(null!=document.baseURI){url=new URL(hrefEsacped,document.baseURI)}else{url=new URL(hrefEsacped)}var origin;// IE Polyfill
if(window.location.origin){origin=window.location.origin}else{origin=window.location.protocol+"//"+window.location.host}var urlOrigin;if(url.origin&&"null"!==url.origin){urlOrigin=url.origin}else{// IE always adds port number on HTTP and HTTPS on <a>.host but not on
// window.location.host
var urlHost=url.host,urlPort=url.port,urlProtocol=url.protocol,isExtraneousHTTPS="https:"===urlProtocol&&"443"===urlPort,isExtraneousHTTP="http:"===urlProtocol&&"80"===urlPort;if(isExtraneousHTTPS||isExtraneousHTTP){urlHost=url.hostname}urlOrigin=urlProtocol+"//"+urlHost}if(urlOrigin!==origin){return""}var normalizedHref=url.pathname.replace(/\$_\$_/g,"::")+url.search.replace(/\$_\$_/g,"::")+url.hash.replace(/\$_\$_/g,"::");// pathname should start with '/', but may not if `new URL` is not supported
if("/"!==normalizedHref[0]){normalizedHref="/"+normalizedHref}// If we've been configured not to handle this url... don't handle it!
// let urlSpaceRegExp = RouterElement._makeRegExp(RouterElement.whiteListRegEx);
// if (urlSpaceRegExp && !urlSpaceRegExp.test(normalizedHref)) {
//   return '';
// }
// Need to use a full URL in case the containing page has a base URI.
var fullNormalizedHref=new URL(normalizedHref,window.location.href).href;return fullNormalizedHref}// static _makeRegExp(urlSpaceRegex) {
//   return RegExp(urlSpaceRegex);
// }
// ---------- Action helpers ----------
// Much of this code was taken from the Polymer project iron elements
},{key:"_getHash",value:function _getHash(){return decodeURIComponent(window.location.hash.substring(1))}},{key:"baseUrlSansHost",value:function baseUrlSansHost(){var host=window.location.protocol+"//"+window.location.host;return document.baseURI.substr(host.length+1)}},{key:"_getUrl",value:function _getUrl(url){url=url||window.location;var path=decodeURIComponent(url.pathname),query=url.search.substring(1),hash=RouterElement._getHash(),partiallyEncodedPath=encodeURI(path).replace(/\#/g,"%23").replace(/\?/g,"%3F"),partiallyEncodedQuery="";if(query){partiallyEncodedQuery="?"+query.replace(/\#/g,"%23");if(RouterElement._encodeSpaceAsPlusInQuery){partiallyEncodedQuery=partiallyEncodedQuery.replace(/\+/g,"%2B").replace(/ /g,"+").replace(/%20/g,"+")}else{// required for edge
partiallyEncodedQuery=partiallyEncodedQuery.replace(/\+/g,"%2B").replace(/ /g,"%20")}}var partiallyEncodedHash="";if(hash){partiallyEncodedHash="#"+encodeURI(hash)}return partiallyEncodedPath+partiallyEncodedQuery+partiallyEncodedHash}}]);return RouterElement}(babelHelpers.wrapNativeSuper(HTMLElement));///@ts-check
RouterElement._routers=[];RouterElement._route={};RouterElement._initialized=!1;RouterElement._activeRouters=[];RouterElement._dwellTime=2e3;RouterElement._anchors=[];RouterElement._encodeSpaceAsPlusInQuery=!1;RouterElement.assignedOutlets={};window.customElements.define("a-router",RouterElement);var routesRouter={RouterElement:RouterElement},RouteElement=/*#__PURE__*/function(_HTMLElement2){babelHelpers.inherits(RouteElement,_HTMLElement2);babelHelpers.createClass(RouteElement,[{key:"connectedCallback",value:function connectedCallback(){if(!this.created){this.created=!0;this.style.display="none";var baseElement=document.head.querySelector("base");this.baseUrl=baseElement&&baseElement.getAttribute("href")}if(this.isConnected){var onRouteAdded=new CustomEvent("onRouteAdded",{bubbles:!0,composed:!0,detail:{route:this}});this.dispatchEvent(onRouteAdded);if(!this.hasAttribute("lazyload")||"true"!==this.getAttribute("lazyload").toLowerCase()){var importAttr=this.getAttribute("import"),tagName=this.getAttribute("element");NamedRouting.prefetchImport(importAttr,tagName)}}}},{key:"disconnectedCallback",value:function disconnectedCallback(){}}]);function RouteElement(){var _this2;babelHelpers.classCallCheck(this,RouteElement);_this2=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(RouteElement).call(this));_this2.canLeave=NamedRouting.canLeave.bind(babelHelpers.assertThisInitialized(_this2));return _this2}babelHelpers.createClass(RouteElement,[{key:"_createPathSegments",value:function _createPathSegments(url){return url.replace(/(^\/+|\/+$)/g,"").split("/")}/**
     * Performs matching and partial matching. In order to successfully match, a RouteElement elements path attribute must match from the start of the URL. A full match would completely match the URL. A partial match would return from the start.
     * @fires RouteElement#onROuteMatch
     * @param {string} url - The url to perform matching against
     * @returns {Match} match - The resulting match. Null will be returned if no match was made.
     */},{key:"match",value:function match(url){var urlSegments=this._createPathSegments(url),path=this.getAttribute("path");if(!path){console.info("route must contain a path");throw"Route has no path defined. Add a path attribute to route"}var match=null,fullMatch={url:url,remainder:"",data:null,redirect:null,useCache:!1};if("*"===path){match=fullMatch}else if(path===url){match=fullMatch}else{for(var pathSegments=this._createPathSegments(path),data=new Map,max=Math.max(urlSegments.length,pathSegments.length),ret,i=0;i<max;i++){if(pathSegments[i]&&":"===pathSegments[i].charAt(0)){var param=pathSegments[i].replace(/(^\:|[+*?]+$)/g,""),flags=(pathSegments[i].match(/[+*?]+$/)||[])[0]||"",plus=~flags.indexOf("+"),star=~flags.indexOf("*"),val=urlSegments[i]||"";if(!val&&!star&&(0>flags.indexOf("?")||plus)){match=null;break}data.set(param,decodeURIComponent(val));if(plus||star){data.set(param,urlSegments.slice(i).map(decodeURIComponent).join("/"));match=match||fullMatch;match.data=data;break}}else if(pathSegments[i]!==urlSegments[i]){if(0<i&&!this.hasAttribute("fullmatch")){match=match||fullMatch;match.data=data;match.url=urlSegments.slice(0,i).join("/");match.remainder=urlSegments.slice(i).join("/")}break}if(i===max-1){match=match||fullMatch;match.data=data}}}if(null!==match){/**
       * Route Match event that fires after a route has performed successful matching. The event can be cancelled to prevent the match.
       * @event RouteElement#onRouteMatch
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.route - The RouteElement that performed the match.
       * @property {Match} details.match - The resulting match. Warning, modifications to the Match will take effect.
       * @property {string} details.path - The RouteElement path attribute value that was matched against.
       */var routeMatchedEvent=new CustomEvent("onRouteMatch",{bubbles:!0,cancelable:!0,composed:!0,detail:{route:this,match:match,path:path}});this.dispatchEvent(routeMatchedEvent);if(routeMatchedEvent.defaultPrevented){match=null}if(this.hasAttribute("redirect")){match.redirect=this.getAttribute("redirect")}}if(match){var useCache=this.lastMatch&&this.lastMatch.url===match.url&&!this.hasAttribute("disableCache");match.useCache=useCache}this.lastMatch=match;return match}},{key:"clearLastMatch",value:function clearLastMatch(){this.lastMatch=null}/**
     * Generates content for this route.
     * @param {Object} attributes - Object of properties that will be applied to the content. Only applies if the content was not generated form a Template.
     * @returns {Promise<string|DocumentFragment|Node>} - The resulting generated content.
     */},{key:"getContent",value:function(){var _getContent=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee20(){var attributes,content,importAttr,tagName,template,_args20=arguments;return regeneratorRuntime.wrap(function _callee20$(_context20){while(1){switch(_context20.prev=_context20.next){case 0:attributes=0<_args20.length&&_args20[0]!==void 0?_args20[0]:{};content=this.content;if(content){_context20.next=11;break}importAttr=this.getAttribute("import");tagName=this.getAttribute("element");_context20.next=7;return NamedRouting.importCustomElement(importAttr,tagName);case 7:if(tagName){// TODO support if tagName is a function that is called and will return the content
// content = tagName(attributes);
content=document.createElement(tagName);if(customElements.get(tagName)===void 0){console.error("Custom Element not found: ".concat(tagName,". Are you missing an import or mis-spelled tag name?"))}}template=this.children[0];if(!(template&&babelHelpers.instanceof(template,HTMLTemplateElement))){_context20.next=11;break}return _context20.abrupt("return",template.content.cloneNode(!0));case 11:if(attributes){RouteElement.setData(content,attributes)}return _context20.abrupt("return",this.content=content);case 13:case"end":return _context20.stop();}}},_callee20,this)}));function getContent(){return _getContent.apply(this,arguments)}return getContent}()}],[{key:"setData",value:function setData(target,data){data.forEach(function(v,k){if("."===k[0]){target[k.substr(1)]=v}else{target.setAttribute(k,v)}})}}]);return RouteElement}(babelHelpers.wrapNativeSuper(HTMLElement));///@ts-check
window.customElements.define("a-route",RouteElement);var routesRoute={RouteElement:RouteElement},OutletElement=/*#__PURE__*/function(_HTMLElement3){babelHelpers.inherits(OutletElement,_HTMLElement3);babelHelpers.createClass(OutletElement,[{key:"connectedCallback",value:function(){var _connectedCallback2=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee21(){return regeneratorRuntime.wrap(function _callee21$(_context21){while(1){switch(_context21.prev=_context21.next){case 0:if(!this.isConnected){_context21.next=7;break}if(this.created){_context21.next=5;break}this.created=!0;// var p = document.createElement('p');
// p.textContent = 'Please add your routes!';
// this.appendChild(p);
_context21.next=5;return NamedRouting.addNamedItem(this);case 5:_context21.next=7;return RouterElement.initialize();case 7:case"end":return _context21.stop();}}},_callee21,this)}));function connectedCallback(){return _connectedCallback2.apply(this,arguments)}return connectedCallback}()},{key:"disconnectedCallback",value:function disconnectedCallback(){if(this.getName()){NamedRouting.removeNamedItem(this.getName())}}}]);function OutletElement(){var _this3;babelHelpers.classCallCheck(this,OutletElement);_this3=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(OutletElement).call(this));_this3.canLeave=NamedRouting.canLeave.bind(babelHelpers.assertThisInitialized(_this3));return _this3}babelHelpers.createClass(OutletElement,[{key:"getName",value:function getName(){if(this.outletName===void 0){this.outletName=this.getAttribute("name")}return this.outletName}},{key:"_createPathSegments",value:function _createPathSegments(url){return url.replace(/(^\/+|\/+$)/g,"").split("/")}/**
     * Replaces the content of this outlet with the supplied new content
     * @fires OutletElement#onOutletUpdated
     * @param {string|DocumentFragment|Node} content - Content that will replace the current content of the outlet
     */},{key:"renderOutletContent",value:function renderOutletContent(content){this.innerHTML="";// console.info('outlet rendered: ' + this.outletName, content);
if("string"===typeof content){this.innerHTML=content}else{this.appendChild(content)}this.dispatchOuletUpdated()}/**
     * Takes in a url that contains named outlet data and renders the outlet using the information
     * @param {string} url
     * @param {Promise<boolean>} supressUrlGeneration
     */},{key:"processNamedUrl",value:function(){var _processNamedUrl2=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee22(url,supressUrlGeneration){var details,options,data,element;return regeneratorRuntime.wrap(function _callee22$(_context22){while(1){switch(_context22.prev=_context22.next){case 0:details=NamedRouting.parseNamedOutletUrl(url);options=details.options||{import:null};data=details.data||new Map;if(!1===babelHelpers.instanceof(data,Map)){data=new Map(Object.entries(data||{}))}// If same tag name then just set the data
if(!(this.children&&this.children[0]&&this.children[0].tagName.toLowerCase()==details.elementTag)){_context22.next=8;break}RouteElement.setData(this.children[0],data||{});this.dispatchOuletUpdated();return _context22.abrupt("return",this.children[0]);case 8:_context22.next=10;return NamedRouting.importCustomElement(options.import,details.elementTag);case 10:element=document.createElement(details.elementTag);RouteElement.setData(element,data||{});if(customElements.get(details.elementTag)===void 0){console.error("Custom Element not found: ".concat(details.elementTag,". Are you missing an import or mis-spelled tag name?"))}this.renderOutletContent(element);if(!supressUrlGeneration){RouterElement.updateHistory("")}return _context22.abrupt("return",element);case 16:case"end":return _context22.stop();}}},_callee22,this)}));function processNamedUrl(_x27,_x28){return _processNamedUrl2.apply(this,arguments)}return processNamedUrl}()},{key:"dispatchOuletUpdated",value:function dispatchOuletUpdated(){/**
     * Outlet updated event that fires after an Outlet replaces it's content.
     * @event OutletElement#onOutletUpdated
     * @type CustomEvent
     * @property {any} - Currently no information is passed in the event.
     */this.dispatchEvent(new CustomEvent("onOutletUpdated",{bubbles:!0,composed:!0,detail:{}}))}}]);return OutletElement}(babelHelpers.wrapNativeSuper(HTMLElement));///@ts-check
window.customElements.define("an-outlet",OutletElement);var routesOutlet={OutletElement:OutletElement},dispatchRegisterLink=function dispatchRegisterLink(link){window.dispatchEvent(new CustomEvent("routerLinksAdded",{detail:{links:[link]}}))},RouterLinkElement=/*#__PURE__*/function(_HTMLAnchorElement){babelHelpers.inherits(RouterLinkElement,_HTMLAnchorElement);babelHelpers.createClass(RouterLinkElement,[{key:"connectedCallback",/** @inheritdoc */value:function connectedCallback(){RouterElement.initialize();dispatchRegisterLink(this)}/** @inheritdoc */},{key:"attributeChangedCallback",/**
     * @inheritdoc
     * Listens for href attribute changing. If it does then it re-regesters the link.
     */value:function attributeChangedCallback(name,oldValue,newValue){if("href"===name){if(oldValue&&newValue){dispatchRegisterLink(this)}}}/** @inheritdoc */}],[{key:"observedAttributes",get:function get(){return["href"]}}]);function RouterLinkElement(){babelHelpers.classCallCheck(this,RouterLinkElement);return babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(RouterLinkElement).call(this))}return RouterLinkElement}(babelHelpers.wrapNativeSuper(HTMLAnchorElement));///@ts-check
window.customElements.define("router-link",RouterLinkElement,{extends:"a"});export{namedRouting as $namedRouting,routesOutlet as $routesOutlet,routesRoute as $routesRoute,routesRouter as $routesRouter,NamedRouting,OutletElement,RouteElement,RouterElement};