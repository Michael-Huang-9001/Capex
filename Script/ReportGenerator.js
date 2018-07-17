const PDFDocument = require('pdfkit');

async function generate_report(report_json, res) {
    try {
        console.log('Downloading pdf')
        //console.log(report_json);

        const doc = new PDFDocument();
        doc.registerFont('Times-New-Roman', 'Script/Times New Roman.ttf');
        const filename = 'Capex Report.pdf';

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');
        doc.font('Times-New-Roman').text('Based on the following customer data and total data size:');
        //doc.y = 300;
        doc.font('Times-New-Roman').text(' ');

        for (let i = 0; i < report_json.table.length; i++) {
            let row = report_json.table[i];
            doc.font('Times-New-Roman').text(row.name + ': ' + row.size + ' TB');
        }

        doc.font('Times-New-Roman').text(' ');

        doc.font('Times-New-Roman').text('Total: ' + report_json.sum + ' TB');
        doc.font('Times-New-Roman').text(' ');

        doc.font('Times-New-Roman').text('Here is an estimation of needed hosts:');
        doc.font('Times-New-Roman').text(' ');

        doc.font('Times-New-Roman').text('Location: ' + report_json.location);
        doc.font('Times-New-Roman').text('Required total blob sets: ' + report_json.blobs.sets);
        doc.font('Times-New-Roman').text('Required total blob hosts: ' + report_json.blobs.hosts);
        doc.font('Times-New-Roman').text(' ');

        doc.font('Times-New-Roman').text('Required total struct sets: ' + report_json.structs.sets);
        doc.font('Times-New-Roman').text('Required total struct hosts: ' + report_json.structs.hosts);
        doc.font('Times-New-Roman').text(' ');


        doc.font('Times-New-Roman').text('Breakdown:');

        // SC4, 'MURICA
        doc.font('Times-New-Roman').text('SC4' + ' \u2192 ' + 'SC4 : UT7');
        doc.font('Times-New-Roman').text('Blobs' + ' \u2192 ' + report_json.blobs.sets + ' : ' + report_json.blobs.sets);
        doc.font('Times-New-Roman').text('Structs' + ' \u2192 ' + report_json.structs.sets * 2 + ' : ' + report_json.structs.sets);
        doc.font('Times-New-Roman').text(' ');

        // EU
        doc.font('Times-New-Roman').text('EU' + ' \u2192 ' + 'FRA : AMS');
        doc.font('Times-New-Roman').text('Blobs' + ' \u2192 ' + report_json.blobs.sets + ' : ' + report_json.blobs.sets);
        doc.font('Times-New-Roman').text('Structs' + ' \u2192 ' + report_json.structs.sets + ' : ' + report_json.structs.sets);
        doc.font('Times-New-Roman').text(' ');

        // GOOD OLD CANADA
        doc.font('Times-New-Roman').text('CAN' + ' \u2192 ' + 'MARK : BRA');
        doc.font('Times-New-Roman').text('Blobs' + ' \u2192 ' + report_json.blobs.sets + ' : ' + report_json.blobs.sets);
        doc.font('Times-New-Roman').text('Structs' + ' \u2192 ' + report_json.structs.sets + ' : ' + report_json.structs.sets);
        doc.font('Times-New-Roman').text(' ');

        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.log(error);
    }
}

module.exports.generate_report = generate_report;