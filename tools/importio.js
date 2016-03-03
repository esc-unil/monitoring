'use strict';
/**
 * Created by tpineau
 */

var querystring = require('querystring');
var request = require('request');
var extend = require('extend');
var fs =require('fs');

function connector(id, url, user, apikey){
    var query = 'https://api.import.io/store/connector/' + id + '/_query?input=webpage/url:' + url + "&_user=" + user + "&_apikey=" + apikey;
    request(query, function (err, response) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(JSON.stringify(response));
        }
    });
    console.log(query);

}

connector('', '', '', '');

