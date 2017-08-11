var pluginIdentifier = "io.terence.sketch.mapcreator";

function checkLayer(selectedLayers) {
  var app = NSApplication.sharedApplication();
  if (!selectedLayers || selectedLayers.count() != 1) {
    app.displayDialog_withTitle('Please select exactly 1 shape layer.', 'Invalid shape layer selection');
    return false;
  }
  var layer = selectedLayers[0];
  if ([layer class] !== MSShapeGroup) {
    app.displayDialog_withTitle('Your selection was a ' + [layer name] + ', that is not a shape layer. Please select a shape layer.', 'Invalid layer type');
    return false;
  }
  return true;
}

function checkOptions(options) {
  var app = NSApplication.sharedApplication();
  if (!options) {
    return false;
  }
  if (!options.center) {
    app.displayDialog_withTitle('Please enter valid center', 'Invalid center');
    return false;
  }
  return true;
}

function createTextField(value, placeholder) {
  var textField = NSTextField.alloc().initWithFrame(NSMakeRect(0, 0, 300, 24));
  if (value) {
    textField.setStringValue(value);
  }
  if (placeholder) {
    textField.setPlaceholderString(placeholder);
  }
  return textField;
}

function createSelect(options, selectedIndex, width) {
  var selIdx = selectedIndex || 0;
  var select = NSPopUpButton.alloc().initWithFrame(NSMakeRect(0, 0, width || 100, 28));
  var i;
  if (options) {
    select.addItemsWithTitles(options);
    select.selectItemAtIndex(selIdx);
  }
  return select;
}

function createCheck(title, checked) {
  var check = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 200, 20))
  check.setButtonType(NSSwitchButton);
  check.setBezelStyle(NSRoundedBezelStyle);
  check.setTitle(title);
  check.setState(checked == 0 ? NSOffState : NSOnState);
  return check;
}

function calcZoomLevels(zoomLevels, minZoom, maxZoom) {
  if (zoomLevels.length > 0) {
    return;
  }
  var i;
  for (i = minZoom; i <= maxZoom; i++) {
    zoomLevels.push(i.toString());
  }
}

function fillLayer(context, imageUrl, layer) {
  var data = fetchImage(imageUrl);
  if (!data) {
    context.document.showMessage("Fetch map error, invalid request params");
    return;
  }
  var result = NSString.alloc().initWithData_encoding(data, NSUTF8StringEncoding);
  if (result) {
    context.document.showMessage("Fetch map error, invalid request params, error info: " + result);
    return;
  }
  var imageData = NSImage.alloc().initWithData(data);
  var fill = layer.style().fills().firstObject();
  fill.setFillType(4);
  fill.setImage(MSImageData.alloc().initWithImage_convertColorSpace(imageData, false));
  fill.setPatternFillType(1);
  context.document.showMessage("Map created");
}

function fetchImage(url) {
  var request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
  var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
  return response;
}

function handleDialog(dialog, viewIndex, prefix, responseCode) {
  saveOptions(dialog, viewIndex, prefix);
  if (responseCode == "1000") {
    var result = {};
    var i;
    for (i = 0; i < viewIndex.length; i++) {
      if (viewIndex[i].type === 'select') {
        result[viewIndex[i].key] = dialog.viewAtIndex(viewIndex[i].index).titleOfSelectedItem();
      } else if (viewIndex[i].type === 'string') {
        result[viewIndex[i].key] = dialog.viewAtIndex(viewIndex[i].index).stringValue();
      }
    };
    return result;
  }
  return null;
}

function saveOptions(dialog, viewIndex, prefix) {
  var i;
  for (i = 0; i < viewIndex.length; i++) {
    if (viewIndex[i].type === 'select') {
      setPreferences(prefix + '.' + viewIndex[i].key, dialog.viewAtIndex(viewIndex[i].index).indexOfSelectedItem());
    } else if (viewIndex[i].type === 'string') {
      setPreferences(prefix + '.' + viewIndex[i].key, dialog.viewAtIndex(viewIndex[i].index).stringValue());
    }
  };
}

function getOption(key, defaultValue, prefix) {
  return getPreferences(prefix + '.' + key, defaultValue);
}

function getPreferences(key, defaultValue) {
  var userDefaults = NSUserDefaults.standardUserDefaults();
  if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
    var defaultPreferences = NSMutableDictionary.alloc().init();
    userDefaults.setObject_forKey(defaultPreferences, pluginIdentifier);
    userDefaults.synchronize();
  }
  var value = userDefaults.dictionaryForKey(pluginIdentifier).objectForKey(key);
  return value === undefined ? defaultValue : value;
}

function setPreferences(key, value) {
  var userDefaults = NSUserDefaults.standardUserDefaults();
  var preferences;
  if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
    preferences = NSMutableDictionary.alloc().init();
  } else {
    preferences = NSMutableDictionary.dictionaryWithDictionary(userDefaults.dictionaryForKey(pluginIdentifier));
  }
  preferences.setObject_forKey(value, key);
  userDefaults.setObject_forKey(preferences, pluginIdentifier);
  userDefaults.synchronize();
}