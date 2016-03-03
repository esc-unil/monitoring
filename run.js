'use strict';
/**
 * Created by tpineau
 *
 * Programme de lancement des différentes requêtes via les API des plateformes.  Les données brutes retournées sont stockées
 * dans une base de donnée MongoDB.
 *
 */

var log=require('./log.js');
var mongoClient = require('mongodb').MongoClient;

var db = null; // URL of the MongoDB database (ie mongodb://[username:password@]hostname[:port1]/database[?options])
var dbName = null; //database name (ex:doping, docs)
var api = null; //API name (google, bing, yahoo, twitter, facebook, gplus, youtube, reddit, etc.)
var keys = null; //JSON with the different API keys
var type = null; //request type (i.e post or user for Twitter // web, images for Google // subreddit name for reddit)
var request = null; //string for the request
var number = null; //number of desired outcomes
var options = null; //[OPTIONAL] JSON with the optional arguments (see the specific API reference)
var help = '\nInformation sur les arguments:\n\n' +
            '-d ou -db          URL de la base de donnee (ex: mongodb://[username:password@]hostname[:port1]/database)\n' +
            '-a ou -api         Nom de la plate-forme fournissant l\'API: (\n' +
            '                       google, bing, yahoo, facebook, twitter, google_plus, youtube ou reddit\n' +
            '-k ou -keys        JSON contenant les clefs de l\'API\n' +
            '-r ou -request     La requete a effectuee (mots-clefs)\n' +
            '-n ou -number      Nombre de resultats attendus\n' +
            '-t ou -type        [Optionnel] Le type de la requete (ex: post ou user pour Twitter, ou web ou images pour Google)\n' +
            '                       web ou images, pour google, bing and yahoo (defaut: web)\n' +
            '                       user pour facebook (defaut: user)\n' +
            '                       user ou post pour twitter, google_plus (defaut: post)\n' +
            '                       video pour youtube (defaut: video)\n' +
            '                       [nom d\'un subreddit] pour reddit (defaut: null)\n' +
            '-o ou -options     [Optionnel] JSON contenant les differents arguments pour la requete (voir la documentation de l\'API)\n'
    ;


//--------------------------------------------------------------------------------------
//grab arguments from the command line interface (CLI) and parse them

var argv = process.argv;

if(argv[2] == "-h" || argv[2] == "-help"){
    console.log(help);
    process.exit();
}

if(argv.indexOf("-d") != -1){
    db = argv[argv.indexOf("-d") + 1];
} else {
    if(argv.indexOf("-db") != -1){
        db = argv[argv.indexOf("-db") + 1];
    }
}

if(argv.indexOf("-a") != -1){
    api = argv[argv.indexOf("-a") + 1];
} else {
    if(argv.indexOf("-api") != -1){
    api = argv[argv.indexOf("-api") + 1];
    }
}

if(argv.indexOf("-k") != -1){
    keys = JSON.parse(argv[argv.indexOf("-k") + 1]);
} else {
    if(argv.indexOf("-keys") != -1) {
        keys = JSON.parse(argv[argv.indexOf("-api") + 1]);
    }
}


if(argv.indexOf("-t") != -1){
    type = argv[argv.indexOf("-t") + 1];
} else {
    if(argv.indexOf("-type") != -1){
        type = argv[argv.indexOf("-type") + 1];
    }
}

if(argv.indexOf("-r") != -1){
    request = argv[argv.indexOf("-r") + 1];
} else {
    if(argv.indexOf("-request") != -1){
        request = argv[argv.indexOf("-request") + 1];
    }
}

if(argv.indexOf("-n") != -1){
    number = argv[argv.indexOf("-n") + 1];
} else {
    if(argv.indexOf("-number") != -1){
        number = argv[argv.indexOf("-number") + 1];
    }
}

if(argv.indexOf("-o") != -1){
    options = argv[argv.indexOf("-o") + 1];
} else {
    if(argv.indexOf("-options") != -1){
        options = argv[argv.indexOf("-options") + 1];
    }
}

//--------------------------------------------------------------------------------------
//Check attributes
try {
    keys =JSON.parse(keys)
} catch (e) {
    keys = null;
}

try {
    options =JSON.parse(options)
} catch (e) {
    options = null;
}

try {
    number = parseInt(number);
} catch (e) {
    number = null;
}

try{
    dbName = db.match(/mongodb:\/\/.+\/([^\/]+$)/i)[1];
} catch (e) {
    dbName = null;
    db = null;
}

if (db == null || api == null || request == null || number == null){
    log.error('RUN bad request - Missing argument(s) - ' + dbName + ';' + api + ';' + request);
    process.exit();
}

var platform = api.toLowerCase();
switch (api.toLowerCase()){
    case 'google':
        api = require('./storage/google.js');
        break;
    case 'bing':
        api = require('./storage/bing.js');
        break;
    case 'yahoo':
        api = require('./storage/yahoo.js');
        break;
    case 'facebook':
        api = require('./storage/facebook.js');
        break;
    case 'twitter':
        api = require('./storage/twitter.js');
        break;
    case 'google_plus':
        api = require('./storage/google_plus.js');
        break;
    case 'youtube':
        api = require('./storage/youtube.js');
        break;
    case 'reddit':
        api = require('./storage/reddit.js');
        break;
    default:
        log.error('RUN bad request - Wrong API argument - ' + dbName + ';' + api + ';' + request);
        process.exit();
}


//--------------------------------------------------------------------------------------
mongoClient.connect(db, function(err, database) {
    if (platform === 'reddit'){
        if (type.toLowerCase() == 'null' || type == ''){
            type = null;
        }
        api(database, request, number, type, options, cb); //!!!!!!!!!!!!in progress
    } else {
        api[type](database, request, number, options, cb);
    }
});



//--------------------------------------------------------------------------------------
