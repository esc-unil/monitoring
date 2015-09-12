'use strict';
/**
 * Created by tpineau
 *
 */

var request = require('request');
var htmlparser = require("htmlparser");
var http = require('http');


function headersNbody(hostname, callback){
    var url = 'http://' + hostname;
    var options = {
        method: "GET",
        url: url,
        followAllRedirects: true,
        timeout: 10000,
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

function dom(string, callback){ //parse le code source string -> json
    var handler = new htmlparser.DefaultHandler(function (err, dom) {
        if (err) {callback(err);}
        else {callback(null, dom)}
    }, { verbose: false, ignoreWhitespace: true });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(string);
}

exports.headersNbody = headersNbody;


//headersNbody('uvcvncvncvncvnbvcc6chcnil.ch', function (a,b,c) {console.log(JSON.stringify(c));});
