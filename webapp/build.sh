#!/bin/sh

# Build the project
npm run build

# Copy the main assets to the static directory
mkdir -p ../schedule/static/app/js
mkdir -p ../schedule/static/app/css
cp -R build/static/js/*.js ../schedule/static/app/js/bundle.js
cp -R build/static/css/*.css ../schedule/static/app/css/application.css
cp -R build/static/css/*.css.map ../schedule/static/app/css/application.css.map

# cleanup
rm -rf ./build
