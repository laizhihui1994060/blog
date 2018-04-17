const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname ,'../error.log');


module.exports = async function(error){
    console.log( error )
    var error = error && error.stack ? error.stack:error;

    return new Promise((resolve,reject)=>{
        fs.exists(filePath,(exists)=>{
            if(exists){
                
                // 添加数据
                fs.appendFile(filePath, `\n\n\n${error}`,'utf8', function (err) {
                    if (err) reject('写入error.log失败');
                    resolve(filePath)
                });
    
            }else{
                // 写入数据, 文件不存在会自动创建
                fs.writeFile(filePath, error,'utf8', function (err) {
                    if (err) reject('写入error.log失败');
                    resolve(filePath)
                });
            }
        });
    });
}