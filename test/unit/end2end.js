import { NamedRouting } from '../../src/named-routing.js'
import { RouterElement } from '../../src/routes-router.js'
import '../../src/routes-route.js'
import '../../src/routes-outlet.js'

class End2EndElement extends HTMLElement {

    connectedCallback() {
        if (this.isConnected) {
            this.render();
        }
    }

    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
        <!-- Test set up -->
        <a-outlet name="myoutlet1" id="myoutlet1"></a-outlet>
        <a-router id="router-a">
          <a-outlet id="outletA"></a-outlet>
          <a-route path="/template" id="template-route"><template>Hello Template</template></a-route>
          <a-route path="/template"><template>Only hit if template route cancelled</template></a-route>
          <a-route path="/webcomponent" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/nested">
            <template>
              <p>Content with nested router</p>
              <a-router name="router-a-b">
                <a-outlet id="outletB"></a-outlet>
                <a-route path="/template_nested"><template>Hello Nested</template></a-route>
                <a-route path="/webcomponent_nested" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
                <a-route path="/nested2/:param1">
                  <template>
                    <p>Nested router with data</p>
                    <a-router>
                      <a-outlet id="outletC"></a-outlet>
                      <a-route id="route-nested-component" path="/webcomponent-data2/:requiredParam" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
                    </a-route>
                  </template>
                </a-route>
                <a-route id="catch-all" path='*'><template>catach all - NotFound1</template></a-route>
              </a-route>
            </template>
          </a-route>
          <a-route path="/webcomponent-data1/:requiredParam" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data2/:optionalParam?" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data3/:atLeastOneParam+" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data4/:anyNumOfParam*" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data5/:firstParam/:secondParam" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route id="catch-all" path='*'><template>catach all - NotFound2</template></a-route>
        </a-router>
      
