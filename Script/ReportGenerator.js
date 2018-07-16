/**
 *
 * IF YOU WANT TO RUN THIS SCRIPT INDEPENDENTLY AND NOT IN EXPRESS, ADD A '.' (PERIOD) IN FRONT OF EVERY FILEPATH.
 * IN NODE, USE './SCREENSHOTS/...'
 * INDEPENDENTLY, USE '../SCREENSHOTS/...'
 */

const docx = require('docx');
const fs = require('fs');

/**
 * Generates DOCX file, planning to switch to docx rather than officegen
 * param pdf is a boolean that indicates whether to generate a pdf or docx
 */
async function generate_report(report_json, res, pdf) {
    if (pdf) {
        console.log('-- Generating .pdf report...');
    } else {
        console.log('-- Generating .docx report...');
    }

    try {
        // Read an external style from the As Built template. Needed for the vertical padding in table cells among other things
        let style = fs.readFileSync('./Screenshots/styles.xml', 'utf-8');

        // Makes a new document with
        const doc = new docx.Document({
            title: 'Title',
            externalStyles: style,
        }, {
            top: 0,
            header: 100, // Header top margin
            footer: 100, // Footer bottom margin
            bottom: 0
        });

        //const doc = new docx.Document();

        /**
         * Helper method to generate text in document
         * @param val the string to be added
         * @param size the font size, use actual font pt instead of *2
         * @param center if the text should be centered
         * @param bold if the text should be bold
         */
        function make_text(val, size, center, bold) {
            let p = (center) ? new docx.Paragraph().center() : new docx.Paragraph();
            let run = new docx.TextRun(val).font('Arial').size(size * 2);
            if (bold) {
                run = run.bold();
            }
            p.addRun(run);
            doc.addParagraph(p);
        }

        /**
         * Helper for generating today's date
         * @returns e.g. July 7, 2018
         */
        function today() {
            let date = new Date();
            let months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

            return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear()
        }

        /**
         * Adds content to a given table.
         * @param table the table to add content to
         * @param json:
         * {
         *      val: the content to be added
         *      bold: if the string should be bold
         *      x: the row of the table to add the content to
         *      y: the column of the table to add the content to
         * }
         *
         */
        function add_to_table(table, json) {
            let p = new docx.Paragraph().spacing({before: 0, after: 240, line: 276});
            let run = new docx.TextRun(json['val']).font('Arial').size(20);
            if (json['bold']) {
                run = run.bold();
            }
            p.addRun(run);

            table.getCell(json.x, json.y).cellProperties.setWidth(20000); // Make each cell impossibly big and force a stretch
            table.getCell(json.x, json.y).addContent(p);
        }

        /**
         * Adds the account details table
         */
        function account_details() {
            make_text('Account Details', 10, false, true);
            doc.createParagraph();
            const table = doc.createTable(4, 2);
            add_to_table(table, {val: 'Account Name', bold: false, x: 0, y: 0});
            add_to_table(table, {val: report_json['account_name'], bold: false, x: 0, y: 1});
            add_to_table(table, {val: 'GUID', bold: false, x: 1, y: 0});
            add_to_table(table, {val: report_json['guid'], bold: false, x: 1, y: 1});
            add_to_table(table, {val: 'Datacenter', bold: false, x: 2, y: 0});
            add_to_table(table, {val: report_json['datacenter'], bold: false, x: 2, y: 1});
            add_to_table(table, {val: 'Appliance Version', bold: false, x: 3, y: 0});
            add_to_table(table, {val: report_json['appliance_version'], bold: false, x: 3, y: 1});
            doc.createParagraph();
        }

        /**
         * Adds the AD account table
         */
        function AD_account() {
            make_text('AD domain and Account used with Ad reader (Directory Sync)', 10, false, true);
            doc.createParagraph();
            const table = doc.createTable(3, 3);
            add_to_table(table, {val: 'Domain', bold: true, x: 0, y: 0});
            add_to_table(table, {val: 'AD Account', bold: true, x: 0, y: 1});
            add_to_table(table, {val: 'User Directory Server', bold: true, x: 0, y: 2});
            add_to_table(table, {val: 'METNET.NET', bold: false, x: 1, y: 0});
            add_to_table(table, {val: 'USSALES.NET', bold: false, x: 2, y: 0});


            add_to_table(table, {val: report_json['AD_account_info']['AD_account'], bold: false, x: 1, y: 1});
            add_to_table(table, {
                val: report_json['AD_account_info']['user_directory_server'],
                bold: false,
                x: 1,
                y: 2
            });
            add_to_table(table, {val: report_json['AD_account_info']['AD_account'], bold: false, x: 2, y: 1});
            add_to_table(table, {
                val: report_json['AD_account_info']['user_directory_server'],
                bold: false,
                x: 2,
                y: 2
            });
            doc.createParagraph();
        }

        /**
         * Adds any additional AD config notes as bullet points
         */
        function AD_configs() {
            make_text('Additional AD reader configuration', 10, false, true);
            doc.createParagraph();
            if (report_json['additional_ad_configs']) {
                report_json['additional_ad_configs'].split('\n').forEach((line) => {
                    if (line.trim()) {
                        let p = new docx.Paragraph().bullet();
                        p.addRun(new docx.TextRun(line).font('Arial').size(10));
                        doc.addParagraph(p);
                    }
                });
            }
        }

        /**
         * Adds the journal mailboxes table
         * If no jmboxes, adds 20 blank rows
         */
        function journal_mailboxes() {
            make_text('Journal mailboxes', 10, false, true);
            doc.createParagraph();


            if (report_json['journal_mailboxes'] && report_json['journal_mailboxes'].length) {
                let table = doc.createTable(report_json['journal_mailboxes'].length + 1, 3);
                add_to_table(table, {val: 'Journal mailbox', bold: true, x: 0, y: 0});
                add_to_table(table, {val: 'Exchange server address', bold: true, x: 0, y: 1});
                add_to_table(table, {val: 'Appliance', bold: true, x: 0, y: 2});
                for (let row = 0; row < report_json['journal_mailboxes'].length; row++) {
                    // [{"name": "Administrator", "app": "", "server": "mail.ushostedarchiving.net"}]
                    add_to_table(table, {
                        val: report_json['journal_mailboxes'][row].name,
                        bold: false,
                        x: row + 1,
                        y: 0
                    });
                    add_to_table(table, {
                        val: report_json['journal_mailboxes'][row].server,
                        bold: false,
                        x: row + 1,
                        y: 1
                    });
                    add_to_table(table, {
                        val: report_json['journal_mailboxes'][row].app,
                        bold: false,
                        x: row + 1,
                        y: 2
                    });
                }
            } else {
                let table = doc.createTable(19 + 1, 3);
                add_to_table(table, {val: 'Journal mailbox', bold: true, x: 0, y: 0});
                add_to_table(table, {val: 'Exchange server address', bold: true, x: 0, y: 1});
                add_to_table(table, {val: 'Appliance', bold: true, x: 0, y: 2});
                for (let row = 0; row < 19; row++) {
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 0
                    });
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 1
                    });
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 2
                    });
                }
            }
        }

        /**
         * Adds the authentication SAML table
         * Default = 3 rows
         */
        function saml_auth() {
            make_text('Authentication - SAML', 10, false, true);
            doc.createParagraph();

            if (report_json['saml']) {
                let table = doc.createTable(report_json['saml'].length + 1, 4);
                add_to_table(table, {val: 'Auth Type', bold: true, x: 0, y: 0});
                add_to_table(table, {val: 'Identity Provider', bold: true, x: 0, y: 1});
                add_to_table(table, {val: 'ACS URL', bold: true, x: 0, y: 2});
                add_to_table(table, {val: 'Identity ID', bold: true, x: 0, y: 3});

                for (let row = 0; row < report_json['saml'].length; row++) {
                    add_to_table(table, {
                        val: report_json['saml'][row][0],
                        bold: false,
                        x: row + 1,
                        y: 0
                    });
                    add_to_table(table, {
                        val: report_json['saml'][row][1],
                        bold: false,
                        x: row + 1,
                        y: 1
                    });
                    add_to_table(table, {
                        val: report_json['saml'][row][2],
                        bold: false,
                        x: row + 1,
                        y: 2
                    });
                    add_to_table(table, {
                        val: report_json['saml'][row][3],
                        bold: false,
                        x: row + 1,
                        y: 3
                    });
                }
            } else {
                let table = doc.createTable(2 + 1, 4);
                add_to_table(table, {val: 'Auth Type', bold: true, x: 0, y: 0});
                add_to_table(table, {val: 'Identity Provider', bold: true, x: 0, y: 1});
                add_to_table(table, {val: 'ACS URL', bold: true, x: 0, y: 2});
                add_to_table(table, {val: 'Identity ID', bold: true, x: 0, y: 3});
                for (let row = 0; row < 2; row++) {
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 0
                    });
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 1
                    });
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 2
                    });
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 3
                    });
                }
            }
        }

        /**
         * Adds the add-ons and features table
         */
        function addons() {
            make_text('Add-ons and Features', 10, false, true);
            doc.createParagraph();

            if (report_json['addons']) {
                let table = doc.createTable(report_json['addons'].length + 1, 3);
                add_to_table(table, {val: 'Add-ons installed', bold: true, x: 0, y: 0});
                add_to_table(table, {val: 'Location', bold: true, x: 0, y: 1});
                add_to_table(table, {val: 'Accounts', bold: true, x: 0, y: 2});
                for (let row = 0; row < report_json['addons'].length; row++) {
                    add_to_table(table, {
                        val: report_json['addons'][row][0],
                        bold: false,
                        x: row + 1,
                        y: 0
                    });
                    add_to_table(table, {
                        val: report_json['addons'][row][1],
                        bold: false,
                        x: row + 1,
                        y: 1
                    });
                    add_to_table(table, {
                        val: report_json['addons'][row][2],
                        bold: false,
                        x: row + 1,
                        y: 2
                    });
                }
            } else {
                let table = doc.createTable(4 + 1, 3);
                add_to_table(table, {val: 'Add-ons installed', bold: true, x: 0, y: 0});
                add_to_table(table, {val: 'Location', bold: true, x: 0, y: 1});
                add_to_table(table, {val: 'Accounts', bold: true, x: 0, y: 2});
                for (let row = 0; row < 4; row++) {
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 0
                    });
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 1
                    });
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 2
                    });
                }
            }
        }

        /**
         * Adds the social plugins table
         */
        function social_plugins() {
            make_text('Social Plugins Installed', 10, false, true);
            doc.createParagraph();

            if (report_json['social_plugins']) {
                let table = doc.createTable(report_json['social_plugins'].length + 1, 3);
                add_to_table(table, {val: 'Social Feature', bold: true, x: 0, y: 0});
                add_to_table(table, {val: 'Social Admin Account', bold: true, x: 0, y: 1});
                add_to_table(table, {val: 'Application Details', bold: true, x: 0, y: 2});
                for (let row = 0; row < report_json['social_plugins'].length; row++) {
                    add_to_table(table, {
                        val: report_json['social_plugins'][row][0],
                        bold: false,
                        x: row + 1,
                        y: 0
                    });
                    add_to_table(table, {
                        val: report_json['social_plugins'][row][1],
                        bold: false,
                        x: row + 1,
                        y: 1
                    });
                    add_to_table(table, {
                        val: report_json['social_plugins'][row][2],
                        bold: false,
                        x: row + 1,
                        y: 2
                    });
                }
            } else {
                let table = doc.createTable(4 + 1, 3);
                add_to_table(table, {val: 'Social Feature', bold: true, x: 0, y: 0});
                add_to_table(table, {val: 'Social Admin Account', bold: true, x: 0, y: 1});
                add_to_table(table, {val: 'Application Details', bold: true, x: 0, y: 2});
                for (let row = 0; row < 4; row++) {
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 0
                    });
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 1
                    });
                    add_to_table(table, {
                        val: '',
                        bold: false,
                        x: row + 1,
                        y: 2
                    });
                }
            }
        }

        // ====================================== Actual content placement ======================================

        // Sets headers/footers
        doc.Header.createImage('./Screenshots/headercombo.png');
        doc.Header.createParagraph();
        doc.Footer.createImage('./Screenshots/footer.png');
        doc.Footer.addParagraph(new docx.Paragraph().right().addRun(new docx.TextRun().pageNumber())); // Add page number at footer

        // Page 1/title page

        make_text('Proofpoint Enterprise Archive', 18, true, true);
        make_text(report_json['account_name'] + ' As Built', 18, true, true);

        for (let i = 0; i < 10; i++) {
            doc.createParagraph();
        }
        make_text(today(), 14, true, false); // Insert date

        doc.createParagraph().pageBreak();

        // Page 2

        // Account details
        account_details();

        doc.createParagraph();

        // AD account details
        AD_account();

        doc.createParagraph();

        // AD config notes
        AD_configs();

        doc.createParagraph().pageBreak();

        // Page 3

        // Archive architecture/sysmap pics

        make_text('Archive Architecture', 10, false, true);
        if (report_json['sysmap']) {
            for (let map of report_json['sysmap']) {
                doc.createParagraph();
                doc.createImage(map['path']).scale(0.6);
            }

            doc.createParagraph().pageBreak();
        } else {
            doc.createParagraph();
        }

        // Journal mailboxes
        journal_mailboxes();

        doc.createParagraph().pageBreak();

        // Page 4

        // SAML auth
        saml_auth();

        doc.createParagraph();

        // Addons
        addons();

        doc.createParagraph();

        // Social plugins
        social_plugins();

        doc.createParagraph().pageBreak();

        // Export

        if (pdf) {
            let exporter = new docx.LocalPacker(doc);
            await exporter.packPdf('./Screenshots/Report').then(() => {
                console.log("--! PDF packed locally.");
            });
        } else {
            let exporter = new docx.LocalPacker(doc);
            await exporter.pack('./Screenshots/Report').then(() => {
                console.log("--! DOCX packed locally.");
            });

            //Express exporter not working, can't set headers after they're sent error.

            // let filename = report_json['account_name'] + ' As Built';
            //
            // let express_exporter = new docx.ExpressPacker(doc, res);
            // await express_exporter.pack(filename).then(() => {
            //     console.log('Packed using express packer');
            // }).catch((error) => {
            //     console.log('--- Exporter for express catch:');
            //     console.log(error);
            //     return false;
            // });
        }

        return true;

    } catch (error) {
        if (error) {
            console.log('--- Error found in script generation:');
            console.log(error);
        }
        return false;
    }
}

// Used to run the script locally,
// generate_report({
//     "guid": "1_ba9ae4b5ec28f46b__2342b2ab_15746f9a3dc__8000",
//     "datacenter": "US2 Data Center",
//     "account_name": "US Bank Corp PoC",
//     "appliance_version": "",
//     "AD_account_info": {"AD_account": "usbcpoc/fortivaadj", "user_directory_server": "10.108.72.38"},
//     "journal_mailboxes": [{"name": "Administrator", "app": "", "server": "mail.ushostedarchiving.net"}],
//     "sysmap": [{"path": "./Screenshots/SystemMap1.png", "size": {"width": 702, "height": 507}}],
//     "ad_account": {"metnet": ["usbcpoc/fortivaadj", "10.108.72.38"], "ussales": ["usbcpoc/fortivaadj", "10.108.72.38"]},
//     "saml": [["2", "2", "2", "2"]],
//     "addons": [["3", "3", "3"]],
//     "social_plugins": [["4", "4", "4"]],
//     "additional_ad_configs": "1\r\n\r\n2\r\n\r\n3"
// }, null, true).then((success) => {
//     if (success) {
//         console.log("Exported successfully");
//     } else {
//         console.log("Something was borked");
//     }
// });

module.exports.generate_report = generate_report;