/**
 * mapbox.js
 *
 * Copyright (c) 2017-present, Terence Wu.
 */

@import "common.js";

function Mapbox() { }

Mapbox.prototype.prefix = 'mapbox';
Mapbox.prototype.maxWidth = 1280;
Mapbox.prototype.maxHeight = 1280;
Mapbox.prototype.types = [
  'streets',
  'light',
  'dark',
  'satellite',
  'streets-satellite',
  'wheatpaste',
  'streets-basic',
  'comic',
  'outdoors',
  'run-bike-hike',
  'pencil',
  'pirates',
  'emerald',
  'high-contrast'
];
Mapbox.prototype.ak = 'pk.eyJ1IjoidHJlbmNlMzIwIiwiYSI6ImNqNjRobjF0czFrZGMzMnBvN3VzYzQxenMifQ.BJml_qE3BhBJ2bPodjwfeg';

Mapbox.prototype.createMap = function (context) {
  if (!checkLayer(context.selection)) {
    return;
  }
  var app = NSApplication.sharedApplication();
  var viewIndex = [];
  var dialog = this.buildOptionDialog(viewIndex, context);
  var options = handleDialog(dialog, viewIndex, this.prefix, dialog.runModal());
  if (!options) {
    return;
  }
  var shouldRemember = getOption('remember', 0, this.prefix);
  if (shouldRemember == 1) {
    setOption('lng', this.centerLng, this.prefix);
    setOption('lat', this.centerLat, this.prefix);
    setOption('zoom', this.zoom, this.prefix);
  }
  var layer = context.selection[0];
  var layerSizes = layer.frame();
  var width = Math.min(parseInt([layerSizes width]), this.maxWidth);
  var height = Math.min(parseInt([layerSizes height]), this.maxHeight);
  var imageUrl = 'https://api.mapbox.com/v4/mapbox.' + options.type + '/' + this.centerLng + ',' + this.centerLat + ',' + this.zoom + '/' + width + 'x' + height + '.jpg90?access_token=' + this.ak;
  fillLayer(context, imageUrl, layer);
}

Mapbox.prototype.buildOptionDialog = function (viewIndex, context) {
  var shouldRemember = getOption('remember', 0, this.prefix);

  var dialogWindow = NSAlert.alloc().init();
  dialogWindow.setMessageText(tipsTargetCenter);
  var dialogContent = NSView.alloc().init();
  dialogContent.setFlipped(true);
  dialogContent.frame = NSMakeRect(0, 0, 500, 430);
  dialogWindow.accessoryView = dialogContent;

  dialogWindow.addButtonWithTitle('OK');
  dialogWindow.addButtonWithTitle('Cancel');

  var typeIndex = getOption('type', 0, this.prefix);
  var webView = createWebView('mapbox.html', context);
  var windowObject = webView.windowScriptObject();
  var self = this;
  var delegate = new MochaJSDelegate({
    "webView:didFinishLoadForFrame:" : (function(webView, webFrame) {
        if (shouldRemember == 1) {
          var options = {
            center: {
              lng: parseFloat(getOption('lng', 0, self.prefix)),
              lat: parseFloat(getOption('lat', 0, self.prefix))
            },
            zoom: parseInt(getOption('zoom', 11, self.prefix))
          };
          windowObject.evaluateWebScript('setOptions(' + JSON.stringify(options) + ')');
          var mapType = 'mapbox.' + self.types[typeIndex];
          windowObject.evaluateWebScript('setType("' + mapType + '")');
        }
    }),
    "webView:didChangeLocationWithinPageForFrame:" : (function(webView, webFrame) {
        var locationHash = windowObject.evaluateWebScript("window.location.hash");
        var hash = parseHash(locationHash);
        self.centerLng = hash.centerLng;
        self.centerLat = hash.centerLat;
        self.zoom = hash.zoom;
    })
  });
  webView.setFrameLoadDelegate_(delegate.getClassInstance());
  dialogContent.addSubview(webView);

  var typeLabel = createLabel('Select map type',  NSMakeRect(0, 360, 100, 20));
  dialogContent.addSubview(typeLabel);

  var typeTag = 1;
  var type = createSelect(this.types, shouldRemember == 0 ? 0 : getOption('type', 0, this.prefix), NSMakeRect(120, 360, 200, 20), typeTag, function(sender) {
    var mapType = 'mapbox.' + self.types[sender.indexOfSelectedItem()];
    windowObject.evaluateWebScript('setType("' + mapType + '")');
  });
  dialogContent.addSubview(type);

  var checkTag = 2;
  var remember = createCheck('Remember my options', shouldRemember == 1, NSMakeRect(0, 390, 150, 20), checkTag);
  dialogContent.addSubview(remember);

  viewIndex.push({
    key: 'type',
    index: typeTag,
    type: 'select'
  });

  viewIndex.push({
    key: 'remember',
    index: checkTag,
    type: 'string'
  });

  return dialogWindow;
}
