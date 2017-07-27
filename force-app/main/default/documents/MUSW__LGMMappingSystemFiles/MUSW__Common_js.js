// Common.js - common functions for tax viewer applications to avoid copy-and-paste reuse of common functions.
// the idea is to have the map/data specific config in the .html file, and for these functions to be more
// generic - i.e., you could copy and paste the html for a water pipe app and not change common.js

  function setSliderLabels(layer){
    // set the labels on the zoom slider according to tiled service cache scales
       if (layer.loaded)
      initLayer(layer);
    else
      dojo.connect(layer, "onLoad", initLayer);
  }
  
  function initLayer(layer){
    //custom slider labels
    //use layer's scales to display as slider labels
    var labels = [];
    var lods = layer.tileInfo.lods;
    for (var i = 0, il = lods.length; i < il; i++) {
      labels[i] = lods[i].scale;
    }
    
    esriConfig.defaults.map.sliderLabel = {
      tick: 0,
      labels: labels,
      style: "width:2em; font-family:Verdana; font-size:50%; color:grey; padding-left:2px;"
    };    
  }

  function executeQueryTask(evt){
    // execute esri query task, callable with evt (mouse click), or without (url query)
    map.infoWindow.hide();
    //featureSet = null;
    if (evt != null) {
      query.geometry = evt.mapPoint;  
      query.where = "";
      query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_WITHIN;
      searchMsg("Querying map for mouse click ...");
    }
    else {
      query.where = "\"" + keyField + "\" = '" + featureID + "'";
      query.geometry = startExtent;
      query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS; 
      searchMsg("Searching for " + query.where);
    }
    startStatusUpdate(1000);

    //Execute task and call showResults on completion
    featureID = "";
    queryTask.execute(query, function(fset) {
      if (fset.features.length == 1) {
        searchMsg("");
        showFeature(fset.features[0], evt);
      }
      else if (fset.features.length != 0) {
        searchMsg("");
        featureSet = fset;
        showFeatureSet(fset, evt);
      }
      else {
        searchMsg("No Tax Parcels found");
        hidePopup();
      }
      clearStatusUpdate();
    });
  }

  function showFeatureSet(fset,evt) {
    // show a feature set list using keyField and addressField
    hidePopup();
    setSearchResultItems([]);
    clearStatusUpdate();
    var screenPoint = evt.screenPoint;
    featureSet = fset;

    var numFeatures = fset.features.length;

    //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the infowindow.
    searchMsg(numFeatures + " Features, " + " <a href='javascript:showClickResults(featureSet);'>show as Search Results</a>");

    var title = numFeatures + " Features found at this location.";
    var content = "<p><a href='javascript:showClickResults(featureSet);'>Show as Search Results</a> or select:</p>";
    content += "<table>";
    for (var i=0; i<numFeatures; i++) {
      var graphic = fset.features[i];
      content +=  "<tr><td width='80px'><a href='javascript:showFeature(featureSet.features[" + i + "]);'>" + getFieldValue(graphic,keyField) + "</a></td>";
      content +=  "<td width='*'>" + getFieldValue(graphic,addressField) + "</td></tr>";
    }
    content += "</table>";
    map.infoWindow.setTitle(title);
    map.infoWindow.setContent(content);
    map.infoWindow.resize(infoWindowWidth,infoWindowHeight);
    map.infoWindow.show(screenPoint,map.getInfoWindowAnchor(evt.screenPoint));
  }

  function showClickResults(featureSet){
    // this function shows a feature set as results in the dojo grid
    // usually called from "Show as Results" when multiple features are found for a map click
    hidePopup();
    searchResults = null;

    var items = []; //all items to be stored in data store
    searchMsg(featureSet.features.length + " Features found");
    
    for (var i = 0, il = featureSet.features.length; i < il; i++) {
      items.push(featureSet.features[i].attributes); //append each attribute list as item in store
      //searchMsg(dojo.toJson(featureSet.features[i]));
    }
    setSearchResultItems(items);
  }

    function showResults(results){
    // This function works with an array of FindResult that the task returns  
    // Usually called after the user enters search criteria in the Search box
    hidePopup();
    searchResults = results;
    featureSet = null;
    
    //Create items array to be added to stores data
    var items = []; //all items to be stored in data store
    clearStatusUpdate();     
    searchMsg(results.length + " Features found");
    for (var i = 0, il = results.length; i < il; i++) {
      items.push(results[i].feature.attributes); //append each attribute list as item in store
    }
    setSearchResultItems(items);
  }
  
  function setSearchResultItems(items){
    //Create data object to be used in store
    var data = {
      identifier: keyField, //This field needs to have unique values
      label: addressField, //Name field for display. Not pertinent to a grid but may be used elsewhere.
      items: items
    };
    dojo.byId("grid").style.visibility = "visible";
    //Create data store and bind to grid.
    store = new dojo.data.ItemFileReadStore({
      data: data
    });
    grid.setStore(store);
    //grid.setQuery({ PARCELID : '*' });
  }

  function extentChange(){
    //map.graphics.clear();
    //map.infoWindow.hide();
  }

  function searchMap(){
    // search the map for the value in the search box
    //Set the search text to the value in the box
    var searchBox = dojo.byId("searchBox");
    var searchText = searchBox.value;
    searchText = searchText.replace(/-/g,"");
    findParams.searchText = searchText;
    searchBox.value = searchText;
    if (searchText != "") {
      searchMsg("Searching for '" + searchText + "' ...");
      featureID = "";
      startStatusUpdate(1000);
      findTask.execute(findParams, showResults);
    }
    else
      searchMsg("No search criteria entered, enter search text");
  }

   function searchKey(e){
    // special case for IE to capture <enter> in the search box
    var key = window.event ? e.keyCode : e.which;
    var keychar = String.fromCharCode(key);
    if (key == 13)
      searchMap();
  }

  function searchMsg(msg){
    // set the search message
    dojo.byId("searchStatus").innerHTML = msg;
  }

  function refreshStatus(){
    // refresh the search status while queries in progress. Add "." to the screen to show progress
    searchMsg(dojo.byId("searchStatus").innerHTML + ".");
    dotCount += 1;
    if( dotCount > 40) {
      // assume query or search has failed
      clearStatusUpdate();
      dotCount = 0;
    }
  }  

  function clearStatusUpdate(){
    // get rid of the stack of intervals that may be available. Multiple asynch requests can be made
    while (iTimerIDs.length > 0) {
      var iT = iTimerIDs.pop();
      //searchMsg("array length=" + (iTimerIDs.length+1) + ", value=" + iT );
      window.clearInterval (iT);
    }
    document.body.style.cursor = "default";
  }  

  function startStatusUpdate(interval){
    // start an interval update of the browser, call refresh status for each interval
    iTimerID = window.setInterval("refreshStatus()", interval);
    iTimerIDs.push(iTimerID); //append each attribute list as item in store
    document.body.style.cursor = "wait";
  }

  function mapResizeOther(){
    // resize function called when the html body element is resized. Firefox Case
    if (dojo.isIE) {
      // do nothing for IE
    }
    else {
      //Non-IE
      if(map){
        map.reposition();
        map.resize();
      }
    }
  }
  function mapResize(){ 
    // resize function called when the html mapArea/borderContainer element is resized. Internet Explorer Case
    if (dojo.isIE) {
      //IE - resize 
      if(map){
        map.reposition();
        map.resize();
      }
    }
    else {
      // do nothing
    }
  }

  function formatNumber(theValue){
    // format number values as whole numbers with thousands separators
    var x, x1, x2;
    if( theValue != undefined){
      var nStr = parseFloat(theValue).toFixed(0).toString();
      nStr += '';
      x = nStr.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    }
    else return "";
  }

  function printMap(){
    // open a new window with Print.html using featureid and extent
    var idString = "";
    var mapDiv = dojo.byId("mapDiv");
    var extString = getExtentString();  
    var urlStr = insertIntoHtmlURL("Print.html");
    urlStr += "?featureID=" + idString  + "&extent=" + extString + "&appWidth=" + mapDiv.style.width + "&appHeight=" + mapDiv.style.height + "&mapName=" + getMapName();
    window.open(urlStr);
  }

  function sendMail(){
    // open default email program with URI = featureID and extent
    var emailSubject = "Tax Viewer Map";
    var idString = "";
    var mapStr = "";
    var extString = getExtentString();

    if(featureID != "" && featureID != undefined && map.infoWindow.isShowing){
      idString =  featureID;
    }
    var url = esri.urlToObject(window.location.toString());
    var urlStr = encodeURI(url.path) +  "?featureID=" + featureID  + "%26extent=" + extString + "%26mapName=" + getMapName(); 
    parent.location.href = "mailto:?subject=" + emailSubject + "&body=" + urlStr;
  }

  function help(){
    // open a new window with appName + Help.pdf
    var urlStr = insertIntoHtmlURL("Help.pdf"); 
    window.open(urlStr);
  }

  function insertIntoHtmlURL(addString){
    // insert the supplied string into the html appname URL.
    var urlStr = appFolder + addString; 
    return(urlStr);
  }

  function getExtentString(){
    // get the extent of the current map and convert to a string xmin,ymin,xmax,ymax
    var extString = map.extent.xmin.toString() + ",";
    extString += map.extent.ymin.toString() + ",";
    extString += map.extent.xmax.toString() + ",";
    extString += map.extent.ymax.toString();
    return(extString);

  }


  function getExtentString2(){
    // get the extent of the current map and convert to a string xmin,ymin,xmax,ymax
    // this trims off trailing decimal spaces - good for feet, not good for decimal degrees
    var val = [];
    var extString = ""; 
    val = map.extent.xmin.toString().split(".");
    extString += val[0] + ",";
    val = map.extent.ymin.toString().split(".");
    extString += val[0] + ",";
    val = map.extent.xmax.toString().split(".");
    extString += val[0] + ",";
    val = map.extent.ymax.toString().split(".");
    extString += val[0];
    return(extString);
  }

  function initQueryCheck() {
    // on startup check for url query parameters and use extent and optionally featureID
    // executeQueryTask will be called if there is a featureID so the app behaves just like a mouse click
    var url = esri.urlToObject(window.location.toString());
    if (url.query && url.query != null && false) { //JAW scontrol URL is not a feature :)
      featureID = url.query.featureID;
      mapName = url.query.mapName;
      var bounds = url.query.extent.split(",");
      var xmin, ymin, xmax, ymax;
      xmin = parseFloat(bounds[0]);
      ymin = parseFloat(bounds[1]);
      xmax = parseFloat(bounds[2]);
      ymax = parseFloat(bounds[3]);
      //alert("b " + xmin + "," + ymin + "," + xmax + "," + ymax);
      startExtent = new esri.geometry.Extent(xmin, ymin, xmax, ymax, spRef);
    }
  }

  function getFieldValue(graphic,fieldName){
    // return the value of a named field
    var res = esri.substitute(graphic.attributes,"${" + fieldName + "}");
    return(res);
  }
  
  function getMapName(){
    // get the short name of the map service using the url for mapName
    var strArray = mapName.url.split("/");
    if(strArray.length >= 2)
      return(strArray[strArray.length-2]);
    else
      return(null);
  }
  
  function getUrlName(layer){
    // get the short name of the layer using the url
    var strArray = layer.url.split("/");
    if(strArray.length >= 2)
      return(strArray[strArray.length-2]);
    else
      return(null);
  }

  function setMapByName(layerName){
    // use the short name of the layer to search through the map layer urls and set the layerName as visible
    for (var j=0, jl=map.layerIds.length; j<jl; j++) {
      var layer = map.getLayer(map.layerIds[j]);
      var strArray = layer.url.split("/");
      var name = strArray[strArray.length-2];
      if (layerName == name && layerName != null) {
        mapName=layer;
        changeMap([layer]);
      }
    }
  }
  
  function changeMap(layers) {
    // show the map for the layers provided in the layers array
    hideImageTiledLayers(layers);
    for (var i=0; i<layers.length; i++) {
      layers[i].show();
      mapName = layers[i];
    }
  }

  function hideImageTiledLayers(layers) {
    // hide the layers array layers provided
    for (var j=0, jl=map.layerIds.length; j<jl; j++) {
      var layer = map.getLayer(map.layerIds[j]);
      if (dojo.indexOf(layers, layer) == -1) {
        layer.hide();
        setButtonColor(j);
      }
    }
  }

  function setButtonColor(num){
    // set the button color/focus for the selected map button
    var mapHtmlId;
    for (var j = 0, jl = map.layerIds.length; j < jl; j++) {
      mapHtmlId = dojo.byId("mapButton" + j);
      if(mapHtmlId != null){
        mapHtmlId.style.color = "#999999"    
      }
    }
    mapHtmlId = dojo.byId("mapButton" + num);
    if(mapHtmlId != null){
      //mapHtmlId.style.backgroundImage = "url('./graphics/mapButtonPressed.gif')";
      mapHtmlId.style.color = "#03336f";    
      mapHtmlId.focus();
    }
  }

  function onHidePopup(){
    // when the popup is hidden/closed, clear map graphics
    if( map.graphics != null){
      map.graphics.clear();  
    }
  }

  function hidePopup(){
    // when the popup is hidden/closed, clear map graphics
    if( map.graphics != null){
      map.graphics.clear();  
    }
    if (map.infoWindow != null) {
      map.infoWindow.hide();
    }
  }
