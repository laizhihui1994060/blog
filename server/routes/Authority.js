const router = require('koa-router')()
const Authority = require('../dataStorage/mysql/Authority');

router
	.get('/dateil/:userId'  ,async (ctx, next) => {
		let authority = new Authority();
		authority.user_authority_id = ctx.params.userId;
        
        const result = await authority.query();
        result[0].params = JSON.parse( result[0].params  );

		ctx.body =  {
			msg:"获取权限成功",
			code:200,
			content:result
		}
	})

    .put('/dateil/:userId'  ,async (ctx, next) => {
        
        const body = ctx.request.body;

        let authority = new Authority();
        authority.user_authority_id = ctx.params.userId;
        authority.params = JSON.stringify(body.params);
        
        const result = await authority.updata();
        ctx.body =  {
            msg:"修改权限成功",
            code:200,
            content:result
        }
    })

module.exports = router

