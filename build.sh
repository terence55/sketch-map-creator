if [ -d "MapCreator.sketchplugin" ]; then
  rm -rf MapCreator.sketchplugin
fi

mkdir MapCreator.sketchplugin
cp -r src/* MapCreator.sketchplugin/