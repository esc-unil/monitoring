'use strict';
/**
 * Created by tpineau
 *
 */

var request = require('request');
var htmlparser = require("htmlparser");



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

function dom(string, callback){
    var handler = new htmlparser.DefaultHandler(function (err, dom) {
        if (err) {callback(err);}
        else {callback(null, dom)}
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(string);
}

sourceCode('http://unil.ch/index.html', function (err,res){
    var domtree = {name: '/'};
    dom(res, function(err, document){
        tree(document, domtree);

        console.log(JSON.stringify(domtree));
    });

});



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