<% users.forEach(function(user) { %>
                                <% if (user.id === blog.userId) { %>
                                    <strong><%= user.userName %></strong>
                                <%}%>

                            <% }) %>





                            //blog page
app.get('/blogs', (req, res) => {
    if (req.session.user === undefined) {
        res.redirect("/signin")
    }
    Blogs.findAll()
    .then((blogs) => {
        Users.findAll({attributes: ['id', 'userName']})
        .then((blog, users) => {
        res.render("blogs", {blog:blog, user:users})
        })
    .catch(err => console.error('Error', err.stack))
})