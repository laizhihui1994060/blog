const Article = require('../dataStorage/mysql/Article');

module.exports = async (ctx,next)=>{

    const article = new Article();
    ctx.article =  await article.query();
    return next();
}