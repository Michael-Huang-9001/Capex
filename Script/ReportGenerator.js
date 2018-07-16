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

        // ====================================== Actual content placement ======================================

        // Sets headers/footers
        doc.Header.createImage('./Screenshots/headercombo.png');
        doc.Header.createParagraph();
        doc.Footer.createImage('./Screenshots/footer.png');
        doc.Footer.addParagraph(new docx.Paragraph().right().addRun(new docx.TextRun('').pageNumber())); // Add page number at footer

        // Page 1/title page

        make_text('Proofpoint Enterprise Archive', 18, true, true);
        make_text(report_json['account_name'] + ' As Built', 18, true, true);

        doc.createParagraph();

        const table = doc.createTable(4, 2);
        add_to_table(table, {val: 'Account Name', bold: false, x: 0, y: 0});



        // Export

        if (pdf) {
            let exporter = new docx.LocalPacker(doc);
            await exporter.packPdf('./Screenshots/Report').then(() => {
                console.log("--! PDF packed locally.");
            });
        } else {
            // let exporter = new docx.LocalPacker(doc);
            // await exporter.pack('./Screenshots/Report').then(() => {
            //     console.log("--! DOCX packed locally.");
            // });

            //Express exporter not working, can't set headers after they're sent error.

            let filename = report_json['account_name'] + ' As Built';

            let express_exporter = new docx.ExpressPacker(doc, res);
            await express_exporter.pack(filename).then(() => {
                console.log('Packed using express packer');
            }).catch((error) => {
                console.log('--- Exporter for express catch:');
                console.log(error);
                return false;
            });
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