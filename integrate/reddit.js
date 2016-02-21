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
                    var title = obj.result.title;
                    var text = obj.result.selftext;
                    tools.findAllUrls([title, text], function (err, urls){
                        async.each(
                            urls,
                            function(url, cbUrl){
                                var hostname = urlparse(url).hostname;
                                var result = {
                                    urls: url,
                                    hostname: hostname,
                                    keywords: obj.keywords,
                                    date: obj.date,
                                    platform: 'reddit',
                                    type: obj.type,
                                    source: obj._id,
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
                            },
                            function(err){
                                db.collection('reddit').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                                    if (err) console.log(obj._id, err);
                                    cbObj();
                                });
                            }
                        );
                    });
                },
                function (err) {callback(err);}
            );
        }
    });
}

exports.getURL = getURL;
