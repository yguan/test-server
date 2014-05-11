/*global require, module */

var Datastore = require('nedb');

function repository(config) {
    this.db = new Datastore({
        filename: config.databaseDirectory + config.databaseName + '.txt',
        autoload: true
    });
}

repository.prototype.add = function (data, callback) {
    this.db.insert(data, callback);
};

repository.prototype.remove =  function (data, callback) {
    this.db.remove(data, { multi: true }, callback);
};

repository.prototype.find = function (data, callback) {
    this.db.find(data, callback);
};

module.exports = repository;