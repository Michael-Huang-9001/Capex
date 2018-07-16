/**
 * CURRENTLY USING GLOBAL VARIABLES FOR PROCESSING REQUESTS, DANGEROUS IF THERE ARE CONCURRENT REQUESTS
 *
 * To-do:
 * Grab posts instead of using globals, e.g. server =(data)=> client =(same data)=> server => download
 * ^ This can solve concurrent requests, I hope. Or maybe there's another way.
 *
 * Catch point of failures.
 *
 * Bridge the login. e.g. Log in using LDAP, then check if is logged into dashboard somehow, the grab customers if so, login otherwise.
 * Or don't use Nikko's hard-coded login and asks user for login in index and refresh page to update list.
 *
 * Make things more efficient by looking for ways to grab info without page redirects.
 *
 * Consider: USE HTTPS
 *
 */

const express = require("express");
const router = express.Router();
const ldap = require('ldapjs');
const sanitize_fname = require('sanitize-filename'); // Used for downloading the file to escape/sanitize potential metacharacters


const script = require('../Script/Calc');
const report_generator = require('../Script/ReportGenerator');

// Entry point for the app startup, grabs customer list from Archiving Dashboard
router.get("/", function (req, res) {
    // For testing
    let data = [
        {name: "A", size: 200},
        {name: "B", size: 67},
        {name: "C", size: 45},
        {name: "D", size: 33},
        {name: "E", size: 18}
    ];
    res.render('index', {data: data});
    // res.render('index');
});

router.post("/", function (req, res) {
    console.log('-- POSTED');

    console.log(req.body.form);

    res.render('index', {data: null});
});

module.exports = router;
