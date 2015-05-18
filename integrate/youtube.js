'use strict';
/**
 * Created by tpineau
 *
 * remarque: pas d'information sur l'auteur avec l'API youtube
 */

var mongo = require('./../mongodb.js');
var mongoClient = require('mongodb').MongoClient;
var async = require("async");

function getURL(target, callback) {
    mongoClient.connect(mongo.mongoPath, function(err, db) {
        db.collection('youtube').find(target).toArray(function (err, res) {
            if (err) {
                callback(err);
            }
            else {
                async.eachLimit(
                    res,
                    20,
                    function (obj, cbObj) {
                        /*db.collection('youtube').update({_id: mongo.ObjectId(obj._id)}, {$set: {integrate: 1}}, function (err) {
                            if (err) console.log(obj._id, err);
                        });
                        */
                        var description = obj.result.id.description;
                        var result = {
                            url: obj.url,
                            keywords: obj.keywords,
                            date: obj.date,
                            platform: 'youtube',
                            type: obj.type,
                            info: {
                                id: obj.result.id.videoId,
                                date: obj.result.snippet.publishedAt,
                            }
                        };
                        db.collection('test').insert(result, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            cbObj();
                        })

                    },
                    function (err) {
                        db.close();
                        callback(err);
                    }
                );
            }
        });
    });
}

exports.getURL = getURL;

getURL({integrate:0}, function(err){console.log('done')});
