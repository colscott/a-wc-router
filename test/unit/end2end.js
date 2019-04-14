// import '../../node_modules/mocha/mocha.js'
// import '../../node_modules/chai/register-expect.js';
import { NamedRouting } from '../../src/named-routing.js'
import { RouterElement } from '../../src/routes-router.js'
import { RouteElement } from '../../src/routes-route'
import '../../src/routes-outlet'

class End2EndElement extends HTMLElement {

    connectedCallback() {
        if (this.isConnected) {
            this.render();
            setTimeout(this.runTests.bind(this), 0);
        }
    }

    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
        <a href="/components/a-wc-router/test/unit/index.html" onclick="setTimeout(() => window.location.reload(true), 0)">Rerun</a>
        <div id="mocha">
          <p><a href=".">Index</a></p>
        </div>
        <div id="messages"></div>
        <div id="fixtures"></div>
      
        <!-- Test set up -->
        <an-outlet name="myoutlet1" id="myoutlet1"></an-outlet>
        <a-router id="router-a">
          <an-outlet id="outletA"></an-outlet>
          <a-route path="/template" id="template-route"><template>Hello Template</template></a-route>
          <a-route path="/template"><template>Only hit if template route cancelled</template></a-route>
          <a-route path="/webcomponent" import='/components/a-wc-router/src/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/nested">
            <template>
              <p>Content with nested router</p>
              <a-router name="router-a-b">
                <an-outlet id="outletB"></an-outlet>
                <a-route path="/template_nested"><template>Hello Nested</template></a-route>
                <a-route path="/webcomponent_nested" import='/components/a-wc-router/src/test-dummy.js' element="test-dummy"></a-route>
                <a-route path="/nested2/:param1">
                  <template>
                    <p>Nested router with data</p>
                    <a-router>
                      <an-outlet id="outletC"></an-outlet>
                      <a-route id="route-nested-component" path="/webcomponent-data2/:requiredParam" import='/components/a-wc-router/src/test-dummy.js' element="test-dummy"></a-route>
                    </a-route>
                  </template>
                </a-route>
                <a-route id="catch-all" path='*'><template>catach all - NotFound1</template></a-route>
              </a-route>
            </template>
          </a-route>
          <a-route path="/webcomponent-data1/:requiredParam" import='/components/a-wc-router/src/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data2/:optionalParam?" import='/components/a-wc-router/src/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data3/:atLeastOneParam+" import='/components/a-wc-router/src/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data4/:anyNumOfParam*" import='/components/a-wc-router/src/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data5/:firstParam/:secondParam" import='/components/a-wc-router/src/test-dummy.js' element="test-dummy"></a-route>
          <a-route id="catch-all" path='*'><template>catach all - NotFound2</template></a-route>
        </a-router>
      
        <template id="auxiliary-routing">
          <a-router id="routerb">
            <an-outlet id="main"></an-outlet>
            <a-route path='/main'>
              <template>
                  <a-router>
                      <an-outlet id="main_view1"></an-outlet>
                      <a-route path='/main_view1/:param'>
                        <template>Main View 1</template>
                      </a-route>
                      <a-route path='/main_view2'>
                        <template>Main View 2</template>
                      </a-route>
                  </a-router>
                  <a-router>
                      <an-outlet id="main2_view1"></an-outlet>
                      <a-route path='/main2_view1/:param2'>
                        <template>Main2 View 1</template>
                      </a-route>
                  </a-router>
              </template>
            </a-route>
          </a-router>
          <a-router id="routerc">
              <an-outlet id="sec"></an-outlet>
              <a-route path='/secondary'>
                <template>
                    <a-router>
                      <an-outlet id="sec_v1"></an-outlet>
                      <a-route path='/sec_view1/:param'>
                        <template>Sec View 1</template>
                      </a-route>
                      <a-route path='/sec_view2'>
                        <template>Sec View 2</template>
                      </a-route>
                    </a-router>
                    <a-router>
                      <an-outlet id="sec_v2"></an-outlet>
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

