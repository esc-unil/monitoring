'use strict';
/**
 * Created by tpineau
 *
 */

var async = require("async");
var tools = require('./tools.js');

function getURL(db, col, target, callback) {
    async.eachSeries(
        [getPost, getUsers],
        function (fct, cb){fct(db, col, target, cb);},
        function(err){callback(err);}
    );
}

function getPost(db, col, target, callback) {
    target.type = 'post';
    db.collection('twitter').find(target).toArray(function (err, res) {
        if (err) {callback(err);}
        else {
            async.eachLimit(
                res,
                200,
                function (obj, cbObj) {
                    db.collection('twitter').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
                    var urls = obj.result.entities.urls;
                    if (urls.length > 0) {
                        var list = [];
                        for (var i=0; i<urls.length; i++){list.push(urls[i].url);}
                        tools.findAllUrls(list, function (err, urls) {
                            async.each(
                                urls,
                                function (url, cbUrl) {
                                    var result = {
                                        _id: 'twitter;' + obj._id + ';' + url,
                                        url: url,
                                        keywords: obj.keywords,
                                        date: obj.date,
                                        platform: 'twitter',
                                        type: obj.type,
                                        info: {
                                            id: obj.result.id_str,
                                            author: obj.result.user.screen_name,
                                            author_id: obj.result.user.id_str,
                                            date: obj.result.created_date,
                                            lang : obj.result.lang
                                        }
                                    };
                                    db.collection(col).insert(result, function (err) {
                                        cbUrl();
                                    })
                                },
                                function (err) {cbObj();}
                            );
                        });
                    } else {cbObj();}
                },
                function (err) {callback(err);}
            );
        }
    });
}

function getUsers(db, col, target, callback) {
    target.type = 'users';
    db.collection('twitter').find(target).toArray(function (err, res) {
        if (err) {callback(err);}
        else {
            async.eachLimit(
                res,
                20,
                function (obj, cbObj) {
                    db.collection('twitter').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
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
                                            _id: 'twitter;' + obj.type + ';' + obj.keywords + ';' + item.id_str + ';' + url,
                                            url: url,
                                            keywords: obj.keywords,
                                            date: obj.date,
                                            platform: 'twitter',
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

