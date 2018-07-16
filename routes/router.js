

const express = require("express");
const router = express.Router();
const ldap = require('ldapjs');
const sanitize_fname = require('sanitize-filename'); // Used for downloading the file to escape/sanitize potential metacharacters


const script = require('../Script/Calc');
const report_generator = require('../Script/ReportGenerator');

// Entry point for the app startup, grabs customer list from Archiving Dashboard
router.get("/", function (req, res) {
    // For testing
    let example = [
        {name: "A", size: 200},
        {name: "B", size: 67},
        {name: "C", size: 45},
        {name: "D", size: 33},
        {name: "E", size: 18}
    ];
    example.sort((a, b) => {
        return 0.5 - Math.random();
    });
    let blobs = {"sets": 0, "hosts": 0};
    let structs = {"sets": 0, "hosts": 0};
    res.render('index', {example: example, location: null, blobs: blobs, structs: structs});
    // res.render('index', {example: null, location: null, blobs: blobs, structs: structs});
});

router.post("/", function (req, res) {
    console.log('-- POSTED');

    let data = req.body.form;
    if (data) {
        let sum = 0;
        let sizes = [];

        // This filters out any empty rows, e.g. both customer name and data size is empty
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].name || data[i].size) {
                sum += Number(data[i].size);
                sizes.push((data[i].size) ? data[i].size : 0);
            } else {
                data.splice(i, 1);
            }
        }

        console.log('Data size sum: ' + sum);
        console.log(sizes);

        console.log("SORTED: ");
        data.sort(function (a, b) {
            return b.size - a.size;
        });
        console.log(data);
        //data = (data.length) ? data : [{'name': '', 'size': 0}]; // Make to to have least 1 row

        let blobs = script.get_blob_count(sum);
        console.log('--- Blobs:');
        console.log(blobs);

        let structs = script.get_struct_count(sum, Number(req.body.location));
        console.log('--- Structs:');
        console.log(structs);

        console.log('example: ');
        console.log(data);

        res.render('index', {example: data, location: req.body.location, blobs: blobs, structs: structs});
    } else {
        res.render('index', {example: data, location: null, blobs: {sets: 0, hosts: 0}, structs: {sets: 0, hosts: 0}});
    }
});

router.post("/", function (req, res) {
    console.log('-- POSTED');

    let data = req.body.form;
    if (data) {
        let sum = 0;
        let sizes = [];

        // This filters out any empty rows, e.g. both customer name and data size is empty
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].name || data[i].size) {
                sum += Number(data[i].size);
                sizes.push((data[i].size) ? data[i].size : 0);
            } else {
                data.splice(i, 1);
            }
        }

        console.log('Data size sum: ' + sum);
        console.log(sizes);

        console.log("SORTED: ");
        data.sort(function (a, b) {
            return b.size - a.size;
        });
        console.log(data);
        //data = (data.length) ? data : [{'name': '', 'size': 0}]; // Make to to have least 1 row

        let blobs = script.get_blob_count(sum);
        console.log('--- Blobs:');
        console.log(blobs);

        let structs = script.get_struct_count(sum, Number(req.body.location));
        console.log('--- Structs:');
        console.log(structs);

        console.log('example: ');
        console.log(data);

        report_generator.generate_report({})
    } else {
        res.render('index', {example: data, location: null, blobs: {sets: 0, hosts: 0}, structs: {sets: 0, hosts: 0}});
    }
});

// 30TB data needs:
//     4 host x Blob
// 2 host x NGSS
// 24 VM x Index => ( 4 host x HDD or 8 x regular)
//
// this requires:
//     6 host x R530
// 8 host x regular R730

module.exports = router;
