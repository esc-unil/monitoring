'use strict';
/**
 * Created by tpineau
 */

var extend = require('extend');
var async = require("async");
var googleapis = require('googleapis');
var keys = require('./../keys.json');

var language = googleapis.translate('v2');
var googleKey = keys.googleTranslate;

function translate(text, lang, opt_args, callback) {
// Fonction de traduction via Google Translate
// arguments: https://cloud.google.com/translate/v2/using_rest#query-params
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    var args = {q: text, target: lang, auth: googleKey};
    extend(args, opt_args);
    language.translations.list(args, function (err, response) {
        if (err) callback(err);
        else {
            delete args.auth;
            var results = {
                date: new Date(),
                type: 'translate',
                args: args,
                result: response.data.translations
            };
            callback(null, results);
        }
    });
}

translate('http://ipsac.unil.ch/main/index.php','en', function(a,b){console.log(a, b)});

exports.translate = translate;