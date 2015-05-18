'use strict';
/**
 * Created by tpineau
 */

var keys = require('./../keys.json');
var request = require('request');

function importIO(api, callback){
    var url = "https://api.import.io/store/data/" + api + "/_query?_user=" + keys.importioUser + "&_apikey=" + keys.importioKey;

    var options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json'
        }
    };


    request(options, function (err, response, body) {
        if (err) {callback(err);}
        else {callback(null,body);}
    })
}

importIO('4a1b21c6-22ce-452a-9b9f-e52b2ac33338', function(err,res){console.log(res);}) //ozironking