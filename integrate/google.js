'use strict';
/**
 * Created by tpineau
 */

var mongo = require('./../mongodb.js');
var async = require("async");

function getURL(callback) {
    mongo.find('google', {}, function (err, res) {
        if (err) {callback(err);}
        else {
            for (var i = 0; i < res.length; i++) {
                var obj = res[i];
                mongo.update('google', {_id:mongo.ObjectId(obj._id)}, {$set: {integrate:1}}, function(err){
                    if (err) console.log(obj._id, err);
                });
                for (var j=0; j < obj.result.length; j++){
                    var item = obj.result[j];
                    var result = {
                        url: item.link,
                        keywords: obj.keywords,
                        date: obj.date,
                        platform: 'google',
                        type: obj.type,
                        info:{
                            ranking:j+1
                        }
                    };
                    mongo.insert('urls', result, function (err){
                        if (err) {console.log(err);}
                    })
                }
            }
            callback(null);
        }
    });
}

exports.getURL = getURL;

