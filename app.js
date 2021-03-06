var express = require('express');
var bodyParser = require('body-parser');
var redis = require('./models/redis.js');
var mongodb = require('./models/mongodb.js');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//扔一个漂流瓶
app.post('/', function(req, res){
	if(!(req.body.owner && req.body.type && req.body.content)){
		if(req.body.type && (["male","female"].indexOf(req.body.type) === -1)){
			return res.json({code:0,msg:"类型错误"});
		}
		return res.json({code:0,msg:"信息不完整"});
	}
	redis.throw(req.body, function(result){
		res.json(result);
	});
});

//捡一个漂流瓶
app.get('/', function(req, res){
	if(!req.query.user){
		return res.json({code:0,msg:"信息不完整"})
	}
	if(req.query.type && (["male","female"].indexOf(req.body.type) === -1)){
		return res.json({code:0,msg:"类型错误"});
	}
	redis.pick(req.query, function(result){
		if(result.code === 1){
			mongodb.save(req.query.user, result.msg, function(err){
				if(err){
					return res.json({code:0,msg:"获取漂流瓶失败，请重试"});
				}
				return res.json(result);
			});
		}
		res.json(result);
	});
});

//扔回海里一个漂流瓶
app.post('/back',function(req, res){
	redis.throwBack(req.body, function(result){
		res.json(result);
	})
});

//获取一个用户所有的漂流瓶
app.get('/user/:user',function(req, res){
	mongodb.getAll(req.params.user, function(result){
		res.json(result);
	})
});

app.listen(3000);