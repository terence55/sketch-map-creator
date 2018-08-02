/**
 * baidu.js
 *
 * Copyright (c) 2017-present, Terence Wu.
 */

@import "common.js";
@import "MochaJSDelegate.js";

function BaiduMap() {}

BaiduMap.prototype.prefix = 'baidu';
BaiduMap.prototype.maxWidth = 512;
BaiduMap.prototype.maxHeight = 512;
BaiduMap.prototype.ak = '4yWbU5UAZzPq3zG136ioc188jR1p6j0t';

BaiduMap.prototype.createMap = function (context) {
  if (!checkLayer(context.selection)) {
    return;
  }
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
  var imageUrl = 'https://api.map.baidu.com/staticimage/v2?center=' + encodeURIComponent(this.centerLng + ',' + this.centerLat) + '&width=' + width + '&height=' + height + '&zoom=' + (parseInt(this.zoom)) + '&scale=2&copyright=1&ak=' + this.ak;
  fillLayer(context, imageUrl, layer);
}

BaiduMap.prototype.buildOptionDialog = function (viewIndex, context) {
  var shouldRemember = getOption('remember', 0, this.prefix);

  var dialogWindow = NSAlert.alloc().init();
  dialogWindow.setMessageText(tipsTargetCenter);
  var dialogContent = NSView.alloc().init();
  dialogContent.setFlipped(true);
  dialogContent.frame = NSMakeRect(0, 0, 800, 400);
  dialogWindow.accessoryView = dialogContent;

  dialogWindow.addButtonWithTitle('OK');
  dialogWindow.addButtonWithTitle('Cancel');

  var webView = createWebView('baidu.html', context, NSMakeRect(0, 0, 800, 350));
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

  var checkTag = 1;
  var remember = createCheck('Remember my options', shouldRemember == 1, NSMakeRect(0, 360, 200, 20), checkTag);
  dialogContent.addSubview(remember);

  viewIndex.push({
    key: 'remember',
    index: checkTag,
    type: 'string'
  });

  return dialogWindow;
}
