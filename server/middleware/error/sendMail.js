const nodemailer = require('nodemailer');
const emailConfig = require('../../config/config').email;  

let transporter = nodemailer.createTransport(emailConfig); 



module.exports = ( {subject = 'zhiHui系统错误提醒',html = '系统出错啦',to = emailConfig.auth.toUser } = {},attachments = [])=>{
    const mailOptions = {  
        from: emailConfig.auth.user, // 发送者  
        to: to, // 接受者,可以同时发送多个,以逗号隔开  
        subject: subject, // 标题  
        //text: 'Hello world', // 文本  
        html: html,
        attachments:attachments
    };  
    console.log( mailOptions )
    return new Promise((resolve,reject)=>{

        transporter.sendMail(mailOptions, function (err, info) {  
            if (err) {  
                console.log('发送邮件失败',err);  
                reject('error');
                return;  
            }  
            console.log('发送邮件成功');
            resolve('ok');
        });
    });


}