const Category = require('../dataStorage/mysql/Category');

module.exports = async (ctx,next)=>{

    const category = new Category();
    ctx.category =  await category.query();
    return next();
}