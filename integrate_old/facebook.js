'use strict';
/**
 * Created by tpineau
 *
 */

var async = require("async");
var urlparse = require('url').parse;
var tools = require('./tools.js');

function getURL(db, col, target, callback) {
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
                            var about = item.about;
                            var website = item.website;
                            tools.findAllUrls([website, about, description], function (err, urls) {
                                async.each(
                                    urls,
                                    function (url, cbUrl) {
                                        var type = 'page'; if (obj.type === 'places'){type = 'place';}
                                        var result = {
                                            _id: 'facebook;' + obj.type + ';' + obj.keywords + ';' + item.id + ';' + url,
                                            url: url,
                                            hostname: urlparse(url).hostname,
                                            keywords: obj.keywords,
                                            date: obj.date,
                                            platform: 'facebook',
                                            type: type,
                                            info: {
                                                id: item.id,
                                                name: item.name,
                                                location: item.location,
                                                phone: item.phone,
                                                url: item.link
                                            },
                                            integrate: 0
                                        };
                                        db.collection(col).insert(result, function (err) {
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
