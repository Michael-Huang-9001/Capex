/**
 *
 *
 */


const data_reduction_rate = 0.8;
const blob_data_ratio = 0.95;
const blob_size = 21; // TB
const struct_data_ratio = 0.1;
const struct_size = 21; // TB

function get_blob_count(sum) {
    // console.log('===== Blob Calc =====');
    if (sum <= 0) {
        // Early termination to save work
        return {'sets': 0, 'hosts': 0};
    }
    let blobs = {};
    let blob_total = sum * data_reduction_rate * blob_data_ratio;
    // console.log('Blob total: ' + blob_total);
    let blob_sets = Math.floor(blob_total / blob_size);
    blob_sets += (blob_total % blob_size == 0) ? 0 : 1;
    blobs['sets'] = blob_sets;
    blobs['hosts'] = blob_sets * 2;
    return blobs;
}

function get_struct_count(sum, host_multiplier) {
    // console.log('===== Structs Calc =====');
    if (sum <= 0) {
        // Early termination to save work
        return {'sets': 0, 'hosts': 0};
    }
    let structs = {};
    let structs_total = sum * data_reduction_rate * struct_data_ratio;
    // console.log('Structs total: ' + structs_total);
    let struct_sets = Math.floor(structs_total / struct_size);
    struct_sets += (structs_total % struct_size == 0) ? 0 : 1;
    structs['sets'] = struct_sets;
    structs['hosts'] = struct_sets * host_multiplier;
    return structs;
}

function json_sorter(data) {
    data.sort(function (a, b) {
        return b.size - a.size;
    });
}

async function calc_sum(data) {
    let sum = 0;
    // This filters out any empty rows, e.g. both customer name and data size is empty
    for (let i = data.length - 1; i > 0; i--) {
        if (data[i].name || data[i].size) {
            sum += Number(data[i].size);
        } else {
            data.splice(i, 1);
            // console.log('splicing');
        }
    }
    // console.log('Sum: ' + sum);
    return sum;
}

module.exports.get_blob_count = get_blob_count;
module.exports.get_struct_count = get_struct_count;
module.exports.json_sorter = json_sorter;
module.exports.calc_sum = calc_sum;