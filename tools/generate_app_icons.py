#!/usr/bin/env python3
import os
import sys
import json
import time
import traceback
from PIL import Image, ImageDraw
import shutil

def resize_image(input_path, output_path, size, zoom_factor=1.0):
    """Resize an image and save it to the output path with optional zoom."""
    try:
        img = Image.open(input_path)
        
        # Apply zoom by cropping the center portion if zoom_factor > 1
        if zoom_factor > 1.0:
            width, height = img.size
            new_width = int(width / zoom_factor)
            new_height = int(height / zoom_factor)
            
            # Calculate crop box (left, upper, right, lower)
            left = (width - new_width) // 2
            upper = (height - new_height) // 2
            right = left + new_width
            lower = upper + new_height
            
            # Crop the image to zoom in
            img = img.crop((left, upper, right, lower))
        
        # Resize the image with high quality
        img = img.resize((size, size), Image.LANCZOS)
        
        # Save the resized image
        img.save(output_path)
        return True
    except Exception as e:
        print(f"Error resizing image: {e}")
        return False

def create_round_icon(input_path, output_path, size, zoom_factor=1.0):
    """Create a round version of the icon by masking the square icon with a circle."""
    try:
        img = Image.open(input_path)
        
        # Apply zoom by cropping the center portion if zoom_factor > 1
        if zoom_factor > 1.0:
            width, height = img.size
            new_width = int(width / zoom_factor)
            new_height = int(height / zoom_factor)
            
            # Calculate crop box (left, upper, right, lower)
            left = (width - new_width) // 2
            upper = (height - new_height) // 2
            right = left + new_width
            lower = upper + new_height
            
            # Crop the image to zoom in
            img = img.crop((left, upper, right, lower))
        
        img = img.resize((size, size), Image.LANCZOS)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Create a mask (transparent circle)
        mask = Image.new('L', (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        
        # Create a new transparent image
        result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Paste the original image using the mask
        result.paste(img, (0, 0), mask)
        
        # Save the result
        result.save(output_path)
        return True
    except Exception as e:
        print(f"Error creating round icon: {e}")
        return False

def generate_android_icons(source_icon_path, round_icon=False, zoom_factor=1.0):
    """Generate Android app icons in various sizes."""
    print(f"Generating Android {'round' if round_icon else 'square'} icons...")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    android_res_dir = os.path.join(base_dir, "android", "app", "src", "main", "res")
    
    # Define Android icon sizes - only key sizes for faster processing
    android_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xxhdpi": 144,  # Skip xhdpi
        "mipmap-xxxhdpi": 192  # Most important for high-density screens
    }
    
    icon_name = "ic_launcher_round.png" if round_icon else "ic_launcher.png"
    
    for folder, size in android_sizes.items():
        folder_path = os.path.join(android_res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        output_path = os.path.join(folder_path, icon_name)
        
        if round_icon:
            create_round_icon(source_icon_path, output_path, size, zoom_factor)
        else:
            resize_image(source_icon_path, output_path, size, zoom_factor)

def generate_ios_icons(source_icon_path, zoom_factor=1.0):
    """Generate iOS app icons in various sizes and update Contents.json."""
    print("Generating iOS icons...")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ios_icons_dir = os.path.join(base_dir, "ios", "Test", "Images.xcassets", "AppIcon.appiconset")
    
    # Define iOS icon sizes with their corresponding entries for Contents.json - only key sizes
    ios_icons = [
        {"idiom": "iphone", "size": "60x60", "scale": "2x", "filename": "Icon-60x60@2x.png"},
        {"idiom": "iphone", "size": "60x60", "scale": "3x", "filename": "Icon-60x60@3x.png"},
        {"idiom": "ios-marketing", "size": "1024x1024", "scale": "1x", "filename": "Icon-1024x1024@1x.png"}
    ]
    
    # Create directory if it doesn't exist
    os.makedirs(ios_icons_dir, exist_ok=True)
    
    # Generate all icon sizes
    for icon_info in ios_icons:
        size_str = icon_info["size"]
        scale = int(icon_info["scale"].replace("x", ""))
        filename = icon_info["filename"]
        
        width, height = map(int, size_str.split("x"))
        output_width = width * scale
        output_height = height * scale
        
        output_path = os.path.join(ios_icons_dir, filename)
        resize_image(source_icon_path, output_path, output_width, zoom_factor)
    
    # Update Contents.json
    contents_json_path = os.path.join(ios_icons_dir, "Contents.json")
    try:
        # Read existing content to preserve other entries
        existing_contents = {}
        if os.path.exists(contents_json_path):
            try:
                with open(contents_json_path, 'r') as f:
                    existing_contents = json.load(f)
            except:
                pass
        
        # Update only the entries we've processed
        if 'images' in existing_contents:
            for i, img in enumerate(existing_contents['images']):
                for new_icon in ios_icons:
                    if img.get('size') == new_icon['size'] and img.get('scale') == new_icon['scale']:
                        existing_contents['images'][i]['filename'] = new_icon['filename']
        else:
            existing_contents = {
                "images": [
                    {
                        "idiom": icon["idiom"],
                        "size": icon["size"],
                        "scale": icon["scale"],
                        "filename": icon["filename"]
                    } for icon in ios_icons
                ],
                "info": {
                    "author": "xcode",
                    "version": 1
                }
            }
        
        with open(contents_json_path, 'w') as f:
            json.dump(existing_contents, f, indent=2)
    except Exception as e:
        print(f"Error updating Contents.json: {e}")

def quick_generate(source_icon_path, zoom_factor=1.0):
    """Quick generation of just the most important app icons."""
    print(f"Quick generating app icons with zoom factor {zoom_factor}...")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Generate key Android icons - square
    android_res_dir = os.path.join(base_dir, "android", "app", "src", "main", "res")
    mipmap_xxxhdpi_dir = os.path.join(android_res_dir, "mipmap-xxxhdpi")
    os.makedirs(mipmap_xxxhdpi_dir, exist_ok=True)
    
    # Generate the highest resolution icon
    square_icon_path = os.path.join(mipmap_xxxhdpi_dir, "ic_launcher.png")
    round_icon_path = os.path.join(mipmap_xxxhdpi_dir, "ic_launcher_round.png")
    
    resize_image(source_icon_path, square_icon_path, 192, zoom_factor)
    create_round_icon(source_icon_path, round_icon_path, 192, zoom_factor)
    
    print("Icons generated successfully. Please build your app to see changes.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_app_icons.py <path_to_source_icon> [zoom_factor] [--quick]")
        return
    
    source_icon_path = sys.argv[1]
    zoom_factor = 1.5  # Default zoom factor
    quick_mode = False
    
    # Parse arguments
    for arg in sys.argv[2:]:
        if arg == "--quick":
            quick_mode = True
        else:
            try:
                zoom_factor = float(arg)
            except ValueError:
                print(f"Invalid zoom factor: {arg}. Using default value: {zoom_factor}")
    
    print(f"App Icon Generator - Zoom factor: {zoom_factor}x")
    
    if not os.path.exists(source_icon_path):
        print(f"Error: Source icon not found at {source_icon_path}")
        return
    
    try:
        if quick_mode:
            quick_generate(source_icon_path, zoom_factor)
        else:
            # Generate square icons
            generate_android_icons(source_icon_path, round_icon=False, zoom_factor=zoom_factor)
            
            # Generate round icons
            generate_android_icons(source_icon_path, round_icon=True, zoom_factor=zoom_factor)
            
            # Generate iOS icons
            generate_ios_icons(source_icon_path, zoom_factor=zoom_factor)
            
            print("App icon generation completed!")
    except Exception as e:
        print(f"Error during app icon generation: {e}")

if __name__ == "__main__":
    main() 