var redis = require('redis');
var async = require('async');
var client  = redis.createClient('6379', '127.0.0.1');
var config = [60,60,60,60,60,60,60,60];
var d = new Date().getDay();

if(d == 1){
	config = [100,15,5,1,1,50,2000,100];
}else if(d ==2){
	config = [50,7,2,1,1,100,2000,50];
}else if(d == 3){
	config = [50,7,2,1,1,100,2000,50];
}

var n = 0;
async.eachSeries(config,function(i,cb){
	console.log(n);
	client.set('str_' + n ,i,function(){n++;cb()});
},function(err){
	console.log(err);
	client.end();
});



