/*global require */

var unirest = require('unirest');

function testGet() {
    unirest.get('http://localhost:9006/hello/get-someone')
        .end(function (response) {
            console.log("test GET");
            console.log(response.body);
        });
}

function testPost() {
    unirest.post('http://localhost:9006/post')
        .headers({ 'Accept': 'application/json' })
        .send({ "name": "post-someone" })
        .end(function (response) {
            console.log("test POST");
            console.log(response.body);
        });
}

testGet();
testPost();