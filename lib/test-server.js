/*global require */

var http = require('http'),
    httpProxy = require('http-proxy'),
    extend = require('util')._extend;

function addBodyToRequest(req) {
    if (req.method == 'POST' || req.method == 'PUT') {
        req.body = '';

        req.addListener('data', function (chunk) {
            req.body += chunk;
        });

//        req.addListener('end', function() {
//            // req.body has full data
//            handler(req, res);
//        });
    }
}

function addListenerToResponseDataReady(req, res, handler) {
    res.oldWrite = res.write;
    res.write = function (data) {
        res.oldWrite(data);
        handler(req, data.toString('UTF8'));
    };
}

function createRequestCache(req, responseData) {
    var request = {
        url: req.url,
        body: req.body
    };
    if (responseData) {
        request.responseData = responseData;
    }
    return request;
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
 * @param {number} config.mode The server mode.
 * @param {number} config.port The port that test server listens to.
 * @param {string} config.targetServerUrl The url to the server that test server acts as proxy.
 * @param {string} config.databaseDirectory The directory that test server to store its database files.
 *
 * @return {Object} server Test server object
 *
 * @api public
 */
function createServer(config) {
    var proxy = httpProxy.createProxyServer({}),
        cacheManager = require('./cache-manager'),
        serverMode = require('./server-mode'),
        isInActiveMode = config.mode === serverMode.active,
        server;

    cacheManager.init(config);

    server = http.createServer(function (req, res) {

        addBodyToRequest(req);

        addListenerToResponseDataReady(req, res, function (request, responseData) {
            cacheManager.add(createRequestCache(request, responseData));
        });

        if (isInActiveMode) {
            cacheManager.find(createRequestCache(req), function () {
                proxy.web(req, res);
            });
            return;
        }

        proxy.web(req, res, {target: config.targetServerUrl});
    });

    /*
     * Listen for the event that is emitted when the request to the target got a response
     */
//    proxy.on('proxyRes', function (res) {
////            console.log(res);
////            console.log(Object.keys(response));
////            console.log(arguments)
////            cacheManager.add(res);
//    });

    console.log("listening on port " + config.port)
    server.listen(config.port);
}

module.exports = {
    createServer: createServer
};
