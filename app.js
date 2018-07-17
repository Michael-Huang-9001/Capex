const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");
//const favicon = require('serve-favicon');
const app = express();
const helmet = require('helmet');
const comp = require('compression');

// APP CONFIGURATION
// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(helmet());
app.use(comp());

// set so we don't have to type .ejs all the time when routing
app.set("view engine", "ejs");
// used so we can make a public folder that contains stylesheet and js, and be able to access it
app.use(express.static(__dirname + "/public"));
//including routes. Separating the routes to different file, so it will be cleaner.
let routes = require("./routes/router");
// used so we can get data from forms and etc.
app.use(bodyParser.urlencoded({extended: true}));
// security. This line of code has to be always after body-parser
app.use(expressSanitizer());
// so we can use PUT request
app.use(methodOverride("_method"));
app.use(routes);

//catch 404 and forward to error handler
app.use(function () {
    let err = new Error("File Not Found");
    err.status = 404;
});

//error handler
//defined as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

app.listen(8082, function () {
    console.log("App is running on 8082");
});