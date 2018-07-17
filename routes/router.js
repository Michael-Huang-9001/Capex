const express = require("express");
const router = express.Router();

const script = require('../Script/Calc');
const report_generator = require('../Script/ReportGenerator');

// Entry point for the app startup, grabs customer list from Archiving Dashboard
router.get("/", function (req, res) {
    let blobs = {"sets": 0, "hosts": 0};
    let structs = {"sets": 0, "hosts": 0};

    // For testing
    // let example = [
    //     {name: "A", size: 200},
    //     {name: "B", size: 67},
    //     {name: "C", size: 45},
    //     {name: "D", size: 33},
    //     {name: "E", size: 18}
    // ];
    // example.sort((a, b) => {
    //     return 0.5 - Math.random();
    // });
    // res.render('index', {example: example, location: null, blobs: blobs, structs: structs, generate_report: false});

    // Use this in production
    res.render('index', {example: null, location: null, blobs: blobs, structs: structs, generate_report: false});
});

router.post("/", function (req, res) {
    //console.log('-- POSTED');

    try {
        let data = req.body.form;

        if (data) {
            let sum = 0;
            let sizes = []; // For index
            let generate_report = false;

            // This filters out any empty rows, e.g. both customer name and data size is empty
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].name || data[i].size) {
                    let num = Number(data[i].size);
                    sum += num;
                    sizes.push((num) ? num : 0);
                    generate_report = true;
                } else {
                    data.splice(i, 1);
                }
            }

            //console.log('Data size sum: ' + sum);
            //console.log(sizes);

            //console.log("SORTED: ");
            data.sort(function (a, b) {
                return b.size - a.size;
            });
            //console.log(data);


            let blobs = script.get_blob_count(sum);
            //console.log('--- Blobs:');
            //console.log(blobs);

            let structs = script.get_struct_count(sum, Number(req.body.location));
            //console.log('--- Structs:');
            //console.log(structs);

            res.render('index', {
                example: data,
                location: req.body.location,
                blobs: blobs,
                structs: structs,
                generate_report: generate_report
            });
        } else {
            res.render('index', {
                example: data,
                location: null,
                blobs: {sets: 0, hosts: 0},
                structs: {sets: 0, hosts: 0},
                generate_report: false
            });
        }
    } catch (error) {
        res.render('index', {
            example: req.body.form,
            location: null,
            blobs: {sets: 0, hosts: 0},
            structs: {sets: 0, hosts: 0},
            generate_report: false
        });
    }
});

router.post("/download", function (req, res) {
    //console.log('\n-- POSTED IN DOWNLOAD');

    try {
        let data = req.body.form;
        if (data && req.body.generate_report) {
            let sum = 0;
            let sizes = []; // For index

            // This filters out any empty rows, e.g. both customer name and data size is empty
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].name || data[i].size) {
                    let num = Number(data[i].size);
                    sum += num;
                    sizes.push((num) ? num : 0);
                } else {
                    data.splice(i, 1);
                }
            }

            //console.log('Data size sum: ' + sum);
            //console.log(sizes);

            //console.log("SORTED: ");
            data.sort(function (a, b) {
                return b.size - a.size;
            });
            //console.log(data);


            let blobs = script.get_blob_count(sum);
            //console.log('--- Blobs:');
            //console.log(blobs);

            let structs = script.get_struct_count(sum, Number(req.body.location));
            //console.log('--- Structs:');
            //console.log(structs);

            report_generator.generate_report({
                table: data,
                blobs: blobs,
                structs: structs,
                sum: sum,
                location: (Number(req.body.location) === 2) ? 'Frankfurt/Markham' : 'SC4'
            }, res);

            // res.download
        } else {
            res.render('index', {
                example: data,
                location: null,
                blobs: {sets: 0, hosts: 0},
                structs: {sets: 0, hosts: 0},
                generate_report: false
            });
        }
    } catch (error) {
        res.render('index', {
            example: req.body.form,
            location: null,
            blobs: {sets: 0, hosts: 0},
            structs: {sets: 0, hosts: 0},
            generate_report: false
        });
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
