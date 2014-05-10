var restify = require('restify');

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
    next();
}

var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});

//
//
//var Datastore = require('nedb'),
//    db = new Datastore({ filename: 'test.txt', autoload: true });
//
//var doc = { hello: 'world'
//    , n: 5
//    , today: new Date()
//    , nedbIsAwesome: true
//    , notthere: null
//    , notToBeSaved: undefined  // Will not be saved
//    , fruits: [ 'apple', 'orange', 'pear' ]
//    , infos: { name: 'nedb' }
//};
//
//db.insert(doc, function (err, newDoc) {   // Callback is optional
//    // newDoc is the newly inserted document, including its _id
//    // newDoc has no key called notToBeSaved since its value was undefined
//});