const router = require('koa-router')();
const Category = require('../dataStorage/mysql/Category');
const uuid = require('node-uuid');  




router.post('/list', async (ctx, next) => {
   
	const body = ctx.request.body;
    
    if(!body.pageIndex)body.pageIndex = 1;
    if(!body.category_name)body.category_name = '';
    if(!body.startTime)body.startTime = '';
    if(!body.endTime)body.endTime = '';
    

    let category = new Category();
    category.pageIndex = body.pageIndex;
    category.category_name = body.category_name;
    category.category_createTime = {
        startTime:body.startTime,
        endTime:body.endTime
    }
    
    if( body.sortField ){
        category.sortField = body.sortField;
        category.orderBy = body.orderBy;
    }

    const count = await category.getCount();
    const categorys = await category.getList();

    ctx.body = {
        code:200,
        msg:"获取数据成功",
        pageCount:Math.ceil(count/Category.pageSize()),
        pageIndex:body.pageIndex,
        pageSize:Category.pageSize(),
        recordSize:count,
        content:categorys
    }
})

router.get('/all', async (ctx, next) => {
    
	// const category_id = ctx.query.category_id;
    let category = new Category();
    result = await category.query();
    
    ctx.body = {
        msg:"获取数据成功",
        code:200,
        content:result
    }

})

router.get('/detail/:categoryId', async (ctx, next) => {
    
    let category = new Category();
	const category_id = ctx.query.categoryId;
    
    result = await category.query();
    
    ctx.body = {
        msg:"获取数据成功",
        code:200,
        content:result
    }

})

router.post('/add', async (ctx, next) => {
    let category = new Category();
    const body = ctx.request.body;
    
    const category_id = uuid.v1();

    category.category_name = body.category_name;
    const queryResutle = await category.query();
    
    if(queryResutle.length)return  ctx.body = {code: 403, msg: '当前分类已存在请重新命名!', content: []};

    category.category_id = category_id;
    category.created = body.created;

    const resutle = await category.insert();

    if(typeof resutle.insertId === "number"){
        ctx.body = {code: 200, msg: '添加分类成功！', content: category_id};
    }else{
        ctx.body = {code: 401, msg: '添加分类失败！', content: resutle};
	}
})


router.put('/updata/:category_id', async (ctx, next) => {
    
    const body = ctx.request.body;
    const category_id = ctx.params.category_id;
    
    let category = new Category();

    category.category_id = category_id;
    category.created = body.created;
    category.category_name = body.category_name;

    const resutle = await category.updata();

    if(typeof resutle.insertId === "number"){
        ctx.body = {code: 200, msg: '修改分类成功！', content: category_id};
    }else{
        ctx.body = {code: 401, msg: '修改分类失败！', content: resutle};
    }
})


router.delete('/remove/:category_id', async (ctx, next) => {
    
        const category_id = ctx.params.category_id;
        
        let category = new Category();
    
        category.category_id = category_id;
    
        const resutle = await category.delete();
    
        if(typeof resutle.insertId === "number"){
            ctx.body = {code: 200, msg: '删除分类成功！', content: category_id};
        }else{
            ctx.body = {code: 401, msg: '删除分类失败！', content: resutle};
        }
    })



module.exports = router

