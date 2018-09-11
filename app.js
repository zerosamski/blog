//requiring modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

//configuring modules
app = express();
app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.static('node_modules/bulma/css'));
app.use(bodyParser.urlencoded({extended: true}))


const sequelize = new Sequelize('blog', process.env.PGUSER, 'password', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false
})

//model definitions
const Users = sequelize.define('users', {
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    userName: {
        type: Sequelize.STRING, unique: true
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

//set up sessions
app.use(session({
    secret: "canihazcheeseburger",
    store: new SequelizeStore({
        db: sequelize
    }),
    resave: false,
    saveUninitialized: false,

}))


app.get("/", (req, res) => {
    res.render("home")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.listen(3000, function() {
    console.log("Server is listening on port 3000")
})