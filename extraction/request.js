'use strict';
/**
 * Created by tpineau
 *
 */

var request = require('request');
var htmlparser = require("htmlparser");
var http = require('http');

function sourceCode(url, callback){
    var options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0'
        }
    };
    request(options, function (err, response, body) {
        if (err) {callback(err)}
        else {callback(null, body);}
    });
}

/*
function domStructure(xmlString, callback){
    var handler = new htmlparser.DefaultHandler(function (err, document) {
        if (err) {callback(err);}
        else {
            var domtree = {name: '/'};
            tree(document, domtree);
            console.log(JSON.stringify(domtree));
        }
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(xmlString);
}*/

function dom(string, callback){
    var handler = new htmlparser.DefaultHandler(function (err, dom) {
        if (err) {callback(err);}
        else {callback(null, dom)}
    }, { verbose: false, ignoreWhitespace: true });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(string);
}

/*

function tree(array, branch){
            var c = 0;
            if (array != undefined && array.length>0) {
                branch.contents = [];
                array.forEach(function (element, i){
                    if (element.name != undefined){
                        branch.contents.push({name: element.name});
                       if (element.children != undefined) {tree(element.children, branch.contents[i-c]);}
                    }
                    else {c++}
                });
            }
}
*/

function header(url, callback){
    var options = {
        method: "GET",
        url: url,
        followAllRedirects: true,
        timeout: 50000,
        rejectUnauthorized: false,
        requestCert: true,
        pool:  new http.Agent({'maxSockets': Infinity})
    };
    request(options, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.headers);
        }
    }).setMaxListeners(0);
}

header('http://unil.ch', function (a,b) {console.log(JSON.stringify(b));});

sourceCode('http://example.com', function (err,res){
    console.log(res);
    dom(res, function(a,b){console.log(JSON.stringify(b));})
});