    runTests() {
        mocha.setup('bdd');
        let expect = chai.expect;
        var outlet = document.getElementById('outletA');

        var click = function(linkDetails, keepLink) {
            let link = document.createElement('A');
            link.href = linkDetails.href;
            linkDetails.target && (link.target = linkDetails.target);
            document.body.appendChild(link);
            link.click();
            return keepLink ? link : link.remove();
        }

        var clickAndTest = function (linkDetails, expectedTextOrHtmlContent, done, outletId) {
            outletId = outletId || 'outletA';
            console.group('test: ' + linkDetails.href)
            
            let callback = function (event) {
                console.log('outlet updated: ' + event.target.id + '-----' + event.target.innerText);
                if (!outletId || outletId === event.target.id) {
                if (expectedTextOrHtmlContent instanceof Function)
                    expectedTextOrHtmlContent(event.target);
                else
                    expect(event.target.innerHTML).to.contains(expectedTextOrHtmlContent);
                document.body.removeEventListener("onOutletUpdated", callback);
                console.log('call done for ' + linkDetails.href);
                console.groupEnd();
                done && done();
                }
            };

            document.body.addEventListener("onOutletUpdated", callback);
            
            click(linkDetails);
        };

        var clickAndNotHandle = function(linkDetails, done) {
            console.group('test: ' + linkDetails.href);

            let clickCallback = (event) => {
                window.removeEventListener('click', clickCallback);
                event.preventDefault();
            };
            window.addEventListener('click', clickCallback, false);
            
            let notHandledCallback = function (event) {
                document.body.removeEventListener("onRouteNotHandled", notHandledCallback);
                console.log('route not handled: ' + linkDetails.href);
                console.log('call done for ' + linkDetails.href);
                console.groupEnd();
                done && done();
            }
            document.body.addEventListener("onRouteNotHandled", notHandledCallback);

            click(linkDetails);
        };

        describe('link state', function() {
        it('link should be active for routes', function(done){
            let link1 = document.createElement('a');
            document.body.appendChild(link1);
            link1.href = 'nested/webcomponent_nested';
            let link2 = document.createElement('a');
            document.body.appendChild(link2);
            link2.href = 'nested2/webcomponent_nested';
            RouterElement.registerLinks([link1, link2], 'active');
            link1.click();
            clickAndTest({ href: "nested/webcomponent_nested" }, 'Test Element', () => {
                expect(link1.className).to.equal('active');
                expect(link2.className).to.equal('');
                link1.remove();
                link2.remove();
                done();
            }, 'outletB');
        });

        it('link should be active for named outlet', function(done){
            let link1 = document.createElement('a');
            document.body.appendChild(link1);
            link1.href = '(myoutlet1:test-dummy(/components/a-wc-router/src/test-dummy.js))';
            let link2 = document.createElement('a');
            document.body.appendChild(link2);
            link2.href = '(myoutlet:tests-dummy(/components/a-wc-router/src/test-dummy.js))';
            RouterElement.registerLinks([link1, link2], 'active');

            let outletUpdateCallback = function (event) {
                window.removeEventListener("onLinkActiveStatusUpdated", outletUpdateCallback);
                setTimeout(() => NamedRouting.removeAssignment('myoutlet1'), 0);
                expect(link1.className).to.equal('active');
                expect(link2.className).to.equal('');
                link1.remove();
                link2.remove();
                done();
            };
            window.addEventListener("onLinkActiveStatusUpdated", outletUpdateCallback);

            click({ href: "(myoutlet1:test-dummy(/components/a-wc-router/src/test-dummy.js))" });
        });

        it('link should be active for named outlet with data', function(done){
            let link1 = document.createElement('a');
            document.body.appendChild(link1);
            link1.href = '(myoutlet1:test-dummy(/components/a-wc-router/src/test-dummy.js):param1=value1)';
            let link2 = document.createElement('a');
            document.body.appendChild(link2);
            link2.href = '(myoutlet1:test-dummy(/components/a-wc-router/src/test-dummy.js)):param1=value2';
            let link3 = document.createElement('a');
            document.body.appendChild(link3);
            link3.href = '(myoutlet1:test-dummy(/components/a-wc-router/src/test-dummy.js))';
            RouterElement.registerLinks([link1, link2, link3], 'active');

            let outletUpdateCallback = function (event) {
                window.removeEventListener("onLinkActiveStatusUpdated", outletUpdateCallback);
                setTimeout(() => NamedRouting.removeAssignment('myoutlet1'), 0);
                expect(link1.className).to.equal('active');
                expect(link2.className).to.equal('');
                expect(link3.className).to.equal('active');
                link1.remove();
                link2.remove();
                link3.remove();
                done();
            };
            window.addEventListener("onLinkActiveStatusUpdated", outletUpdateCallback);

            click({ href: "(myoutlet1:test-dummy(/components/a-wc-router/src/test-dummy.js):param1=value1)" });
        });

        it('link should be active for named routes', function(done){
            let link1 = document.createElement('a');
            document.body.appendChild(link1);
            link1.href = '(router-a-b:template2_nested)';
            let link2 = document.createElement('a');
            document.body.appendChild(link2);
            link2.href = '(router-a-b:template_nested)';
            RouterElement.registerLinks([link1, link2], 'active');
            click({ href: "nested/webcomponent_nested" });
            clickAndTest({ href: "(router-a-b:template_nested)" }, 'Hello Nested', () => {
            setTimeout(() => NamedRouting.removeAssignment('router-a-b'), 0);
            expect(link1.className).to.equal('');
            expect(link2.className).to.equal('active');
            link1.remove();
            link2.remove();
            done();
            }, 'outletB');
        });
        });

        describe('named outlets', function() {
            it('should show named outlet', function(done) {
                let outletUpdateCallback = function (event) {
                    document.body.removeEventListener("onOutletUpdated", outletUpdateCallback);
                    let content = document.querySelector("[name='myoutlet1']").innerHTML;
                    expect(content).to.contain('test-dummy');
                    done();
                };
                document.body.addEventListener("onOutletUpdated", outletUpdateCallback);
                click({ href: '(myoutlet1:test-dummy(/components/a-wc-router/src/test-dummy.js))'});
            });

            it('updates for clicked links', function(done) {
                clickAndTest({ href: "(myoutlet1:test-dummy(/components/a-wc-router/src/test-dummy.js):requiredParam=named outlet,testing)" }, 'Test Element named outlet,testing', done, 'myoutlet1');
            });

            it('should support convention based importing', function(done) {
                clickAndTest({ href: "(myoutlet1:/components/a-wc-router/src/test-dummy-two)" }, 'Test Element Two', done, 'myoutlet1');
            });
        });

        describe('named routers', function() {
            it('updates for clicked links', function(done) {
                click({ href: "nested/webcomponent_nested" });
                clickAndTest({ href: "(router-a-b:template_nested)" }, 'Hello Nested', () => {
                setTimeout(() => NamedRouting.removeAssignment('router-a-b'), 0);
                done();
                }, 'outletB');
            });
        });

        describe('routes-router', function () {
        describe('simple flat', function () {
            it('template based route works', function (done) {
            clickAndTest({ href: "template" }, 'Hello Template', done);
            });

            it('web component based route works with import', function (done) {
            clickAndTest({ href: "webcomponent" }, '<test-dummy><p>Test Element</p></test-dummy>', done);
            });

            it('nomatch should hit catch all', function (done) {
            clickAndTest({ href: "nomatch" }, 'catach all - NotFound2', done);
            });

            it('404 if no match and no catch all', function (done) {
            var route = document.getElementById('catch-all');
            route.setAttribute('path', 'other');
            clickAndTest(
                { href: "exception" },
                (outlet) => {
                expect(outlet.innerHTML).to.contain('404');
                route.setAttribute('path', '*');
                },
                done);
            });

            // TODO
            // it('only white listed routes should match', function (done) {
            //   var route = document.getElementById('catch-all');
            //   route.setAttribute('path', 'other');
            //   clickAndTest(
            //     { href: "exception" },
            //     (outlet) => {
            //       expect(outlet.innerHTML).to.contain('404');
            //       route.setAttribute('path', '*');
            //     },
            //     done);
            // });

            it('shouldn\'t handle different base urls', function (done) {
            clickAndNotHandle({ href: "/template" }, done);
            });

            it('absolute path should match', function (done) {
            clickAndTest({ href: "/components/a-wc-router/test/unit/template" }, 'Hello Template', done);
            });
        });

        describe('auxiliary routing', function(){
            it('Should route auxiliary', function(done) {
            let routerA = document.getElementById('router-a');
            let auxiliaryRouting = document.getElementById('auxiliary-routing').content.cloneNode(true);
            let i = 2;
            routerA.parentNode.insertBefore(auxiliaryRouting, routerA.nextSibling);
            let outletUpdateCallback = function (event) {
                console.log('outlet updated: ' + event.target.id + '-----' + event.target.innerText);
                expect(document.getElementById('router-a').innerText)
                    .to.contain('Hello Template');
                switch (event.target.id) {
                case 'main2_view1':
                    expect(document.getElementById('routerb').innerText)
                    .to.equal('Main View 1 Main2 View 1');
                    // document.getElementById('routerb').remove();
                    i--;
                    break;
                case 'sec_v2':
                    expect(document.getElementById('routerc').innerText)
                    .to.equal('Sec View 1 Sec2 View 1');
                    // document.getElementById('routerc').remove();
                    i--
                    break;
                }
                if(!i) {
                console.groupEnd();
                document.body.removeEventListener("onOutletUpdated", outletUpdateCallback);
                done();
                }
            };
            document.body.addEventListener("onOutletUpdated", outletUpdateCallback);
            click(
                { href: "(template)::main/(main_view1/10::main2_view1/99)::secondary/(sec_view1/54::secondary2_view1/43)" });
            });
        });
        
        describe('nested routes', function() {
            it('should match nested', function(done) {
            clickAndTest({ href: "nested/webcomponent_nested" }, '<test-dummy><p>Test Element</p></test-dummy>', done, 'outletB');
            });

            describe('with data', function() {
            it('should work with nested data', function(done){
                clickAndTest(
                { href: 'nested/nested2/value1/webcomponent-data2/value2' }, 
                'Test Element value2', 
                done,
                'outletC');
            });
            });
        });

        describe('data', function() {
            it('should require data', function(done) {
            clickAndTest(
                { href: 'webcomponent-data1/paramValue1' },
                '<test-dummy requiredparam="paramValue1"><p>Test Element paramValue1</p></test-dummy>',
                done);
            });

            it('supports optional data', function(done) {
            clickAndTest(
                { href: 'webcomponent-data2' },
                '<test-dummy optionalparam=""><p>Test Element</p></test-dummy>',
                done);
            });

            it('supports one or more data', function(done) {
            clickAndTest(
                { href: 'webcomponent-data3/paramValue1' },
                '<test-dummy atleastoneparam="paramValue1"><p>Test Element</p></test-dummy>',
                done);
            });

            it('supports zero or more data', function(done) {
            clickAndTest(
                { href: 'webcomponent-data4/paramValue1' },
                '<test-dummy anynumofparam="paramValue1"><p>Test Element</p></test-dummy>',
                done);
            });

            it('supports multiple data params', function(done) {
            clickAndTest(
                { href: 'webcomponent-data5/paramValue1/paramVlaue2' },
                '<test-dummy firstparam="paramValue1" secondparam="paramVlaue2"><p>Test Element</p></test-dummy>',
                done);
            });
        });

        describe('Route Caching', function() {
            it('will not update', function(done) {
            var check = function() {
                clickAndTest(
                { href: 'nested/nested2/value1/webcomponent-data2/value2' },
                function(outlet){ 
                    expect(outlet.getAttribute('test')).to.equal('123');
                },
                done,
                'outletC');
                };
            clickAndTest(
                { href: 'nested/nested2/value1/webcomponent-data2/value3' },
                function(outlet){
                    outlet.setAttribute('test', '123');
                },
                check,
                'outletC');
            });

            it('will update', function(done) {
            var check = function() {
                clickAndTest(
                { href: 'nested/nested2/value1/webcomponent-data2/value2' }, 
                function(outlet){ expect(outlet.getAttribute('test')).not.equal('123'); }, 
                done,
                'outletC');
                };
            clickAndTest(
                { href: 'nested/nested2/value2/webcomponent-data2/value3' }, 
                function(outlet){ outlet.setAttribute('test', '123'); }, 
                check,
                'outletC');
            });
        });

        describe('Route Guards', function() {
            it('will not leave', function(done) {
            var check = function() {
                let routeLeaveCallback = function(event) {
                    document.body.removeEventListener('onRouteLeave', routeLeaveCallback);
                    event.preventDefault();
                    let routeCancelledCallback = function(event) {
                        document.body.removeEventListener('onRouteCancelled', routeCancelledCallback);
                        console.groupEnd();
                        done();
                    };
                    document.body.addEventListener('onRouteCancelled', routeCancelledCallback);
                };
                document.body.addEventListener('onRouteLeave', routeLeaveCallback);
                clickAndTest(
                { href: 'nested/nested2/value2/webcomponent-data2/value2' }, 
                function(outlet){ }, 
                done,
                'outletC');
                };
            clickAndTest(
                { href: 'nested/nested2/value1/webcomponent-data2/value3' }, 
                function(outlet){ outlet.setAttribute('test', '123'); }, 
                check,
                'outletC');
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
            clickAndTest({ href: 'template' }, 'Only hit if template route cancelled', done);
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

        mocha.run();
    }
}

window.customElements.define('end-to-end', End2EndElement);