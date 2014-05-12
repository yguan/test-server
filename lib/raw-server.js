/*global require */

var http = require('http');


function onRequest(client_req, client_res) {
    console.log(Object.keys(client_req));

    var options = {
        hostname: 'www.google.com',
        port: 80,
        path: client_req.url,
        method: 'GET'
    };

    var proxy = http.request(options, function (res) {
        res.pipe(client_res, {
            end: true
        });
    });

    client_req.pipe(proxy, {
        end: true
    });
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
    http.createServer(onRequest).listen(config.port);
}

module.exports = {
    createServer: createServer
};