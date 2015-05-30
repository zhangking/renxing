var Sequelize = require('sequelize');
var model = function(){
   this.sequelize = new Sequelize('ren', 'root', '123456', {host : '127.0.0.1', port : '3306', dialect : 'mysql'});
   this.prize = this.sequelize.define('Prize', {
       openid : {type : Sequelize.STRING, primaryKey : true, unique : true},
       name : {type : Sequelize.STRING},
       event : {type : Sequelize.STRING},
       prize : {type : Sequelize.STRING}
    });
   this.sequelize.sync();
}

model.prototype.insert = function(param){
     return  this.prize.upsert(param);
}
model.prototype.update = function(param1,param2){
  return this.prize.update(param1,param2);
}
model.prototype.find = function(param,cb){
    return    this.prize.findAll(param).then(cb);
}

module.exports  = new model();