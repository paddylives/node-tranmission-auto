
var path = require("path");
var fs = require("fs");
var axios = require('axios');
const config = require("./config.js");
var ptPathName = config.ptPathName;
var finishPathName = config.finishPathName;
let fileNameLsit = [];
let finishList = "";
let newAddList = [];
let overList = [];
let headersData = config.headersData;
// 获取全部种子文件
const files = fs.readdirSync(ptPathName)
files.forEach(function (item, index) {
    let stat = fs.lstatSync(path.join(ptPathName, item))
    if (stat.isDirectory() === false && item.indexOf(".torrent") > -1) { 
        fileNameLsit.push(item)
    }
});
// 判断已完成文件是否存在
let finishResult = null;
try{
    finishResult = fs.accessSync(finishPathName)
}catch(e){
    fs.writeFileSync(finishPathName,'');
    finishResult = null;
}
if(finishResult && finishResult.code == 'ENOENT'){
    fs.writeFileSync(finishPathName,'');
}else{
    finishList = fs.readFileSync(finishPathName).toString();
}
finishList = finishList.split("\n");

for (let index = 0; index < fileNameLsit.length; index++) {
    const element = fileNameLsit[index];
    if(finishList.indexOf(element) > -1){
        continue;
    }else{
        newAddList.push(element);
    }
};
const total = newAddList.length;
console.log("任务开始>>>>"+"共计"+total+'种子');

startQuery();
function startQuery(){
    if(newAddList.length == 0){
        console.log("<<<<任务结束：总共未上传：" + total + "个种子，本次上传"+overList.length+"个种子");
        return fs.appendFileSync(finishPathName,overList.join("\n")+"\n");
    };
    var queryName = newAddList.shift();
    let fileData = fs.readFileSync(path.join(ptPathName, queryName)).toString('base64');
    var data = JSON.stringify({"method":"torrent-add","arguments":{"download-dir":config.downloadDir,"paused":false,"metainfo":fileData}});
    var config = {
        method: 'post',
        url: config.rpcUrl,
        headers:headersData,
        data : data
    };
    axios(config).then(function (response) {
        if(JSON.stringify(response.data).indexOf("success") === -1){
            console.log("失败信息：" + JSON.stringify(response.data)+"重新开始任务");
            newAddList.unshift(queryName);
        }else{
            console.log(queryName+"上传成功");
            overList.push(queryName);
        };
        startQuery();
    }).catch(function (error) {
        if (error.response) {
            if(error.response.status === 409){
                headersData['X-Transmission-Session-Id'] = error.response.data.match(/[^><]+(?=<\/code>)/gi)[0].split(": ")[1];
                console.log("最新X-Transmission-Session-Id值：" + error.response.data.match(/[^><]+(?=<\/code>)/gi)[0].split(": ")[1] + "请注意修改脚本");
                newAddList.unshift(queryName);
                console.log("错误状态码：" + error.response.status + "，重新开始此次任务");
            }else{
                console.log("错误状态码：" + error.response.status + "，请重新确认脚本请求参数");
            }
        } else if (error.request) {
            console.log("错误信息：" + error.request + "，请重新确认脚本请求参数");
        } else {
            console.log("错误信息：" + error.message + "，请重新确认脚本请求参数");
        };
        console.log("任务剩余" + newAddList.length + '个');
        startQuery();
    });
}
