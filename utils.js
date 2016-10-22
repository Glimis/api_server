var _=require('lodash')
var qs = require('querystring');  
module.exports ={
  setHeader:function (req,json){
    _.each(json,function(key,val){
      req.setHeader(val,key);
    })
  },  
  setBody:function (req,json){
    req.write(qs.stringify(json));
  }  
}