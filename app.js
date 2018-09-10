const express = require('express');
app = express();
const bodyParser = require('body-parser');

app.set("view enginge", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))

const Sequelize = require('sequelize');
const sequelize = new Sequelize('blog', process.env.PGUSER, 'password', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,

})

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  })


app.listen(3000, function() {
    console.log("Server is listening on port 3000")
})