const router = require('koa-router')()
const Authority = require('../dataStorage/mysql/Authority');
const ueditor = require('../lib/ueditor')
const path = require('path')

router.all('/ue', ueditor(path.join(__dirname,`../static`),(ctx,next)=>{
        //客户端上传文件设置
        var imgDir = '/img/ueditor/'
        var ActionType = ctx.query.action;

        if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
            var file_url = imgDir;//默认图片上传地址
            /*其他上传格式的地址*/
            if (ActionType === 'uploadfile') {
                file_url = '/file/ueditor/'; //附件
            }
            if (ActionType === 'uploadvideo') {
                file_url = '/video/ueditor/'; //视频s
            }
            console.log('1')
            ctx.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
            
            ctx.res.setHeader('Content-Type', 'text/html');
        }
        //  客户端发起图片列表请求
        else if (ctx.query.action === 'listimage') {
            var dir_url = imgDir;
            ctx.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
        }
        // 客户端发起其它请求
        else {
            // console.log('config.json')
            ctx.header ='Content-Type', 'application/json' ;
            ctx.redirect('/admin/static/UE/asp/config.json');
        }
}))

module.exports = router

