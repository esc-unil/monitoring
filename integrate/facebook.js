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
            async.eachSeries(
                res,
                function (obj, cbObj) {
                    async.each(
                        obj.result,
                        function (item, cbItem) {
                            var description = item.description;
                            var about = item.about;
                            var website = item.website;
                            tools.findAllUrls([website, about, description], function (err, urls) {
                                async.eachSeries(
                                    urls,
                                    function (url, cbUrl) {
                                        var hostname = urlparse(url).hostname;
                                        var result = {
                                            urls: url,
                                            hostname: hostname,
                                            keywords: obj.keywords,
                                            date: obj.date,
                                            platform: 'facebook',
                                            type: obj.type,
                                            source: obj._id,
                                            info: {
                                                id: item.id,
                                                name: item.name,
                                                location: item.location,
                                                phone: item.phone,
                                                url: item.link
                                            },
                                            integrate: 0
                                        };
                                        db.collection(col).insert(result, function(err){cbUrl();});
                                    },
                                    function (err) {cbItem();}
                                );
                            });
                        },
                        function (err) {
                            if (err) {console.log(err);}
                            db.collection('facebook').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                                if (err) console.log(obj._id, err);
                                cbObj()
                            });
                        }
                    );
                },
                function (err) {callback(err);}
            );
        }
    });
}

exports.getURL = getURL;
