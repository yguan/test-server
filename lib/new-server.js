/*global require */

//http://greim.github.io/hoxy/#response-population

var hoxy = require('hoxy');

function createRequestCache(req, resp) {
    var request = {
        key: JSON.stringify({
            url: req.url,
            body: req.string
        })
    };
    if (resp) {
        request.res = {
//            headers: resp.headers,
            data: resp.string
        };
    }
    return request;
}

function onRequest(req, resp, cacheManager, isInActiveMode) {
    if (isInActiveMode) {
        cacheManager.find(createRequestCache(req), function (err, results) {
            if (results.length > 0) {
                // The response is now populated so the
                // server call is skipped. Status code will
                // default to 200.
                // resp.statusCode = 200;
                resp.string = JSON.parse(results[0].res.data);
            }
        });
    }
}

function onResponse(req, resp, cacheManager) {
    cacheManager.add(createRequestCache(req, resp));
}
/**
 * Creates the test server.
 *
 * Examples:
 *
 *    testServer.createServer({ .. }, 8000)
 *    // => '{ web: [Function], ws: [Function] ... }'
 *
 * @param {Object} config Config object passed to the server
 * @param {number} config.serverMode The server mode.
 * @param {number} config.port The port that test server listens to.
 * @param {string} config.targetServerUrl The url to the server that test server acts as proxy.
 * @param {string} config.databaseDirectory The directory that test server to store its database files.
 *
 * @return {Object} server Test server object
 *
 * @api public
 */
function createServer(config) {
    var proxy = new hoxy.Proxy({
            reverse: config.targetServerUrl
        }).listen(config.port),
        cacheManager = require('./cache-manager'),
        serverMode = require('./server-mode'),
        isInActiveMode = config.serverMode === serverMode.active,
        server;

    cacheManager.init(config);

    proxy.intercept({
        phase: 'request',
        as: 'string'
    }, function (req, resp) {
        onRequest(req, resp, cacheManager, isInActiveMode);
    });

    proxy.intercept({
        phase: 'response',
        as: 'string'
    }, function (req, resp) {
        onResponse(req, resp, cacheManager);
    });

    console.log("listening on port " + config.port);
}

module.exports = {
    createServer: createServer
};
