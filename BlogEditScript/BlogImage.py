import os
import re
import argparse
import shutil

def fix_to_local(markdown_file, folder_name):
    with open(markdown_file, "r", encoding="utf-8") as f:
        content = f.read()

    # 匹配 Markdown 图片原始格式：![](image/image_xxx.png)
    pattern = r"!\[\]\(image/(image_[^)]+?\.(?:png|jpg|jpeg|webp|gif))\)"
    matches = re.findall(pattern, content)

    new_content = content
    for filename in matches:
        old_syntax = f"![](image/{filename})"
        new_syntax = f"![image.png](/img/blog_img/{folder_name}/{filename})"
        new_content = new_content.replace(old_syntax, new_syntax)

    with open(markdown_file, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"✅ Markdown updated with local image links: {markdown_file}")

    # 重命名 image 文件夹为 folder_name
    if os.path.isdir("image"):
        if not os.path.exists(folder_name):
            shutil.move("image", folder_name)
            print(f"📁 Renamed folder 'image/' → '{folder_name}/'")
        else:
            print(f"⚠️ Target folder '{folder_name}/' already exists. Skipping rename.")
    else:
        print(f"❌ 'image/' folder not found. Skipping rename.")

def fix_to_remote(markdown_file, folder_name):
    with open(markdown_file, "r", encoding="utf-8") as f:
        content = f.read()

    # 匹配本地路径形式 ![image.png](/img/blog_img/folder_name/xxx.png)
    pattern = rf"!\[.*?\]\(/img/blog_img/{re.escape(folder_name)}/(image_[^)]+?\.(?:png|jpg|jpeg|webp|gif))\)"
    matches = re.findall(pattern, content)

    new_content = content
    for filename in matches:
        old_syntax = f"![](/img/blog_img/{folder_name}/{filename})"
        # 兼容 ![image.png](...) 和 ![](...)
        old_pattern_variants = [
            f"![image.png](/img/blog_img/{folder_name}/{filename})",
            f"![](/img/blog_img/{folder_name}/{filename})"
        ]
        new_syntax = f"![](https://cdn.jsdelivr.net/gh/f1lyyy/blog_photo@main/{folder_name}/{filename})"
        for variant in old_pattern_variants:
            new_content = new_content.replace(variant, new_syntax)

    with open(markdown_file, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"✅ Markdown updated with remote CDN links: {markdown_file}")

def main():
    parser = argparse.ArgumentParser(description="Process Markdown image links to local or remote format.")
    parser.add_argument("action", choices=["local", "remote"], help="Mode: local or remote")
    parser.add_argument("markdown_file", help="Markdown file to process")
    parser.add_argument("folder_name", help="Folder name for image paths (e.g., GoogleCTF2023-v8box)")
    args = parser.parse_args()

    if args.action == "local":
        fix_to_local(args.markdown_file, args.folder_name)
    elif args.action == "remote":
        fix_to_remote(args.markdown_file, args.folder_name)

if __name__ == "__main__":
    main()
