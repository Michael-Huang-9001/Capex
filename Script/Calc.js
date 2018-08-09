/**
 * LIFT YOURSELF UP ON YOUR FEET
 * LET'S GET IT ONNNNNNNNN
 *
 * POOPITY SCOOP
 *
 * @type {number}
 */

const data_reduction_rate = 0.8;
const TB_to_GB = 1000;

// Blob related constants
const blob_data_ratio = 0.95;
const blob_size = 21; // TB
const blob_hosts_per_set = 2;

// Struct related constants
const struct_data_ratio = 0.1;
const struct_size = 21; // TB
const struct_hosts_per_set_EU_CAN = 2;
const struct_hosts_per_set_SC4 = 3;

// Index related constants
const vm_data_allowed = 250; // 250 GB per VM
const vm_capacity = 400; // 400 GB max
const index_data_ratio = 0.25;
const index_set_per_VM = 15;
const index_hosts_per_set = 2;

/**
 * @param sum the total data size
 * @returns {{sets: number, hosts: number}}
 */
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
    blob_sets += (blob_total % blob_size === 0) ? 0 : 1;
    blobs['sets'] = blob_sets;
    blobs['hosts'] = blob_sets * blob_hosts_per_set;
    return blobs;
}

/**
 * @param sum the total data size
 * @param host_multiplier SC4 (hosts = blobs * 3), EU/CAN (hosts = blobs * 2)
 * @returns {{sets: number, hosts: number}}
 */
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
    struct_sets += (structs_total % struct_size === 0) ? 0 : 1;
    structs['sets'] = struct_sets;
    structs['hosts'] = struct_sets * (
        (host_multiplier == 'CAN' || host_multiplier == 'EU') ? struct_hosts_per_set_EU_CAN : struct_hosts_per_set_SC4);
    return structs;
}

/**
 * @param sum the total data size
 * @param sizes the list of data sizes individually
 */
function get_index_count(data) {
    if (!data.length) {
        return {VMs: 0, sets: 0, hosts: 0, required_space_analysis: 0, table: []};
    }

    let table = [];

    let vm250_used = 0;
    let vm150_used = 0;
    let vm150_remaining = 0;
    let required_index_VMs = 0;

    for (let i = 0; i < data.length; i++) {
        let form_row = data[i];

        let table_row = {};
        table_row.name = form_row.name;
        table_row.TB = Number(form_row.size);
        table_row.GB = table_row.TB * TB_to_GB;
        table_row.ingested = table_row.GB * data_reduction_rate;
        table_row.index = table_row.ingested * index_data_ratio;

        let index_data_size = table_row.index; // TB to GB, then reduce.

        if (i === 0) {
            // Number of VMs using full 250 GB allowed, dictated by largest data size.
            vm250_used = Math.ceil(index_data_size / vm_data_allowed);
            table_row.vm250_used = vm250_used;

            // The largest data size should not need any 150s.
            vm150_used = 0;
            table_row.vm150_used = vm150_used;

            // Summing total 250GBs used, as 250 GB portions must be used before 150 GBs, considered head count.
            required_index_VMs += vm250_used;
            // Save number of 150 GB portions for subsequent use.
            vm150_remaining = vm250_used - vm150_used;
            table_row.vm150_remaining = vm150_remaining;
        } else {
            // Use the minimum of remaining 150 GBs, or whatever # current_index_size / 150 GBs is.
            vm150_used = Math.min(vm150_remaining, Math.ceil(index_data_size / (vm_capacity - vm_data_allowed)));
            table_row.vm150_used = vm150_used;

            // =IF(H2=0,ROUNDUP(D3/250,0),ROUNDUP(MAX(D3-F3*150,0)/250,0))
            if (vm150_remaining == 0) {
                // ROUNDUP(D3/250,0)
                vm250_used = Math.ceil(index_data_size / vm_data_allowed);
            } else {
                // ROUNDUP(MAX(index_data_size - vm150_used*150,0)/250,0)
                vm250_used = Math.ceil(Math.max(index_data_size - (vm150_used * (vm_capacity - vm_data_allowed)), 0) / vm_data_allowed);
            }
            table_row.vm250_used = vm250_used;

            // =H2-F3+E3
            vm150_remaining = vm150_remaining - vm150_used + vm250_used;
            table_row.vm150_remaining = vm150_remaining;

            // Summing all 250 GB portions used
            required_index_VMs += vm250_used;
        }

        // Required space = vm250_used * 250 GB + vm150_used * 150
        table_row.required_spaces = vm250_used * vm_data_allowed + vm150_used * (vm_capacity - vm_data_allowed);

        table.push(table_row);
    }

    let required_index_sets = Math.ceil(required_index_VMs / index_set_per_VM);
    let required_index_hosts = required_index_sets * index_hosts_per_set;

    return {
        VMs: required_index_VMs,
        sets: required_index_sets,
        hosts: required_index_hosts,
        table: table
    };
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
module.exports.get_index_count = get_index_count;
module.exports.calc_sum = calc_sum;