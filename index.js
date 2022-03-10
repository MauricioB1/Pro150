const express = require("express"),
    pug = require("pug"),
    path = require("path"),
    routes = require("./routes/routes.js"),
    expressSession = require("express-session");
    config = require('./config'),
    favicon = require('serve-favicon');


const app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "/public")));

app.use(expressSession({
    secret: 'wh4t3v3r',
    saveUninitialized: true,
    resave: true
}));

const checkAuth = (req, res, next) => {
    if(req.session.user && req.session.user.isAuthenticated) {
        next();
    } else {
        res.redirect(req.get("referer"));
    }
};

const urlencodedParser = express.urlencoded({
    extended: false,
});

app.get("/", routes.homepage);

app.get("/userpage", routes.userpage);
app.get("/editcomicpage/:heroName", checkAuth, routes.editcomicpage);
app.post("/edit/:id",urlencodedParser, routes.editUser)
app.get("/user", routes.user);
app.get("/index", routes.index);
//app.get("/loggedin", routes.loggedin);
app.get("/signup", routes.signup);
app.get("/login", checkAuth, routes.login);
app.post("/login",urlencodedParser, routes.login);
app.get("/signup", routes.signup);


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err);
        } else {
            config.user[0][1] = "Guest";
            config.user[1][1] = "/tempPFP.png";
            res.redirect('/');
        }
    });
});

app.get("/test", routes.testpage);

app.post("/changeComic/:heroName", urlencodedParser, routes.changeComic)

//app.get("/signup", routes.signup)

app.get("/comicpage/:heroName", urlencodedParser, routes.comicpage);

app.post("/create", urlencodedParser, routes.create);

app.post("/results", urlencodedParser, routes.search);

app.listen(3000);
