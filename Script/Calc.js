/**
 *
 *
 */

const data_reduction_rate = 0.8;
const blob_data_ratio = 0.95;
const struct_data_ration = 0.1;

function get_blob_count(sum) {
    let blobs = {};

    return blobs;
}

function get_struct_count(sum) {
    let structs = {};

    return structs;
}

function json_sorter(json) {
    let array = [];
    for(let key in json) {
        array.push(json[key]);
    }
}

module.exports.get_blob_count = get_blob_count;
module.exports.get_struct_count = get_struct_count;