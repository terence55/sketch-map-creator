@import "common.js";

function Mapbox() { }

Mapbox.prototype.prefix = 'mapbox';
Mapbox.prototype.maxWidth = 1280;
Mapbox.prototype.maxHeight = 1280;
Mapbox.prototype.minZoom = 0;
Mapbox.prototype.maxZoom = 22;
Mapbox.prototype.zoomLevels = [];
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
Mapbox.prototype.minLon = -180;
Mapbox.prototype.maxLon = 180;
Mapbox.prototype.minLat = -85.0511;
Mapbox.prototype.maxLat = 85.0511;
Mapbox.prototype.ak = 'pk.eyJ1IjoidHJlbmNlMzIwIiwiYSI6ImNqNjRobjF0czFrZGMzMnBvN3VzYzQxenMifQ.BJml_qE3BhBJ2bPodjwfeg';

Mapbox.prototype.createMap = function (context) {
  calcZoomLevels(this.zoomLevels, this.minZoom, this.maxZoom);
  if (!checkLayer(context.selection)) {
    return;
  }
  var app = NSApplication.sharedApplication();
  var viewIndex = [];
  var dialog = this.buildOptionDialog(viewIndex);
  var options = handleDialog(dialog, viewIndex, this.prefix, dialog.runModal());
  if (!checkOptions(options)) {
    return;
  }
  var coordinate = options.center.split(',');
  if (coordinate.length !== 2
    || (isNaN(coordinate[0] || coordinate[1]))
    || (coordinate[0] < this.minLon || coordinate[0] > this.maxLon)
    || (coordinate[1] < this.minLat || coordinate[1] > this.maxLat)) {
    app.displayDialog_withTitle('Please enter valid center, longitude must be between -180 and 180, latitude must be between -85.0511 and 85.0511', 'Invalid center');
    return;
  }
  var layer = context.selection[0];
  var layerSizes = layer.frame();
  var width = Math.min(parseInt([layerSizes width]), this.maxWidth);
  var height = Math.min(parseInt([layerSizes height]), this.maxHeight);
  var imageUrl = 'https://api.mapbox.com/v4/mapbox.' + options.type + '/' + options.center + ',' + options.zoom + '/' + width + 'x' + height + '.jpg90?access_token=' + this.ak;
  fillLayer(context, imageUrl, layer);
}

Mapbox.prototype.buildOptionDialog = function (viewIndex) {
  var remember = getOption('remember', 0, this.prefix);

  var dialogWindow = COSAlertWindow.new();
  dialogWindow.setMessageText('Map Creator');
  dialogWindow.setInformativeText('Input your options to create a map');

  dialogWindow.addTextLabelWithValue('Input your map center');
  var center = createTextField(remember == 0 ? '' : getOption('center', '', this.prefix), 'Coordinate like \'116.403874,39.914888\'');
  dialogWindow.addAccessoryView(center);

  dialogWindow.addTextLabelWithValue('Select zoom level');
  var zoom = createSelect(this.zoomLevels, remember == 0 ? 0 : getOption('zoom', 0, this.prefix));
  dialogWindow.addAccessoryView(zoom);

  dialogWindow.addTextLabelWithValue('Select map type');
  var type = createSelect(this.types, remember == 0 ? 0 : getOption('type', 0, this.prefix), 150);
  dialogWindow.addAccessoryView(type);

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
    key: 'type',
    index: 5,
    type: 'select'
  });
  viewIndex.push({
    key: 'remember',
    index: 6,
    type: 'string'
  });

  return dialogWindow;
}
