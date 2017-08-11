@import "common.js";

function BaiduMap() {}

BaiduMap.prototype.prefix = 'baidu';
BaiduMap.prototype.maxWidth = 1024;
BaiduMap.prototype.maxHeight = 1024;
BaiduMap.prototype.minZoom = 3;
BaiduMap.prototype.maxZoom = 18;
BaiduMap.prototype.zoomLevels = [];
BaiduMap.prototype.ak = '4yWbU5UAZzPq3zG136ioc188jR1p6j0t';

BaiduMap.prototype.createMap = function (context) {
  calcZoomLevels(this.zoomLevels, this.minZoom, this.maxZoom);
  if (!checkLayer(context.selection)) {
    return;
  }
  var viewIndex = [];
  var dialog = this.buildOptionDialog(viewIndex);
  var options = handleDialog(dialog, viewIndex, this.prefix, dialog.runModal());
  if (!checkOptions(options)) {
    return;
  }
  var layer = context.selection[0];
  var layerSizes = layer.frame();
  var width = Math.min(parseInt([layerSizes width]), this.maxWidth);
  var height = Math.min(parseInt([layerSizes height]), this.maxHeight);
  var imageUrl = 'https://api.map.baidu.com/staticimage/v2?center=' + encodeURIComponent(options.center) + '&width=' + width + '&height=' + height + '&zoom=' + options.zoom + '&scale=1&copyright=1&ak=' + this.ak;
  fillLayer(context, imageUrl, layer);
}

BaiduMap.prototype.buildOptionDialog = function (viewIndex) {
  var remember = getOption('remember', 0, this.prefix);

  var dialogWindow = COSAlertWindow.new();
  dialogWindow.setMessageText('Map Creator');
  dialogWindow.setInformativeText('Input your options to create a map');

  dialogWindow.addTextLabelWithValue('Input your map center');
  var center = createTextField(remember == 0 ? '' : getOption('center', '', this.prefix), 'Name or coordinate like \'116.403874,39.914888\'');
  dialogWindow.addAccessoryView(center);

  dialogWindow.addTextLabelWithValue('Select zoom level');
  var zoom = createSelect(this.zoomLevels, remember == 0 ? 0 : getOption('zoom', 0, this.prefix));
  dialogWindow.addAccessoryView(zoom);

  var remember = createCheck('Remember my options', remember);
  dialogWindow.addAccessoryView(remember);

  dialogWindow.addButtonWithTitle('OK');
  dialogWindow.addButtonWithTitle('Cancel');

  viewIndex.push({
    key: 'center',
    index: 1,
    type: 'string'
  });
  viewIndex.push({
    key: 'zoom',
    index: 3,
    type: 'select'
  });
  viewIndex.push({
    key: 'remember',
    index: 4,
    type: 'string'
  });

  return dialogWindow;
}
