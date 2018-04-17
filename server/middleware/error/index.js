const ErrorObj = require('./error_obj');
const getErrorInfo = require('./getErrorInfo');
const sendMail = require('./sendMail');
const saveLog = require('../../util/save_errorLogs');

let watchError = async(ctx,next)=>{
    try{
        await next();
    }catch(error){

        try{
            const filePath = await saveLog(error);

            ctx.body = {
                code: error && error.code ? error.code : 403,
                msg: error && error.msg ? error.msg : `已发现未知错误，以发邮件通知管理员管理；请稍等， 管理员会尽快处理。`
            }
            await sendMail({
                html:error
            },[{
                filename : 'error.log',  
                path: filePath  
            }]);



        }catch(e){
            console.log(e)
            ctx.body = {
                code: 500,
                msg: '已发现未知错误，发送邮件管理失败；请主动联系管理员。'
            }
        }
    }
}

module.exports = watchError;