var Q = require("q");
var exec = require('child_process').exec;
var http = require("http");
var utils=require('./utils')

function loginbody(username,password){
  return {
      j_username:username,
      j_password:password,
      from:'/jenkins/',
      json:{"j_username": username, "j_password": password, "remember_me": false, "from": "/jenkins/", "Submit": "登录"},
      Submit:"登录"
    }
} 

function login(cookie){
  var deferred = Q.defer();
  var options={
    hostname:'ci.yonyou.com',
    path: '/jenkins/j_acegi_security_check',
    method: 'POST'
  }
  var req=http.request(options,function(res){  
  var _cookie=res.headers['set-cookie'];
    deferred.resolve(_cookie);
  });

  req.on('error', function (e) {  
    console.log('problem with request: ' + e.message);  
  })

  utils.setHeader(req,{
    "Upgrade-Insecure-Requests":1,
    "Content-Type":"application/x-www-form-urlencoded"
  })
  
  utils.setBody(req,loginbody('liuchyg','yy4115021991'))
  req.end(); 
  return deferred.promise;
}  

function jenkins(cookie){
  var deferred = Q.defer();
  var options={
    hostname: "ci.yonyou.com",
    path: "/jenkins/job/YC-CPU-011-FE-Test-Deploy/build?delay=0sec",
    method: 'POST'
  }

  var req=http.request(options,function(res){  
    var html='';
      res.on('data',function(data){  
           html+=data;  
      });  
      res.on('end',function(){  
          deferred.resolve(cookie);
      }); 
  });
  req.on('error', function (e) {  
    console.log('problem with request: ' + e.message);  
  })

  req.setHeader("Cookie",cookie);
  req.setHeader('Jenkins-Crumb','c2c2489280e62948fccd40e7cfaaff81')
  req.write("delay=0sec");
  req.end(); 
  return deferred.promise;
}

function message(cookie){
  var options={
    hostname: "ci.yonyou.com",
    path: "/jenkins/job/YC-CPU-011-FE-Test-Deploy/buildHistory/ajax",
    method: 'POST'
  }

  var req=http.request(options,function(res){  
    var html='';
      res.on('data',function(data){  
           html+=data;  
      });  
      res.on('end',function(){  
          var vals=html.match(/width:(\d)*/g);
          if(vals&&vals[1].match(/\d+/)){
            console.log("进度:"+vals[1].match(/\d+/))
            setTimeout(function(){
              message(cookie)
            },1000)
          }else{
            console.log("已完成")
          }
      }); 

  });

  req.setHeader("Cookie",cookie);
  req.setHeader("Jenkins-Crumb","c2c2489280e62948fccd40e7cfaaff81");
  req.on('error', function (e) {  
    console.log('进度查询错误' + e.message);  
  })


  req.end(); 
}

login()
  .then(jenkins)
  .then(function(cookie){
    console.log('部署请求已经启动,坐等..');
     setTimeout(function(){
              message(cookie)
            },1000)
  });

