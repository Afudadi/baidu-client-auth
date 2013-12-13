/**
 * Created by hjin on 13-12-13.
 */
var constants = require('../config/constants');

var qrcode = require('qrcode-terminal')
  , request = require('request')
  , when = require('when')
  , colors = require('colors');


function requestCode() {
  var deferred = when.defer();
  request.post(constants.REQUEST_CODE_URL,
    {form: simpleMixin(constants.REQUEST_CODE, {
      client_id: constants.AK
    })},
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
    mobile: json.verification_url + '?code=' + json.user_code + '&display=mobile',
    device_code: json.device_code,
    interval: json.interval
  }

}

function requestDwz(data) {
  var deferred = when.defer();
  request.post(constants.DWZ_URL,
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
  console.log('手机扫描二维码，或在浏览器中打开下面的链接以完成授权');
  console.log(data.json.pc.blue);

  return data;
}

function requestToken(data) {

  process.stdout.write('等待授权中'.blue);

  return pollToken(data)
    .then(function(result) {
      console.log('done');
      // console.log(result);
      return result;
    })
}

function pollToken(data){
  var deferred = when.defer();
  process.stdout.write('.'.grey);
  request.post(constants.REQUEST_TOKEN_URL, {form:
    simpleMixin(constants.REQUEST_TOKEN, {
      code: data.json.device_code,
      client_id: constants.AK,
      client_secret: constants.SK
    })
  }, function(error, response, body) {
    if(error) {
      deferred.reject(error);
      return ;
    }

    try {
      body = JSON.parse(body);
    } catch(e) {
      deferred.reject(e);
      return ;
    }

    if(body.error) {
      /*
       {
       "error":"authorization_pending",
       "error_description":"User has not yet completed the authorization"
       }
       */
      setTimeout(function () {

        pollToken(data)
          .then(function(result) {
            deferred.resolve(result);
          })

      }, data.json.interval * 1000);

      return ;
    }

    deferred.resolve(body);

  });
  return deferred.promise;
}




function simpleMixin(target, other) {
  for(var i in other) {
    if(other.hasOwnProperty(i)) {
      target[i] = other[i];
    }
  }
  return target;
}



module.exports = {
  /**
   *
   * @param {String} ak
   * @param {String} sk
   * @returns {Promise}
   */
  requestToken: function(ak, sk) {
    if(!ak || !sk) {
      throw new Error('ak/sk cant be empty');
    }
    constants.AK = ak;
    constants.SK = sk;
    return requestCode()
      .then(handleCode)
      .then(requestDwz)
      .then(showResult)
      .then(requestToken)
  }
};