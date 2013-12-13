# Baidu Client Auth

request AccessToken of Baidu Passport in Terminal by Oauth.

在命令行里使用 Oauth 获取百度帐号的 AccessToken。

## Usage / 使用方法

```
var auth = require('baidu-client-auth');
auth.requestToken('Your Client Id (Api Key)', 'Your Secret Key')
  .then(function(data) {
    /** @var {{expires_in, refresh_token, access_token, session_secret, session_key, scope}} data */
    console.log(data);
  });
```



