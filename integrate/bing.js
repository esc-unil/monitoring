'use strict';
/**
 * Created by tpineau
 */

var mongo = require('./../mongodb.js');
var async = require("async");

function getURL(callback) {
    mongo.find('bing', {}, function (err, res) {
        if (err) {callback(err);}
        else {

            async.eachLimit(
                res,
                1,
                function (obj, cbObj) {
                    mongo.update('bing', {_id:mongo.ObjectId(obj._id)}, {$set: {integrate:1}}, function(err){
                        if (err) console.log(obj._id, err);
                    });
                    async.eachSeries(
                        obj.result,
                        function(item, cbItem){
                            if (obj.type === 'web'){var url = item.Url;}
                            else if (obj.type === 'images' || obj.type === 'videos'){var url = item.MediaUrl;}
                            var result = {
                                url: url,
                                keywords: obj.keywords,
                                date: obj.date,
                                platform: 'bing',
                                type: obj.type,
                                info:{
                                    ranking:1
                                }
                            };
                            mongo.insert('urls', result, function (err){
                                if (err) {console.log(err);}
                                cbItem();
                            })
                        },
                        function (err){
                            if (err) {console.log(err);}
                            cbObj()
                        }
                    );
                },
                function (err){
                    if (err) {callback(err);}
                    callback(null);
                }

            );

            /*for (var i = 0; i < res.length; i++) {
                var obj = res[i];
                mongo.update('bing', {_id:mongo.ObjectId(obj._id)}, {$set: {integrate:1}}, function(err){
                    if (err) console.log(obj._id, err);
                });
                for (var j=0; j < obj.result.length; j++){
                    var item = obj.result[j];
                    if (obj.type === 'web'){var url = item.Url;}
                    else if (obj.type === 'images' || obj.type === 'videos'){var url = item.MediaUrl;}
                    var result = {
                        url: url,
                        keywords: obj.keywords,
                        date: obj.date,
                        platform: 'bing',
                        type: obj.type,
                        info:{
                            ranking:j+1
                        }
                    };
                    mongo.insert('urls', result, function (err){
                        if (err) {console.log(err);}
                    })
                }
            }
            callback(null);*/
        }
    });
}

exports.getURL = getURL;

getURL(function(err){console.log('done')});