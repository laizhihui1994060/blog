const router = require('koa-router')()
const Categoty = require('../dataStorage/mysql/Category');
const Article = require('../dataStorage/mysql/Article');
const getCategory = require('../middleware/getCategory');
const uuid = require('node-uuid');  

router
	.post('/list' ,async (ctx, next) => {

		const body = ctx.request.body;

		if(!body.pageIndex)body.pageIndex = 1;
		if(!body.category_id)body.category_id = '';
		if(!body.article_title)body.article_title = '';
		if(!body.startTime)body.startTime = '';
		if(!body.endTime)body.endTime = '';
		


		let article = new Article();
		article.category_id = body.category_id;
		article.pageIndex = body.pageIndex;
		article.article_title = body.article_title;
		if(body.article_publish != '')article.article_publish = body.article_publish;
		article.article_createTime = {
			startTime:body.startTime,
			endTime:body.endTime
		}

		if( body.sortField ){
			article.sortField = body.sortField;
			article.orderBy = body.orderBy;
		}

		

		const count = await article.getCount();
		const articles = await article.getList();

		ctx.body =  {
			msg:"获取数据成功",
			code:200,
			pageCount:Math.ceil(count/Article.pageSize()),
			pageIndex:body.pageIndex,
			pageSize:Article.pageSize(),
			recordSize:count,
			content:articles
		}
		
	})

	.get('/detail/:articleId',async (ctx, next) => {

		let article = new Article();
		article.article_id = ctx.params.articleId;
		result = await article.query();

		ctx.body = {
			msg:"获取数据成功",
			code:200,
			content:result
		}
	})

	.post('/add', async (ctx, next) => {

		const body = ctx.request.body;

		let article = new Article();
		article.article_title = body.article_title;

		const articleQueryResult = await article.query();
		if(articleQueryResult.length)return ctx.body = {code: 403, msg: '当前文章已存在请重新命名!', content: []};
		
		const article_id = uuid.v1();

		article.article_id = article_id;
		article.article_publish = body.article_publish;
		article.article_content = body.article_content;
		article.category_id = body.category_id;
		article.article_author_id = body.article_author_id;


		const result = await article.insert();
		console.log( result)
		
		if(typeof result.insertId === "number"){
			ctx.body = {code: 200, msg: '添加文章成功！', content: article_id};
		}else{
			ctx.body = {code: 401, msg: '添加文章失败！', content: result};
		}
	})

	.put('/updata/:article_id', async (ctx, next) => {

		const body = ctx.request.body;
		const article_id = ctx.params.article_id;

		let article = new Article();
		article.article_id = article_id;
		article.category_id = body.category_id;
		article.article_publish = body.article_publish ? 1:0;
		article.article_content = body.article_content;
		article.article_author_id = body.article_author_id;
		article.article_title = body.article_title;

		const articleUpdataResult = await article.updata();
		
		if(typeof articleUpdataResult.insertId === "number"){
			ctx.body = {code: 200, msg: '修改文章成功！', content: article_id};
		}else{
			ctx.body = {code: 401, msg: '修改文章失败！', content: articleUpdataResult};
		}
	})
			

	.delete('/remove/:article_id', async (ctx, next) => {
	
		const article_id = ctx.params.article_id;
		let article = new Article();
		article.article_id = article_id;

		const articleDeleteResult = await article.delete();
		
		if(typeof articleDeleteResult.insertId === "number"){
			ctx.body = {code: 200, msg: '删除文章成功！', content: article_id};
		}else{
			ctx.body = {code: 401, msg: '删除文章失败！', content: articleDeleteResult};
		}
	})
				
		

	.put('/putStatus/:article_id/:article_publish', async (ctx, next) => {
	
		const article_id = ctx.params.article_id;
		const article_publish = ctx.params.article_publish;

		let article = new Article();
		article.article_id = article_id;
		article.article_publish = article_publish;
		

		const articleUpdataResult = await article.updata();
		
		if(typeof articleUpdataResult.insertId === "number"){
			ctx.body = {code: 200, msg: `${Number(article_publish) ? '发布文章成功!':'下架文章成功'}`, content: article_id};
		}else{
			ctx.body = {code: 401, msg: `${Number(article_publish) ? '发布文章失败!':'下架文章失败'}`, content: articleUpdataResult};
		}
	})
				
	
	




module.exports = router

