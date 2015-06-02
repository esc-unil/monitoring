'use strict';
/**
 * Created by tpineau
 *
 */

var async = require("async");
var urlparse = require('url').parse;
var tools = require('./tools.js');

function getURL(db, col, target, callback) {
    db.collection('reddit').find(target).toArray(function (err, res) {
        if (err) {callback(err);}
        else {
            async.eachSeries(
                res,
                function (obj, cbObj) {
                    db.collection('reddit').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
                    var title = obj.result.title;
                    var text = obj.result.selftext;
                    tools.findAllUrls([title, text], function (err, urls){
                        async.each(
                            urls,
                            function(url, cbUrl){
                                //-------------

                                var hostname = urlparse(url).hostname;
                                var id = 'reddit;' + obj.type + ';' + obj.result.name + ';' + hostname;
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
                                                platform: 'reddit',
                                                type: obj.type,
                                                info: {
                                                    date: obj.result.created,
                                                    id: obj.result.name,
                                                    author: obj.result.author,
                                                    subreddit:obj.result.subreddit,
                                                    url: obj.result.url
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


                                //-----------------
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