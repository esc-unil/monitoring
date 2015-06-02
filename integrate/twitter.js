'use strict';
/**
 * Created by tpineau
 *
 */

var async = require("async");
var urlparse = require('url').parse;
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
            async.eachSeries(
                res,
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
                                    //--------------


                                    var hostname = urlparse(url).hostname;
                                    var id = 'twitter;' + obj.type + ';' + obj.result.id_str + ';' + hostname;
                                    var retweet = false;
                                    if (obj.result.retweeted_status != undefined){retweet=true;}
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
                                                    platform: 'twitter',
                                                    type: obj.type,
                                                    info: {
                                                        date: obj.result.created_date,
                                                        id: obj.result.id_str,
                                                        author: obj.result.user.screen_name,
                                                        author_id: obj.result.user.id_str,
                                                        location: obj.result.place,
                                                        coordinates: obj.result.coordinates,
                                                        lang : obj.result.lang,
                                                        retweet: retweet
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
            async.eachSeries(
                res,
                function (obj, cbObj) {
                    db.collection('twitter').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
                    async.each(
                        obj.result,
                        function (item, cbItem) {
                            var description = item.description;
                            var website = item.url;
                            tools.findAllUrls([website, description], function (err, urls) {
                                async.eachSeries(
                                    urls,
                                    function (url, cbUrl) {
                                        //---------------------

                                        var hostname = urlparse(url).hostname;
                                        var id = 'twitter;' + obj.type + ';' + item.id_str + ';' + hostname;

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
                                                        platform: 'twitter',
                                                        type: obj.type,
                                                        info: {
                                                            date1: obj.date,
                                                            date2: obj.date,
                                                            id: item.id_str,
                                                            name: item.screen_name,
                                                            date: new Date(item.created_at),
                                                            location: item.location,
                                                            timezone: item.time_zone,
                                                            lang : item.lang
                                                        },
                                                        integrate: 0
                                                    };
                                                    db.collection(col).insert(result, function(err){cbUrl();});
                                                }
                                                else { //mise a jour pour le hostname/type
                                                    var add = {$addToSet: {urls: url, keywords: obj.keywords}};
                                                    if (elem.info.date2 < obj.date){add['$set'] = {'info.date2': obj.date}}
                                                    db.collection(col).update({_id: id}, add, function(err){cbUrl();});
                                                }
                                            }
                                        });

                                        //--------------
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

