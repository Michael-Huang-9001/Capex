const testing = false;

const express = require("express");
const router = express.Router();

const script = require('../Script/Calc');
const report_generator = require('../Script/ReportGenerator');

const nodemailer = require('nodemailer');

const blob_cost = 6233.70;
const struct_cost = 6233.70;
const index_cost_EU = 6592.61;
const index_cost_US = 13775.00;

// Entry point for the app startup
router.get("/", function (req, res) {

    // For testing
    if (testing) {
        let example = [
            { name: "A", size: 200 },
            { name: "B", size: 67 },
            { name: "C", size: 45 },
            { name: "D", size: 33 },
            { name: "E", size: 18 }
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
            generate_report: false,
            blob_multiplier: blob_cost,
            struct_multiplier: struct_cost,
            index_multiplier: index_cost_US
        });
    } else {
        //Use this in production

        res.render('index', {
            example: null,
            location: null,
            blobs: null,
            structs: null,
            index: null,
            total: 0,
            generate_report: false,
            blob_multiplier: blob_cost,
            struct_multiplier: struct_cost,
            index_multiplier: index_cost_US
        });
    }
});

router.post("/", function (req, res) {
    //console.log('-- POSTED');

    try {
        //throw new Error();
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

            let indices = script.get_index_count(data, req.body.location);
            // console.log('--- Indices:');
            // console.log(indices);

            res.render('index', {
                example: data,
                location: req.body.location,
                blobs: blobs,
                structs: structs,
                index: indices,
                total: sum,
                generate_report: generate_report,
                blob_multiplier: (req.body.blob_multiplier) ? req.body.blob_multiplier : blob_cost,
                struct_multiplier: (req.body.struct_multiplier) ? req.body.struct_multiplier : struct_cost,
                index_multiplier: (req.body.location == 'CAN' || req.body.location == 'EU') ? index_cost_EU : index_cost_US
            });
        } else {
            res.redirect(req.headers.referer);
        }
    } catch (error) {
        console.log(error);
        res.redirect(req.headers.referer);
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

            let indices = script.get_index_count(data, req.body.location);
            //console.log('--- Indices:');
            //console.log(indices);

            report_generator.generate_report({
                table: data,
                blobs: blobs,
                structs: structs,
                index: indices,
                sum: sum,
                location: req.body.location
            }, res);
        } else {
            res.redirect(req.headers.referer);
        }
    } catch (error) {
        res.redirect(req.headers.referer);
    }
});

router.post("/email", function (req, res) {
    try {
        console.log('POSTED IN EMAIL');
        //console.log(req.body);

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            type: 'smtp',
            host: 'smtp.us.proofpoint.com',
            port: 25,
            secure: false,
            logger: false,
            debug: false,
        });

        // setup e-mail data with unicode symbols
        let mail_contents = {
            from: '"Capex Calculator" <capexcalculator@proofpoint.com>', // sender address
            to: req.body.email, // list of receivers
            //to: 'mihuang@proofpoint.com, hkaito@proofpoint.com', // list of receivers
            subject: '[' + new Date().toLocaleDateString() + '] Capex Calculation', // Subject line
            text: '', // plaintext body
            html: 'Location: ' + req.body.location +
                '<br><br><table border="1">' + req.body.form +
                '</table><br>' + req.body.total_size + '<br><table border="1">' + req.body.results +
                '</table><br>' + req.body.results_text // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mail_contents, function (error, info) {
            if (error) {
                console.log(error);
                res.end(JSON.stringify({ message: error.message, status: 200 }));
            } else {
                console.log('Message sent: ' + info.response);
                res.end(JSON.stringify({ message: "Email sent to " + req.body.email + ".", status: 200 }));
            }
        });
    } catch (error) {
        res.end(JSON.stringify({ message: "Email not sent.", status: 200 }));
    }
});

module.exports = router;
