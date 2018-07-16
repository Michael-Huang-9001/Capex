console.log('===== Structs Calc =====')
let structss = {};
let structs_total = sum * data_reduction_rate * structs_data_ratio;
console.log('Structs total: ' + structs_total);
let structs_sets = Math.floor(structs_total / structs_size);
structs_sets += (structs_total % structs_size == 0) ? 0 : 1;
structss['sets'] = structs_sets;
structss['hosts'] = structs_sets * 2;
return structss;