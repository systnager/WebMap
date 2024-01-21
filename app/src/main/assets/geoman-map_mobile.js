 map.pm.Toolbar.changeControlOrder([
  'drawPolygon',
  'drawPolyline',
  'drawMarker',
]);


const custom_polygon_draw_actions = [
  // uses the default 'cancel' action
  'finish',
  'removeLastVertex',
  'cancel',
  {
    text: `<i class="fa-solid fa-location-crosshairs"></i>`,
    onClick: () => {
      map.fireEvent('click', {latlng: current_user_location_latlng})
    },
  }
  
];

const custom_point_draw_actions = [
  // uses the default 'cancel' action
  'cancel',
  {
    text: `<i class="fa-solid fa-location-crosshairs"></i>`,
    onClick: () => {
      map.fireEvent('click', {latlng: current_user_location_latlng})
    },
  }
  
];

var custom_polygon_draw_button = map.pm.Toolbar.copyDrawControl('Polygon', {
  name: 'PolygonCustom',
  block: 'custom',
  actions: custom_polygon_draw_actions,
});
var custom_polyline_draw_button = map.pm.Toolbar.copyDrawControl('Polyline', {
  name: 'PolylineCustom',
  block: 'custom',
//   title: 'Display text on hover button',
   actions: custom_polygon_draw_actions,
});
var custom_point_draw_button = map.pm.Toolbar.copyDrawControl('Marker', {
  name: 'PointCustom',
  block: 'custom',
//   title: 'Display text on hover button',
  actions: custom_point_draw_actions,
});

map.pm.addControls({  
    positions: {
          custom: 'topleft',
      draw: 'topleft',
       
     edit: 'topright',
     
  },  
  drawPolygon: false,
  drawPolyline: false,
  drawMarker: false,
 drawCircle: false,
   drawText: false,
drawCircleMarker: false,
 drawRectangle: false,
 drawCircle: false,

});

 const customTranslation = {
     tooltips: {
    placeMarker: "",
    firstVertex: "",
    continueLine: "",
    finishLine: "",
    finishPoly: "",
    finishRect: "",
    startCircle: "",
    finishCircle: "",
    placeCircleMarker: ""
  },
  actions: {
    cancel: `<i class="fa-solid fa-xmark" style="font-size:1.5em"></i>`,
    removeLastVertex: `<i class="fa-solid fa-rotate-left" style="font-size:1.5em"></i>`,
    finish: `<i class="fa-solid fa-check" style="font-size:1.5em"></i>`

  },
};

map.pm.setLang('icons', customTranslation, 'ua');

map.pm.setLang('ua');


function bindTooltip_geometry_info (layer) {
    console.log('bindtooltip called')
    
     if (layer.pm.getShape()==="Polygon"){
   
layer.bindTooltip(`<b style="font-size: 18px">Площа: ${(turf.area(layer.toGeoJSON())/10000).toFixed(4)} га</br>
      Периметр: ${(turf.length(layer.toGeoJSON(), {units: 'meters'})).toFixed(1)} м </b>`,)

}
    else if(layer.pm.getShape()==="Line") {

   layer.bindTooltip(`<b style="font-size: 18px">Довжина: ${turf.length(layer.toGeoJSON(), {units: 'meters'}).toFixed(1)} м </b>`,)
  }
}
 
 
   LayerDrawnByGeoman.on('pm:edit', e=> {
 
 setTimeout(()=>info_label.innerHTML=``, 1000)
  setTimeout(()=>info_label.setAttribute("style", ''), 1000)
  })
 
   
 var points, polygon_area, polygon_perimeter, line_length
map.on('pm:drawstart', ({ workingLayer }) => {
   workingLayer.on('pm:vertexadded', (e) => {
     
if (e.shape === "PolygonCustom") {
 points = []
 polygon_perimeter = 0
 polygon_area = 0

    for (var x in e.workingLayer._latlngs) {

     points.push([e.workingLayer._latlngs[x].lng, e.workingLayer._latlngs[x].lat])
     }
     console.log(`points = ${e.workingLayer._latlngs.length}`)
     
    if (e.workingLayer._latlngs.length == 1) {
    points.push([lng, lat])
   
  polygon_perimeter = turf.length(turf.lineString(points), {units: 'meters'}).toFixed(1)
    
   info_label.innerHTML = `<b style="font-size: 20px">Площа: 0,0000 га <br> Периметр: ${polygon_perimeter} м</b>`
   info_label.setAttribute("style", 'border:2px solid; padding: 5px; background-color:white;')
    }
  else if (e.workingLayer._latlngs.length >= 2) {
  points.push([lng, lat])
  

  points.push([e.workingLayer._latlngs[0].lng, e.workingLayer._latlngs[0].lat])

     polygon_perimeter = turf.length(turf.lineString(points), {units: 'meters'}).toFixed(1)
  polygon_area = (turf.area(turf.polygon([points]))/10000).toFixed(4)
     console.log(`area ${polygon_area} perimetr ${polygon_perimeter}`)
   info_label.innerHTML = `<b style="font-size: 20px">Площа: ${polygon_area} га <br> Периметр: ${polygon_perimeter} м</b>`
   info_label.setAttribute("style", 'border:2px solid; padding: 5px; background-color:white;')
 }
console.log(info_label.innerHTML)
 }
 
 else if (e.shape === "Cut") {
  e.layerInteractedWith.unbindTooltip()
 } 
 
else if (e.shape === "PolylineCustom") {
 points = []
    for (var x in e.workingLayer._latlngs) {

     points.push([e.workingLayer._latlngs[x].lng, e.workingLayer._latlngs[x].lat])
     }
    if (e.workingLayer._latlngs.length >= 1) {
    points.push([lng, lat])
  line_length = turf.length(turf.lineString(points), {units: 'meters'}).toFixed(1)
  
  info_label.innerHTML = `<b style="font-size: 20px">Довжина = ${line_length} м</b>`
  info_label.setAttribute("style", 'border:2px solid; padding: 5px; background-color:white;')
    }
    
 }

});
   
  

}); 

