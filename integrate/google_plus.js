'use strict';
/**
 * Created by tpineau
 *
 */

var async = require("async");
var tools = require('./tools.js');
var urlparse = require('url').parse;

function getURL(db, col, target, callback) {
    async.eachSeries(
        [getPost, getUsers],
        function (fct, cb){fct(db, col, target, cb);},
        function(err){callback(err);}
    );
}

function getPost(db, col, target, callback) {
    target.type = 'post';
    db.collection('google_plus').find(target).toArray(function (err, res) {
        if (err) {callback(err);}
        else {
            async.eachSeries(
                res,
                function (obj, cbObj) {
                    var list = [obj.result.title, obj.result.object.content];
                    var attachments = obj.result.object.attachments;
                    if (attachments != undefined){ //fichiers joints au poste
                        for (var i=0; i<attachments.length; i++){
                            list.push(attachments[i].url);
                            list.push(attachments[i].displayName);
                            list.push(attachments[i].content);
                        }
                    }
                    tools.findAllUrls(list, function (err, urls) {
                        async.each(
                            urls,
                            function (url, cbUrl) {
                                var hostname = urlparse(url).hostname;
                                var result = {
                                    urls: url,
                                    hostname: hostname,
                                    keywords: obj.keywords,
                                    date: obj.date,
                                    platform: 'google_plus',
                                    type: obj.type,
                                    source: obj._id,
                                    info: {
                                        date: obj.result.published,
                                        id: obj.result.id,
                                        author: obj.result.actor.displayName,
                                        author_id: obj.result.actor.id,
                                        url : obj.result.url
                                    },
                                    integrate: 0
                                };
                                db.collection(col).insert(result, function(err){cbUrl();});
                            },
                            function (err) {
                                db.collection('google_plus').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
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

function getUsers(db, col, target, callback) {
    target.type = 'users';
    db.collection('google_plus').find(target).toArray(function (err, res) {
        if (err) {callback(err);}
        else {
            async.eachSeries(
                res,
                function (obj, cbObj) {
                    async.each(
                        obj.result,
                        function (item, cbItem) {
                            var  list =[item.aboutMe, item.displayName, item.tagline];
                            var links = item.urls;
                            if (links != undefined){for (var i=0; i<links.length; i++){list.push(links[i].value);}}
                            tools.findAllUrls(list, function (err, urls) {
                                async.eachSeries(
                                    urls,
                                    function (url, cbUrl) {
                                        var hostname = urlparse(url).hostname;
                                        var result = {
                                            urls: url,
                                            hostname: hostname,
                                            keywords: obj.keywords,
                                            date: obj.date,
                                            platform: 'google_plus',
                                            type: obj.type,
                                            source: obj._id,
                                            info: {
                                                name: item.displayName,
                                                id: item.id,
                                                url: item.url
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
                            db.collection('google_plus').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
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
