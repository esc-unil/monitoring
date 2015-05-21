'use strict';
/**
 * Created by tpineau
 *
 */

var async = require("async");
var tools = require('./tools.js');

function getURL(db, target, callback) {
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
                    var title = obj.result.snippet.title;
                    var description = obj.result.snippet.description;
                    tools.findAllUrls([title, description], function (err, urls){
                        async.each(
                            urls,
                            function(url, cbUrl){
                                var result = {
                                    _id: 'reddit;' + obj._id + ';' + url,
                                    url: url,
                                    keywords: obj.keywords,
                                    date: obj.date,
                                    platform: 'reddit',
                                    type: obj.type,
                                    info: {
                                        id: obj.result.id.videoId,
                                        date: obj.result.snippet.publishedAt
                                    }
                                };
                                db.collection('urls').insert(result, function (err) {
                                    if (err) {console.log(err);}
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