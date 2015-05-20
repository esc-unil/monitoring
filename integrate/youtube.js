'use strict';
/**
 * Created by tpineau
 *
 * remarque: pas d'information sur l'auteur avec l'API youtube
 */


var async = require("async");

function getURL(db, target, callback) {
    db.collection('youtube').find(target).toArray(function (err, res) {
        if (err) {callback(err);}
        else {
            async.eachLimit(
                res,
                20,
                function (obj, cbObj) {
                    /*db.collection('youtube').update({_id: mongo.ObjectId(obj._id)}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
                    */
                    var title = obj.result.snippet.title;
                    var description = obj.result.snippet.description;
                    var result = {
                        url: obj.url,
                        keywords: obj.keywords,
                        date: obj.date,
                        platform: 'youtube',
                        type: obj.type,
                        info: {
                            id: obj.result.id.videoId,
                            date: obj.result.snippet.publishedAt,
                        }
                    };
                    db.collection('test').insert(result, function (err) {
                        if (err) {console.log(err);}
                        cbObj();
                    })
                },
                function (err) {callback(err);}
            );
        }
    });
}

exports.getURL = getURL;
