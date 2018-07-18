const express = require("express");
const router = express.Router();

const script = require('../Script/Calc');
const report_generator = require('../Script/ReportGenerator');

const nodemailer = require('nodemailer');

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
    res.render('index', {
        example: example,
        location: null,
        blobs: null,
        structs: null,
        index: null,
        total: 0,
        generate_report: false
    });

    // Use this in production
    // res.render('index', {example: null, location: null, blobs: null, structs: null, index: null, total: 0, generate_report: false});
});

router.post("/", function (req, res) {
    //console.log('-- POSTED');

    try {
        let data = req.body.form;

        if (data) {
            let sum = 0;
            let generate_report = false;

            //console.log("SORTED: ");
            data.sort(function (a, b) {
                return b.size - a.size;
            });
            //console.log(data);

            // This filters out any empty rows, e.g. both customer name and data size is empty
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].name || data[i].size) {
                    if (!data[i].size) {
                        data[i].size = 0;
                    } else {
                        sum += Math.ceil(Number(data[i].size));
                    }
                } else {
                    data.splice(i, 1);
                }
            }

            if (sum > 0) {
                generate_report = true;
            }

            let blobs = script.get_blob_count(sum);
            //console.log('--- Blobs:');
            //console.log(blobs);

            let structs = script.get_struct_count(sum, req.body.location);
            //console.log('--- Structs:');
            //console.log(structs);

            let indices = script.get_index_count(data);
            // console.log('--- Indices:');
            // console.log(indices);

            res.render('index', {
                example: data,
                location: req.body.location,
                blobs: blobs,
                structs: structs,
                index: indices,
                total: sum,
                generate_report: generate_report
            });
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.redirect("/");
    }
});

router.post("/download", function (req, res) {
    console.log('-- POSTED IN DOWNLOAD');

    try {
        let data = req.body.form;

        if (data) {
            let sum = 0;

            //console.log("SORTED: ");
            data.sort(function (a, b) {
                return b.size - a.size;
            });
            //console.log(data);

            // This filters out any empty rows, e.g. both customer name and data size is empty
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].name || data[i].size) {
                    if (!data[i].size) {
                        data[i].size = 0;
                    } else {
                        sum += Number(data[i].size);
                    }
                } else {
                    data.splice(i, 1);
                }
            }

            //console.log('Data size sum: ' + sum);
            //console.log(sizes);

            let blobs = script.get_blob_count(sum);
            //console.log('--- Blobs:');
            //console.log(blobs);

            let structs = script.get_struct_count(sum, req.body.location);
            //console.log('--- Structs:');
            //console.log(structs);

            let indices = script.get_index_count(data);
            console.log('--- Indices:');
            console.log(indices);

            report_generator.generate_report({
                table: data,
                blobs: blobs,
                structs: structs,
                index: indices,
                sum: sum,
                location: req.body.location
            }, res);
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.redirect("/");
    }
});

router.post("/email", function (req, res) {
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
        type: 'smtp',
        host: 'smtp.us.proofpoint.com',
        port: 25,
        secure: false,
        logger: true,
        debug: true,
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"Capex Calculator" <capexcalculator@proofpoint.com>', // sender address
        to: 'mihuang@proofpoint.com', // list of receivers
        subject: 'Test subject', // Subject line
        text: 'text content', // plaintext body
        html: '<b>Hello world ?</b>' +
        '<br>' +
        '<b>bruh</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
});

module.exports = router;
