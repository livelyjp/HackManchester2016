console.log('Loading Lambda Function (v1234)');

var textInput = require('./text_input.js');

exports.handler = function(event, context) {
  textInput.save(event, context);
};
