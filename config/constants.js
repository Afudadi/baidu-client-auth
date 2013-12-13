/**
 * Created by hjin on 13-12-13.
 */

module.exports = {
  AK: '',
  SK: '',
  API_ENTRY: "https://openapi.baidu.com/rest/2.0",
  DWZ_URL: 'http://dwz.cn/create.php',
  REQUEST_TOKEN_URL: 'https://openapi.baidu.com/oauth/2.0/token',
  REQUEST_TOKEN: {
    grant_type: 'device_token',
    code: '',
    client_id: '',
    client_secret: ''
  },
  REQUEST_CODE_URL: 'https://openapi.baidu.com/oauth/2.0/device/code',
  REQUEST_CODE: {
    client_id: '',
    response_type: 'device_code',
    scope: 'basic'
  }
};
