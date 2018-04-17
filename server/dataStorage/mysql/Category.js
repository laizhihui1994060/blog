const ModuleDB = require('./ModuleDB');

class User extends ModuleDB{
    get table (){
        return 'category_tbl';
    }

    get primary(){
        return 'category_id';
    }

    get sort(){      //排序字段定义的key和value
        return {
            key:'sortField',
            value:'orderBy'
        }
    }
    get fields(){
        return ['category_id','created','category_name'];
    }
    get likes(){
        return ['category_name']
    }
    get limit(){
        return 'pageIndex'
    }
    get timeStamps(){
        return ['category_createTime']
    }
    get reutrnContent(){
        return ['category_id','user_name','category_name','category_createTime']
    }
    get relationFields(){
        return {
            'user_tbl':{
                sourceField:'created',
                relationField:'user_id'
            }
        }
    }
   
}

module.exports = User;