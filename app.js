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

//creating the tables
const Users = sequelize.define('users', {
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    passWord: {
        type: Sequelize.STRING
    }
});

Users.sync({force: true}).then(() => {
  })

const Blogs = sequelize.define('blogs', {
    title: {
        type: Sequelize.STRING
    },
    body: {
        type: Sequelize.STRING
    }
})

Blogs.sync({force: true}).then(() => {
})

Blogs.belongsTo(Users)

const Comments = sequelize.define('comments', {
    comment: {
        type: Sequelize.STRING
    }
})

Comments.sync({force: true}).then(() => {
})

Comments.belongsTo(Users)
Comments.belongsTo(Blogs)

app.listen(3000, function() {
    console.log("Server is listening on port 3000")
})