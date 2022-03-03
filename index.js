const express = require("express"),
    pug = require("pug"),
    path = require("path"),
    routes = require("./routes/routes.js");

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "/public")));

const urlencodedParser = express.urlencoded({
    extended: false,
});

app.get("/", routes.homepage);

app.get("/userpage", routes.userpage);
app.get("/editcomicpage", routes.editcomicpage);

app.get("/user", routes.user);
app.get("/index", routes.index);
app.get("/loggedin", routes.loggedin);
app.get("/signup", routes.signup);

app.get("/test", routes.testpage);

//app.get("/signup", routes.signup)

app.get("/comicpage/:heroName", urlencodedParser, routes.comicpage);

app.post("/create", urlencodedParser, routes.create);

app.listen(3000);
