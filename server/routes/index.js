const router = require('koa-router')();
const getFile = require('../util/getFile');

router.get("/",async (ctx)=>{

    const file = await getFile('../client/admin/root-layout.html');
   
    await ctx.res.end(file)
   
});

module.exports = router
 