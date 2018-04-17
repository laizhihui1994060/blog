const mysql = require('mysql');
const config = require('../../config/config');
const randomString = require('../../util/randomString')
const pool = mysql.createPool({
    connectTimeout  : 60 * 60 * 1000,    
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.db
});


class ModuleDB{
    _query(sql, args = []) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) return reject(err);
                console.log(`run ${sql} \narray ${args}`)
                connection.query(sql, args, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
    
                    connection.release();
                });
            });
        });
    }
    query(){
        let sql,{attrs, vals, err} = ModuleDB.getDBModuleArgs(this);
        if(err) return console.log(`object ${this.constructor.toString()} lack necessary field (table, fields)`);

        let str = attrs.reduce((str,value)=>{
            if(attrs.length === 1){
                return str += `${value}= ?`;
            }else{
                return str += ` ${value}= ? ${ModuleDB.AND()}`;
            }
        },'');

        if(attrs.length > 1)str = str.slice(0,-(ModuleDB.AND().length));

        sql = `SELECT * FROM ${this.table} ${str ? `WHERE ${str}` :'' }`;
        
        return this._query(sql, vals);
    }

    insert(){
        let sql,{attrs, vals, err} = ModuleDB.getDBModuleArgs(this);

        if(err) return console.log(`object ${this.constructor.toString()} lack necessary field (table, fields)`);

        sql = `INSERT INTO ${this.table} (${attrs.join(',')}) VALUES (${vals.map(()=>'?')})`;

        return this._query(sql, vals);
        
    }

    updata(){
        let sql,{attrs, vals, err} = ModuleDB.getDBModuleArgs(this);

        if(err) return console.log(`object ${this.constructor.toString()} lack necessary field (table, fields)`);

        sql = `UPDATE ${this.table} SET ${attrs.map((attr)=>`${attr}=?`)} WHERE ${this.primary}='${this[this.primary]}'`;

        return this._query(sql, vals);
        
    }
    delete(){

        if(!this[this.primary]){
            return console.log(`${this.table}的primary${this.primary}尚未赋值，无法删除`)
        }

        let sql = `DELETE FROM ${this.table}  WHERE ${this.primary}='${this[this.primary]}'`;

        return this._query(sql);
        
    }
    getCount(){
        let sql = `SELECT ${ModuleDB.count()}  FROM ${this.table}`;
        let sourceRandomString = randomString();
        
        sql = this.joinRelationFields(sql,sourceRandomString);
        sql = this.joinLikes(sql,sourceRandomString);
        sql = this.joinTimeStamps(sql,sourceRandomString);
        sql = this.joinFilterFields(sql,sourceRandomString);

        return this._query(sql).then((count)=>{
            return new Promise((resolve,reject)=>{
                resolve(count[0]['COUNT(*)']);
            });
        });
    }
    getList(){

        if(!this.reutrnContent)Promise.reject('reutrnContent未定义');
        let sql = `SELECT ${this.reutrnContent.join(',')}  FROM ${this.table}`;
        let sourceRandomString = randomString();
        
        sql = this.joinRelationFields(sql,sourceRandomString);
        sql = this.joinLikes(sql,sourceRandomString);
        sql = this.joinTimeStamps(sql,sourceRandomString);
        sql = this.joinFilterFields(sql,sourceRandomString);
        sql = this.joinSort(sql,sourceRandomString);
        sql = this.joinLimit(sql,sourceRandomString);
        
        return this._query(sql);
    }
    joinRelationFields(sql,sourceRandomString){
        if(!this.relationFields)return sql;
        sql += ` ${ sourceRandomString}`;

        for(let i in this.relationFields){

            if(this.relationFields[i].sourceField && this.relationFields[i].relationField){
                let relationRandomString = randomString();
                
                sql += ` INNER JOIN ${i} ${relationRandomString} ON ${sourceRandomString + '.' + [ this.relationFields[i].sourceField ]}=${relationRandomString + '.' + [ this.relationFields[i].relationField ]} `

            }else{
                Promise.reject('relationFields内容格式定义不规范。例子\n（{user_tbl:{sourceField:"article_author_id",relationField:"user_id"}}）');
            }
        }

        return sql;
    }
    joinLikes(sql,sourceRandomString){
        
        if(!this.likes)return sql;
        let likeSql = '',
            {attrs, vals, err} = ModuleDB.getDBModuleLikeArgs(this);

        if(err) return console.log(`like,object ${this.constructor.toString()} lack necessary field (table, fields)`);


        for(let i = 0 ;i<attrs.length;i++){
            if( vals[i] ) likeSql += ` ${attrs[i]} LIKE '%${vals[i]}%'`;
        }

        if(!likeSql)return sql;

        
        if( sql.indexOf('WHERE') != -1 ){
            sql += ` AND likeSql`;
        }else{
            console.log("??")
            likeSql = likeSql.replace('and','');
            sql += ` WHERE ${likeSql}`
        }
        return sql;
    }
    joinTimeStamps(sql,sourceRandomString){
        if(!this.timeStamps)return sql;
        let timeSql = '',
        {attrs, vals, err} = ModuleDB.getDBModuleTimeStampArgs(this);

        if(err) return console.log(`timeStamp,object ${this.constructor.toString()} lack necessary field (table, fields)`);

        
        for(let i = 0 ;i<attrs.length;i++){

            if(typeof vals[i] != 'object') return console.log(`${attrs[i]}时间戳查询需要传对象例如article_createTime={startTime:'',endTime:''}`);

            if( vals[i].startTime || vals[i].endTime ){
                timeSql += ` ${attrs[i]} >= '${vals[i].startTime}' AND ${attrs[i]} <= '${vals[i].endTime}' `;
            }
        
        }
        if(!timeSql)return sql;
        
        if( sql.indexOf('WHERE') != -1){
            sql += ` AND ${timeSql}`;
        }else{
            timeSql = timeSql.replace('and','');
            sql += ` WHERE ${timeSql}`
        }

        return sql;
    }
    joinFilterFields(sql,sourceRandomString){
        if(!this.filterFields)return sql;
        let filterFieldSql,{attrs, vals, err} = ModuleDB.getDBModuleFilterArgs(this);
        if(err) return console.log(`filterFields,object ${this.constructor.toString()} lack necessary field (table, fields)`);

        filterFieldSql = attrs.reduce((filterFieldSql,value,index)=>{
            if(!filterFieldSql)filterFieldSql = '';
            if(vals[index]){
                if(attrs.length === 1){
                    
                    return filterFieldSql += `${ModuleDB.AND()} ${sourceRandomString}.${value}= '${vals[index]}'`;
                }else{
                    return filterFieldSql += ` ${value}= '${vals[index]}' ${ModuleDB.AND()}`;
                }
            }
        },'');

        if(!filterFieldSql)return sql;
        if(attrs.length > 1)filterFieldSql = filterFieldSql.slice(0,-(ModuleDB.AND().length));

        
        if( sql.indexOf('WHERE') != -1 ){
            sql += filterFieldSql;
        }else{
            filterFieldSql = filterFieldSql.replace('and','');
            sql += ` WHERE ${filterFieldSql}`
        }
        return sql;
    }
    joinLimit(sql,sourceRandomString){

        if(this.limit && this[this.limit]){
            const pageIndex = Number(this[this.limit]);
            sql += ` LIMIT ${(pageIndex - 1) * ModuleDB.pageSize()  + ',' + pageIndex * ModuleDB.pageSize() }`;
        }else{
            sql += ` LIMIT 0 , 10 `;
        }
        

        return sql
    }
    joinSort(sql,sourceRandomString){
        let {err,key,value} = ModuleDB.getDBModuleSortFidldSql(this);

        if( !err )return sql;

        return sql += ` ORDER BY ${key} ${value}`
    }
    static AND(){
        return 'and';
    }
    static pageSize(){
        return 10 ;
    }

    static count(){
        return `COUNT(*)`;
    }

    static getDBModuleArgs(ModuleDB){
        if( !( (ModuleDB.table && ModuleDB.primary) && (Object.prototype.toString.call(ModuleDB.fields) == '[object Array]' && ModuleDB.fields.length>0 ) )){
            return {err:true};
        }

        let attrs = [], vals = [];

        for(let field of ModuleDB.fields){
            if( ModuleDB[field] != null && ModuleDB[field] != undefined ){
                attrs.push(field);
                vals.push( ModuleDB[field] );
            }
        }

        return {
            err:false,
            attrs,
            vals
        }


    }

    static getDBModuleLikeArgs(ModuleDB){
        if( !( (ModuleDB.table && ModuleDB.primary) && (Object.prototype.toString.call(ModuleDB.likes) == '[object Array]' && ModuleDB.likes.length>0 ) )){
            return {err:true};
        }

        let attrs = [], vals = [];

        for(let like of ModuleDB.likes){
            if( ModuleDB[like] != null && ModuleDB[like] != undefined ){
                attrs.push(like);
                vals.push( ModuleDB[like] );
            }
        }

        return {
            err:false,
            attrs,
            vals
        }


    }

    static getDBModuleTimeStampArgs(ModuleDB){
        if( !( (ModuleDB.table && ModuleDB.primary) && (Object.prototype.toString.call(ModuleDB.timeStamps) == '[object Array]' && ModuleDB.timeStamps.length>0 ) )){
            return {err:true};
        }

        let attrs = [], vals = [];

        for(let timeStamp of ModuleDB.timeStamps){
            if( ModuleDB[timeStamp] != null && ModuleDB[timeStamp] != undefined ){
                attrs.push(timeStamp);
                vals.push( ModuleDB[timeStamp] );
            }
        }

        return {
            err:false,
            attrs,
            vals
        }


    }
    
    static getDBModuleFilterArgs(ModuleDB){
        if( !( (ModuleDB.table && ModuleDB.primary) && (Object.prototype.toString.call(ModuleDB.filterFields) == '[object Array]' && ModuleDB.filterFields.length>0 ) )){
            return {err:true};
        }

        let attrs = [], vals = [];

        for(let field of ModuleDB.filterFields){
            if( ModuleDB[field] != null && ModuleDB[field] != undefined ){
                attrs.push(field);
                vals.push( ModuleDB[field] );
            }
        }

        return {
            err:false,
            attrs,
            vals
        }

    }

    static getDBModuleSortFidldSql(ModuleDB){
        if( !( (ModuleDB.table && ModuleDB.primary) && (Object.prototype.toString.call(ModuleDB.sort) == '[object Object]' ) )){
            return {err:false} ;
        }

        if( !(ModuleDB.sort.key && ModuleDB.sort.value) ) {
            console.log(`sql查询排序错误，请检查${ModuleDB}表类的sort定义`)
            return {err:false};
        }


        if( (ModuleDB.reutrnContent ? ModuleDB.reutrnContent : ModuleDB.fields).indexOf(  ModuleDB[ModuleDB.sort.key] ) > -1 && this.sortType().indexOf( ModuleDB[ModuleDB.sort.value].toLocaleUpperCase() ) > -1){
            return {
                key:ModuleDB[ModuleDB.sort.key],
                value:ModuleDB[ModuleDB.sort.value].toLocaleUpperCase(),
                err:true
            }
        }else{
            return {err:false}
        }
    }

    static sortType(){
        return ['ASC','DESC']
    }


}

module.exports = ModuleDB;



