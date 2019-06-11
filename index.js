/*
* Primary File for the API
*/
// Dependecies

var http = require('http');
var url = require('url'); // parse the url 
var StringDecoder = require('string_decoder').StringDecoder;

var server = http.createServer(function(req, res){

    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    var queryStringObject = parsedUrl.query;
    var method = req.method.toLowerCase(); //gets the http method in lowercase
    var headers = req.headers;


    var decoder = new StringDecoder('utf-8');
    // node works on stream - the  data comes in installments, so we need ot collect and coalesce
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    })
    req.on('end', function(){
        buffer += decoder.end();
        
        //Chosen handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        //construct data object to send to handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer             
        }

        //Route the request to handler chosen
        chosenHandler(data, function(statusCode, payload){
            //default status code and default payload
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
            payload = typeof(payload) === 'object' ? payload : {};

            //convert to string
            var payLoadString = JSON.stringify(payload);

            res.writeHead(statusCode);
            res.end(payLoadString)

            console.log('Request received with this payload', statusCode, payLoadString);
        });
    });
});

server.listen(3000, function(){
    console.log("The server is listening to the port 3000 now")
});
// Defining handlers to handle the requests as per the path, routed by the server
var handlers = {};

handlers.sample = function(data, callback){
    // callback http status code and payload

    callback(406, {'name': 'sample handler'});
};

handlers.notFound = function(data, callback){
    callback(404);
}

var router = {
    'sample': handlers.sample
}