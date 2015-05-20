'use strict';
/**
 * Created by tpineau
 */

function findURL(string){
    var reg = /https?:\/\/[^\s]+\.[^\s]+/i;
    return reg.exec(string);
}

function stdURL(url){

}