        <template id="auxiliary-routing">
          <a-router id="routerb">
            <a-outlet id="main"></a-outlet>
            <a-route path='/main'>
              <template>
                  <a-router>
                      <a-outlet id="main_view1"></a-outlet>
                      <a-route path='/main_view1/:param'>
                        <template>Main View 1</template>
                      </a-route>
                      <a-route path='/main_view2'>
                        <template>Main View 2</template>
                      </a-route>
                  </a-router>
                  <a-router>
                      <a-outlet id="main2_view1"></a-outlet>
                      <a-route path='/main2_view1/:param2'>
                        <template>Main2 View 1</template>
                      </a-route>
                  </a-router>
              </template>
            </a-route>
          </a-router>
          <a-router id="routerc">
              <a-outlet id="sec"></a-outlet>
              <a-route path='/secondary'>
                <template>
                    <a-router>
                      <a-outlet id="sec_v1"></a-outlet>
                      <a-route path='/sec_view1/:param'>
                        <template>Sec View 1</template>
                      </a-route>
                      <a-route path='/sec_view2'>
                        <template>Sec View 2</template>
                      </a-route>
                    </a-router>
                    <a-router>
                      <a-outlet id="sec_v2"></a-outlet>
                      <a-route path='/secondary2_view1/:param3'>
                        <template>Sec2 View 1</template>
                      </a-route>
                    </a-router>
                </template>
              </a-route>
            </a-router>
        </template>
        `;
    }
}

window.customElements.define('end-to-end', End2EndElement);
    const baseUrl = document.createElement('base');
    baseUrl.setAttribute('href', '/myapp/');
    document.head.appendChild(baseUrl);
    let outlet = document.getElementById('outletA');
    document.body.appendChild(document.createElement('end-to-end'));

    let fireNavigate = function(link) {
        let navigateEvent = new CustomEvent('navigate', {
            detail: {
                href: link
            }
        });
        window.dispatchEvent(navigateEvent);
        return navigateEvent;
    }

    let click = function(href) {
        let link = href instanceof HTMLAnchorElement ? href : undefined;
        let removeLink = false;
        if (!link) {
            link = document.createElement('A');
            link.href = href.href || href;
            document.body.appendChild(link);
            removeLink = true;
        }
        let navEvent = fireNavigate(link);
        console.info(navEvent.detail.onNavigated, link.href, link);
        return navEvent.detail.onNavigated.then(() => {
            removeLink && link.remove();
            return navEvent.detail.onNavigated;
        });
    }

    let clickAndTest = function (linkDetails, expectedTextOrHtmlContent, outletId) {
        outletId = outletId || 'outletA';
        console.group('test: ' + linkDetails.href)
        
        let callback = function (event) {
            document.body.removeEventListener("onOutletUpdated", callback);
            console.info('callback for ' + linkDetails.href);
            console.info('outlet updated: ' + event.target.id + '-----' + event.target.innerText);
            if (!outletId || outletId === event.target.id) {
                if (expectedTextOrHtmlContent instanceof Function)
                    expectedTextOrHtmlContent(event.target);
                else
                    expect(event.target.innerHTML).toContain(expectedTextOrHtmlContent);                    
            }
        };

        document.body.addEventListener("onOutletUpdated", callback);

        return click(linkDetails).then((event) => {
            document.body.removeEventListener("onOutletUpdated", callback);
            console.info('call done for ' + linkDetails.href);
            console.groupEnd();
        });
    };

    let clickAndNotHandle = function(linkDetails, done) {
        console.info('clickAndNotHandle: ' + linkDetails.href);
        let clickCallback = (event) => {
            window.removeEventListener('click', clickCallback);
            event.preventDefault();
        };
        window.addEventListener('click', clickCallback, false);
        
        let notHandled = false;
        let notHandledCallback = function (event) {
            notHandled = true;
        }
        document.body.addEventListener("onRouteNotHandled", notHandledCallback);

        return click(linkDetails).then(() => {
            document.body.removeEventListener("onRouteNotHandled", notHandledCallback);
            expect(notHandled).toBe(true);
            console.info('route not handled: ' + linkDetails.href);
            console.info('call done for ' + linkDetails.href);
            done && done();
        });
    };

    describe('link state', function() {
        it('link should be active for nested routes', async function(){
            let link1 = document.createElement('a');
            link1.href = 'nested/webcomponent_nested';
            document.body.appendChild(link1);
            
            let link2 = document.createElement('a');
            link2.href = 'nested2/webcomponent_nested';
            document.body.appendChild(link2);
            debugger;
            
            await RouterElement.registerLinks([link1, link2], 'active');
            
            let onLinkActiveStatusUpdated = 0;
            let handler = () => {
                onLinkActiveStatusUpdated += 1;
            }

            window.addEventListener("onLinkActiveStatusUpdated", handler);
            await click(link1);
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    expect(link1.className).toEqual('active');
                    expect(link2.className).toEqual('');
                    link1.remove();
                    link2.remove();
                    window.removeEventListener("onLinkActiveStatusUpdated", handler);
                    resolve('foo');
                }, 100);
              });
        });

        it('link should be active for named outlet', function(){
            let link1 = document.createElement('a');
            document.body.appendChild(link1);
            link1.href = '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js))';
            let link2 = document.createElement('a');
            document.body.appendChild(link2);
            link2.href = '(myoutlet:tests-dummy(/base/test/assets/test-dummy.js))';
            RouterElement.registerLinks([link1, link2], 'active');

            let linkStatusesUpdate = false;
            let onLinkActiveStatusUpdatedCallback = function (event) {
                linkStatusesUpdate = true;
            };
            window.addEventListener("onLinkActiveStatusUpdated", onLinkActiveStatusUpdatedCallback);

            return click({ href: "(myoutlet1:test-dummy(/base/test/assets/test-dummy.js))" }).then(() => {
                window.removeEventListener("onLinkActiveStatusUpdated", onLinkActiveStatusUpdatedCallback);
                NamedRouting.removeAssignment('myoutlet1');
                expect(linkStatusesUpdate).toBe(true);
                expect(link1.className).toEqual('active');
                expect(link2.className).toEqual('');
                link1.remove();
                link2.remove();
            });
        });

        it('link should be active for named outlet with data', function(){
            let link1 = document.createElement('a');
            document.body.appendChild(link1);
            link1.href = '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js):param1=value1)';
            let link2 = document.createElement('a');
            document.body.appendChild(link2);
            link2.href = '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js)):param1=value2';
            let link3 = document.createElement('a');
            document.body.appendChild(link3);
            link3.href = '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js))';
            RouterElement.registerLinks([link1, link2, link3], 'active');

            let linkStatusesUpdate = false;
            let outletUpdateCallback = function (event) {
                linkStatusesUpdate = true;
            };
            window.addEventListener("onLinkActiveStatusUpdated", outletUpdateCallback);

            return click({ href: "(myoutlet1:test-dummy(/base/test/assets/test-dummy.js):param1=value1)" }).then(() => {
                window.removeEventListener("onLinkActiveStatusUpdated", outletUpdateCallback);
                NamedRouting.removeAssignment('myoutlet1');
                expect(linkStatusesUpdate).toBe(true);
                expect(link1.className).toEqual('active');
                expect(link2.className).toEqual('');
                expect(link3.className).toEqual('active');
                link1.remove();
                link2.remove();
                link3.remove();
            });
        });

        it('link should be active for named routes', function(){
            let link1 = document.createElement('a');
            document.body.appendChild(link1);
            link1.href = '(router-a-b:template2_nested)';
            let link2 = document.createElement('a');
            document.body.appendChild(link2);
            link2.href = '(router-a-b:template_nested)';
            RouterElement.registerLinks([link1, link2], 'active');
            return click({ href: "nested/webcomponent_nested" }, 'outletB').then(() => {
                return clickAndTest({ href: "(router-a-b:template_nested)" }, 'Hello Nested').then(() => {
                    NamedRouting.removeAssignment('router-a-b');
                    expect(link1.className).toEqual('');
                    expect(link2.className).toEqual('active');
                    link1.remove();
                    link2.remove();
                })
            });
        });
    });

    describe('named outlets', function() {
        it('should show named outlet', function() {
            return click({ href: '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js))'}).then(() => {
                let content = document.querySelector("[name='myoutlet1']").innerHTML;
                expect(content).toContain('test-dummy');
            });
        });

        it('updates for clicked links', function() {
            return clickAndTest({ href: "(myoutlet1:test-dummy(/base/test/assets/test-dummy.js):requiredParam=named outlet,testing)" }, 'Test Element named outlet,testing', 'myoutlet1');
        });

        it('should support convention based importing', function() {
            return clickAndTest({ href: "(myoutlet1:/base/test/assets/test-dummy-two)" }, 'Test Element Two', 'myoutlet1');
        });
    });

    describe('named routers', function() {
        it('updates for clicked links', function() {
            return click({ href: "nested/webcomponent_nested" }).then(() => {
                clickAndTest({ href: "(router-a-b:template_nested)" }, 'Hello Nested', 'outletB').then(() => {
                    NamedRouting.removeAssignment('router-a-b');
                })
            });
        });
    });

    describe('routes-router', function () {
        describe('simple flat', () => {
            it('template based route works', (done) => {
                clickAndTest({ href: "template" }, 'Hello Template').then(() => done());
            });

            it('web component based route works with import', function (done) {
                clickAndTest({ href: "webcomponent" }, '<test-dummy><p>Test Element</p></test-dummy>').then(() => done());
            });

            it('nomatch should hit catch all', function (done) {
                clickAndTest({ href: "nomatch" }, 'catach all - NotFound2').then(() => done());
            });

            it('404 if no match and no catch all', function (done) {
                var route = document.getElementById('catch-all');
                route.setAttribute('path', 'other');
                clickAndTest({ href: "exception" }, '404').then(() => {
                    route.setAttribute('path', '*');
                    done();
                });
            });

            // TODO
            // it('only white listed routes should match', function (done) {
            //   var route = document.getElementById('catch-all');
            //   route.setAttribute('path', 'other');
            //   clickAndTest(
            //     { href: "exception" },
            //     (outlet) => {
            //       expect(outlet.innerHTML).toContain('404');
            //       route.setAttribute('path', '*');
            //     },
            //     done);
            // });

            it('absolute path should match', function (done) {
                clickAndTest({ href: "/myapp/template" }, 'Hello Template').then(() => done());
            });

            it('shouldn\'t handle different base urls', function () {
                return clickAndNotHandle({ href: "/myotherapp/template" });
            });
        });

        describe('auxiliary routing', function(){
            it('Should route auxiliary', async function() {
                let routerA = document.getElementById('router-a');
                let auxiliaryRouting = document.getElementById('auxiliary-routing').content.cloneNode(true);
                let i = 2;
                auxiliaryRouting = routerA.parentNode.insertBefore(auxiliaryRouting, routerA.nextSibling);
                await click({ href: "(template)::main/(main_view1/10::main2_view1/99)::secondary/(sec_view1/54::secondary2_view1/43)" }).then(() => {
                    expect(document.getElementById('router-a').innerText)
                        .toContain('Hello Template');
                    let routerB = document.getElementById('routerb');
                    expect(routerB.innerText)
                        .toContain('Main View 1 Main2 View 1');
                    let routerC = document.getElementById('routerc');
                    expect(routerC.innerText)
                        .toContain('Sec View 1 Sec2 View 1');
                    routerB.parentNode.removeChild(routerB);
                    routerC.parentNode.removeChild(routerC);
                });
            });
        });
        
        describe('nested routes', function() {
            it('should match nested', function(done) {
                clickAndTest({ href: "nested/webcomponent_nested" }, '<test-dummy><p>Test Element</p></test-dummy>', 'outletB').then(() => done());
            });

            describe('with data', function() {
                it('should work with nested data', function(done){
                    clickAndTest(
                        { href: 'nested/nested2/value1/webcomponent-data2/value2' }, 
                        'Test Element value2', 
                        'outletC').then(() => done());
                });
            });
        });

        describe('data', function() {
            it('should require data', function(done) {
            clickAndTest(
                { href: 'webcomponent-data1/paramValue1' },
                '<test-dummy requiredparam="paramValue1"><p>Test Element paramValue1</p></test-dummy>').then(() => done());
            });

            it('supports optional data', function(done) {
                clickAndTest(
                    { href: 'webcomponent-data2' },
                    '<test-dummy optionalparam=""><p>Test Element</p></test-dummy>').then(() => done());
            });

            it('supports one or more data', function(done) {
                clickAndTest(
                    { href: 'webcomponent-data3/paramValue1' },
                    '<test-dummy atleastoneparam="paramValue1"><p>Test Element</p></test-dummy>').then(() => done());
            });

            it('supports zero or more data', function(done) {
                clickAndTest(
                    { href: 'webcomponent-data4/paramValue1' },
                    '<test-dummy anynumofparam="paramValue1"><p>Test Element</p></test-dummy>').then(() => done());
            });

            it('supports multiple data params', function(done) {
                clickAndTest(
                { href: 'webcomponent-data5/paramValue1/paramVlaue2' },
                '<test-dummy firstparam="paramValue1" secondparam="paramVlaue2"><p>Test Element</p></test-dummy>').then(() => done());
            });
        });

        describe('Route Caching', function() {
            it('will not update', function(done) {
                clickAndTest(
                    { href: 'nested/nested2/value1/webcomponent-data2/value3' },
                    (outlet) => outlet.setAttribute('test', '123'),
                    'outletC').then(() => clickAndTest(
                        { href: 'nested/nested2/value1/webcomponent-data2/value2' },
                        (outlet) => expect(outlet.getAttribute('test')).toEqual('123'),
                        'outletC')).then(() => done());
            });

            it('will update', function(done) {
            clickAndTest(
                { href: 'nested/nested2/value2/webcomponent-data2/value3' }, 
                (outlet) => outlet.setAttribute('test', '123'),
                'outletC').then(() => clickAndTest(
                    { href: 'nested/nested2/value1/webcomponent-data2/value2' }, 
                    (outlet) => expect(outlet.getAttribute('test')).not.equal('123'),
                    'outletC')).then(() => done());
            });
        });

        describe('Route Guards', () => {
            it('will not leave', (done) => {
            var check = () => {
                let routeLeaveCallback = (event) => {
                    document.body.removeEventListener('onRouteLeave', routeLeaveCallback);
                    event.preventDefault();
                    let routeCancelledCallback = (event) => {
                        document.body.removeEventListener('onRouteCancelled', routeCancelledCallback);
                        console.groupEnd();
                    };
                    document.body.addEventListener('onRouteCancelled', routeCancelledCallback);
                };
                document.body.addEventListener('onRouteLeave', routeLeaveCallback);
                clickAndTest(
                    { href: 'nested/nested2/value2/webcomponent-data2/value2' }, 
                    (outlet) => { },
                    'outletC').then(() => done());
                };
            clickAndTest(
                { href: 'nested/nested2/value1/webcomponent-data2/value3' }, 
                function(outlet){ outlet.setAttribute('test', '123'); }, 
                'outletC').then(() => check());
            });
        });

        describe('Router Events', function() {
            // it('should fire onRouterAdded', function(done) {
            
            // });
            // it('should fire onRouteCancelled', function(done) {
            
            // });
        });

        describe('Route Events', function() {
            // it('should fire onRouteLeave', function(done) {
            //   clickAndTest({ href: 'nested/template_nested' }, 'Hello Nested', done);
            // });

            it('should cancel match with onRouteMatch', function(done) {
            var templateRoute = document.getElementById('template-route');
            let routeMatchedCallback = function(event) {
                templateRoute.removeEventListener('onRouteMatch', routeMatchedCallback);
                event.preventDefault();
            };
            templateRoute.addEventListener('onRouteMatch', routeMatchedCallback);
            clickAndTest({ href: 'template' }, 'Only hit if template route cancelled').then(() => done());
            });
        });

        // describe('Outlet Events', function() {
        //   it('should match nested', function(done) {
        //     clickAndTest({ href: 'nested/template_nested' }, 'Hello Nested', done);
        //   });
        // });

        // describe('test hash routing', function() {
        //   it('should match', function(done) {
        //     clickAndTest({ href: 'nested/template_nested' }, 'Hello Nested');
        //   });
        // });
    });

    describe('routes-route', function () {
        describe('route matching', function () {
            // it('full matches', function () {

            // });
        });
    });
