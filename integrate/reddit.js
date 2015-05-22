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
            async.eachLimit(
                res,
                200,
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
                                var result = {
                                    _id: 'reddit;' + obj._id + ';' + url,
                                    url: url,
                                    hostname: urlparse(url).hostname,
                                    keywords: obj.keywords,
                                    date: obj.date,
                                    platform: 'reddit',
                                    type: obj.type,
                                    info: {
                                        id: obj.result.name,
                                        author: obj.result.author,
                                        date: obj.result.created,
                                        subreddit:obj.result.subreddit,
                                        url: obj.result.url
                                    },
                                    integrate: 0
                                };
                                db.collection(col).insert(result, function (err) {
                                    cbUrl();
                                })
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