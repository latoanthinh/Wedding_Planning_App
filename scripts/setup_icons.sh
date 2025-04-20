#!/bin/bash

# Cài đặt dependencies
npm install sharp

# Đổi tên các file icon
node scripts/rename_icons.js

# Tạo các file icon tròn
node scripts/create_round_icons.js

# Clean và build lại project
cd android
./gradlew clean
./gradlew assembleDebug 