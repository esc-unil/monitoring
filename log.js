'use strict';
/**
 * Created by tpineau
 */

var logPath = "/var/log/webintell";
var fs    = require('fs');


function insert(message){
    log('[INFO]', message);
}

function error(message){
    log('[ERROR]', message);
}

function log(type, message) {
    var date = new Date();
    date = date.toISOString();
    var file = logPath + '/' + date.substring(0, 10) + '.log';
    message = '[' + date + ']' + type + ' ' + message + '\n';
    fs.appendFileSync(file, message);
}

exports.insert = insert;
exports.error = error;

