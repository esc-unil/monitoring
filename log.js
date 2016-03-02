'use strict';
/**
 * Created by tpineau
 */

var log = "/var/log/webintell";
var fs    = require('fs');


function insert(message){
    var date = getDateTime();
    var file = log + '/' + date.substring(0, 10) + '.log';
    message = '[' + date + ']' + '[INFO]' + message + '\n';
    fs.appendFileSync(file, message);
}

function error(message){
    var date = getDateTime();
    var file = log + '/' + date.substring(0, 10) + '.log';
    message = '[' + date + ']' + '[ERROR]' + message + '\n';
    fs.appendFileSync(file, message);
}

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "." + month + "." + day + "-" + hour + ":" + min + ":" + sec;
}

exports.insert = insert;
exports.error = error;

error('asdasdad');
insert('aaaffffffff');