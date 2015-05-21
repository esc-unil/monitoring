'use strict';
/**
 * Created by tpineau
 *
 */

var async = require("async");
var tools = require('./tools.js');

function getURL(db, target, callback) {
    target.type = 'users';
    db.collection('facebook').find(target).toArray(function (err, res) {
        if (err) {callback(err);}
        else {
            async.eachLimit(
                res,
                20,
                function (obj, cbObj) {
                    db.collection('facebook').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
                    async.eachSeries(
                        obj.result,
                        function (item, cbItem) {
                            var description = item.description;
                            var website = item.url;
                            tools.findAllUrls([website, description], function (err, urls) {
                                async.each(
                                    urls,
                                    function (url, cbUrl) {
                                        var result = {
                                            _id: 'facebook;' + obj._id + ';' + url,
                                            url: url,
                                            keywords: obj.keywords,
                                            date: obj.date,
                                            platform: 'facebook',
                                            type: obj.type,
                                            info: {
                                                author: item.screen_name,
                                                author_id: item.id_str,
                                                date: new Date(item.created_at),
                                                location: item.location,
                                                timezone: item.time_zone,
                                                lang : item.lang
                                            }
                                        };
                                        db.collection('urls').insert(result, function (err) {
                                            cbUrl();
                                        })
                                    },
                                    function (err) {cbItem();}
                                );
                            });
                        },
                        function (err) {
                            if (err) {console.log(err);}
                            cbObj()
                        }
                    );
                },
                function (err) {callback(err);}
            );
        }
    });
}

exports.getURL = getURL;
