'use strict';
/**
 * Created by tpineau
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


headersNbody('steroid.com/', function (err, headers, body) {
        if (err) {
            console.log(err); /////////////////////////////////////////////////////////////callback
        }
        else {
            dom(body, function (err, res) {
                if (err) {
                    console.log(err); /////////////////////////////////////////////////////////////callback
                }
                else {
                    var text = "";
                    var urls = "";
                    parse(res, text, urls);

                    //console.log(JSON.stringify(res));
                }

            });
        }
});

function parse(list, text, urls){
    list.forEach(function(element){
        if (element.type != "style" && element.type != "script" && element.type == "text"){
            text = text + " " + element.data;
        }
        else if (element.type != "style" && element.type != "script" && element.name == "meta"){
            if (element.attribs != undefined && element.attribs.content != undefined){
                text = text + " " + element.attribs.content;
            }
        }
        if (element.type != "style" && element.type != "script" && element.children != undefined){
            parse(element.children, text, urls);
        }
    });
    console.log(text);
}