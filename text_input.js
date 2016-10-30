var elastic = require('./elastic.js');
var indexName = 'text_input';
var https = require('https');
var async = require('async');
var AWS = require('aws-sdk');
var path = require('path');
var swear_words = require('./swear_words.js');

var esDomain = {
  region: 'us-west-2',
  endpoint: 'search-wackshaftchester-i7avkivh4zlasjvlgdzatttxxi.us-west-2.es.amazonaws.com'
};
var awsRequst = require('./aws_request.js');

function getDirtyWordIndexes(userId) {
  var url = path.join('/', 'text_input', userId, '_search', '?size=1000');
  var data = {
    "query": {
        "bool" : {
          "must" : {
              "terms" : { "text" : swear_words}
             }
         }
    }
  }
  console.log('HGSDJHFGSJDFGSaasdasdasd' + url);
  console.log('HGSDJHFGSJDFGSD' + JSON.stringify(data));

  var req = awsRequst.get(url, data);
  return req;
}

module.exports = {
  save: function(event, context) {
    var userId = event.headers.Authorization;
    var body = event.body;
    var text = body.text;
    var data = JSON.stringify({
      text: text
    });

    elastic.post(indexName, userId, data, context);
  },

  getDirtyWordIds: function(userId, callback){
    var idsWithSwearWords = ['sdf'];

    var req = getDirtyWordIndexes(userId);

    var send = new AWS.NodeHttpClient();
    send.handleRequest(req, null, function (httpResp) {

      var respBody = '';
      httpResp.on('data', function (chunk) {
        respBody += chunk;
      });


      httpResp.on('end', function (chunk) {
        var response = JSON.parse(respBody);
        var hits = response.hits;
        var hitsArray = hits.hits;
        idsWithSwearWords = hitsArray.map(function(x){
          return x._id;
        });

        console.log('NUMBER OF INDEXES' + idsWithSwearWords.count);
        console.log('INDEXES' + idsWithSwearWords);

        callback(idsWithSwearWords);
      });
    },

    function (err) {
      console.log('Error: ' + err);
      context.fail('Lambda failed with error ' + err);
    }
  );

  return idsWithSwearWords;
  }
};
