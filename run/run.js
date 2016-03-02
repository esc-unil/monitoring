'use strict';
/**
 * Created by tpineau
 */



var db; // URL of the database (ie mongodb://[username:password@]hostname[:port1]/database[?options])
var api; //API name (google, bing, yahoo, twitter, facebook, gplus, youtube, reddit, etc.)
var keys; //JSON with the different API keys
var type; //request type (i.e post or user for Twitter, web, images for Google)
var request; //string for the request
var number; //number of desired outcomes
var options; //[OPTIONAL] JSON with the optional arguments (see the specific API reference)
var help = '\nInformation sur les arguments:\n\n' +
            '-d ou -db          URL de la base de donnee (ex: mongodb://[username:password@]hostname[:port1]/database[?options])\n' +
            '-a ou -api         Nom de la plate-forme fournissant l\'API (\n' +
            '-k ou -keys        JSON contenant les clefs de l\'API\n' +
            '-t ou -type        Le type de la requete (ex: post ou user pour Twitter, ou web ou images pour Google)\n' +
            '-r ou -request     La requete a effectu�e (mots-clefs)\n' +
            '-n ou -number      Nombre de resultats attendus\n' +
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
    number = parseInt(argv[argv.indexOf("-n") + 1]);
} else {
    if(argv.indexOf("-number") != -1){
        number = parseInt(argv[argv.indexOf("-number") + 1]);
    }
}

if(argv.indexOf("-o") != -1){
    options = JSON.parse(argv[argv.indexOf("-o") + 1]);
} else {
    if(argv.indexOf("-options") != -1){
        options = JSON.parse(argv[argv.indexOf("-options") + 1]);
    } else {
        options = {};
    }
}


