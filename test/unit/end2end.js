/* eslint-disable no-console */
/* globals expect,describe,afterEach,it */
import { NamedRouting } from '../../src/named-routing.js';
import { RouterElement } from '../../src/routes-router.js';
import '../../src/routes-route.js';
import '../../src/routes-outlet.js';

const testDelay = 100;
/** Web Component be be used by suite of end to end tests */
class End2EndElement extends HTMLElement {
  /** Initialize */
  connectedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  /** Set up HTML for tests */
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
                <a-route id="catch-all" path='*'><template>catch all - NotFound1</template></a-route>
              </a-route>
            </template>
          </a-route>
          <a-route path="/webcomponent-data1/:requiredParam" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data2/:optionalParam?" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data3/:atLeastOneParam+" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data4/:anyNumOfParam*" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route path="/webcomponent-data5/:firstParam/:secondParam/:.thirdparam" import='/base/test/assets/test-dummy.js' element="test-dummy"></a-route>
          <a-route id="catch-all" path='*'><template>catch all - NotFound2</template></a-route>
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
document.body.appendChild(document.createElement('end-to-end'));

/**
 * @param {HTMLAnchorElement} link
 * @returns resulting navigate event
 */
function fireNavigate(link) {
  const navigateEvent = new CustomEvent('navigate', {
    detail: {
      href: link,
      onNavigated: undefined,
    },
  });
  window.dispatchEvent(navigateEvent);
  return navigateEvent;
}

/**
 * @param {string|HTMLAnchorElement|{ href: string }} href url or link to click and navigate to
 * @param {() => void} [done]
 * @returns {Promise<void>} onNavigated promise of the navigate event
 */
function click(href, done) {
  let link = href instanceof HTMLAnchorElement ? href : undefined;
  let removeLink = false;
  if (!link) {
    link = /** @type {HTMLAnchorElement} */ (document.createElement('A'));
    link.href = typeof href === 'string' ? href : href.href;
    document.body.appendChild(link);
    removeLink = true;
  }
  const navEvent = fireNavigate(link);
  console.info(navEvent.detail.onNavigated, link.href, link);
  return navEvent.detail.onNavigated.then(() => {
    removeLink && link.remove();
    done && done();
    return navEvent.detail.onNavigated;
  });
}

/**
 * @param {{ href: string }} linkDetails to navigate to
 * @param {string|((HTMLElement) => void)} expectedTextOrHtmlContent to test is present
 * @param {'myoutlet1'|'outletA'|'outletB'|'outletC'} outletId of the outlet that will be updated bu the navigation
 * @param {() => void} [done]
 * @returns {Promise<void>}
 */
function clickAndTest(linkDetails, expectedTextOrHtmlContent, outletId, done) {
  const _outletId = outletId || 'outletA';
  console.group(`test: ${linkDetails.href}`);

  /** @type {Promise<void>} */
  let onNavigated = null;

  /** @param {CustomEvent} event */
  function callback(event) {
    const target = event.target instanceof HTMLElement && event.target;
    document.body.removeEventListener('onOutletUpdated', callback);
    console.info(`callback for ${linkDetails.href}`);
    console.info(`outlet updated: ${target.id}-----${target.innerText}`);
    if (!_outletId || _outletId === target.id) {
      if (expectedTextOrHtmlContent instanceof Function) {
        expectedTextOrHtmlContent(event.target);
      } else {
        expect(target.innerHTML).toContain(expectedTextOrHtmlContent);
      }
    }
  }

  document.body.addEventListener('onOutletUpdated', callback);

  onNavigated = click(linkDetails, done).then(event => {
    document.body.removeEventListener('onOutletUpdated', callback);
    console.info(`call done for ${linkDetails.href}`);
    console.groupEnd();
  });

  return onNavigated;
}

/**
 * @param {{href: string}} linkDetails
 * @param {() => void} [done]
 * @returns {Promise<void>}
 */
function clickAndNotHandle(linkDetails, done) {
  console.info(`clickAndNotHandle: ${linkDetails.href}`);
  const clickCallback = /** @param {Event} event */ event => {
    window.removeEventListener('click', clickCallback);
    event.preventDefault();
  };
  window.addEventListener('click', clickCallback, false);

  let notHandled = false;
  const notHandledCallback = /** @param {Event} event */ event => {
    notHandled = true;
  };
  document.body.addEventListener('onRouteNotHandled', notHandledCallback);

  return click(linkDetails).then(() => {
    document.body.removeEventListener('onRouteNotHandled', notHandledCallback);
    expect(notHandled).toBe(true);
    console.info(`route not handled: ${linkDetails.href}`);
    console.info(`call done for ${linkDetails.href}`);
    done && done();
  });
}

afterEach(done => setTimeout(done, testDelay));

describe('link state', () => {
  it('link should be active for nested routes', async () => {
    const link1 = document.createElement('a');
    link1.href = 'nested/webcomponent_nested';
    document.body.appendChild(link1);

    const link2 = document.createElement('a');
    link2.href = 'nested2/webcomponent_nested';
    document.body.appendChild(link2);

    await RouterElement.registerLinks([link1, link2], 'active');

    let onLinkActiveStatusUpdated = 0;
    // eslint-disable-next-line require-jsdoc
    const handler = () => {
      onLinkActiveStatusUpdated += 1;
    };

    window.addEventListener('onLinkActiveStatusUpdated', handler);
    await click(link1);
    expect(link1.className).toEqual('active');
    expect(link2.className).toEqual('');
    console.info(`There are ${document.querySelectorAll('a').length} links`);
    expect(onLinkActiveStatusUpdated).toBeGreaterThan(0);
    link1.remove();
    link2.remove();
    window.removeEventListener('onLinkActiveStatusUpdated', handler);
  });

  it('link should be active for named outlet', () => {
    const link1 = document.createElement('a');
    document.body.appendChild(link1);
    link1.href = '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js))';
    const link2 = document.createElement('a');
    document.body.appendChild(link2);
    link2.href = '(myoutlet:tests-dummy(/base/test/assets/test-dummy.js))';
    RouterElement.registerLinks([link1, link2], 'active');

    let linkStatusesUpdate = false;
    // eslint-disable-next-line require-jsdoc
    const onLinkActiveStatusUpdatedCallback = event => {
      linkStatusesUpdate = true;
    };
    window.addEventListener('onLinkActiveStatusUpdated', onLinkActiveStatusUpdatedCallback);

    return click({ href: '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js))' }).then(() => {
      window.removeEventListener('onLinkActiveStatusUpdated', onLinkActiveStatusUpdatedCallback);
      NamedRouting.removeAssignment('myoutlet1');
      expect(linkStatusesUpdate).toBe(true);
      expect(link1.className).toEqual('active');
      expect(link2.className).toEqual('');
      link1.remove();
      link2.remove();
    });
  });

  it('link should be active for named outlet with data', () => {
    const link1 = document.createElement('a');
    document.body.appendChild(link1);
    link1.href = '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js):param1=value1)';
    const link2 = document.createElement('a');
    document.body.appendChild(link2);
    link2.href = '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js)):param1=value2';
    const link3 = document.createElement('a');
    document.body.appendChild(link3);
    link3.href = '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js))';
    RouterElement.registerLinks([link1, link2, link3], 'active');

    let linkStatusesUpdate = false;
    // eslint-disable-next-line require-jsdoc
    const outletUpdateCallback = event => {
      linkStatusesUpdate = true;
    };
    window.addEventListener('onLinkActiveStatusUpdated', outletUpdateCallback);

    return click({ href: '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js):param1=value1)' }).then(() => {
      window.removeEventListener('onLinkActiveStatusUpdated', outletUpdateCallback);
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

  it('link should be active for named routes', () => {
    const link1 = document.createElement('a');
    document.body.appendChild(link1);
    link1.href = '(router-a-b:template2_nested)';
    const link2 = document.createElement('a');
    document.body.appendChild(link2);
    link2.href = '(router-a-b:template_nested)';
    RouterElement.registerLinks([link1, link2], 'active');
    return click({ href: 'nested/webcomponent_nested' }).then(() => {
      return clickAndTest({ href: '(router-a-b:template_nested)' }, 'Hello Nested', 'outletA').then(() => {
        NamedRouting.removeAssignment('router-a-b');
        expect(link1.className).toEqual('');
        expect(link2.className).toEqual('active');
        link1.remove();
        link2.remove();
      });
    });
  });
});

describe('named outlets', () => {
  it('should show named outlet', () => {
    return click({ href: '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js))' }).then(() => {
      const content = document.querySelector("[name='myoutlet1']").innerHTML;
      expect(content).toContain('test-dummy');
    });
  });

  it('updates for clicked links', () => {
    return clickAndTest(
      { href: '(myoutlet1:test-dummy(/base/test/assets/test-dummy.js):requiredParam=named outlet,testing)' },
      'Test Element named outlet,testing',
      'myoutlet1',
    );
  });

  it('should support convention based importing', () => {
    return clickAndTest({ href: '(myoutlet1:/base/test/assets/test-dummy-two)' }, 'Test Element Two', 'myoutlet1');
  });
});

describe('named routers', () => {
  it('updates for clicked links', async () => {
    await click({ href: 'nested/webcomponent_nested' });
    await clickAndTest({ href: '(router-a-b:template_nested)' }, 'Hello Nested', 'outletB');
    NamedRouting.removeAssignment('router-a-b');
  });
});

describe('routes-router', () => {
  describe('simple flat', () => {
    it('template based route works', () => clickAndTest({ href: 'template' }, 'Hello Template', 'outletA'));

    it('web component based route works with import', () =>
      clickAndTest({ href: 'webcomponent' }, '<test-dummy><p>Test Element</p></test-dummy>', 'outletA'));

    it('nomatch should hit catch all', () => clickAndTest({ href: 'nomatch' }, 'catch all - NotFound2', 'outletA'));

    it('404 if no match and no catch all', () => {
      const route = document.getElementById('catch-all');
      route.setAttribute('path', 'other');
      return clickAndTest({ href: 'exception' }, '404', 'outletA').then(() => {
        route.setAttribute('path', '*');
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

    it('absolute path should match', () => clickAndTest({ href: '/myapp/template' }, 'Hello Template', 'outletA'));

    it("shouldn't handle different base urls", () => {
      return clickAndNotHandle({ href: '/myotherapp/template' });
    });
  });

  describe('auxiliary routing', () => {
    it('Should route auxiliary', async () => {
      const routerA = document.getElementById('router-a');
      // @ts-ignore
      const auxiliaryRouting = document.getElementById('auxiliary-routing').content.cloneNode(true);
      routerA.parentNode.insertBefore(auxiliaryRouting, routerA.nextSibling);
      await click({
        href: '(template)::main/(main_view1/10::main2_view1/99)::secondary/(sec_view1/54::secondary2_view1/43)',
      }).then(() => {
        expect(document.getElementById('router-a').innerText).toContain('Hello Template');
        const routerB = document.getElementById('routerb');
        expect(routerB.innerText).toContain('Main View 1 Main2 View 1');
        const routerC = document.getElementById('routerc');
        expect(routerC.innerText).toContain('Sec View 1 Sec2 View 1');
        routerB.parentNode.removeChild(routerB);
        routerC.parentNode.removeChild(routerC);
      });
    });
  });

  describe('nested routes', () => {
    it('should match nested', () =>
      clickAndTest({ href: 'nested/webcomponent_nested' }, '<test-dummy><p>Test Element</p></test-dummy>', 'outletB'));

    describe('with data', () => {
      it('should work with nested data', () =>
        clickAndTest({ href: 'nested/nested2/value1/webcomponent-data2/value2' }, 'Test Element value2', 'outletC'));
    });
  });

  describe('data', () => {
    it('should require data', () =>
      clickAndTest(
        { href: 'webcomponent-data1/paramValue1' },
        '<test-dummy requiredparam="paramValue1"><p>Test Element paramValue1</p></test-dummy>',
        'outletA',
      ));

    it('supports optional data', () =>
      clickAndTest(
        { href: 'webcomponent-data2' },
        '<test-dummy optionalparam=""><p>Test Element</p></test-dummy>',
        'outletA',
      ));

    it('supports one or more data', () =>
      clickAndTest(
        { href: 'webcomponent-data3/paramValue1' },
        '<test-dummy atleastoneparam="paramValue1"><p>Test Element</p></test-dummy>',
        'outletA',
      ));

    it('supports zero or more data', () =>
      clickAndTest(
        { href: 'webcomponent-data4/paramValue1' },
        '<test-dummy anynumofparam="paramValue1"><p>Test Element</p></test-dummy>',
        'outletA',
      ));

    it('supports multiple data params', () =>
      clickAndTest(
        { href: 'webcomponent-data5/paramValue1/paramVlaue2/paramValue3' },
        '<test-dummy firstparam="paramValue1" secondparam="paramVlaue2"><p>Test Element</p></test-dummy>',
        'outletA',
      ));

    it('Supports setting data properties', () =>
      clickAndTest(
        { href: 'webcomponent-data5/paramValue1/paramVlaue2/paramValue3' },
        outlet => {
          const testDummy = outlet.querySelector('test-dummy');
          expect(testDummy.thirdparam).toEqual('paramValue3');
          expect(testDummy.getAttribute('firstParam')).toEqual('paramValue1');
          expect(testDummy.getAttribute('secondParam')).toEqual('paramVlaue2');
        },
        'outletA',
      ));
  });

  describe('Route Caching', () => {
    it('should use cache if url is same', async () => {
      await click({ href: 'nested/nested2/value1/webcomponent-data2/value3' });
      document.getElementById('outletC').setAttribute('test', '123');
      await clickAndTest(
        { href: 'nested/nested2/value1/webcomponent-data2/value2' },
        outlet => {
          expect(outlet.getAttribute('test')).toEqual('123');
        },
        'outletC',
      );
    });

    it('should not use cache if url is different', async () => {
      await click({ href: 'nested/nested2/value2/webcomponent-data2/value3' });
      const outletCBefore = document.getElementById('outletC');
      outletCBefore.setAttribute('test', '123');
      await click({ href: 'nested/nested2/value1/webcomponent-data2/value2' });
      const outletCAfter = document.getElementById('outletC');
      expect(outletCAfter).not.toEqual(outletCBefore);
      expect(outletCAfter.getAttribute('test')).not.toEqual('123');
    });
  });

  describe('Route Guards', () => {
    it('will not leave', done => {
      // eslint-disable-next-line require-jsdoc
      const check = () => {
        // eslint-disable-next-line require-jsdoc
        const routeLeaveCallback = event => {
          document.body.removeEventListener('onRouteLeave', routeLeaveCallback);
          event.preventDefault();
          // eslint-disable-next-line require-jsdoc
          const routeCancelledCallback = _ => {
            document.body.removeEventListener('onRouteCancelled', routeCancelledCallback);
            console.groupEnd();
          };
          document.body.addEventListener('onRouteCancelled', routeCancelledCallback);
        };
        document.body.addEventListener('onRouteLeave', routeLeaveCallback);
        clickAndTest({ href: 'nested/nested2/value2/webcomponent-data2/value2' }, outlet => {}, 'outletC').then(() =>
          done(),
        );
      };
      clickAndTest(
        { href: 'nested/nested2/value1/webcomponent-data2/value3' },
        outlet => {
          outlet.setAttribute('test', '123');
        },
        'outletC',
      ).then(() => check());
    });
  });

  describe('Router Events', () => {
    // it('should fire onRouterAdded', done => {
    // });
    // it('should fire onRouteCancelled', done => {
    // });
  });

  describe('Route Events', () => {
    // it('should fire onRouteLeave', done => {
    //   clickAndTest({ href: 'nested/template_nested' }, 'Hello Nested', done);
    // });

    it('should cancel match with onRouteMatch', async () => {
      const templateRoute = document.getElementById('template-route');
      // eslint-disable-next-line require-jsdoc
      const routeMatchedCallback = event => {
        templateRoute.removeEventListener('onRouteMatch', routeMatchedCallback);
        event.preventDefault();
      };
      templateRoute.addEventListener('onRouteMatch', routeMatchedCallback);
      await clickAndTest({ href: 'template' }, 'Only hit if template route cancelled', 'outletA');
    });
  });

  // describe('Outlet Events', () => {
  //   it('should match nested', done => {
  //     clickAndTest({ href: 'nested/template_nested' }, 'Hello Nested', done);
  //   });
  // });

  // describe('test hash routing', () => {
  //   it('should match', done => {
  //     clickAndTest({ href: 'nested/template_nested' }, 'Hello Nested');
  //   });
  // });
});

describe('routes-route', () => {
  describe('route matching', () => {
    // it('full matches', function () {
    // });
  });
});
