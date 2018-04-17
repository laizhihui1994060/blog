const fs = require('fs');
const path = require('path');

module.exports = function(filePath){
    return new Promise((resolve,reject)=>{
        fs.readFile(path.join(__dirname,filePath),'utf-8',(err,file)=>{
            if(err){
                reject(err)
            }else{
                resolve(file)
            }
        });
    });
    
}