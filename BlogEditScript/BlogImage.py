import os
import re
import argparse
import shutil
import subprocess
from datetime import datetime

# 全局变量，方便修改
BLOG_POSTS_DIR = "/Users/flyyy/Desktop/workspace/blog/BlogFile/source/_posts/"
BLOG_ROOT_DIR = "/Users/flyyy/Desktop/workspace/blog/BlogFile/"

def fix_to_remote(markdown_file, folder_name):
    with open(markdown_file, "r", encoding="utf-8") as f:
        content = f.read()

    # 获取当前目录下的所有文件夹
    current_dir = os.path.dirname(markdown_file) if os.path.dirname(markdown_file) else "."
    local_folders = [d for d in os.listdir(current_dir) if os.path.isdir(d)]
    
    # 支持的图片格式
    image_extensions = ['png', 'jpg', 'jpeg', 'webp', 'gif']
    
    # 查找index_img和banner_img
    index_img = None
    banner_img = None
    all_images = []
    image_folder = None  # 记录包含图片的文件夹
    
    # 遍历所有本地文件夹，查找图片文件
    for local_folder in local_folders:
        # 检查文件夹中是否有图片文件
        folder_path = os.path.join(current_dir, local_folder)
        image_files = []
        
        for ext in image_extensions:
            image_files.extend([f for f in os.listdir(folder_path) if f.lower().endswith(f'.{ext}')])
        
        if image_files:
            print(f" Found image folder: {local_folder} with {len(image_files)} images")
            all_images.extend(image_files)
            image_folder = local_folder  # 记录找到的图片文件夹
            
            # 查找banner和title图片
            for filename in image_files:
                filename_lower = filename.lower()
                if 'banner' in filename_lower:
                    banner_img = filename
                    print(f"  Found banner image: {filename}")
                elif 'title' in filename_lower:
                    index_img = filename
                    print(f" ️ Found title image: {filename}")

    # 如果没有找到banner或title，使用第一个可用的图片
    if not banner_img and all_images:
        banner_img = all_images[0]
        print(f"  🎨 Using first image as banner: {banner_img}")
    
    if not index_img and all_images:
        index_img = all_images[0] if not banner_img else (all_images[1] if len(all_images) > 1 else all_images[0])
        print(f"  🖼️ Using image as title: {index_img}")

    # 使用正则表达式替换所有图片链接
    new_content = content
    
    # 匹配所有图片链接格式
    patterns = [
        r'!\[.*?\]\(([^)]+\.(?:png|jpg|jpeg|webp|gif))\)',  # 标准格式
        r'!\[image\.png\]\(([^)]+\.(?:png|jpg|jpeg|webp|gif))\)',  # 带image.png的格式
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, new_content)
        for match in matches:
            # 提取文件名
            filename = os.path.basename(match)
            # 检查是否是本地路径（不是http开头且不是/img/blog_img开头）
            if not match.startswith('http') and not match.startswith('/img/blog_img'):
                # 构建新的CDN链接
                new_syntax = f"![](https://cdn.jsdelivr.net/gh/f1lyyy/blog_photo@main/{folder_name}/{filename})"
                # 替换所有匹配的格式
                old_patterns = [
                    f"![]({match})",
                    f"![image.png]({match})",
                ]
                for old_pattern in old_patterns:
                    if old_pattern in new_content:
                        new_content = new_content.replace(old_pattern, new_syntax)
                        print(f"  🔄 Replaced: {old_pattern} → {new_syntax}")

    # 生成当前时间
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 生成YAML front matter，使用CDN路径
    yaml_front_matter = f"""---
title: 
excerpt: 
tags: []
index_img: https://cdn.jsdelivr.net/gh/f1lyyy/blog_photo@main/{folder_name}/{index_img if index_img else 'image.png'}
banner_img: https://cdn.jsdelivr.net/gh/f1lyyy/blog_photo@main/{folder_name}/{banner_img if banner_img else 'image.png'}
date: {current_time}
hide: false
categories:
 - 

---
"""
    
    # 检查文件是否已经有YAML front matter
    if not content.startswith('---'):
        # 在文件开头添加YAML front matter
        new_content = yaml_front_matter + new_content
        print(f"📝 Added YAML front matter to {markdown_file}")
    else:
        print(f"⚠️ File already has YAML front matter, skipping addition")

    # 保存修改后的内容到新文件名
    new_md_file = f"{folder_name}.md"
    with open(new_md_file, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"✅ Markdown updated and saved as: {new_md_file}")
    
    # 显示最终使用的图片
    print(f"🖼️ Final index_img: {index_img}")
    print(f"🎨 Final banner_img: {banner_img}")

    # 重命名图片文件夹
    if image_folder and image_folder != folder_name:
        old_folder_path = os.path.join(current_dir, image_folder)
        new_folder_path = os.path.join(current_dir, folder_name)
        
        if os.path.exists(new_folder_path):
            print(f"⚠️ Target folder '{folder_name}' already exists. Skipping rename.")
        else:
            try:
                shutil.move(old_folder_path, new_folder_path)
                print(f"📁 Renamed folder '{image_folder}' → '{folder_name}'")
            except Exception as e:
                print(f"❌ Failed to rename folder: {e}")
    elif image_folder == folder_name:
        print(f"ℹ️ Folder already named '{folder_name}', no rename needed.")
    else:
        print(f"❌ No image folder found to rename.")

    # 执行git操作
    print(f"\n🚀 Starting git operations...")
    
    try:
        # 1. git clone
        print(" Cloning blog_photo repository...")
        if os.path.exists("blog_photo"):
            print("ℹ️ blog_photo directory already exists, skipping clone.")
        else:
            subprocess.run(["git", "clone", "git@github.com:f1lyyy/blog_photo.git"], check=True)
            print("✅ Repository cloned successfully.")
        
        # 2. cd blog_photo
        os.chdir("blog_photo")
        print(f"📂 Changed directory to: {os.getcwd()}")
        
        # 3. cp -r ../folder_name ./folder_name
        source_path = os.path.join("..", folder_name)
        dest_path = os.path.join(".", folder_name)
        
        if os.path.exists(dest_path):
            print(f"⚠️ Destination folder '{folder_name}' already exists in blog_photo. Removing...")
            shutil.rmtree(dest_path)
        
        print(f"📋 Copying {folder_name} to blog_photo...")
        shutil.copytree(source_path, dest_path)
        print(f"✅ Copied {folder_name} successfully.")
        
        # 4. git add
        print(f"➕ Adding {folder_name} to git...")
        subprocess.run(["git", "add", folder_name], check=True)
        print("✅ Added to git successfully.")
        
        # 5. git commit
        print(f" Committing changes...")
        subprocess.run(["git", "commit", "-m", folder_name], check=True)
        print("✅ Committed successfully.")
        
        # 6. git push
        print("🚀 Pushing to origin main...")
        subprocess.run(["git", "push", "origin", "main"], check=True)
        print("✅ Pushed successfully.")
        
        # 7. 删除clone的仓库
        print("��️ Cleaning up blog_photo repository...")
        os.chdir("..")  # 回到上级目录
        shutil.rmtree("blog_photo")
        print("✅ Repository cleaned up.")
        
        # 8. 复制md文件到博客目录
        print(f"📋 Copying {new_md_file} to blog posts directory...")
        source_md = os.path.join(current_dir, new_md_file)
        dest_md = os.path.join(BLOG_POSTS_DIR, new_md_file)
        
        if os.path.exists(dest_md):
            print(f"⚠️ Destination file '{new_md_file}' already exists. Removing...")
            os.remove(dest_md)
        
        shutil.copy2(source_md, dest_md)
        print(f"✅ Copied {new_md_file} to blog posts directory.")
        
        print(f"\n🎉 All operations completed successfully!")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Git/Hexo operation failed: {e}")
        print(f"Command that failed: {e.cmd}")
        print(f"Return code: {e.returncode}")
    except Exception as e:
        print(f"❌ Unexpected error during operations: {e}")

def main():
    parser = argparse.ArgumentParser(description="Process Markdown image links to remote CDN format.")
    parser.add_argument("markdown_file", help="Markdown file to process")
    parser.add_argument("folder_name", help="Folder name for CDN paths (e.g., GoogleCTF2023-v8box)")
    args = parser.parse_args()

    fix_to_remote(args.markdown_file, args.folder_name)

if __name__ == "__main__":
    main()