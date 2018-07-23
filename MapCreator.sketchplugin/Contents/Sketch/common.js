/**
 * common.js
 *
 * Copyright (c) 2017-present, Terence Wu.
 */

var pluginIdentifier = 'io.terence.sketch.mapcreator';

var tipsTargetCenter = 'Move map to target the center you want';

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

function createLabel(value, frame) {
  var textField = NSTextField.alloc().initWithFrame(frame);
  textField.setEditable(false);
  textField.setBordered(false);
  textField.setBackgroundColor(NSColor.colorWithRed_green_blue_alpha(0, 0, 0, 0));
  if (value) {
    textField.setStringValue(value);
  }
  return textField;
}

function createTextField(value, placeholder, frame, tag) {
  var textField = NSTextField.alloc().initWithFrame(frame);
  if (value) {
    textField.setStringValue(value);
  }
  if (placeholder) {
    textField.setPlaceholderString(placeholder);
  }
  textField.setTag(tag);
  return textField;
}

function createSelect(options, selectedIndex, frame, tag, onSelectChange) {
  var selIdx = selectedIndex || 0;
  var select = NSPopUpButton.alloc().initWithFrame(frame);
  var i;
  if (options) {
    select.addItemsWithTitles(options);
    select.selectItemAtIndex(selIdx);
  }
  select.setTag(tag);
  if (onSelectChange) {
    select.setCOSJSTargetFunction(onSelectChange);
  }
  return select;
}

function createCheck(title, checked, frame, tag) {
  var check = NSButton.alloc().initWithFrame(frame);
  check.setButtonType(NSSwitchButton);
  check.setBezelStyle(NSRoundedBezelStyle);
  check.setTitle(title);
  check.setState(checked == 0 ? NSOffState : NSOnState);
  check.setTag(tag);
  return check;
}

function createWebView(uri, context) {
  var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, 500, 350));
  webView.setMainFrameURL_(context.plugin.urlForResourceNamed(uri).path());
  return webView;
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
  if (MSApplicationMetadata.metadata().appVersion < 47) {
    fill.setImage(MSImageData.alloc().initWithImageConvertingColorSpace(imageData, false));
  } else {
    fill.setImage(MSImageData.alloc().initWithImage(imageData));
  }
  fill.setPatternFillType(1);
  context.document.showMessage("Map has been created");
}

function fetchImage(url) {
  var request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
  var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
  return response;
}

function handleDialog(dialog, viewIndex, prefix, responseCode) {
  saveOptions(dialog, viewIndex, prefix);
  if (responseCode == NSAlertFirstButtonReturn) {
    var result = {};
    var i;
    for (i = 0; i < viewIndex.length; i++) {
      if (viewIndex[i].type === 'select') {
        result[viewIndex[i].key] = dialog.accessoryView().viewWithTag(viewIndex[i].index).titleOfSelectedItem();
      } else if (viewIndex[i].type === 'string') {
        result[viewIndex[i].key] = dialog.accessoryView().viewWithTag(viewIndex[i].index).stringValue();
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
      setOption(viewIndex[i].key, dialog.accessoryView().viewWithTag(viewIndex[i].index).indexOfSelectedItem(), prefix);
    } else if (viewIndex[i].type === 'string') {
      setOption(viewIndex[i].key, dialog.accessoryView().viewWithTag(viewIndex[i].index).stringValue(), prefix);
    }
  };
}

function setOption(key, value, prefix) {
  return setPreferences(prefix + '.' + key, value);
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

function parseHash(url) {
  url = url;
  var vars = {};
  var hashes = url.slice(url.indexOf('#') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
       var hash = hashes[i].split('=');
       if(hash.length > 1) {
         vars[hash[0].toString()] = hash[1];
       } else {
         vars[hash[0].toString()] = null;
       }
    }
    return vars;
}