/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */!function(a){"use strict";function b(a,b,c,e){// If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
     var f=b&&b.prototype instanceof d?b:d,g=Object.create(f.prototype),h=new m(e||[]);return g._invoke=i(a,c,h),g}// Try/catch helper to minimize deoptimizations. Returns a completion
     // record like context.tryEntries[i].completion. This interface could
     // have been (and was previously) designed to take a closure to be
     // invoked without arguments, but in all the cases we care about we
     // already have an existing method we want to call, so there's no need
     // to create a new function object. We can even get away with assuming
     // the method takes exactly one argument, since that happens to be true
     // in every case, so we don't have to touch the arguments object. The
     // only additional allocation required is the completion record, which
     // has a stable shape and so hopefully should be cheap to allocate.
     function c(a,b,c){try{return{type:"normal",arg:a.call(b,c)}}catch(a){return{type:"throw",arg:a}}}// Dummy constructor functions that we use as the .constructor and
     // .constructor.prototype properties for functions that return Generator
     // objects. For full spec compliance, you may wish to configure your
     // minifier not to mangle the names of these two functions.
     function d(){}function e(){}function f(){}// This is a polyfill for %IteratorPrototype% for environments that
     // don't natively support it.
     // Helper for defining the .next, .throw, and .return methods of the
     // Iterator interface in terms of a single ._invoke method.
     function g(a){["next","throw","return"].forEach(function(b){a[b]=function(a){return this._invoke(b,a)}})}function h(a){function b(d,e,f,g){var h=c(a[d],a,e);if("throw"===h.type)g(h.arg);else{var i=h.arg,j=i.value;return j&&"object"===typeof j&&q.call(j,"__await")?Promise.resolve(j.__await).then(function(a){b("next",a,f,g)},function(a){b("throw",a,f,g)}):Promise.resolve(j).then(function(a){// When a yielded Promise is resolved, its final value becomes
     // the .value of the Promise<{value,done}> result for the
     // current iteration. If the Promise is rejected, however, the
     // result for this iteration will be rejected with the same
     // reason. Note that rejections of yielded Promises are not
     // thrown back into the generator function, as is the case
     // when an awaited Promise is rejected. This difference in
     // behavior between yield and await is important, because it
     // allows the consumer to decide what to do with the yielded
     // rejection (swallow it and continue, manually .throw it back
     // into the generator, abandon iteration, whatever). With
     // await, by contrast, there is no opportunity to examine the
     // rejection reason outside the generator function, so the
     // only option is to throw it from the await expression, and
     // let the generator function handle the exception.
     i.value=a,f(i)},g)}}function d(a,c){function d(){return new Promise(function(d,e){b(a,c,d,e)})}return e=// If enqueue has been called before, then we want to wait until
     // all previous Promises have been resolved before calling invoke,
     // so that results are always delivered in the correct order. If
     // enqueue has not been called before, then it is important to
     // call invoke immediately, without waiting on a callback to fire,
     // so that the async generator function has the opportunity to do
     // any necessary setup in a predictable way. This predictability
     // is why the Promise constructor synchronously invokes its
     // executor callback, and why async functions synchronously
     // execute code before the first await. Since we implement simple
     // async functions in terms of async generators, it is especially
     // important to get this right, even though it requires care.
     e?e.then(d,// Avoid propagating failures to Promises returned by later
     // invocations of the iterator.
     d):d()}// Define the unified helper method that is used to implement .next,
     // .throw, and .return (see defineIteratorMethods).
     var e;this._invoke=d}function i(a,b,d){var e="suspendedStart";return function(f,g){if(e==="executing")throw new Error("Generator is already running");if("completed"===e){if("throw"===f)throw g;// Be forgiving, per 25.3.3.3.3 of the spec:
     // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
     return o()}for(d.method=f,d.arg=g;;){var h=d.delegate;if(h){var i=j(h,d);if(i){if(i===x)continue;return i}}if("next"===d.method)// Setting context._sent for legacy support of Babel's
     // function.sent implementation.
     d.sent=d._sent=d.arg;else if("throw"===d.method){if("suspendedStart"===e)throw e="completed",d.arg;d.dispatchException(d.arg)}else"return"===d.method&&d.abrupt("return",d.arg);e="executing";var k=c(a,b,d);if("normal"===k.type){if(e=d.done?"completed":"suspendedYield",k.arg===x)continue;return{value:k.arg,done:d.done}}"throw"===k.type&&(// Dispatch the exception by looping back around to the
     // context.dispatchException(context.arg) call above.
     e="completed",d.method="throw",d.arg=k.arg)}}}// Call delegate.iterator[context.method](context.arg) and handle the
     // result, either by returning a { value, done } result from the
     // delegate iterator, or by modifying context.method and context.arg,
     // setting context.delegate to null, and returning the ContinueSentinel.
     function j(a,b){var d=a.iterator[b.method];if(void 0===d){if(b.delegate=null,"throw"===b.method){if(a.iterator.return&&(b.method="return",b.arg=void 0,j(a,b),"throw"===b.method))// If maybeInvokeDelegate(context) changed context.method from
     // "return" to "throw", let that override the TypeError below.
     return x;b.method="throw",b.arg=new TypeError("The iterator does not provide a 'throw' method")}return x}var e=c(d,a.iterator,b.arg);if("throw"===e.type)return b.method="throw",b.arg=e.arg,b.delegate=null,x;var f=e.arg;if(!f)return b.method="throw",b.arg=new TypeError("iterator result is not an object"),b.delegate=null,x;if(f.done)b[a.resultName]=f.value,b.next=a.nextLoc,"return"!==b.method&&(b.method="next",b.arg=void 0);else// Re-yield the result returned by the delegate method.
     return f;// The delegate iterator is finished, so forget it and continue with
     // the outer generator.
     return b.delegate=null,x}// Define Generator.prototype.{next,throw,return} in terms of the
     // unified ._invoke helper method.
     function k(a){var b={tryLoc:a[0]};1 in a&&(b.catchLoc=a[1]),2 in a&&(b.finallyLoc=a[2],b.afterLoc=a[3]),this.tryEntries.push(b)}function l(a){var b=a.completion||{};b.type="normal",delete b.arg,a.completion=b}function m(a){// The root entry object (effectively a try statement without a catch
     // or a finally block) gives us a place to store values thrown from
     // locations where there is no enclosing try statement.
     this.tryEntries=[{tryLoc:"root"}],a.forEach(k,this),this.reset(!0)}function n(a){if(a){var b=a[s];if(b)return b.call(a);if("function"===typeof a.next)return a;if(!isNaN(a.length)){var c=-1,d=function b(){for(;++c<a.length;)if(q.call(a,c))return b.value=a[c],b.done=!1,b;return b.value=void 0,b.done=!0,b};return d.next=d}}// Return an iterator with no values.
     return{next:o}}function o(){return{value:void 0,done:!0}}var p=Object.prototype,q=p.hasOwnProperty,r="function"===typeof Symbol?Symbol:{},s=r.iterator||"@@iterator",t=r.asyncIterator||"@@asyncIterator",u=r.toStringTag||"@@toStringTag",v="object"===typeof module,w=a.regeneratorRuntime;if(w)// Don't bother evaluating the rest of this file if the runtime was
     // already defined globally.
     return void(v&&(module.exports=w));// Define the runtime globally (as expected by generated code) as either
     // module.exports (if we're in a module) or a new, empty object.
     w=a.regeneratorRuntime=v?module.exports:{},w.wrap=b;var x={},y={};y[s]=function(){return this};var z=Object.getPrototypeOf,A=z&&z(z(n([])));A&&A!==p&&q.call(A,s)&&(y=A);var B=f.prototype=d.prototype=Object.create(y);// Within the body of any async function, `await x` is transformed to
     // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
     // `hasOwn.call(value, "__await")` to determine if the yielded value is
     // meant to be awaited.
     // Note that simple async functions are implemented on top of
     // AsyncIterator objects; they just return a Promise for the value of
     // the final result produced by the iterator.
     // A Generator should always return itself as the iterator object when the
     // @@iterator function is called on it. Some browsers' implementations of the
     // iterator prototype chain incorrectly implement this, causing the Generator
     // object to not be returned from this call. This ensures that doesn't happen.
     // See https://github.com/facebook/regenerator/issues/274 for more details.
     e.prototype=B.constructor=f,f.constructor=e,f[u]=e.displayName="GeneratorFunction",w.isGeneratorFunction=function(a){var b="function"===typeof a&&a.constructor;return!!b&&(b===e||// For the native GeneratorFunction constructor, the best we can
     // do is to check its .name property.
     "GeneratorFunction"===(b.displayName||b.name))},w.mark=function(a){return Object.setPrototypeOf?Object.setPrototypeOf(a,f):(a.__proto__=f,!(u in a)&&(a[u]="GeneratorFunction")),a.prototype=Object.create(B),a},w.awrap=function(a){return{__await:a}},g(h.prototype),h.prototype[t]=function(){return this},w.AsyncIterator=h,w.async=function(a,c,d,e){var f=new h(b(a,c,d,e));return w.isGeneratorFunction(c)?f// If outerFn is a generator, return the full iterator.
     :f.next().then(function(a){return a.done?a.value:f.next()})},g(B),B[u]="Generator",B[s]=function(){return this},B.toString=function(){return"[object Generator]"},w.keys=function(a){var b=[];for(var c in a)b.push(c);// Rather than returning an object with a next method, we keep
     // things simple and return the next function itself.
     return b.reverse(),function c(){for(;b.length;){var d=b.pop();if(d in a)return c.value=d,c.done=!1,c}// To avoid creating an additional object, we just hang the .value
     // and .done properties off the next function object itself. This
     // also ensures that the minifier will not anonymize the function.
     return c.done=!0,c}},w.values=n,m.prototype={constructor:m,reset:function(a){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(l),!a)for(var b in this)// Not sure about the optimal order of these conditions:
     "t"===b.charAt(0)&&q.call(this,b)&&!isNaN(+b.slice(1))&&(this[b]=void 0)},stop:function(){this.done=!0;var a=this.tryEntries[0],b=a.completion;if("throw"===b.type)throw b.arg;return this.rval},dispatchException:function(a){function b(b,d){return f.type="throw",f.arg=a,c.next=b,d&&(c.method="next",c.arg=void 0),!!d}if(this.done)throw a;for(var c=this,d=this.tryEntries.length-1;0<=d;--d){var e=this.tryEntries[d],f=e.completion;if("root"===e.tryLoc)// Exception thrown outside of any try block that could handle
     // it, so set the completion value of the entire function to
     // throw the exception.
     return b("end");if(e.tryLoc<=this.prev){var g=q.call(e,"catchLoc"),h=q.call(e,"finallyLoc");if(g&&h){if(this.prev<e.catchLoc)return b(e.catchLoc,!0);if(this.prev<e.finallyLoc)return b(e.finallyLoc)}else if(g){if(this.prev<e.catchLoc)return b(e.catchLoc,!0);}else if(!h)throw new Error("try statement without catch or finally");else if(this.prev<e.finallyLoc)return b(e.finallyLoc)}}},abrupt:function(a,b){for(var c,d=this.tryEntries.length-1;0<=d;--d)if(c=this.tryEntries[d],c.tryLoc<=this.prev&&q.call(c,"finallyLoc")&&this.prev<c.finallyLoc){var e=c;break}e&&("break"===a||"continue"===a)&&e.tryLoc<=b&&b<=e.finallyLoc&&(e=null);var f=e?e.completion:{};return f.type=a,f.arg=b,e?(this.method="next",this.next=e.finallyLoc,x):this.complete(f)},complete:function(a,b){if("throw"===a.type)throw a.arg;return"break"===a.type||"continue"===a.type?this.next=a.arg:"return"===a.type?(this.rval=this.arg=a.arg,this.method="return",this.next="end"):"normal"===a.type&&b&&(this.next=b),x},finish:function(a){for(var b,c=this.tryEntries.length-1;0<=c;--c)if(b=this.tryEntries[c],b.finallyLoc===a)return this.complete(b.completion,b.afterLoc),l(b),x},catch:function(a){for(var b,c=this.tryEntries.length-1;0<=c;--c)if(b=this.tryEntries[c],b.tryLoc===a){var d=b.completion;if("throw"===d.type){var e=d.arg;l(b)}return e}// The context.catch method must only be called with a location
     // argument that corresponds to a known catch block.
     throw new Error("illegal catch attempt")},delegateYield:function(a,b,c){return this.delegate={iterator:n(a),resultName:b,nextLoc:c},"next"===this.method&&(this.arg=void 0),x}}}(// In sloppy mode, unbound `this` refers to the global object, fallback to
     // Function constructor if we're in global strict mode. That is sadly a form
     // of indirect eval which violates Content Security Policy.
     function(){return this}()||Function("return this")());(function(a){function b(a){return r.typeof="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?b=function(a){return typeof a}:b=function(a){return a&&"function"===typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},b(a)}function c(a){function b(d,e){try{var f=a[d](e),g=f.value,h=g instanceof r.AwaitValue;Promise.resolve(h?g.wrapped:g).then(function(a){return h?void b("next",a):void c(f.done?"return":"normal",a)},function(a){b("throw",a)})}catch(a){c("throw",a)}}function c(a,c){switch(a){case"return":d.resolve({value:c,done:!0});break;case"throw":d.reject(c);break;default:d.resolve({value:c,done:!1});}d=d.next,d?b(d.key,d.arg):e=null}var d,e;this._invoke=function(a,c){return new Promise(function(f,g){var h={key:a,arg:c,resolve:f,reject:g,next:null};e?e=e.next=h:(d=e=h,b(a,c))})},"function"!==typeof a.return&&(this.return=void 0)}function d(a,b,c,d,e,f,g){try{var h=a[f](g),i=h.value}catch(a){return void c(a)}h.done?b(i):Promise.resolve(i).then(d,e)}function e(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function f(a,b){for(var c in b){var d=b[c];d.configurable=d.enumerable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,c,d)}if(Object.getOwnPropertySymbols)for(var e=Object.getOwnPropertySymbols(b),f=0;f<e.length;f++){var g=e[f],d=b[g];d.configurable=d.enumerable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,g,d)}return a}function g(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function h(){return r.extends=h=Object.assign||function(a){for(var b,c=1;c<arguments.length;c++)for(var d in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d]);return a},h.apply(this,arguments)}function i(a){return r.getPrototypeOf=i=Object.setPrototypeOf?Object.getPrototypeOf:function(a){return a.__proto__||Object.getPrototypeOf(a)},i(a)}function j(a,b){return r.setPrototypeOf=j=Object.setPrototypeOf||function(a,b){return a.__proto__=b,a},j(a,b)}function k(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(a){return!1}}function l(){return r.construct=k()?l=Reflect.construct:l=function(b,c,d){var e=[null];e.push.apply(e,c);var a=Function.bind.apply(b,e),f=new a;return d&&r.setPrototypeOf(f,d.prototype),f},l.apply(null,arguments)}function m(a){var b="function"===typeof Map?new Map:void 0;return r.wrapNativeSuper=m=function(a){function c(){return r.construct(a,arguments,r.getPrototypeOf(this).constructor)}if(null===a||!r.isNativeFunction(a))return a;if("function"!==typeof a)throw new TypeError("Super expression must either be null or a function");if("undefined"!==typeof b){if(b.has(a))return b.get(a);b.set(a,c)}return c.prototype=Object.create(a.prototype,{constructor:{value:c,enumerable:!1,writable:!0,configurable:!0}}),r.setPrototypeOf(c,a)},m(a)}function n(a,b,c){return r.get="undefined"!==typeof Reflect&&Reflect.get?n=Reflect.get:n=function(a,b,c){var d=r.superPropBase(a,b);if(d){var e=Object.getOwnPropertyDescriptor(d,b);return e.get?e.get.call(c):e.value}},n(a,b,c||a)}function o(a,b,c,d){return o="undefined"!==typeof Reflect&&Reflect.set?Reflect.set:function(a,b,c,d){var e,f=r.superPropBase(a,b);if(f){if(e=Object.getOwnPropertyDescriptor(f,b),e.set)return e.set.call(d,c),!0;if(!e.writable)return!1}if(e=Object.getOwnPropertyDescriptor(d,b),e){if(!e.writable)return!1;e.value=c,Object.defineProperty(d,b,e)}else r.defineProperty(d,b,c);return!0},o(a,b,c,d)}function p(a,b,c,d,e){var f=o(a,b,c,d||a);if(!f&&e)throw new Error("failed to set property");return c}function q(a){if(Symbol.iterator in Object(a)||"[object Arguments]"===Object.prototype.toString.call(a))return Array.from(a)}var r=a.babelHelpers={};r.typeof=b,r.asyncIterator=function(a){var b;if("function"===typeof Symbol){if(Symbol.asyncIterator&&(b=a[Symbol.asyncIterator],null!=b))return b.call(a);if(Symbol.iterator&&(b=a[Symbol.iterator],null!=b))return b.call(a)}throw new TypeError("Object is not async iterable")},r.AwaitValue=function(a){this.wrapped=a},"function"===typeof Symbol&&Symbol.asyncIterator&&(c.prototype[Symbol.asyncIterator]=function(){return this}),c.prototype.next=function(a){return this._invoke("next",a)},c.prototype.throw=function(a){return this._invoke("throw",a)},c.prototype.return=function(a){return this._invoke("return",a)},r.AsyncGenerator=c,r.wrapAsyncGenerator=function(a){return function(){return new r.AsyncGenerator(a.apply(this,arguments))}},r.awaitAsyncGenerator=function(a){return new r.AwaitValue(a)},r.asyncGeneratorDelegate=function(a,b){function c(c,d){return e=!0,d=new Promise(function(b){b(a[c](d))}),{done:!1,value:b(d)}}var d={},e=!1;return"function"===typeof Symbol&&Symbol.iterator&&(d[Symbol.iterator]=function(){return this}),d.next=function(a){return e?(e=!1,a):c("next",a)},"function"===typeof a.throw&&(d.throw=function(a){if(e)throw e=!1,a;return c("throw",a)}),"function"===typeof a.return&&(d.return=function(a){return c("return",a)}),d},r.asyncToGenerator=function(a){return function(){var b=this,c=arguments;return new Promise(function(e,f){function g(a){d(i,e,f,g,h,"next",a)}function h(a){d(i,e,f,g,h,"throw",a)}var i=a.apply(b,c);g(void 0)})}},r.classCallCheck=function(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")},r.createClass=function(a,b,c){return b&&e(a.prototype,b),c&&e(a,c),a},r.defineEnumerableProperties=f,r.defaults=function(a,b){for(var c=Object.getOwnPropertyNames(b),d=0;d<c.length;d++){var e=c[d],f=Object.getOwnPropertyDescriptor(b,e);f&&f.configurable&&a[e]===void 0&&Object.defineProperty(a,e,f)}return a},r.defineProperty=g,r.extends=h,r.objectSpread=function(a){for(var b=1;b<arguments.length;b++){var c=null==arguments[b]?{}:arguments[b],d=Object.keys(c);"function"===typeof Object.getOwnPropertySymbols&&(d=d.concat(Object.getOwnPropertySymbols(c).filter(function(a){return Object.getOwnPropertyDescriptor(c,a).enumerable}))),d.forEach(function(b){r.defineProperty(a,b,c[b])})}return a},r.inherits=function(a,b){if("function"!==typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function");a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),b&&r.setPrototypeOf(a,b)},r.getPrototypeOf=i,r.setPrototypeOf=j,r.construct=l,r.isNativeFunction=function(a){return-1!==Function.toString.call(a).indexOf("[native code]")},r.wrapNativeSuper=m,r.instanceof=function(a,b){return null!=b&&"undefined"!==typeof Symbol&&b[Symbol.hasInstance]?b[Symbol.hasInstance](a):a instanceof b},r.interopRequireDefault=function(a){return a&&a.__esModule?a:{default:a}},r.interopRequireWildcard=function(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)if(Object.prototype.hasOwnProperty.call(a,c)){var d=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(a,c):{};d.get||d.set?Object.defineProperty(b,c,d):b[c]=a[c]}return b.default=a,b},r.newArrowCheck=function(a,b){if(a!==b)throw new TypeError("Cannot instantiate an arrow function")},r.objectDestructuringEmpty=function(a){if(null==a)throw new TypeError("Cannot destructure undefined")},r.objectWithoutPropertiesLoose=function(a,b){if(null==a)return{};var c,d,e={},f=Object.keys(a);for(d=0;d<f.length;d++)c=f[d],0<=b.indexOf(c)||(e[c]=a[c]);return e},r.objectWithoutProperties=function(a,b){if(null==a)return{};var c,d,e=r.objectWithoutPropertiesLoose(a,b);if(Object.getOwnPropertySymbols){var f=Object.getOwnPropertySymbols(a);for(d=0;d<f.length;d++)c=f[d],!(0<=b.indexOf(c))&&Object.prototype.propertyIsEnumerable.call(a,c)&&(e[c]=a[c])}return e},r.assertThisInitialized=function(a){if(void 0===a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a},r.possibleConstructorReturn=function(a,b){return b&&("object"===typeof b||"function"===typeof b)?b:r.assertThisInitialized(a)},r.superPropBase=function(a,b){for(;!Object.prototype.hasOwnProperty.call(a,b)&&(a=r.getPrototypeOf(a),null!==a););return a},r.get=n,r.set=p,r.taggedTemplateLiteral=function(a,b){return b||(b=a.slice(0)),Object.freeze(Object.defineProperties(a,{raw:{value:Object.freeze(b)}}))},r.temporalRef=function(a,b){if(a===r.temporalUndefined)throw new ReferenceError(b+" is not defined - temporal dead zone");else return a},r.readOnlyError=function(a){throw new Error("\""+a+"\" is read-only")},r.temporalUndefined={},r.slicedToArray=function(a,b){return r.arrayWithHoles(a)||r.iterableToArrayLimit(a,b)||r.nonIterableRest()},r.toArray=function(a){return r.arrayWithHoles(a)||r.iterableToArray(a)||r.nonIterableRest()},r.toConsumableArray=function(a){return r.arrayWithoutHoles(a)||r.iterableToArray(a)||r.nonIterableSpread()},r.arrayWithoutHoles=function(a){if(Array.isArray(a)){for(var b=0,c=Array(a.length);b<a.length;b++)c[b]=a[b];return c}},r.arrayWithHoles=function(a){if(Array.isArray(a))return a},r.iterableToArray=q,r.iterableToArrayLimit=function(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{d||null==h["return"]||h["return"]()}finally{if(e)throw f}}return c},r.nonIterableSpread=function(){throw new TypeError("Invalid attempt to spread non-iterable instance")},r.nonIterableRest=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")},r.toPropertyKey=function(a){var b=r.toPrimitive(a,"string");return"symbol"===typeof b?b:b+""}})("undefined"===typeof global?self:global);///@ts-check
