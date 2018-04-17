const router = require('koa-router')()
const ErrorObj = require('../middleware/error/error_obj');
const User = require('../dataStorage/mysql/User');
const sendMail = require('../middleware/error/sendMail');
const randomString = require('../util/randomString');
const uuid = require('node-uuid');  



router.post('/login', async (ctx, next) => {
    let user = new User;
    const body = ctx.request.body;
    user.user_email = body.user_email; 
    let result =  await user.query(); 
    if(result.length){
        user.user_pass = body.user_pass; 
        let userInfo =  await user.query(); 
        if(userInfo.length){
            if(body.rememberPassword){
                ctx.session.userInfo = userInfo[0];
            }else{
                ctx.session.userInfo = null;
            }
            ctx.body = {code: 200, msg: '登陆成功', content:userInfo};
        }else{
            ctx.body = {code: 403, msg: '密码输入错误，请重新输入', content: []};
        }
    }else{
        ctx.body = {code: 403, msg: '当前账号不存在', content: []};
    }
    
})


router.post('/register', async (ctx, next) => {

    let user = new User();
    let body = ctx.request.body;


    if(ctx.session.emailCode !== body.code){
        ctx.body = {code: 500, msg: '注册失败！,邮箱验证码错误', content: []};
        return ;
    }


    user.user_name = body.user_name;
    user.user_pass = body.user_pass;
    user.user_email = body.user_email;
    user.user_phone = body.user_phone;
    user.user_id = uuid.v1();

    let result = await user.insert();
    console.log(result )
    ctx.body = {code: 200, msg: '注册成功！', content: result.insertId};
});

router.post('/verifyRegister',async( ctx,next)=>{
    let user = new User();
    let body = ctx.request.body;
    
    user[body.key] = body.value;


    let result = await user.query();
    ctx.body = {code: 200, msg: '查找成功', content:{isExist:result.length ? true:false}};
});

router.post('/sendEmail',async( ctx,next)=>{
    let body = ctx.request.body;
    
    let random = randomString(8);
    try{

        const result = await sendMail({
            subject:'博客系统后台注册验证码',
            to:body.email,
            html:'你的验证码是：' + random,
        });
        ctx.session.emailCode = random;
        ctx.body = {code: 200, msg: '请求成功', content:{isSend:true}};
    }catch(e){
        ctx.body = {code: 200, msg: '请求成功', content:{isSend:false}};
    }
});

router.post('/updataPassword', async (ctx,next)=>{
   
    let user = new User();
    let body = JSON.parse(ctx.request.body);


    if(ctx.session.emailCode !== body.code){
        ctx.body = {code: 500, msg: '修改密码失败！,邮箱验证码错误', content: []};
        return ;
    }

    if(body.newPassword !== body.repeatNewPassword){
        ctx.body = {code: 500, msg: '修改密码失败！,两次密码不想等', content: []};
        return ;
    }

    user.user_id = body.user_id;
    user.user_pass = body.newPassword;

    let result = await user.updata();

    ctx.body = {code: 200, msg: '修改密码成功！', content: result.insertId};

});

router.get('/detail/:userId',async (ctx,next)=>{

    const user = new User();

    user.user_id = ctx.params.userId;
    
    const result = await user.query();
            console.log( '~~~~~~~~',result);

    if(result.length ){
        ctx.body = {
            code: 200, 
            msg: '获取用户信息成功', 
            content: result
        };

    }else{
        ctx.body = {
            code: 404, 
            msg: '获取用户信息失败', 
            content: []
        };

    }
    

});
            


module.exports = router

