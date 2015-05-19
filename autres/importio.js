'use strict';
/**
 * Created by tpineau
 */

var request = require('request');
var fs = require('fs');
var async = require('async');
var keys = require('./../keys.json');

var user = keys.importioUser;
var apikey = keys.importioKey;

function importCSV(api, webfile, csvfile){


}

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

function readFile(webfile){
    var urls = fs.readFileSync(webfile).toString('utf-8');
    urls = urls.split('\n');
    console.log(urls);
}

function writeCSV(filename, data){
    var keysList = Object.keys(data[0]);
    async.eachSeries(
        data,
        function(obj, cbObj){
            var line = '';
            async.eachSeries(
                keysList,
                function (item, cbItem){
                    if (typeof(obj[item]) === 'undefined' || obj[item] === '' ) {var element = '';}
                    else {var element = obj[item].replace('\s',' ').replace(';',':');}
                    line += element + ";";
                    cbItem();
                },
                function (err) {
                    if (err) {
                        cbObj();
                    }
                    else {
                        line = line.substring(0, line.length - 1)+'\n';
                        fs.appendFileSync(filename, line);
                        cbObj();
                    }
                }
            );
        },
    function(err){
        console.log(err);
    }
    )
}

//importIO('e0beea36-aed2-4fbf-8f26-2b31951878e4', 'http://www.muscletalk.co.uk/Testosterone-Other-Steroids-f10.aspx', function(err,res){console.log(JSON.stringify(res));});

//importIO('4015a606-36f0-41b7-92c4-f61cfa281cf5', 'https://drugs-forum.com/forum/forumdisplay.php?f=89', function(err,res){writeCSV('test.csv', res);});

//importCSV('4015a606-36f0-41b7-92c4-f61cfa281cf5', 'test.txt', 'test.csv');