/**
  * @typedef ParseNamedOutletAsignment
  * @property {string} elementTag
  * @property {Map} data
  * @property {Object} options
  * @property {string} options.import
  */ /**
       * @typedef {Object} NamedMatch
       * @property {name} name of the route or outlet to assign to
       * @property {string} url - The assignment url
       * @property {string} urlEscaped - The assignment url escaped
       * @property {boolean} cancelled - If a failed attempt at assignment was made
       * @property {ParseNamedOutletAsignment} namedOutlet - Any named outlet assignments found
       */ /** 
           * Regestry for named routers and outlets. 
           * Simplifies nested routing by being able to target specific routers and outlets in a link. 
           * Can act as a message bus of sorts. Named items being the handlers and assignments as the messages.
           */var NamedRouting=/*#__PURE__*/function(){function NamedRouting(){babelHelpers.classCallCheck(this,NamedRouting)}babelHelpers.createClass(NamedRouting,null,[{key:"addNamedItem",/**Adds a router or outlet to the registry */value:function addNamedItem(name,item){if(item===void 0){item=name;name=""}if(!name){name=item.getName()}if(name){if(NamedRouting.registry[name]){throw"Error adding named item ".concat(name,", item with that name already registered")}NamedRouting.registry[name]=item;var assignment=NamedRouting.getAssignment(name);if(assignment&&item.canLeave(assignment.url)){item.processNamedUrl(assignment.url)}}}/**Removes an item by name from the registry if it exists. */},{key:"removeNamedItem",value:function removeNamedItem(name){if(NamedRouting.registry[name]){delete NamedRouting.registry[name]}}/**Gets an item by name from the registry */},{key:"getNamedItem",value:function getNamedItem(name){return NamedRouting.registry[name]}/**Retrieves and removes an assignment from the registry */},{key:"consumeAssignement",value:function consumeAssignement(name){var assignment=NamedRouting.getAssignment(name);if(assignment){NamedRouting.removeAssignment(name)}return assignment}/**Gets an assignment from the registry */},{key:"getAssignment",value:function getAssignment(name){return NamedRouting.assignments[name]}/**Add an assignment to the registry. Will override an assignement if one already exists with the same name. */},{key:"addAssignment",value:function addAssignment(name,url){var lastAssignment=NamedRouting.assignments[name];NamedRouting.assignments[name]={name:name,url:url};var namedItem=NamedRouting.getNamedItem(name);if(namedItem){if(!1===namedItem.canLeave(url)){NamedRouting.assignments[name]=lastAssignment;return!1}namedItem.processNamedUrl(url)}}/**Removes an assignment from the registry */},{key:"removeAssignment",value:function removeAssignment(name){if(NamedRouting.assignments[name]){delete NamedRouting.assignments[name];return!0}return!1}/**Serializes the current assignements for URL. */},{key:"generateNamedItemsUrl",value:function generateNamedItemsUrl(){var url="",assignments=NamedRouting.assignments;for(var itemName in assignments){if(url.length){url+="::"}url+=NamedRouting.generateUrlFragment(assignments[itemName])}return url}/**Serializes an assignment for URL. */},{key:"generateUrlFragment",value:function generateUrlFragment(assignment){// Polymer server does not like the period in the import statement
return"(".concat(assignment.name,":").concat(assignment.url.replace(/\./g,"_dot_"),")")}/**
     * Parses a URL section and tries to get a named item from it.
     * @param {string} url
     * @param {boolean} [supressAdding]
     * @returns {object} null if not able to parse
     */},{key:"parseNamedItem",value:function parseNamedItem(url,supressAdding){if("/"===url[0]){url=url.substr(1)}if("("===url[0]){url=url.substr(1,url.length-2)}var match=url.match(/^\/?\(?([\w_-]+)\:(.*)\)?/);if(match){// Polymer server does not like the period in the import statement
var urlEscaped=match[2].replace(/_dot_/g,"."),routeCancelled=!1;if(!0!==supressAdding){if(!1===NamedRouting.addAssignment(match[1],urlEscaped)){routeCancelled=!0}}return{name:match[1],url:match[2],urlEscaped:urlEscaped,cancelled:routeCancelled,namedOutlet:NamedRouting.parseNamedOutletUrl(match[2])}}return null}/**
     * Takes a url for a named outlet assignment and parses
     * @param {string} url
     * @returns {ParseNamedOutletAsignment|null} null is returned if the url could not be parsed into a named outlet assignment
     */},{key:"parseNamedOutletUrl",value:function parseNamedOutletUrl(url){var match=url.match(/^([/\w-]+)(\(.*?\))?(?:\:(.+))?/);if(match){var data=new Map;if(match[3]){for(var keyValues=match[3].split("&"),i=0,iLen=keyValues.length,keyValue;i<iLen;i++){keyValue=keyValues[i].split("=");data.set(decodeURIComponent(keyValue[0]),decodeURIComponent(keyValue[1]))}}var elementTag=match[1],importPath=match[2]&&match[2].substr(1,match[2].length-2),inferredElementTag=NamedRouting.inferCustomElementTagName(elementTag);if(!importPath){importPath=NamedRouting.inferCustomElementImportPath(elementTag,inferredElementTag)}var options={import:importPath};return{elementTag:inferredElementTag,data:data,options:options}}return null}/**
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
inferredTagName=inferredTagName.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();return inferredTagName}/**
     * Prefetches an import module so that it is available when the link is activated
     * @param {NamedMatch} namedAssignment item assignment
     */},{key:"prefetchNamedOutletImports",value:function prefetchNamedOutletImports(namedAssignment){if(namedAssignment.namedOutlet&&namedAssignment.namedOutlet.options&&namedAssignment.namedOutlet.options.import){NamedRouting.pageReady().then(function(){return NamedRouting.importCustomElement(namedAssignment.namedOutlet.options.import,namedAssignment.namedOutlet.elementTag)})}}/**
     * Imports a script for a customer element once the page has loaded
     * @param {string} importSrc 
     * @param {string} tagName 
     */},{key:"prefetchImport",value:function prefetchImport(importSrc,tagName){NamedRouting.pageReady().then(function(){return NamedRouting.importCustomElement(importSrc,tagName)})}/**
     * Imports a script for a customer element
     * @param {string} importSrc 
     * @param {string} tagName 
     */},{key:"importCustomElement",value:function(){var _importCustomElement=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee(importSrc,tagName){return regeneratorRuntime.wrap(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:if(!(importSrc&&customElements.get(tagName)===void 0)){_context.next=3;break}_context.next=3;return import(importSrc);case 3:case"end":return _context.stop();}}},_callee)}));function importCustomElement(_x,_x2){return _importCustomElement.apply(this,arguments)}return importCustomElement}()/**
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
this.dispatchEvent(canLeaveEvent);return!canLeaveEvent.defaultPrevented}}]);return NamedRouting}();NamedRouting.pageReadyPromise=void 0;NamedRouting.registry={};NamedRouting.assignments={};var namedRouting={NamedRouting:NamedRouting},RouterElement=/*#__PURE__*/function(_HTMLElement){babelHelpers.inherits(RouterElement,_HTMLElement);babelHelpers.createClass(RouterElement,[{key:"disconnectedCallback",value:function disconnectedCallback(){RouterElement.removeRouter.call(this._parentRouter,this);// this.removeEventListener('onRouterAdded', this.handlerAddRouter, false);
if(this.getName()){NamedRouting.removeNamedItem(this.getName())}}},{key:"connectedCallback",value:function connectedCallback(){if(!this.created){this.created=!0;// IE workaround for the lack of document.baseURI property
var baseURI=document.baseURI;if(baseURI===void 0){var baseTags=document.getElementsByTagName("base");baseURI=baseTags.length?baseTags[0].href:document.URL;// @ts-ignore
document.baseURI=baseURI}this._routers=[];RouterElement.initialize()}if(this.isConnected){/**
       * Internal event used to plumb together the routers. Do not interfer with.
       * @event RouterElement#onRouterAdded
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */var routerAddedEvent=new CustomEvent("onRouterAdded",{bubbles:!0,cancelable:!0,composed:!0,detail:{router:this}});this.dispatchEvent(routerAddedEvent);this._parentRouter=routerAddedEvent.detail.parentRouter;this.addEventListener("onRouterAdded",this.handlerAddRouter=RouterElement.handlerAddRouter.bind(this),!1);NamedRouting.addNamedItem(this)}}}],[{key:"handlerAddRouter",/** 
   * Event handler for handling when child router is added.
   * This function is called in the scope of RouterElement for the top level collection of routers and instacnes of RotuerElement for nested router collections.
   * Used to link up RouterElements with child RouterElements even through Shadow DOM.
   * @param {CustomEvent} event - routerAdded event
   */value:function handlerAddRouter(event){RouterElement.addRouter.call(this,event.detail.router);event.stopPropagation();event.detail.parentRouter=this}},{key:"handlerRouterLinksAdded",value:function handlerRouterLinksAdded(event){if(event.detail.links){RouterElement.registerLinks(event.detail.links)}}},{key:"handlerNavigate",value:function handlerNavigate(event){if(event.detail.href){RouterElement.navigate(event.detail.href)}}/** 
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
   */},{key:"changeUrl",value:function changeUrl(){var hash=RouterElement._getHash(),path=decodeURIComponent(window.location.pathname),query=window.location.search.substring(1),oldRoute=RouterElement._route;if(!RouterElement._initialized){return!1}if(oldRoute.path===path&&oldRoute.query===query&&oldRoute.hash===hash){// Nothing to do, the current URL is a representation of our properties.
return!1}var newUrl=RouterElement._getUrl(window.location);RouterElement.dispatch(newUrl,!0)}/**
     * Global handler for page clicks. Filters out and handles clicks from links.
     * @param {(MouseEvent|HTMLAnchorElement|string)} navigationSource - The source of the new url to navigate to. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
     */},{key:"navigate",value:function navigate(navigationSource){var event=null,anchor=null;if(babelHelpers.instanceof(navigationSource,Event)){event=navigationSource;// If already handled and canceled
if(event.defaultPrevented){return}}else if("string"!==typeof navigationSource){anchor=navigationSource}var href=RouterElement._getSameOriginLinkHref(navigationSource);if(null===href){return}if(!href){var target=event&&event.target||anchor;if(target){/**
         * Event that fires if a link is not handled due to it not being same origin or base url.
         * @event RouterElement#onRouteCancelled
         * @type CustomEvent
         * @property {Object} details - The event details
         * @property {RouteElement} details.url - The url that was trying to be matched.
         */target.dispatchEvent(new CustomEvent("onRouteNotHandled",{bubbles:!0,composed:!0,detail:{href:href}}))}return}event&&event.preventDefault();// If the navigation is to the current page we shouldn't add a history
// entry or fire a change event.
if(href===window.location.href){return}var url=new URL(href),newUrl=RouterElement._getUrl(url);RouterElement.dispatch(newUrl)}/**
     * Common entry point that starts the routing process.
     * @param {string} url
     * @param {boolean} [skipHistory]
     * @fires RouterElement#onRouteCancelled
     */},{key:"dispatch",value:function dispatch(url,skipHistory){var basePath=RouterElement.baseUrlSansHost(),shortUrl=url.substr(basePath.length);RouterElement._route={url:shortUrl// Check if all current routes wil let us navigate away
};if(RouterElement._activeRouters.length&&!1===RouterElement._activeRouters.every(function(r){return r.route.canLeave(RouterElement._route)})){/**
       * Event that fires if a RouteElement refuses to let us perform routing.
       * @event RouterElement#onRouteCancelled
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */RouterElement._activeRouters[0].router.dispatchEvent(new CustomEvent("onRouteCancelled",{bubbles:!0,composed:!0,detail:{shortUrl:shortUrl}}));return}RouterElement._activeRouters=[];if(RouterElement.performMatchOnRouters(shortUrl,RouterElement._routers)&&!0!==skipHistory){RouterElement.updateHistory(url)}}/** Updates the location history with the new href */},{key:"updateHistory",value:function updateHistory(href){var urlState=RouterElement.getUrlState(),url=urlState;if(2===url.length){url=href}else{url=document.baseURI+url}// Need to use a full URL in case the containing page has a base URI.
var fullNewUrl=new URL(url,window.location.protocol+"//"+window.location.host).href,oldRoute=RouterElement._route,now=window.performance.now(),shouldReplace=oldRoute._lastChangedAt+RouterElement._dwellTime>now;oldRoute._lastChangedAt=now;if(shouldReplace){window.history.replaceState({},"",fullNewUrl)}else{window.history.pushState({},"",fullNewUrl)}RouterElement.updateAnchorsStatus(urlState)}/** Sets the active status of any registered links based on the current URL */},{key:"updateAnchorsStatus",value:function updateAnchorsStatus(url){url=url||RouterElement.getUrlState();// Tidy up any unconnected anchors
for(var currentAnchors=RouterElement._anchors,nextAnchors=[],i=0,iLen=currentAnchors.length;i<iLen;i++){if(!0===currentAnchors[i].a.isConnected){var link=currentAnchors[i];nextAnchors[nextAnchors.length]=link;link.a.classList.remove(link.a.activeClassName||"active")}}var urlFragments=url.split("::");nextUrlFragment:for(var j=0,jLen=urlFragments.length;j<jLen;j++){var urlFragment=urlFragments[j],urlFragNamedItemMatch=NamedRouting.parseNamedItem(urlFragment,!0);nextLink:for(var _i=0,_iLen=nextAnchors.length,_link;_i<_iLen;_i++){_link=nextAnchors[_i];if(_link&&_link.a.classList.contains(_link.a.activeClassName||"active")){continue nextLink}if(_link){if(_link.routerMatches){var named=_link.routerMatches.named,routes=_link.routerMatches.routes;if(urlFragNamedItemMatch){for(var k=0,kLen=named.length;k<kLen;k++){if(named[k].name==urlFragNamedItemMatch.name){// TODO strip import out of both before compare
if(named[k].url==urlFragNamedItemMatch.urlEscaped){// full match on named item
_link.a.classList.add(_link.a.activeClassName||"active");_link=null;continue nextLink}else//Check if it's a mtch upto data portion of url
if(0===urlFragNamedItemMatch.urlEscaped.indexOf(named[k].url)){// full match on named item
_link.a.classList.add(_link.a.activeClassName||"active");_link=null;continue nextLink}}}}for(var _k=0,_kLen=routes.length;_k<_kLen;_k++){if(urlFragment==routes[_k]){// full match on route
_link.a.classList.add(_link.a.activeClassName||"active");_link=null;continue nextLink}else if(0===routes[_k].indexOf(urlFragment)){// partial match on route
_link.a.classList.add(_link.a.activeClassName||"active");_link=null;continue nextLink}}}}}}/**
       * Event that fires when HTMLAnchorElement active statuses are being updated as part of a routing.
       * @event RouterElement#onRouteCancelled
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.url - The url that was trying to be matched.
       */window.dispatchEvent(new CustomEvent("onLinkActiveStatusUpdated",{bubbles:!0,composed:!0,detail:{links:nextAnchors}}));return null}/** Gets the current URL state based on currently active routers and outlets. */},{key:"getUrlState",value:function getUrlState(){var url=NamedRouting.generateNamedItemsUrl();if(RouterElement._routers){for(var i=0,iLen=RouterElement._routers.length,nextFrag;i<iLen;i++){nextFrag=RouterElement._routers[i].generateUrlFragment();if(nextFrag){if(url.length){url+="::"}url+=nextFrag}}}return url}/**
     * Iterates over each child RouterElement and calls it to match it portion of the current URL.
     * @param {string} url - While URL. Will be parsed for individual router URLs.
     * @param {RouterElement[]} routers
     */},{key:"performMatchOnRouters",value:function performMatchOnRouters(url,routers){// TODO query string data should be placed on RouterElement so it's accessible across all outlets. It's regarded as shared data across the routers.
// TODO Maybe have a way to regiser for changes to query string so routes can react
// TODO auxilary routers - start unit testing
if("("===url[0]){url=url.substr(1,url.length-2)}for(var urls=RouterElement.splitUrlIntoRouters(url),urlsWithoutNamedOutlets=[],_i2=0,iLen=urls.length,match;_i2<iLen;_i2++){match=NamedRouting.parseNamedItem(urls[_i2]);if(match&&match.cancelled){return!1}if(!match){urlsWithoutNamedOutlets.push(urls[_i2])}}for(var i=0,_iLen2=routers.length,router;i<_iLen2;i++){router=routers[i];if(urlsWithoutNamedOutlets[i]){router.performMatchOnRouter(urlsWithoutNamedOutlets[i]||"")}}return!0}},{key:"splitUrlIntoRouters",value:function splitUrlIntoRouters(url){for(var urls=[],skip=0,i=0,lastI=i,iLen=url.length,char;i<iLen;i++){char=url[i];if("("===char){skip++}else if(")"===char){skip--}else if(":"===char&&":"===url[i+1]&&0===skip){urls.push(url.substring(lastI+(":"===url[lastI]?1:0),i));i++;lastI=i}}if("("===url[lastI]||")"===url[lastI]||":"===url[lastI]){lastI++}if(i>lastI){urls.push(url.substr(lastI))}for(var j=0,jLen=urls.length;j<jLen;j++){if("/"===urls[j][0]){urls[j]=urls[j].substr(1)}if("("===urls[j][0]&&")"===urls[j][urls[j].length-1]){urls[j]=urls[j].substr(1,urls[j].length-2)}}return urls}},{key:"registerLinks",value:function registerLinks(links,activeClassName){// Tidy up any unconnected anchors
for(var currentAnchors=RouterElement._anchors,nextAnchors=[],i=0,iLen=currentAnchors.length;i<iLen;i++){if(!0===currentAnchors[i].a.isConnected){nextAnchors[nextAnchors.length]=currentAnchors[i]}}// Add the new anchors
for(var _i3=0,_iLen3=links.length;_i3<_iLen3;_i3++){if(links[_i3].href){var matches=RouterElement.sanitizeLinkHref(links[_i3]);if(matches){nextAnchors[nextAnchors.length]={a:links[_i3],activeClassName:activeClassName,routerMatches:matches};for(var j=0,jLen=matches.named.length;j<jLen;j++){NamedRouting.prefetchNamedOutletImports(matches.named[j])}}}}// Do this after pushing history location state
RouterElement._anchors=nextAnchors;RouterElement.updateAnchorsStatus()}/**
     * @typedef {Object} AssignmentMatches
     * @property {string[]} routes - Assignments of type router
     * @property {import('./named-routing').NamedMatch[]} named - Assignments of type namedItems
     */ /**
         * 
         * @param {(MouseEvent|HTMLAnchorElement|string)} hrefSource - The source of the new url to handle. Can be a click event from clicking a link OR an anchor element OR a string that is the url to navigate to.
         * @returns {AssignmentMatches} assignmentMatches
         * 
         */},{key:"sanitizeLinkHref",value:function sanitizeLinkHref(hrefSource){var href=RouterElement._getSameOriginLinkHref(hrefSource),url=new URL(href),hash=RouterElement._getHash(),path=decodeURIComponent(url.pathname),query=url.search.substring(1),basePathLength=RouterElement.baseUrlSansHost().length,urlStr=path.substr(basePathLength);if("("===urlStr[0]){urlStr=urlStr.substr(1,urlStr.length-2)}for(var urls=RouterElement.splitUrlIntoRouters(urlStr),namedMatches=[],routerMatches=[],i=0,iLen=urls.length,namedMatch;i<iLen;i++){namedMatch=NamedRouting.parseNamedItem(urls[i],!0);if(namedMatch){namedMatches.push(namedMatch)}else{routerMatches.push(urls[i])}}return{named:namedMatches,routes:routerMatches}}}]);function RouterElement(){var _this;babelHelpers.classCallCheck(this,RouterElement);_this=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(RouterElement).call(this));_this.canLeave=NamedRouting.canLeave.bind(babelHelpers.assertThisInitialized(_this));return _this}/**
     * Global initialization
     */babelHelpers.createClass(RouterElement,[{key:"getName",value:function getName(){if(this.routerName===void 0){this.routerName=this.getAttribute("name")}return this.routerName}},{key:"getCurrentMatch",value:function getCurrentMatch(){if(!this._currentMatch&&this._parentRouter._currentMatch){this._currentMatch={remainder:this._parentRouter._currentMatch.remainder};// TODO get remainder from parent but ony take this routers url from it
// e.g. split :: and take the firs put the rest back
// TODO if we support adding a router name to the URL this is where we would check for it: (myRouter:users/main) --> target router named myRouter with url users/main
var remainder=this._currentMatch.remainder;if(remainder&&"("===remainder[0]){remainder=RouterElement.splitUrlIntoRouters(remainder.substring(1,remainder.length-2));this._currentMatch.remainder=remainder.shift();// The next line is done in in the postProcessMatch
// this._parentRouter._currentMatch.remainder = '(' + remainder.join('::') + ')';
}this._currentMatch.url=this._currentMatch.remainder}return this._currentMatch}/**
     * Performs matching for nested routes as they connect.
     * @param {import('./routes-route').RouteElement} routeElement 
     */},{key:"addRoute",value:function addRoute(routeElement){console.log("route added: "+routeElement.getAttribute("path"));if(!this.hasMatch){var currentMatch=this.getCurrentMatch();if(currentMatch){if(currentMatch.remainder){this.performMatchOnRoute(currentMatch.remainder,routeElement)}}else{this.performMatchOnRoute(RouterElement._route.url,routeElement)}}}// TODO 
// go (url)
// {
//   let match = this.performMatchOnRouter(url);
//   if (match) {
//     // push new history
//   }
// }
/**
   * Takes in a url that contains named router data and renders the router using the information
   * @param {string} url to process as a named item
   */},{key:"processNamedUrl",value:function processNamedUrl(url){return this.performMatchOnRouter(url)}/**
     * Performs route matching by iterating through routes looking for matches
     * @param {String} url  
     */},{key:"performMatchOnRouter",value:function performMatchOnRouter(url){this.hasMatch=!1;this._currentMatch={remainder:url};for(var routeElements=this.getRouteElements(),outletElement=this.getOutletElement(),match=null,i=0,iLen=routeElements.length,routeElement;i<iLen;i++){routeElement=routeElements[i];match=this.performMatchOnRoute(url,routeElement);if(null!=match){console.log("route matched -> ",routeElement.getAttribute("path"));break}}if(null===match){if(outletElement.renderOutletContent){outletElement.renderOutletContent("No matching route for url "+url+" \r\nTo replace this message add a 404 catch all route\r\n <a-route path='*'><template>catach all - NotFound</template></a-route>");console&&console.error&&console.error("404 - Route not found for url "+url)}return null}return match}},{key:"performMatchOnRoute",value:function performMatchOnRoute(url,routeElement){// RouteElement not connected yet
if(!routeElement.match){return null}var match=routeElement.match(url)||null;if(null!=match){if(match.redirect){// TODO If the route being redirected to comes after then it might not have loaded yet
return this.performMatchOnRouter(match.redirect)}var activeRouters=RouterElement._activeRouters;activeRouters.push({route:routeElement,router:this,match:match});this._currentMatch=match;if(match.useCache){// Content is already loaded so addRoute will not get called. Start the matching for children manually.
if(this._routers&&match.remainder){RouterElement.performMatchOnRouters(match.remainder,this._routers)}}else{var outletElement=this.getOutletElement();routeElement.getContent(match.data).then(function(content){return outletElement.renderOutletContent(content)})}this.postProcessMatch()}return match}},{key:"postProcessMatch",value:function postProcessMatch(){this.hasMatch=!0;if(this._parentRouter._currentMatch){var parentMatch=this._parentRouter._currentMatch,remainder=parentMatch.remainder;// TODO get remainder from parent but ony take this routers url from it
// e.g. split :: and take the first put the rest back
// TODO if we support adding a router name to the URL this is where we would check for it: (myRouter:users/main) --> target router named myRouter with url users/main
if(remainder&&"("===remainder[0]){remainder=remainder.substring(1,remainder.length-2)}remainder=RouterElement.splitUrlIntoRouters(remainder);remainder.shift();// this._currentMatch.remainder = remainder.shift();
if(1<remainder.length){this._parentRouter._currentMatch.remainder="("+remainder.join("::")+")"}else if(1===remainder.length){this._parentRouter._currentMatch.remainder=remainder[0]}else{this._parentRouter._currentMatch.remainder=""}}}},{key:"generateUrlFragment",value:function generateUrlFragment(){var match=this._currentMatch;if(!match){return""}var urlFrag=match.url;if(match.remainder){urlFrag+="/"+match.remainder}if(this._routers&&this._routers.length){urlFrag+="/(";for(var i=0,iLen=this._routers.length;i<iLen;i++){if(0<i){urlFrag+="::"}urlFrag+=this._routers[i].generateUrlFragment()}urlFrag+=")"}return urlFrag}/**
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
     */}],[{key:"initialize",value:function initialize(){if(!RouterElement._initialized){RouterElement._initialized=!0;//RouterElement.whiteListRegEx = this.getAttribute('base-white-list') || '';
window.addEventListener("popstate",RouterElement.changeUrl,!1);window.addEventListener("click",RouterElement.navigate,!1);// Listen for top level routers being added
window.addEventListener("onRouterAdded",RouterElement.handlerAddRouter.bind(RouterElement),!1);// Listen for link registration
window.addEventListener("routerLinksAdded",RouterElement.handlerRouterLinksAdded.bind(RouterElement),!1);// Listen for navigate requests
window.addEventListener("navigate",RouterElement.handlerNavigate.bind(RouterElement),!1);RouterElement.changeUrl()}}},{key:"_getSameOriginLinkHref",value:function _getSameOriginLinkHref(hrefSource){var href=null,anchor=null;if(babelHelpers.instanceof(hrefSource,Event)){var event=hrefSource;// We only care about left-clicks.
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
RouterElement._routers=[];RouterElement._route={};RouterElement._initialized=!1;RouterElement._activeRouters=[];RouterElement._dwellTime=2e3;RouterElement._anchors=[];RouterElement._encodeSpaceAsPlusInQuery=!1;RouterElement.assignedOutlets={};window.customElements.define("a-router",RouterElement);var routesRouter={RouterElement:RouterElement},RouteElement=/*#__PURE__*/function(_HTMLElement2){babelHelpers.inherits(RouteElement,_HTMLElement2);babelHelpers.createClass(RouteElement,[{key:"connectedCallback",value:function connectedCallback(){if(!this.created){this.created=!0;this.style.display="none";var baseElement=document.head.querySelector("base");this.baseUrl=baseElement&&baseElement.getAttribute("href")}if(this.isConnected){// var childrenReady = (mutationList, observer) => {
//   observer.disconnect();
//   this.parentNode.addRoute && this.parentNode.addRoute(this);
// };
// var observer = new MutationObserver(childrenReady);
// observer.observe(this, { attributes: false, childList: true, subtree: true });
var initMatch=function initMatch(){this.parentNode&&this.parentNode.addRoute&&this.parentNode.addRoute(this)};setTimeout(initMatch.bind(this),0);if(this.hasAttribute("lazyload")&&"true"!==this.getAttribute("lazyload").toLowerCase()){var importAttr=this.getAttribute("import"),tagName=this.getAttribute("element");NamedRouting.prefetchImport(importAttr,tagName)}}}},{key:"disconnectedCallback",value:function disconnectedCallback(){this.parentNode&&this.parentNode.isConnected&&this.parentNode.removeRoute(this)}}]);function RouteElement(){var _this2;babelHelpers.classCallCheck(this,RouteElement);_this2=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(RouteElement).call(this));_this2.canLeave=NamedRouting.canLeave.bind(babelHelpers.assertThisInitialized(_this2));return _this2}babelHelpers.createClass(RouteElement,[{key:"_createPathSegments",value:function _createPathSegments(url){return url.replace(/(^\/+|\/+$)/g,"").split("/")}/**
     * @typedef {Object} Match
     * @property {string} url - The url that was matched and consumed by this route. The match.url and the match.remainder will together equal the URL that the route originally matched against.
     * @property {string} remainder - If the route performed a partial match, the remainder of the URL that was not atched is stored in this property.
     * @property {Object} data - Any data found and matched in the URL.
     */ /**
         * Performs matching and partial matching. In order to successfully match, a RouteElement elements path attribute must match from the start of the URL. A full match would completely match the URL. A partial match would return from the start.
         * @fires RouteElement#onROuteMatch
         * @param {string} url - The url to perform matching against
         * @returns {Match} match - The resulting match. Null will be returned if no match was made.
         */},{key:"match",value:function match(url){var urlSegments=this._createPathSegments(url),path=this.getAttribute("path");if(!path){console.log("route must contain a path");throw"Route has no path defined. Add a path attribute to route"}var match=null;if("*"===path){match={url:url,remainder:"",data:null}}else if(path===url){match={url:url,remainder:"",data:null}}else{for(var pathSegments=this._createPathSegments(path),data=new Map,max=Math.max(urlSegments.length,pathSegments.length),ret,i=0;i<max;i++){if(pathSegments[i]&&":"===pathSegments[i].charAt(0)){var param=pathSegments[i].replace(/(^\:|[+*?]+$)/g,""),flags=(pathSegments[i].match(/[+*?]+$/)||[])[0]||"",plus=~flags.indexOf("+"),star=~flags.indexOf("*"),val=urlSegments[i]||"";if(!val&&!star&&(0>flags.indexOf("?")||plus)){match=null;break}data.set(param,decodeURIComponent(val));if(plus||star){data.set(param,urlSegments.slice(i).map(decodeURIComponent).join("/"));match={url:url,remainder:"",data:data};break}}else if(pathSegments[i]!==urlSegments[i]){if(0<i&&!this.hasAttribute("fullmatch")){match={url:urlSegments.slice(0,i).join("/"),remainder:urlSegments.slice(i).join("/"),data:data}}break}if(i===max-1){match={url:url,remainder:"",data:data}}}}if(null!==match){/**
       * Route Match event that fires after a route has performed successful matching. The event can be cancelled to prevent the match.
       * @event RouteElement#onRouteMatch
       * @type CustomEvent
       * @property {Object} details - The event details
       * @property {RouteElement} details.route - The RouteElement that performed the match.
       * @property {Match} details.match - The resulting match. Warning, modifications to the Match will take effect.
       * @property {string} details.path - The RouteElement path attribute value that was matched against.
       */var routeMatchedEvent=new CustomEvent("onRouteMatch",{bubbles:!0,cancelable:!0,composed:!0,detail:{route:this,match:match,path:path}});this.dispatchEvent(routeMatchedEvent);if(routeMatchedEvent.defaultPrevented){match=null}if(this.hasAttribute("redirect")){match.redirect=this.getAttribute("redirect")}}if(match){var useCache=this.lastMatch&&this.lastMatch.url===match.url&&!this.hasAttribute("disableCache");match.useCache=useCache}this.lastMatch=match;return match}/**
     * Generates content for this route.
     * @param {Object} attributes - Object of properties that will be applied to the content. Only applies if the content was not generated form a Template.
     * @returns {Promise<string>|Promise<DocumentFragment>|Promise<HTMLElement>} - The resulting generated content.
     */},{key:"getContent",value:function(){var _getContent=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee2(){var attributes,content,importAttr,tagName,template,_args2=arguments;return regeneratorRuntime.wrap(function _callee2$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:attributes=0<_args2.length&&_args2[0]!==void 0?_args2[0]:{};content=this.content;if(content){_context2.next=11;break}importAttr=this.getAttribute("import");tagName=this.getAttribute("element");_context2.next=7;return NamedRouting.importCustomElement(importAttr,tagName);case 7:if(tagName){// TODO support if tagName is a function that is called and will return the content
// content = tagName(attributes);
content=document.createElement(tagName)}template=this.children[0];if(!(template&&babelHelpers.instanceof(template,HTMLTemplateElement))){_context2.next=11;break}return _context2.abrupt("return",template.content.cloneNode(!0));case 11:if(attributes){RouteElement.setData(content,attributes)}return _context2.abrupt("return",this.content=content);case 13:case"end":return _context2.stop();}}},_callee2,this)}));function getContent(){return _getContent.apply(this,arguments)}return getContent}()}],[{key:"setData",value:function setData(target,data){data.forEach(function(v,k){if("."===k[0]){target[k.substr(1)]=v}else{target.setAttribute(k,v)}})}}]);return RouteElement}(babelHelpers.wrapNativeSuper(HTMLElement));///@ts-check
window.customElements.define("a-route",RouteElement);var routesRoute={RouteElement:RouteElement},OutletElement=/*#__PURE__*/function(_HTMLElement3){babelHelpers.inherits(OutletElement,_HTMLElement3);babelHelpers.createClass(OutletElement,[{key:"connectedCallback",value:function connectedCallback(){if(this.isConnected){if(!this.created){this.created=!0;// var p = document.createElement('p');
// p.textContent = 'Please add your routes!';
// this.appendChild(p);
NamedRouting.addNamedItem(this)}RouterElement.initialize()}}},{key:"disconnectedCallback",value:function disconnectedCallback(){if(this.getName()){NamedRouting.removeNamedItem(this.getName())}}}]);function OutletElement(){var _this3;babelHelpers.classCallCheck(this,OutletElement);_this3=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(OutletElement).call(this));_this3.canLeave=NamedRouting.canLeave.bind(babelHelpers.assertThisInitialized(_this3));return _this3}babelHelpers.createClass(OutletElement,[{key:"getName",value:function getName(){if(this.outletName===void 0){this.outletName=this.getAttribute("name")}return this.outletName}},{key:"_createPathSegments",value:function _createPathSegments(url){return url.replace(/(^\/+|\/+$)/g,"").split("/")}/**
     * Replaces the content of this outlet with the supplied new content
     * @fires OutletElement#onOutletUpdated
     * @param {string|DocumentFragment|HTMLElement} content - Content that will replace the current content of the outlet
     */},{key:"renderOutletContent",value:function renderOutletContent(content){this.innerHTML="";// console.log('outlet rendered: ' + this.outletName, content);
if("string"===typeof content){this.innerHTML=content}else{this.appendChild(content)}this.dispatchOuletUpdated()}/**
     * Takes in a url that contains named outlet data and renders the outlet using the information
     * @param {string} url
     * @param {boolean} supressUrlGeneration
     */},{key:"processNamedUrl",value:function(){var _processNamedUrl=babelHelpers.asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee3(url,supressUrlGeneration){var details,options,data,element;return regeneratorRuntime.wrap(function _callee3$(_context3){while(1){switch(_context3.prev=_context3.next){case 0:details=NamedRouting.parseNamedOutletUrl(url);options=details.options||{import:null};data=details.data||new Map;if(!1===babelHelpers.instanceof(data,Map)){data=new Map(Object.entries(data||{}))}// If same tag name then just set the data
if(!(this.children&&this.children[0]&&this.children[0].tagName.toLowerCase()==details.elementTag)){_context3.next=8;break}RouteElement.setData(this.children[0],data||{});this.dispatchOuletUpdated();return _context3.abrupt("return",this.children[0]);case 8:_context3.next=10;return NamedRouting.importCustomElement(options.import,details.elementTag);case 10:element=document.createElement(details.elementTag);RouteElement.setData(element,data||{});this.renderOutletContent(element);if(!supressUrlGeneration){RouterElement.updateHistory("")}return _context3.abrupt("return",element);case 15:case"end":return _context3.stop();}}},_callee3,this)}));function processNamedUrl(_x3,_x4){return _processNamedUrl.apply(this,arguments)}return processNamedUrl}()},{key:"dispatchOuletUpdated",value:function dispatchOuletUpdated(){/**
     * Outlet updated event that fires after an Outlet replaces it's content.
     * @event OutletElement#onOutletUpdated
     * @type CustomEvent
     * @property {any} - Currently no information is passed in the event.
     */this.dispatchEvent(new CustomEvent("onOutletUpdated",{bubbles:!0,composed:!0,detail:{}}))}}]);return OutletElement}(babelHelpers.wrapNativeSuper(HTMLElement));///@ts-check
window.customElements.define("an-outlet",OutletElement);var routesOutlet={OutletElement:OutletElement},RouterLinkElement=/*#__PURE__*/function(_HTMLAnchorElement){babelHelpers.inherits(RouterLinkElement,_HTMLAnchorElement);babelHelpers.createClass(RouterLinkElement,[{key:"connectedCallback",value:function connectedCallback(){RouterElement.initialize();window.dispatchEvent(new CustomEvent("routerLinksAdded",{detail:{links:[this]}}))}}]);function RouterLinkElement(){babelHelpers.classCallCheck(this,RouterLinkElement);return babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(RouterLinkElement).call(this))}return RouterLinkElement}(babelHelpers.wrapNativeSuper(HTMLAnchorElement));///@ts-check
window.customElements.define("router-link",RouterLinkElement,{extends:"a"});export{namedRouting as $namedRouting,routesOutlet as $routesOutlet,routesRoute as $routesRoute,routesRouter as $routesRouter,NamedRouting,OutletElement,RouteElement,RouterElement};