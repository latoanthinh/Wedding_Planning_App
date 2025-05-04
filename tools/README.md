# App Icon Generation Tool

This tool helps you generate the required app icons for both Android and iOS platforms from a single source image.

## Requirements

- Python 3.x
- Pillow library (PIL)

Install the required dependencies:

```bash
pip install pillow
```

## Usage

1. Prepare a high-resolution square image (at least 1024x1024 pixels) for your app icon.
2. Run the script:

```bash
python generate_app_icons.py <path_to_source_icon> [zoom_factor]
```

For example:

```bash
# Sử dụng với zoom mặc định (1.3x)
python generate_app_icons.py ../src/Assets/Images/ChatGPT_Image_16_58_33_4_thg_5__2025-removebg-preview.png

# Sử dụng với zoom tùy chỉnh (1.5x)
python generate_app_icons.py ../src/Assets/Images/ChatGPT_Image_16_58_33_4_thg_5__2025-removebg-preview.png 1.5
```

The `zoom_factor` parameter (optional) allows you to enlarge the central part of the icon, making the logo appear bigger by cropping out some of the surrounding area. The default value is 1.3.

## What It Does

The script will:

1. Back up your existing icons to an `icon_backups` directory
2. Check if your source image is large enough and square
3. Apply the zoom factor to focus on the center of your icon (if zoom_factor > 1.0)
4. Generate the following icons:

### For Android:
- Different sizes of square icons for various screen densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Different sizes of round icons for various screen densities (properly masked with a circular shape)

### For iOS:
- All required icon sizes for iPhone and App Store
- Updates the Contents.json file in the iOS AppIcon.appiconset directory

## Output Locations

- Android icons will be placed in the appropriate mipmap directories under `android/app/src/main/res/`
- iOS icons will be placed in `ios/Test/Images.xcassets/AppIcon.appiconset/`
- Backups will be stored in `icon_backups/backup_[timestamp]/`

## Features

- **NEW:** Zooms in on the central part of your icon to make logos or text more prominent
- Properly rounds Android icons by applying a circular mask
- Automatically updates iOS Contents.json file with correct filenames
- Backs up existing icons before generating new ones
- Provides warnings for images that are too small or not square
- Uses high-quality image resizing for best results

## Zoom Factor Examples

- `1.0`: No zoom, uses the entire image
- `1.3`: Default zoom, crops 23% of the outer edge to focus on the center
- `1.5`: More zoom, crops 33% of the outer edge
- `2.0`: High zoom, crops 50% of the outer edge, focusing tightly on the center

## Notes

- Make sure your source image is high quality and at least 1024x1024 pixels in size
- The image should be square (same width and height)
- For best results, design your icon with important elements centered
- When using zoom, ensure your main logo or content is in the center of the image
- For the round Android icons, your image will be masked to fit a circular shape 