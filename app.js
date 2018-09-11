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
  storage: "./session.postgres",
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

const Blogs = sequelize.define('blogs', {
    title: {
        type: Sequelize.STRING
    },
    body: {
        type: Sequelize.STRING
    }
})
Blogs.belongsTo(Users)

const Comments = sequelize.define('comments', {
    comment: {
        type: Sequelize.STRING
    }
})

sequelize.sync().then(() => {
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

//routing

//homepage
app.get("/", (req, res) => {
    res.render("home")
})

//signing up
app.get("/signup", (req, res) => {
    res.render("signup")
})

app.post('/signup', (req, res) => {
    console.log(req.body)
    Users.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        passWord: req.body.passWord
    })
    .then((user) => {
        req.session.user = user;
        res.redirect("/")
    })
    .catch(err => console.error('Error', err.stack))
})  

//login
app.get("/signin", (req, res) => {
    let messageusername;
    let messagepassword;
    res.render("signin", {messageusername: messageusername, 
        messagepassword: messagepassword})
})

app.post("/signin", (req, res) => { 
    var messageusername;
    var messagepassword;
    var username = req.body.userName;
    var password = req.body.passWord;
        
    Users.findOne({
        where: {
        userName: username
        }
    })
    .then((user) => {
        if (user === null) {
            messageusername = "This user doesn't exist";
            res.render("signin", {messageusername: messageusername, messagepassword: messagepassword})
        }
        if (user !== null && password === user.passWord) {
            req.session.user = user;
            res.send('blogs page')
        } else {
            messagepassword = "Username and password do not match"
            res.render("signin", {messageusername: messageusername, messagepassword: messagepassword})
        }
    })
    .catch(err => console.error('Error', err.stack))
})

//
// app.get("/post") {
//     res.send('this is the post page')
// }


app.listen(3000, function() {
    console.log("Server is listening on port 3000")
})