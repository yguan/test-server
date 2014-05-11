/*global require, module */

var repositoryFactory = require('./repository-factory'),
    serverMode = require('./server-mode'),
    requestWithResponseDbName = 'request-response',
    requestOnlyDbName = 'request-only',
    requestWithResponseRepo,
    requestOnlyRepo,
    mode;

function isInPassiveMode () {
    return mode === serverMode.passive;
}

function createRequestDbObject (request) {
    return {
        key: JSON.stringify(request)
    };
}

function init (config) {
    mode = config.serverMode;

    requestWithResponseRepo = repositoryFactory.createRepository({
        databaseDirectory: config.databaseDirectory,
        databaseName: requestWithResponseDbName
    });

    requestOnlyRepo = repositoryFactory.createRepository({
        databaseDirectory: config.databaseDirectory,
        databaseName: requestOnlyDbName
    });
}

module.exports = {
    init: init,
    add: function (request, callback) {
        requestWithResponseRepo.add(request, callback);
        if (isInPassiveMode()) {
            requestOnlyRepo.add(request);
        }
    },
    remove: function (request, callback) {
        requestWithResponseRepo.remove(request, callback);
    },
    find: function (request, callback) {
        requestWithResponseRepo.find(request, callback);
    }
};