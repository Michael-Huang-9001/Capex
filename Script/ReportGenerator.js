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

        doc.font('Times-New-Roman').text('Required total index VMs: ' + report_json.index.VMs);
        doc.font('Times-New-Roman').text('Required total index sets: ' + report_json.index.sets);
        doc.font('Times-New-Roman').text('Required total index hosts: ' + report_json.index.hosts);
        doc.font('Times-New-Roman').text(' ');


        doc.font('Times-New-Roman').text('Breakdown for required number of hosts:');

        switch (report_json.location) {

            // \u2192 is an arrow sign


            case 'CAN': {
                // GOOD OLD CANADA
                doc.font('Times-New-Roman').text('CAN ' + 'MARK : BRA');
                doc.font('Times-New-Roman').text('Blobs: ' + report_json.blobs.sets + ' (MARK) : ' + report_json.blobs.sets + ' (BRA)');
                doc.font('Times-New-Roman').text('Structs: ' + report_json.structs.sets + ' (MARK) : ' + report_json.structs.sets + ' (BRA)');
                doc.font('Times-New-Roman').text('Index: ' + report_json.index.sets + ' (MARK) : ' + report_json.index.sets + ' (BRA)');
                doc.font('Times-New-Roman').text(' ');
                break;
            }

            case 'EU': {
                // EU
                doc.font('Times-New-Roman').text('EU: ' + 'FRA : AMS');
                doc.font('Times-New-Roman').text('Blobs: ' + report_json.blobs.sets + ' (FRA) : ' + report_json.blobs.sets + ' (AMS)');
                doc.font('Times-New-Roman').text('Structs: ' + report_json.structs.sets + '(FRA) : ' + report_json.structs.sets + ' (AMS)');
                doc.font('Times-New-Roman').text('Index: ' + report_json.index.sets + '(FRA) : ' + report_json.index.sets + ' (AMS)');
                doc.font('Times-New-Roman').text(' ');
                break;
            }

            default: {
                // SC4, 'MURICA
                doc.font('Times-New-Roman').text('SC4: ' + 'SC4 : UT7');
                doc.font('Times-New-Roman').text('Blobs: ' + report_json.blobs.sets + ' (SC4) : ' + report_json.blobs.sets + ' (UT7)');
                doc.font('Times-New-Roman').text('Structs: ' + report_json.structs.sets * 2 + ' (SC4) : ' + report_json.structs.sets + ' (UT7)');
                doc.font('Times-New-Roman').text('Index: ' + report_json.index.sets + ' (SC4) : ' + report_json.index.sets + ' (UT7)');
                doc.font('Times-New-Roman').text(' ');
            }
        }

        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.log(error);
    }
}

module.exports.generate_report = generate_report;