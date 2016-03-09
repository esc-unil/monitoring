'use strict';
/**
 * Created by tpineau
 *
 */

var request = require('request');
var htmlparser = require("htmlparser");
var http = require('http');
var https = require('https');


function headersNbody(hostname, callback){
    var url = 'http://' + hostname;
    var options = {
        method: "GET",
        url: url,
        followAllRedirects: true,
        timeout: 20000,
        rejectUnauthorized: false,
        requestCert: true,
        pool:  new http.Agent({'maxSockets': Infinity}),
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0'
        }
    };
    request(options, function (err, res) {
        if (err) {
            callback(err, null, null)
        } else {
            callback(null, res.headers, res.body);
        }
    }).setMaxListeners(0);
}

function body(hostname, callback){
    headersNbody(hostname, function(err, headers, body){callback(err, body);});
}

function headers(hostname, callback){
    headersNbody(hostname, function(err, headers, body){callback(err, headers);});
}

function dom(string, callback){ //parse le code source string -> json
    var handler = new htmlparser.DefaultHandler(function (err, dom) {
        if (err) {callback(err);}
        else {callback(null, dom)}
    }, { verbose: false, ignoreWhitespace: true });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(string);
}

function sslCertificate(options, callback) {
// retourne le certificat d'une page https. (options: {host, port}

    if (typeof(options) === 'string') {
        options = {host: options};
    }
    if (options.port === undefined) {
        options.port = 443;
    }
    if (options.method === undefined) {
        options.method = 'GET';
    }

    var req = https.request(options, function (res) {
        callback(res.connection.getPeerCertificate());
    });
    req.end();
}
exports.headersNbody = headersNbody;
exports.sslCertificate = sslCertificate;
exports.headers = headers;
exports.body = body;
//headersNbody('uvcvncvncvncvnbvcc6chcnil.ch', function (a,b,c) {console.log(JSON.stringify(c));});
//sslCertificate('unil.ch', function (err, res) {console.log(res)});

