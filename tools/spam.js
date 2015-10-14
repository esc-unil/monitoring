'use strict';
/**
 * Created by tpineau
 *
 * Insertion des spams untroubled.org dans mongoDB (changer var year)
 */
var async = require('async');
var mongoClient = require('mongodb').MongoClient;
var fs=require('fs');

var mongoPath = 'mongodb://localhost:27017/spam';
var year = '2006';
var path = '/Users/Thomas/Desktop/spam/'+year;

mongoClient.connect(mongoPath, function(err, db) {
    if (err) {console.log(err);}
    else {
        //var folders = fs.readdirSync('/Users/Thomas/Desktop/spam/1998');
        async.eachSeries(
            fs.readdirSync(path),
            function(folder, cb){
                if (folder === '.DS_Store'){cb();}
                else {
                    console.log(folder);
                    async.eachSeries(
                        fs.readdirSync(path + '/' + folder),
                        function (filename, cb2) {
                            if (filename === '.DS_Store') {cb2();}
                            else {
                                var mail = fs.readFileSync(path + '/' + folder + '/' + filename, "utf8");
                                var obj = {'content':mail, 'source':year + '/' + folder + '/' + filename};
                                db.collection('archives').insert(obj, function (err) {
                                    if (err) {console.log(err);}
                                    cb2();
                                });
                            }
                        },
                        function (err) {
                            cb();
                        }
                    );
                }
            },
            function(err){
                db.close();
                console.log('done');
            }

        );
    }
});