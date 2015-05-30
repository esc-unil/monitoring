'use strict';
/**
 * Created by tpineau
 *
 */

var webshot = require('webshot');

function screenshot(hostname, callback){
    var options = {
        shotSize: {width: '1024', height: 'all'},
        quality: 75,
        streamType: 'jpg',
        renderDelay : 2000,
        userAgent: 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0',
        errorIfStatusIsNot200: true //erreur si pas absente
    };


    webshot(hostname, '/webshot/' + hostname + '.jpg', options, function(err) {
    });
}

screenshot('24hourmedstore.com');