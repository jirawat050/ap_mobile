
const sql = require('./db.js')
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var datetime = require('node-datetime');
var date_format = datetime.create();
var format_date = date_format.format('Y-m-d H:M:S');

const crypto = require('crypto');

const User = function (user) {
    this.username = user.username
    this.password = user.password
    this.first_name = user.first_name
    this.last_name = user.last_name
    this.tel = user.tel
    this.project_id = user.project_id
    this.email = user.email
    this.user_id = user.user_id === undefined? '':user.user_id 
    this.event_id = user.event_id === undefined? '':user.event_id 
    this.limit = user.limit === undefined? '':user.limit 
    this.offset = user.offset === undefined? '':user.offset 
}

User.register = async (newUser, result) => {
    // console.log("newUser",newUser);
    let secret = 'ap-mobile';
    let password = crypto.createHmac('sha256', secret)
    .update(newUser.password)
    .digest('hex');
    let value = {
        username:  newUser.username,
        password: password,
        first_name: newUser.first_name,
        last_name:newUser.last_name,
        tel: newUser.tel,
        project_id: newUser.project_id,
        created_on: format_date
    }
    
    try {
      let sql_project = "SELECT * FROM tb_project where id ="+"'"+value.project_id+"'"
      const check_project = await query(sql_project)
      if(check_project.length >0){
        let sql_check_email = "SELECT * FROM tb_user where username ="+"'"+value.username+"'"
        const dup_email = await query(sql_check_email)
        if(dup_email.length > 0){
              result(null,{ status_code: 404,Message: "Username is Duplicate"})
        }
        else{
          let sql_syntax = "INSERT INTO tb_user SET ?"
          const res = await query(sql_syntax,value)
          result(null, { id: res.insertId, ...newUser })
        }
      }
      else{
        result(null,{ status_code: 404,Message: "project id not found"})
      }

  


    } catch (error) {
      result(error, null)
    }
  }
  User.getAll = async result => {

  
    try {
      const row = await query( 'SELECT tb_user.*,tb_project.name FROM tb_user LEFT JOIN tb_project ON tb_user.project_id = tb_project.id' );

     // console.log("res",row)
      result(null, row)
    } catch (error) {
      console.error(error)
      result(error, null)
    }
}
User.login = async (newUser, result) => {
  let secret = 'ap-mobile';
  let password = crypto.createHmac('sha256', secret)
  .update(newUser.password)
  .digest('hex');
  let username = newUser.username
  try{
    let field ="id,username,first_name,last_name,is_lastest_login,created_on,updated_on"
    const data = await query('SELECT '+field+' FROM tb_user WHERE username = ? and password = ?',[username,password]);
    if(data.length <=0){
      result(null, { Status: 500,text: "username or password incorrect" })
    }
    else{
      result(null,data)
    }
  } catch (error) {

  }
}
User.logLogin = async (id,payload, result) => {
  try {
    res = await query("UPDATE tb_user SET is_lastest_login = ?, access_token = ?, refresh_token = ?, refresh_token_iat = ?, refresh_token_exp = ? WHERE id = ?", [payload.dt, payload.token, payload.refresh_token, payload.refresh_token_iat, payload.refresh_token_exp, id]);
    result(null, res);
} catch(err) {
    result(null, 'error');
}   
}
User.getNews = async (newUser, result) => {
    let limit  = newUser.limit == "" || newUser.limit == undefined ? 100 : newUser.limit;
    let offset = newUser.offset == "" || newUser.offset == undefined ? 0 : newUser.offset;
    try {
      const row = await query('SELECT tb_user.*,tb_project.name FROM tb_user LEFT JOIN tb_project ON tb_user.project_id = tb_project.id WHERE tb_user.id = ?',[newUser.user_id] );
      //console.log("row",row)
      if(row.length >0){
          let project_name = row[0].name;
          if(project_name == "All"){
            console.log("pass if")
            let sql = "SELECT tb_project.name as project_name,tb_event.id as news_id,tb_event.title_th,tb_event.created_on FROM tb_event LEFT JOIN tb_project ON tb_project.id = tb_event.project_id"+" LIMIT " + limit + " OFFSET " + offset; 
            var data = await query(sql)
          
          }
          else{
            let get_project =  await query("SELECT id FROM tb_project WHERE name = 'All'")
            let sql = "SELECT tb_project.name as project_name,tb_event.id as news_id,tb_event.title_th,tb_event.created_on,tb_event.project_id FROM tb_event LEFT JOIN tb_project ON tb_project.id = tb_event.project_id where tb_event.project_id IN ("+ [row[0].project_id,get_project[0].id]+")"+" LIMIT " + limit + " OFFSET " + offset; 
            var data = await query(sql)
           
          }
          let select_view = "SELECT event_id FROM tb_view_event WHERE user_id = "+row[0].id
          var view = await query(select_view)
      
          for(let i=0;i< view.length;i++){
              for(let j=0;j< data.length;j++){
                  if(view[i].event_id === data[j].news_id){
                    data[j].read = "Y"
                    }
                }
          }
        result(null,data)
      }
      else{
        result(null, { Status: 500,text: "username or password incorrect" })
      }
    } catch (error) {
      console.error(error)
      result(error, null)
    }
}


User.readNews  = async (newUser, result) => {
    //console.log(newUser)
    try {
        const row = await query('SELECT tb_user.*,tb_project.name FROM tb_user LEFT JOIN tb_project ON tb_user.project_id = tb_project.id WHERE tb_user.id = ?',[newUser.user_id] );
        if(row[0].name === "All"){
            var data = await query('SELECT * FROM tb_event WHERE id = ? ',[newUser.event_id,row[0]])

        }
        else{
            let get_project =  await query("SELECT id FROM tb_project WHERE name = 'All'")
              
            let sql = "SELECT *FROM tb_event where project_id IN ("+ [row[0].project_id,get_project[0].id]+") AND id = "+newUser.event_id
            var data = await query(sql) 
        }
        let check_view = await query('SELECT * FROM tb_view_event WHERE user_id = ? AND event_id = ?',[newUser.user_id,newUser.event_id])
        if(check_view.length <= 0){
            let value = {
                user_id:  newUser.user_id,
                event_id: newUser.event_id,
                created_on: formatted,
                updated_on: formatted
              
            }
            let sql_syntax = "INSERT INTO tb_view_event SET ?"
            const value_data = await query(sql_syntax,value)
  
        }
        result(null, data)

      } catch (error) {
        console.error(error)
        result(error, null)
      }
}
module.exports = User