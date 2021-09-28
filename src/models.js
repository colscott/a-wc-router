export {};
/**
 * @typedef {Object} RouterMatch
 * @property {Object} data
 * @property {string} redirect
 * @property {string} url
 * @property {boolean} useCache
 * @property {string} remainder
 */

/**
 * @typedef {Object} NamedRoutingHandler
 * @property {(url: string) => Promise<void>} processNamedUrl
 * @property {() => string} getName
 * @property {(url: string) => boolean} canLeave
 */
