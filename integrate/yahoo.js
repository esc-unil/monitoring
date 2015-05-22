'use strict';
/**
 * Created by tpineau
 */

var async = require("async");
var urlparse = require('url').parse;

function getURL(db, col, target, callback) {
    db.collection('yahoo').find(target).toArray(function (err, res) {
        if (err) {
            callback(err);
        }
        else {
            async.eachLimit(
                res,
                20,
                function (obj, cbObj) {
                    db.collection('yahoo').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
                    var rank = 1;
                    async.eachSeries(
                        obj.result,
                        function (item, cbItem) {
                            var url = item.url;
                            var result = {
                                _id: 'yahoo;' + obj._id + ';' + item.url,
                                url: url,
                                hostname: urlparse(url).hostname,
                                keywords: obj.keywords,
                                date: obj.date,
                                platform: 'yahoo',
                                type: obj.type,
                                info: {
                                    ranking: rank
                                },
                                integrate: 0
                            };
                            db.collection(col).insert(result, function (err) {
                                if (err === null) {rank++;}
                                cbItem();
                            })
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
