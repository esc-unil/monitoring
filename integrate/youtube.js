'use strict';
/**
 * Created by tpineau
 *
 * remarque: pas d'information sur l'auteur avec l'API youtube
 */

var async = require("async");
var urlparse = require('url').parse;
var tools = require('./tools.js');

function getURL(db, col, target, callback) {
    db.collection('youtube').find(target).toArray(function (err, res) {
        if (err) {callback(err);}
        else {
            async.eachSeries(
                res,
                function (obj, cbObj) {
                    db.collection('youtube').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
                    var title = obj.result.snippet.title;
                    var description = obj.result.snippet.description;
                    tools.findAllUrls([title, description], function (err, urls){
                        async.each(
                            urls,
                            function(url, cbUrl){
                                var hostname = urlparse(url).hostname;
                                var id = 'youtube;' + obj.type + ';' + obj.result.id.videoId + ';' + hostname;
                                db.collection(col).find({_id:id}).toArray(function (err, elem) {
                                    if (err) cbUrl();
                                    else {
                                        elem = elem[0];
                                        if (elem === undefined){ // pas encore le hostname/type
                                            var result = {
                                                _id: id,
                                                urls: [url],
                                                hostname: hostname,
                                                keywords: [obj.keywords],
                                                date: obj.date,
                                                platform: 'youtube',
                                                type: obj.type,
                                                info: {
                                                    date: obj.result.snippet.publishedAt,
                                                    id: obj.result.id.videoId
                                                },
                                                integrate: 0
                                            };
                                            db.collection(col).insert(result, function(err){cbUrl();});
                                        }
                                        else { //mise a jour pour le hostname/type
                                            var add = {$addToSet: {urls: url, keywords: obj.keywords}};
                                            db.collection(col).update({_id: id}, add, function(err){cbUrl();});
                                        }
                                    }
                                });
                            },
                            function(err){cbObj();}
                        );
                    });
                },
                function (err) {callback(err);}
            );
        }
    });
}

exports.getURL = getURL;
