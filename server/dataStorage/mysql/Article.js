const ModuleDB = require('./ModuleDB');

class Article extends ModuleDB{
    get table (){
        return 'article_tbl';
    }

    get primary(){
        return 'article_id';
    }

    get fields(){
        return ['article_id','category_id','article_title','article_content','article_abulous_number','article_belittle_number','report','article_author_id','article_publish','article_createTime'];
    }
    get filterFields(){    //搜索的字段
        return ['category_id','article_publish']
    }
    get likes(){   //模糊查询字段
        return ['article_title']
    }
    get sort(){      //排序字段定义的key和value
        return {
            key:'sortField',
            value:'orderBy'
        }
    }
    get limit(){   //分页字段
        return 'pageIndex'
    }
    get timeStamps(){  //时间范围
        return ['article_createTime']
    }
    get reutrnContent(){   //返回的字段
        return ['article_title','user_name','article_content','category_name','article_abulous_number','article_belittle_number','report','article_publish','article_id','article_createTime']
    }
   
    get relationFields(){   //关联的表
        return {
            'category_tbl':{
                sourceField:'category_id',
                relationField:'category_id'
            },
            'user_tbl':{
                sourceField:'article_author_id',
                relationField:'user_id'
            }
        }
    }
 
}

module.exports = Article;