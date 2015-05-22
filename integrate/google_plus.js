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
            async.eachLimit(
                res,
                50,
                function (obj, cbObj) {
                    db.collection('google_plus').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
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
                                var result = {
                                    _id: 'google_plus;' + obj._id + ';' + url,
                                    url: url,
                                    hostname: urlparse(url).hostname,
                                    keywords: obj.keywords,
                                    date: obj.date,
                                    platform: 'google_plus',
                                    type: 'post',
                                    info: {
                                        id: obj.result.id,
                                        author: obj.result.actor.displayName,
                                        author_id: obj.result.actor.id,
                                        date: obj.result.published,
                                        url : obj.result.url
                                    },
                                    integrate: 0
                                };
                                if (url.indexOf('https://plus.google.com/') === -1) { // urls internes (non voulues)
                                    db.collection(col).insert(result, function (err) {
                                        cbUrl();
                                    });
                                } else {cbUrl();}
                            },
                            function (err) {cbObj();}
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
            async.eachLimit(
                res,
                20,
                function (obj, cbObj) {
                    db.collection('google_plus').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
                    async.eachSeries(
                        obj.result,
                        function (item, cbItem) {
                            var  list =[item.aboutMe, item.displayName, item.tagline];
                            var links = item.urls;
                            if (links != undefined){for (var i=0; i<links.length; i++){list.push(links[i].value);}}
                            tools.findAllUrls(list, function (err, urls) {
                                async.each(
                                    urls,
                                    function (url, cbUrl) {
                                        var result = {
                                            _id: 'google_plus;' + obj.type + ';' + obj.keywords + ';' + item.id + ';' + url,
                                            url: url,
                                            hostname: urlparse(url).hostname,
                                            keywords: obj.keywords,
                                            date: obj.date,
                                            platform: 'google_plus',
                                            type: 'user',
                                            info: {
                                                author: item.displayName,
                                                author_id: item.id,
                                                url: item.url
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
