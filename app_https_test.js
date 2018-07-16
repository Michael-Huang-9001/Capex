/**
 * NOTE: Don't run this in production, this is meant for local testing.
 * This uses cookie sessions and expires in 1 day. This is so you don't have to log in for another day.
 */

const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");
//const session = require("express-session");
const cookie_session = require('cookie-session');
const favicon = require('serve-favicon');
const app = express();
const helmet = require('helmet');

// APP CONFIGURATION
// app.use(favicon(__dirname + '/public/favicon.ico'));

// Middleware to add header security, or something.
app.use(helmet());

// Using sessions for tracking logins
// Session stuff here
let session_config = {
    name: 'session',
    keys: ['lebron to sixers'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

app.use(cookie_session(session_config));

// Exposes the username for the header nav bar.
app.use(function expose_username(req, res, next) {
    //if (req.session && req.session.user) {
        res.locals.user = req.session.user;
    //}
    next();
});

// Disables back button from showing contents when logged out.
app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

// Prints session data
// app.use(function printSession(req, res, next) {
//     console.log('req.session', req.session);
//     next();
// });

// set so we don't have to type .ejs all the time when routing
app.set("view engine", "ejs");
// used so we can make a public folder that contains stylesheet and js, and be able to access it
app.use(express.static(__dirname + "/public"));
//including routes. Separating the routes to different file, so it will be cleaner.
let routes = require("./routes_copy/router");
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

app.listen(8000, function () {
    console.log("App is running on 8000");
});

