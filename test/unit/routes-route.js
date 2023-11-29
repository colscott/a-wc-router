/* eslint-disable no-console */
/* globals expect,describe,afterEach,it */
import { RouteElement } from '../../src/routes-route.js';

/** @returns {RouteElement} */
function createRouteElement() {
  return  /** @type {RouteElement} */(document.createElement('a-route'));
}

describe('routes-route', () => {
  it('match multi level pathname', async () => {
    const routeElement = createRouteElement();
    routeElement.setAttribute('path', '/a/b/:t?');
    expect(routeElement.match('/a/b').url).toBe('/a/b');
    expect(routeElement.match('/a/b/1').url).toBe('/a/b/1');
    expect(routeElement.match('/a/c')).toBeNull();
    expect(routeElement.match('/a/b/1/e/f').url).toBe('a/b/1');
    expect(routeElement.match('/a/b/1/e/f').remainder).toBe('e/f');
  });

  it('optional parameters', () => {
    const routeElement = createRouteElement();

    routeElement.setAttribute('path', '/a/b/:t?');
    expect(routeElement.match('/a/b').url).toBe('/a/b');
    expect(routeElement.match('/a/b/1').url).toBe('/a/b/1');

    routeElement.setAttribute('path', '/a/b/:t?/c/:v?');

    let result = routeElement.match('/a/b/3/c/4');
    expect(result.url).toBe('/a/b/3/c/4');
    expect(result.data).toEqual(new Map([['t', '3'], ['v', '4']]));
    
    result = routeElement.match('/a/b/3/c');
    expect(result.url).toBe('/a/b/3/c');
    expect(result.data).toEqual(new Map([['t', '3'], ['v', '']]));
    expect(routeElement.match('/a/b/c')).toBeNull();

    result = routeElement.match('/a/b/3/c/4/d/5');
    expect(result.url).toBe('a/b/3/c/4');
    expect(result.remainder).toBe('d/5');
    expect(result.data).toEqual(new Map([['t', '3'], ['v', '4']]));

    routeElement.setAttribute('fullMatch', '');
    result = routeElement.match('/a/b/3/c/4/d/5');
    expect(result).toBeNull();
  });

  it('required parameters', () => {
    const routeElement = createRouteElement();

    routeElement.setAttribute('path', '/a/b/:t');
    expect(routeElement.match('/a/b')).toBeNull();
    expect(routeElement.match('/a/b/1').url).toBe('/a/b/1');
    expect(routeElement.match('/a/b/1').data).toEqual(new Map([['t', '1']]));

    routeElement.setAttribute('path', '/a/b/:t/c/:v');

    let result = routeElement.match('/a/b/3/c/4');
    expect(result.url).toBe('/a/b/3/c/4');
    expect(result.data).toEqual(new Map([['t', '3'], ['v', '4']]));
    
    result = routeElement.match('/a/b/3/c');
    expect(result).toBeNull();
    expect(routeElement.match('/a/b/c')).toBeNull();

    result = routeElement.match('/a/b/3/c/4/d/5');
    expect(result.url).toBe('a/b/3/c/4');
    expect(result.remainder).toBe('d/5');
    expect(result.data).toEqual(new Map([['t', '3'], ['v', '4']]));
  });

  it('one or more parameters', () => {
    const routeElement = createRouteElement();

    routeElement.setAttribute('path', '/a/b/:t+');
    expect(routeElement.match('/a/b')).toBeNull();
    expect(routeElement.match('/a/b/1/2/3').url).toBe('/a/b/1/2/3');
    expect(routeElement.match('/a/b/1/2/3').data).toEqual(new Map([['t', '1/2/3']]));
  });

  it('any number of parameters', () => {
    const routeElement = createRouteElement();

    routeElement.setAttribute('path', '/a/b/:t*');
    let match = routeElement.match('/a/b');
    expect(match.url).toBe('/a/b');
    expect(match.data).toEqual(new Map([['t', '']]));
    match = routeElement.match('/a/b/1/2/3');
    expect(match.url).toBe('/a/b/1/2/3');
    expect(match.data).toEqual(new Map([['t', '1/2/3']]));
  });

  it('default parameter values', () => {
    const routeElement = createRouteElement();

    routeElement.setAttribute('path', '/a/b/:t?foobar');
    let match = routeElement.match('/a/b');
    expect(match.url).toBe('/a/b');
    expect(match.data).toEqual(new Map([['t', 'foobar']]));
    match = routeElement.match('/a/b/1');
    expect(match.url).toBe('/a/b/1');
    expect(match.data).toEqual(new Map([['t', '1']]));
  });
});
