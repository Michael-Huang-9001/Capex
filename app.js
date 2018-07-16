/**
 * Rick Dales once said that this archiving dashboard may not be around forever.
 * If that's the case, this thing will either be obsolete or needs to be rewritten based on whatever the new platform is, if needed at all.
 *
 * The most important thing is to identify where a field in the report can be found.
 */

const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const favicon = require('serve-favicon');
const app = express();
const helmet = require('helmet');

// APP CONFIGURATION
// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(helmet());

// Using sessions for tracking logins
// Session stuff here
app.use(session({
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
        ttl: 24 * 60 * 60 * 1000,
        checkPeriod: 60 * 60 * 1000 // Checks for expiry every 24h
    }),
    secret: 'lebron to sixers',
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Exposes the username for the header nav bar.
app.use(function expose_username(req, res, next) {
    res.locals.user = req.session.user;
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


app.listen(8080, function () {
    console.log("App is running on 8080");
});