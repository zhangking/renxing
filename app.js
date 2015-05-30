var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');
var async = require('async');
var redis   = require('redis');
var app = express();
var model = require('./model');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
  secret: 'renxing',
}));
app.use(express.static(path.join(__dirname, 'public')));

var static_url = '';
var appid = '';
var secret = '';
var redirect_url ='http://192.168.0.103:3000/index';

var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri='+redirect_url+'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';

app.get('/',function(req,res){
    res.redirect(url);
});

//router
app.get('/index',function(req,res){
  var code = req.query.code;
   if(!code){
     res.redirect('/');
   }
  async.waterfall([
    function(cb){
      var access_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+appid+'&secret='+secret+'&code='+code+'&grant_type=authorization_code';
      request.get(access_url,function(err,res,data){
        var data = JSON.parse(data);
        cb(null,data);
      });
    },
    function(data,cb){
      var user_url = 'https://api.weixin.qq.com/sns/userinfo?access_token='+data.access_token+'&openid='+data.openid+'&lang=zh_CN';
      request.get(user_url,function(err,res,data){  
        var data = JSON.parse(data);
        cb(null,data);
      });
    }],function(err,data){
         var openid = data.openid;
         var client  = redis.createClient('6379', '127.0.0.1');
         client.get(openid,function(err,ret){
            var first = true;
            if(ret){
              first = false;
            }
            res.render('prize', {first:first,openid:data.openid,name:data.nickname,static_url:static_url});
         });
    });
});

app.get('/submit',function(req,res){
  var openid = req.query.openid,
      name = req.query.name,
      prize = req.query.prize;
 
  var time = new Date();
  var client  = redis.createClient('6379', '127.0.0.1');
  client.get(openid,function(err,data){
      if(data){
          res.end('2');
      }else{
            client.set(openid,1);
            model.insert({openid:openid,name:name,prize:prize,createdAt:time,updatedAt:time });
          res.end();
      }
    });
});


app.get('/get',function(req,res){
  var index = req.query.index;
  if(index == null){
    res.end();
  } 
  index = 'str_' + index;

  var client  = redis.createClient('6379', '127.0.0.1');
  
  client.get(index, function(error, data){
      if(error) {
          console.log(error);
      } else {
          if(data && data > 0){
            client.incrby(index,-1,function(){});
            res.end('1');
            client.end();
          }else{
            res.end('0');
            client.end();
          }
      }
});
});


app.listen(3000);

