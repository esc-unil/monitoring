'use strict';
/**
 * Created by tpineau
 */

var async = require("async");
var urlparse = require('url').parse;

function getURL(db, col, target, callback) {
    db.collection('bing').find(target).toArray(function (err, res) {
        if (err) {
            callback(err);
        }
        else {
            async.eachSeries(
                res,
                function (obj, cbObj) {
                    var rank = 1;
                    async.eachSeries(
                        obj.result,
                        function (item, cbItem) {
                            if (obj.type === 'web') {var url = item.Url;}
                            else if (obj.type === 'images' || obj.type === 'videos') {var url = item.MediaUrl;}
                            var hostname = urlparse(url).hostname;
                            var result = {
                                urls: url,
                                hostname: hostname,
                                keywords: obj.keywords,
                                date: obj.date,
                                platform: 'bing',
                                type: obj.type,
                                source: obj._id,
                                info: {
                                    rank: rank
                                },
                                integrate: 0
                            };
                            rank = rank + 1;
                            db.collection(col).insert(result, function(err){cbItem();});
                        },
                        function (err) {
                            if (err) {console.log(err);}
                            db.collection('bing').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                                if (err) {console.log(obj._id, err);}
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
