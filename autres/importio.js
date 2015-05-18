'use strict';
/**
 * Created by tpineau
 */

var request = require('request');
var keys = require('./../keys.json');

var user = keys.importioUser;
var apikey = keys.importioKey;

function importIO(api, webpage, callback){
    var url = "https://api.import.io/store/data/" + api + '/_query?input/webpage/url=' + webpage
        + "&_user=" + user + "&_apikey=" + apikey;
    var options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json'
        }
    };
    request(options, function (err, response, body) {
        if (err) {callback(err);}
        else {callback(null, JSON.parse(body).results);}
    })
}

importIO('e0beea36-aed2-4fbf-8f26-2b31951878e4', 'http://www.muscletalk.co.uk/Testosterone-Other-Steroids-f10.aspx', function(err,res){console.log(JSON.stringify(res));});


