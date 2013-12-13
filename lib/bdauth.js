/**
 * Created by hjin on 13-12-13.
 */
var constants = require('../config/constants');

var qrcode = require('qrcode-terminal')
  , request = require('request')
  , when = require('when');


function requestCode() {
  var deferred = when.defer();
  request.post('https://openapi.baidu.com/oauth/2.0/device/code',
    {form: constants.REQUEST_CODE},
    function (error, response, body) {
      if (error) {
        deferred.reject(error);
        return;
      }
      var json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        deferred.reject(e);
        return;
      }

      deferred.resolve({
        response: response,
        body: body,
        json: json
      })
    }
  );
  return deferred.promise;
}

function handleCode(data) {
  // var response = data.response;
  var json = data.json;

  return  {
    pc: json.verification_url + '?code=' + json.user_code,
    mobile: json.verification_url + '?code=' + json.user_code + '&display=mobile'
  }

}

function requestDwz(data) {
  var deferred = when.defer();
  request.post('http://dwz.cn/create.php',
    {form: {url: data.mobile}},
    function (error, response, body) {
      if (error) {
        deferred.reject(error);
        return;
      }
      var json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        deferred.reject(e);
        return;
      }

      if (json.status != 0) {
        /*{ tinyurl: 'http://dwz.cn/clZjP',
         status: 0,
         longurl: 'https://openapi.baidu.com/device?code=v7nwm37g&display=mobile',
         err_msg: '' }*/
        deferred.reject(json.err_msg)
      }

      data.tinyMobile = json.tinyurl;

      deferred.resolve({
        response: response,
        body: body,
        json: data
      })
    }
  );

  return deferred.promise;
}

function showResult(data) {
  qrcode.generate(data.json.tinyMobile);
  console.log(data.json.pc);
}

requestCode()
  .then(handleCode)
  .then(requestDwz)
  .then(showResult)
  .then(null, function(err) {
    console.log(err);
  });
