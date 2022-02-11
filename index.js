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

app.get("/", routes.index);

app.listen(3000);