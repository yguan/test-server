/*global require */

var http = require('http'),
    httpProxy = require('http-proxy'),
    extend = require('util')._extend;

function addListenerToRequestBodyReady(req, onBodyReady) {
    if (req.method == 'POST' || req.method == 'PUT') {
        req.body = '';

        req.addListener('data', function (chunk) {
            req.body += chunk;
        });

        req.addListener('end', function () {
            // req.body has full data
            onBodyReady(req);
        });
    }
}

function overrideResponseWrite(res, processData) {
    res.oldWrite = res.write;
    res.write = function (data) {
        var newData = processData(data);
        res.oldWrite(newData);
    };
}

function overrideWriteHead(res) {
    // get response header
    // write it out
    res.oldWriteHead = res.writeHead;
    res.writeHead = function (statusCode, headers) {
        /* add logic to change headers here */
        var contentType = res.getHeader('content-type');
        res.setHeader('content-type', 'text/plain');

        // old way: might not work now
        // as headers param is not always provided
        // https://github.com/nodejitsu/node-http-proxy/pull/260/files
        // headers['foo'] = 'bar';

        res.oldWriteHead(statusCode, headers);
    }
}

function createRequestCache(req, res, responseData) {
    var request = {
        key: JSON.stringify({
            url: req.url,
            body: req.body
        })
    };
    if (responseData) {
        request.res = {
            headers: res.headers,
            data: JSON.stringify(responseData)
        };
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
    var proxy = httpProxy.createProxyServer({}),
        cacheManager = require('./cache-manager'),
        serverMode = require('./server-mode'),
        isInActiveMode = config.serverMode === serverMode.active,
        server;

    cacheManager.init(config);

    server = http.createServer(function (req, res) {

        var isCached = false;

        addListenerToRequestBodyReady(req, function (request) {
            if (isInActiveMode) {
                cacheManager.find(createRequestCache(request), function (err, results) {
                    console.log(results);
                    if (results.length > 0) {
                        isCached = true;
                        // todo: send the captured header with status code
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end(JSON.parse(results[0].res.data));
                    }
                });
            }
        });

        overrideResponseWrite(res, function (responseData) {
            if (!isCached) {
                console.log(responseData);
                cacheManager.add(createRequestCache(req, res, responseData.toString('UTF8')));
                return responseData;
            }

            return res.responseData;
        });

        setTimeout(function () {
            if (!isCached) {
                proxy.web(req, res, {target: config.targetServerUrl});
            }
        }, 10); // todo: Can this be eliminated? The timeout may need to be increase for actual case.
    });

    console.log("listening on port " + config.port);
    server.listen(config.port);
}

module.exports = {
    createServer: createServer
};
