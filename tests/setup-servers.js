/*global require */

var restify = require('restify'),
    testServer = require('../lib/new-server'),
    serverMode = require('../lib/server-mode'),
    targetServerPort = 9005,
    targetServerUrl = 'http://localhost:' + targetServerPort;

function createTargetServer() {
    function respond(req, res, next) {
        console.log('actual server: respond is called');
        res.send('hello ' + req.params.name);
        next();
    }

    function send(req, res, next) {
        console.log('actual server: send is called');
        res.send(201, 'hello ' + req.params.name);
        return next();
    }

    var server = restify.createServer({
        name: 'myapp',
        version: '1.0.0'
    });
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    server.get('/hello/:name', respond);
    server.head('/hello/:name', respond);
    server.post('/post', send);

    server.listen(targetServerPort, function () {
        console.log('%s target server listening at %s', server.name, server.url);
    });
}

function createTestServer() {
    testServer.createServer({
        serverMode: serverMode.active,
        port: 9006,
        targetServerUrl: targetServerUrl,
        databaseDirectory: 'C:\\Users\\coding\\Documents\\GitHub\\test-server\\db-files\\'
    });
}
createTargetServer();
createTestServer();

// test: http://localhost:9006/hello/some


