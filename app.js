//requiring modules
require('dotenv').config()
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

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  storage: "./session.postgres",
  host: process.env.DB_HOST,
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
        type: Sequelize.STRING, unique: true
    },
    body: {
        type: Sequelize.TEXT
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
    if (req.session.user === undefined) {
        res.render("home")
    } else {
        res.render("homeloggedin")
    }
})

//signing up
app.get("/signup", (req, res) => {
    let warningname = "";
    res.render("signup", {warningname: warningname})
})

app.post('/signup', (req, res) => {
    Users.findOne({
        where: {
            userName: req.body.userName
        }
    })
    .then((result) => {
        if (result === null) {
    
            Users.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                userName: req.body.userName,
                passWord: req.body.passWord
            })
            .then((user) => {
                req.session.user = user;
                res.render("homeloggedin")
            })
            .catch(err => console.error('Error', err.stack))
        } else {
            warningname = "This username is already taken!"
            res.render("signup", {warningname: warningname})
        }
    })
}) 

//login
app.get("/signin", (req, res) => {
    let messageusername;
    let messagepassword;
    res.render("signin", {messageusername: messageusername, 
        messagepassword: messagepassword})
})

app.post("/signin", (req, res) => { 
    let messageusername;
    let messagepassword;
        
    Users.findOne({
        where: {
        userName: req.body.userName
        }
    })
    
    .then((user) => {
        if (user === null) {
            messageusername = "This user doesn't exist";
            res.render("signin", {messageusername: messageusername, messagepassword: messagepassword})
        }
        if (user !== null && req.body.passWord === user.passWord) {
            req.session.user = user;
            res.redirect("blogs")
        } else {
            messagepassword = "Username and password do not match"
            res.render("signin", {messageusername: messageusername, messagepassword: messagepassword})
        }
    })
    .catch(err => console.error('Error', err.stack))
})

//logging out
app.get('/logout', (req, res) => {
    req.session.destroy() 
    .then(res.redirect("/"))
    .catch(err => console.error('Error', err.stack))
})

//blog page
app.get('/blogs', (req, res) => {
    if (req.session.user === undefined) {
        res.redirect("/signin")
    }
    
    Users.findAll({attributes: ['id', 'firstName', 'lastName']})
    .then((users) => {
        Blogs.findAll()
        .then((blogs) => {
            console.log(blogs)
            res.render("blogs", {blogs: blogs, users: users})
            }) 
        })
    .catch(err => console.error('Error', err.stack))
})

//making a new blog
app.get('/blogs/new', (req, res) => {
    if(req.session.user === undefined) {
        res.redirect("/signin")
    }
    warningtitle = "";
    res.render("new", {warningtitle: warningtitle})
})

app.post('/blogs/new', (req, res) => {
    Blogs.findOne({
        where: {
        title: req.body.title
        }
    })
    .then((response) => {
        console.log(response)
        if (response === null) {
            Blogs.create({
                title: req.body.title,
                body: req.body.body,
                userId: req.session.user.id
            })
            .then(() => {
                Blogs.findOne({
                where: {
                    title: req.body.title
                }
                })
                .then((blog) => {
                    res.redirect(`/blogs/${blog.id}`)})
            })
            .catch(err => console.error('Error', err.stack))
        } else {
            warningtitle = "This title is already taken!"
            res.render("new", {warningtitle: warningtitle})
        }
    })
})


//show individual blog
app.get("/blogs/:id", (req, res) => {
    Users.findAll({attributes: ['id', 'firstName', 'lastName']})
    .then((users) => {
        Blogs.findById(req.params.id)
        .then((foundBlog) => {
            Comments.findAll({
                where: {
                    blogId: req.params.id
                }
            })
            .then((comments) => {
            res.render("blog", {foundBlog: foundBlog, users: users, comments: comments})
            })
            .catch(err => console.error('Error', err.stack))
        }) 
    })
})

//post comment
app.post("/blogs/:id", (req, res) => {
    Comments.create({
        comment: req.body.comment,
        userId: req.session.user.id,
        blogId: req.params.id
    })
    .then(res.redirect(`/blogs/${req.params.id}`))
    .catch(err => console.error('Error', err.stack))
})

app.get("/user", (req, res) => {
    Users.findById(req.session.user.id)
    .then((foundUser) => {
        Blogs.findAll({
            where: {
                userId: req.session.user.id
            }
        })
        .then((userBlogs) => {
            res.render("user", {foundUser: foundUser, userBlogs: userBlogs})
        })
    })
})

//show all blogs of user {
    app.get("/user/:id", (req, res) => {
    Users.findById(req.params.id)
    .then((foundUser) => {
        Blogs.findAll({
            where: {
                userId: req.params.id
            }
        })
        .then((userBlogs) => {
            res.render("user", {foundUser: foundUser, userBlogs: userBlogs})
        })
    })
})

app.listen(3000, function() {
    console.log("Server is listening on port 3000")
})



