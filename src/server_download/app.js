//debug 调试http://i5ting.github.io/node-debug-tutorial/#302
// 这个需要用npm来安装，只需要执行下列语句：

// npm install -g node-inspector
// 安装完成之后，通常可以直接这样启动在后台：

// node-inspector &
// 默认会监听8080端口，当然，也可能通过使用--web-port参数来修改。然后，在执行node程序的时候，多加个参数：--debug-brk, 如下：

// node --debug-brk app.js
// 或者

// node-debug app.js
// 控制台会返回“debugger listening on port 5858”， 现在打开浏览嚣，访问http://localhost:8080/debug?port=5858，这时候就会打开一个很像Chrome内置调试工具的界面，并且代码断点在第一行，下面就可以使用这个来调试了。
var express = require('express');
var app = express();
var router = express.Router();
var fs = require("fs");
var path = require("path");
var url = require('url');
var deasync = require('deasync');
var fileList = [];
var request = require('request');

function find(source, regExp, start, end) {
    try {
        var find = source.match(regExp)[0];
        return find.substring(start, find.length - end);
    }
    catch (e) {
        return "";
    }
}

router.get('/forward_get', function(req, res) {
    var host = req.protocol + '://' + req.get('host');
    var params = url.parse(req.url,true);
    var trueUrl = params.query.url;
    var done = false;
    var data;
    request(trueUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            data = body
        }
        done = true;
    })
    deasync.loopWhile(function(){return !done;});
    res.writeHead(200, {"Access-Control-Allow-Origin":"*"});
    res.end(data);
});

//http://fund.10jqka.com.cn/002881/historynet.html   JsonData = [{    }];
//http://localhost:3242/data?fundId=110011&dayCount=365
router.get('/data', function(req, res) {
    var host = req.protocol + '://' + req.get('host');
    var params = url.parse(req.url,true);
    var fundId = params.query.fundId;
    var dayCount = params.query.dayCount;
    var done = false;
    var data;
    request("http://fund.10jqka.com.cn/"+fundId+"/historynet.html", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            data = find(body,/JsonData\s=\s\[.*?\];/,11,1);
            //string to json
            var objects = JSON.parse(data);
            var newObjects = [];
            for (var i = 0; i < objects.length && i<dayCount; i++) {
                newObjects.push(objects[i])
            }
            //json to string
            data = JSON.stringify(newObjects);
        }
        done = true;
    })
    deasync.loopWhile(function(){return !done;});
    res.writeHead(200, {"Access-Control-Allow-Origin":"*"});
    res.end(data);
});


app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));

app.use('/', router);
var port = process.env.PORT || 3242;
app.listen(port);
console.log('Magic happens on port ' + port);
