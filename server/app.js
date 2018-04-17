const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const session = require('koa-session-minimal')
const MysqlStore = require('koa-mysql-session')
const logger = require('koa-logger')
const glob = require('glob');
const router = require('koa-router')()
const path = require('path')
const serve = require("koa-static")


const config = require('./config/config.json');
const getFile = require('./util/getFile');




const watchError = require('./middleware/error');

const store = new MysqlStore({
	user: config.session.user,
	password: config.session.password,
	database: config.session.db,
	host: config.session.host
});
const cookie = {
    maxAge: config.session.max_age,
    path: config.session.path,
    domain: config.session.domain,
}


// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

app.use(session({
	key: config.session.key,
	store:store,
	cookie: cookie
}))

app.use(json())
app.use(logger())

app.use(require("koa-static")(path.join(__dirname,"public")));
// app.use(require("koa-static")(path.join(__dirname,"../client/admin/src")));


app.use(serve(path.join(__dirname,"../public/")));
app.use(serve(path.join(__dirname,"/static/")));

// logger

app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(watchError);




app.use(async (ctx,next)=>{
	if(ctx.url == '/admin'){
		const file = await getFile('../../client/admin/app.html');
		ctx.res.end(file);
	}else{
		await next()
	}
	
});

// routes

glob('./routes/*',function(er,files){
  console.log(files)
  
  files.forEach((file)=>{
    let route = require(file);
    let fileName = file.split('/').pop().split('.')[0];
    route.prefix('/api/' + fileName);
    app.use(route.middleware())
  })
})

// let route = require('./routes/index');
// app.use(route.routes(), route.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
