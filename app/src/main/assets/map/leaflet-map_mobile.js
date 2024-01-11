sessionStorage.clear();

var northEast = L.latLng(49.50, 34.15),
southWest = L.latLng(49.05, 33.60);
var bounds = L.latLngBounds(northEast, southWest);

var lat, lng;



var orangeIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

var map = L.map('map', {center: bounds.getCenter(), renderer: L.canvas(), zoomControl: false, zoom: 12,minZoom: 5, maxZoom: 22});
map.attributionControl.addAttribution('&copy;Google; &copy;OSM; kadastr.live');
map.attributionControl.setPosition('bottomleft')
map.attributionControl.setPrefix('')

L.control.attribution('safasdfas',{
  position: 'topright'
}).addTo(map);


map.createPane('Optional_Rasters');
map.createPane('Parcels');
map.createPane('Others');
map.createPane('IKK');
map.createPane('Geoman');
map.createPane('Geoman_marker');

map.getPane('Optional_Rasters').style.zIndex = 251;
map.getPane('Parcels').style.zIndex = 252;
map.getPane('Others').style.zIndex = 253;
map.getPane('IKK').style.zIndex = 254;
map.getPane('Geoman').style.zIndex = 500;
map.getPane('Geoman_marker').style.zIndex = 501;

map.getPane('Optional_Rasters').style.pointerEvents = 'none';
map.getPane('Parcels').style.pointerEvents = 'none';
map.getPane('Others').style.pointerEvents = 'none';
map.getPane('IKK').style.pointerEvents = 'none';
map.getPane('Geoman').style.pointerEvents = 'none';
map.getPane('Geoman_marker').style.pointerEvents = 'none';

var geojson_style = {"color": "yellow",
                    "weight": 2,
                    "fillOpacity": .55}


function getColor_Parcels(d) {
    return d == "Комунальна власність" ? 'green' :
           d == "Приватна власність"  ? 'yellow' :
           d == "Державна власність"  ? 'purple' :
           d == "Не визначено"  ? 'red': 'white'
}

function style_Parcels(feature) {
    return {
        color: getColor_Parcels(feature.properties.ownership),
        fillOpacity: 0.55,
    };
}


    var IKK = L.geoJson(IKK_data, {renderer: L.canvas({pane: 'IKK'}), pmIgnore: true, snapIgnore: true, id: "IKK", layername: 'Кадастровий поділ', style: {color: 'blue', fillOpacity: .0, weight: 5}
    }).addTo(map);

    var Khorishky = L.geoJson(cad_data_khorishky, {renderer: L.canvas({pane:"Parcels"}), pmIgnore: true, snapIgnore: true, id: "Khorishky", layername: 'Земельні ділянки - Хорішківська сільська рада', style: style_Parcels}).addTo(map); 
    var Vakulivka = L.geoJson(cad_data_vakulivka, {renderer: L.canvas({pane:"Parcels"}), pmIgnore: true, snapIgnore: true, id: "Vakulivka", layername: 'Земельні ділянки - Високовакулівська сільська рада', style: style_Parcels}).addTo(map);

    var PZF = L.geoJson(pzf_geojson, {renderer: L.canvas({pane: 'Others'}), pmIgnore: true, snapIgnore: true, stripeColor:'#05fc47', stripeId: "crossing", style: {color: '#05fc47', fillOpacity: .5, weight: 5}, id: "PZF", layername: 'Природно-заповідний фонд'})

    var LayerDrawnByGeoman = L.geoJson();



    LayerDrawnByGeoman.options = {id: 'LayerDrawnByGeoman', layername: 'Намальовані фігури', style: {color: 'orange', weight: 7}, icon: orangeIcon/*, style: {color: 'orange', weight: 7}, stripeColor:'black', stripeId: "diagonal_left_down_to_right_up" */}
    LayerDrawnByGeoman.addTo(map)

    var Auction_parcels = L.geoJson(auction_parcels_geojson, {renderer: L.canvas({pane: 'Others'}), stripeColor:'pink', stripeId: "diagonal_left_down_to_right_up", pmIgnore: true, snapIgnore: true, style: {color: 'pink', fillOpacity: .0, weight: 5}, id: "Auction_parcels", layername: 'Перспективні ділянки для продажу на аукціоні'});


    var Unclaimed_plots_layer = L.geoJson(unclaimed_plots, {renderer: L.canvas({pane: 'Others'}), stripeColor:'orange', stripeId: "crossing", pmIgnore: true, snapIgnore: true, style: {color: 'brown', fillOpacity: .0, weight: 5}, id: "Unclaimed_plots_layer", layername: 'Невитребувані паї'}).addTo(map)

    var user_layers_list = []
    for (x in Array.from({length: 11}, (v, i) => i)) {
        console.log(x)
        window['user_layer_' + x] = L.geoJson()
        user_layers_list.push(window['user_layer_' + x])
        window['user_layer_' + x].options = {id: "user_layer_" + x}
        console.log(window['user_layer_' + x].options)
    }

    var user_layer_group = L.layerGroup(user_layers_list)


    var googlemaps =  L.tileLayer.canvas('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 22,
  maxNativeZoom: 19, id: "GoogleMaps", layername: 'Google знімки із супутника'}).addTo(map)

    var openstreetmap =  L.tileLayer.canvas('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {id: "OpenStreetMap", layername: 'OpenStreetMap'})

    var arcgis_map =  L.tileLayer.canvas('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png', {maxNativeZoom:16, id: "WorldImageryArcGIS", layername: 'World Imagery (ArcGIS) знімки із супутника'})
    var Koz_Lut = L.tileLayer('Koz_Lut/{z}/{x}/{y}.png', {maxZoom: 22, maxNativeZoom:18, id: "Koz_Lut", layername: 'Топографічний план Козельщина'})


      var users_layers_tree = [
                        {label: '<p></p>'},
                        {label: '<button name="create_layer" id="create_layer" href="#popup_window" onclick="show_popup_create_layer()">СТВОРИТИ НОВИЙ ШАР</button>'},
                        {label: '<button name="upload_layer" id="upload_layer" href="#popup_window" onclick="show_popup_upload_layer()">ЗАВАНТАЖИТИ ШАР НА КАРТУ</button>'},
                         {label: `<button name="save_geoman_layer" id="save_geoman_layer" href="#popup_window" onclick="show_popup_save_drawn_layer('${LayerDrawnByGeoman.options.id}')">ЗБЕРЕГТИ НАМАЛЬОВАНІ ФІГУРИ</button>`}
                        ]



    var baseTree = {
    label: 'Базові карти',
    selectAllCheckbox: 'Un/select all',
    children: [
        {label: googlemaps.options.layername, layer: googlemaps },
        {label: openstreetmap.options.layername, layer: openstreetmap},
        {label: arcgis_map.options.layername, layer: arcgis_map}

            ]
        }

   var systemOverlayTree = {
            label: 'Земельні ділянки',
            selectAllCheckbox: true,
            children: [
//                {label: 'Паювання Хорішківська сільська рада', layer: L.tileLayer('Khorishky/{z}/{x}/{y}.png', {maxNativeZoom: 16})},
//             {label: 'Паювання Високовакулівська сільська рада', layer: L.tileLayer('Vakulivka/{z}/{x}/{y}.png', {maxNativeZoom: 16})},
//                
//                 
       
               
                 {label: LayerDrawnByGeoman.options.layername, layer: LayerDrawnByGeoman},
                 { label: Unclaimed_plots_layer.options.layername, layer: Unclaimed_plots_layer },
                 {label: Auction_parcels.options.layername, layer: Auction_parcels },
                {label: PZF.options.layername, layer: PZF},
                { label: Khorishky.options.layername, layer: Khorishky },
                 { label: Vakulivka.options.layername, layer: Vakulivka },
                 {label: IKK.options.layername, layer: IKK}

            ]
}

var overlaysTree = {
   label: 'ШАРИ КАРТИ',
            selectAllCheckbox: true,
            children: [
                systemOverlayTree,
                 {label: '<div class="leaflet-control-layers-separator"></div>'},
                 {
                    label: 'ШАРИ КОРИСТУВАЧА',
                    selectAllCheckbox: true,
                    children: users_layers_tree
                }
                ]
    }

silrada = L.featureGroup([Khorishky, Vakulivka ])



var control_layers = L.control.layers.tree(baseTree, overlaysTree, {
                selectorBack: true,
                closedSymbol: '&#8862;',
                openedSymbol: '&#8863;',

}).addTo(map);

change_geoman_map_events()
change_geoman_map_events()
change_geoman_map_events()

function save_layer (layer_id, layer_name) {
//      console.log(layer_id)
    var collection = window[layer_id].toGeoJSON();
    var bounds = map.getBounds();

        collection.bbox = [[
            bounds.getSouthWest().lng,
            bounds.getSouthWest().lat,
            bounds.getNorthEast().lng,
            bounds.getNorthEast().lat
        ]];
         function download(content, fileName, contentType) {
         var a = document.createElement("a");
         var file = new Blob([content], {type: contentType});
         saveAs(file, fileName);
     }
     download([JSON.stringify(collection)], layer_name + '.geojson', "text/plain;charset=utf-8")
//     var file = new File([JSON.stringify(collection)], layer_name + '.geojson', {type: "text/plain;charset=utf-8"});
//     saveAs(file);

    setTimeout(() => {close_popup_window()}, 500);

}


function get_id_empty_user_layer () {
        var active_user_layer_list = get_all_user_layer_list()
        if (active_user_layer_list.length === 0) {
            console.log('length = 0')
            return 'user_layer_0'
        }
        else if (active_user_layer_list.length !== 0) {
        var all_user_layers_list = new Array(0)
            for (x in user_layer_group._layers) {
                all_user_layers_list.push(user_layer_group._layers[x].options.id)
            }

            for (y in active_user_layer_list) {
                all_user_layers_list.shift(active_user_layer_list[y])
            }

        return all_user_layers_list[0]
        }
    }


function change_geoman_map_events () {
    edit_layers_id_list = get_edit_layers_id_list()
    edit_layers_list = new Array(0)
    for (x in edit_layers_id_list) {
        edit_layers_list.push(window[edit_layers_id_list[x]])
    }

    var drawn_layer_feature_group = L.featureGroup(edit_layers_list)
    map.pm.setGlobalOptions({layerGroup:drawn_layer_feature_group, panes: {vertexPane: 'Geoman_marker', layerPane: 'Geoman', markerPane: 'Geoman_marker'}})

     map.pm.setPathOptions(
    { color: 'orange', weight: 7, stripeColor:'black', icon: orangeIcon, /*renderer: L.canvas(), */stripeId: "diagonal_left_down_to_right_up" },
   {
      merge: true, ignoreShapes: ['Line'],
    }
 );
//      map.pm.markerStyle({icon: orangeIcon})

    map.removeEventListener('pm:create')
    drawn_layer_feature_group.removeEventListener('pm:update')
    drawn_layer_feature_group.removeEventListener('pm:markerdrag')
    drawn_layer_feature_group.removeEventListener('pm:cut')
    drawn_layer_feature_group.removeEventListener('pm:edit')
    drawn_layer_feature_group.removeEventListener('pm:remove')

    map.on('pm:create', e=> {
        if (edit_layers_id_list.length === 1 && edit_layers_id_list[0] === 'LayerDrawnByGeoman') {
            LayerDrawnByGeoman.addData(e.layer.toGeoJSON())
        }

        else if (edit_layers_id_list.length > 1) {
            show_popup_create_properties_value(e.layer.toGeoJSON())
        }

        for (x in LayerDrawnByGeoman._layers) {
            console.log(LayerDrawnByGeoman._layers[x])


            if (LayerDrawnByGeoman._layers[x].feature.geometry.type === 'Polygon' || LayerDrawnByGeoman._layers[x].feature.geometry.type === 'MultiPolygon') {
                LayerDrawnByGeoman._layers[x].options.color = 'orange'
                LayerDrawnByGeoman._layers[x].options.stripeColor = 'black'
                LayerDrawnByGeoman._layers[x].options.stripeId = 'diagonal_left_down_to_right_up'
            }

            bindTooltip_geometry_info(LayerDrawnByGeoman._layers[x])
        }
        points = []
        info_label.innerHTML = ``
        info_label.setAttribute("style", '')
    })

    drawn_layer_feature_group.on('pm:update', e=> {
        console.log(e)
        info_label.innerHTML = ``
        layer_id = e.layer.options.id
        leaflet_id = e.layer._leaflet_id
        raw_geojson_data = JSON.stringify(e.layer.toGeoJSON())
        bindTooltip_geometry_info(e.layer)
        change_object_property (layer_id, leaflet_id, raw_geojson_data)
    })

     drawn_layer_feature_group.on('pm:markerdrag', e=> {

 if (e.layer.pm.getShape()==="Polygon"){

     info_label.innerHTML = `<b style="font-size: 20px">Площа: ${(turf.area(e.layer.toGeoJSON())/10000).toFixed(4)} га <br> Периметр: ${(turf.length(e.layer.toGeoJSON(), {units: 'meters'})).toFixed(1)} м</b>`
       info_label.setAttribute("style", 'border:2px solid; padding: 5px; background-color:white;')
}
    else if(e.layer.pm.getShape()==="Line") {
info_label.innerHTML = `<b style="font-size: 20px">Довжина: ${turf.length(e.layer.toGeoJSON(), {units: 'meters'}).toFixed(1)} м </b>`
       info_label.setAttribute("style", 'border:2px solid; padding: 5px; background-color:white;')
    }
 })

     drawn_layer_feature_group.on('pm:cut', e=> {
   console.log('cuted')

   e.originalLayer.setLatLngs(e.layer.getLatLngs());
    e.originalLayer.addTo(map);
    e.originalLayer._pmTempLayer = false;

    e.layer._pmTempLayer = true;
    e.layer.remove();

    if (e.originalLayer.options.id === 'LayerDrawnByGeoman') {
        for (x in LayerDrawnByGeoman._layers) {
            bindTooltip_geometry_info(LayerDrawnByGeoman._layers[x])
    }

    }
   })

      drawn_layer_feature_group.on('pm:edit', e=> {
  
          
          
 setTimeout(()=>info_label.innerHTML=``, 1000)
 setTimeout(()=>info_label.setAttribute("style", ''), 1000)
   
  })

    drawn_layer_feature_group.on('pm:remove', e=> {
    delete_object_from_layer (e.layer.options.id, e.layer._leaflet_id)

  })


}

function add_layer_to_overlay_tree (user_layer_id) {
    users_layers_tree.unshift({label: `${window[user_layer_id].options.layername} <button name="save_window[user_layer_id]" id="save_window${user_layer_id}" href="#popup_window" onclick="show_popup_save_drawn_layer('${window[user_layer_id].options.id}')">ЗБЕРЕГТИ ШАР</button>  <button name="remove_window${user_layer_id}" id="remove_window_${user_layer_id}" href="#popup_window" onclick="remove_layer('${window[user_layer_id].options.id}')">ВИДАЛИТИ ШАР</button>`, layer: window[user_layer_id]})

    control_layers.setOverlayTree(overlaysTree)
}

function upload_layer (layer_file, layer_options) {

    user_layer_id = get_id_empty_user_layer()

    layer_options.id = user_layer_id

    var data_attributes_dict = {}
    var layer_properties = JSON.parse(file_content).features[0].properties

    for (x in layer_properties) {
        if (typeof layer_properties[x] === 'object' || typeof layer_properties[x] === undefined) {
            data_attributes_dict[x] = 'string'
        }
        else { data_attributes_dict[x] = typeof layer_properties[x] }
    }
    layer_options.data_attributes = data_attributes_dict
    window[user_layer_id] = L.geoJson(JSON.parse(layer_file), layer_options)

    add_layer_to_overlay_tree(user_layer_id)

    change_geoman_map_events()

    window[user_layer_id].addTo(map);

    setTimeout(() => {close_popup_window()}, 500);

}

function create_new_layer (layer_options) {
    user_layer_id = get_id_empty_user_layer()

    layer_options.id = user_layer_id

     window[user_layer_id] = L.geoJson().addTo(map);

     window[user_layer_id].options = layer_options

    add_layer_to_overlay_tree(user_layer_id)

    change_geoman_map_events()

    console.log(window[user_layer_id])

    setTimeout(() => {close_popup_window()}, 500);


}

function remove_layer (layer_id) {
    console.log(users_layers_tree)
    console.log(layer_id)
    map.removeLayer(window[layer_id])
    for (x in users_layers_tree) {
        if (users_layers_tree[x].layer === window[layer_id]) {
            delete users_layers_tree[x]
        }
    }

    control_layers.setOverlayTree(overlaysTree);
    delete sessionStorage['last_clicked_layer']
//     document.getElementById('show_hide_info_control_container').click();
    hide_info_container()
    change_geoman_map_events()
    setTimeout(() => {close_popup_window()}, 500);
}

function delete_object_from_layer (layer_id, leaflet_id) {
     window[layer_id].removeLayer(window[layer_id].getLayer(leaflet_id))

//     delete window[layer_id].getLayer(leaflet_id)
    delete sessionStorage['last_clicked_layer']
//     document.getElementById('show_hide_info_control_container').click();
    hide_info_container()
}



function show_popup_save_drawn_layer (layer_id) {
      var popup_window = document.getElementById('popup_window')
      console.log(layer_id)
      popup_window.innerHTML = `<div class="popup">
        <form action="javascript:save_layer('${layer_id}', document.getElementById('layer_name').value)">
		<h2>Введіть назву файлу</h2>
		<a class="close" href="#" onclick='close_popup_window()'>&times;</a>
		<div class="content">
			<input id="layer_name" type="text">
			<button type="submit">Зберегти</button>
			<p style='font-size: 1em'>Назву шару рекомендовано вводити латинськими літерами<p>
		</div>
		</form>
	</div>`
      popup_window.style.visibility = 'visible';
      popup_window.style.opacity = 1

}

function get_edit_layers_id_list () {
    var layers_list_for_save = new Array(0)

    layers_list_for_save.push('LayerDrawnByGeoman')
    var active_user_layer_list = get_all_user_layer_list()

    console.log(active_user_layer_list)

    if (active_user_layer_list.length !== 0) {
        for (x in active_user_layer_list) {
            if (window[active_user_layer_list[x]].options.pmIgnore === undefined ) {
                layers_list_for_save.push(active_user_layer_list[x])
            }
        }
    }

    return layers_list_for_save
}

function show_popup_change_properties_value (layer_id, leaflet_id) {
//     console.log(layer_id)
    geojson_data = window[layer_id].getLayer(leaflet_id).toGeoJSON()
    var popup_window = document.getElementById('popup_window')

    var layers_list_for_save = get_edit_layers_id_list()

    var layers_innerHTML = ``

    var geojson_data_text_el = document.createElement('text')
    geojson_data_text_el.setAttribute('id', "geojson_data_el")
    geojson_data_text_el.hidden = true;

    var layer_for_save_select_tag = document.createElement('select')
    layer_for_save_select_tag.setAttribute('id', "layer_for_save_select_tag")

    var layer_properties_div =  document.createElement('div')
    layer_properties_div.setAttribute('id', "layer_properties_div")

    layers_innerHTML += `<br> ${layer_properties_div.outerHTML} <br>`

    geojson_innerHTML = `${geojson_data_text_el.outerHTML}`

    geometry_info_innerHTML = `<b style="font-size: 14px">Геометричні параметри об'єкту: <br>Площа: ${(turf.area(geojson_data)/10000).toFixed(4)} га     |
      Периметр: ${(turf.length(geojson_data, {units: 'meters'})).toFixed(1)} м </b>`

       popup_window.innerHTML = `<div class="popup">
        <form id='properties_form' action="javascript:change_object_property('${layer_id}', '${leaflet_id}', document.getElementById('geojson_data_el').innerHTML)">

 		<h2>Оберіть шар для збереження об'єкту</h2>
 		<a class="close" href="#" onclick='close_popup_window()'>&times;</a>
 		${geojson_innerHTML}
 		${geometry_info_innerHTML}
 		<div class="content">
 			${layers_innerHTML}
 			<button type="submit">Зберегти</button>
 		</div>
 		</form>
 	</div>`

    layer_properties_div = document.getElementById("layer_properties_div")


    var table_inner = `<tr><td colspan="2">Встановіть значення атрибутів</td></tr>`
    for (y in window[layer_id].getLayer(leaflet_id).options.data_attributes) {

    if (window[layer_id].getLayer(leaflet_id).options.data_attributes[y] === 'number') {
        table_inner += `<tr>
        <td>${y}</td>
        <td><input type="${window[layer_id].getLayer(leaflet_id).options.data_attributes[y]}" id="${y}" value="${window[layer_id].getLayer(leaflet_id).feature.properties[y]}" step="0.0001"></td>
        </tr>`
        }
    else {
        table_inner += `<tr>
            <td>${y}</td>
            <td><input type="${window[layer_id].getLayer(leaflet_id).options.data_attributes[y]}" value="${window[layer_id].getLayer(leaflet_id).feature.properties[y]}" id="${y}"></td>
            </tr>`
        }

    }
    layer_properties_div.innerHTML = `<table>${table_inner}</table>`

    document.getElementById('properties_form').onclick = function () {
        console.log('click')
         if (layer_properties_div.innerHTML !== ``) {
        var input_list = layer_properties_div.getElementsByTagName('INPUT')
         var layer_properties = {}
        for (x in input_list) {
            if (input_list[x].tagName === 'INPUT') {
                layer_properties[input_list[x].id] = input_list[x].value
            }
        }
        geojson_data.properties = layer_properties
        console.log(geojson_data)
        }
        document.getElementById('geojson_data_el').innerHTML = JSON.stringify(geojson_data)

    }
    document.getElementById('properties_form').dispatchEvent(new Event('change'))

    popup_window.style.visibility = 'visible';
    popup_window.style.opacity = 1

}


function change_object_property (layer_id, leaflet_id, raw_geojson_data) {
    geojson_data = JSON.parse(raw_geojson_data)
    window[layer_id].getLayer(leaflet_id).feature = geojson_data
    hide_info_container()
    setTimeout(() => {close_popup_window()}, 500);

}

function show_popup_create_properties_value (geojson_data) {

    var popup_window = document.getElementById('popup_window')

    var layers_list_for_save = get_edit_layers_id_list()

    var layers_innerHTML = ``

    var geojson_data_text_el = document.createElement('text')
    geojson_data_text_el.setAttribute('id', "geojson_data_el")
    geojson_data_text_el.hidden = true;

    var layer_for_save_select_tag = document.createElement('select')
    layer_for_save_select_tag.setAttribute('id', "layer_for_save_select_tag")

    var layer_properties_div =  document.createElement('div')
    layer_properties_div.setAttribute('id', "layer_properties_div")

    for (x in layers_list_for_save) {
        var select_layer_option_tag = document.createElement('option')
        select_layer_option_tag.setAttribute('id', layers_list_for_save[x])
        select_layer_option_tag.setAttribute('value', layers_list_for_save[x])
        select_layer_option_tag.textContent = window[layers_list_for_save[x]].options.layername
        layer_for_save_select_tag.appendChild(select_layer_option_tag)
    }

    layers_innerHTML += `${layer_for_save_select_tag.outerHTML} <br><br> ${layer_properties_div.outerHTML} <br>`

    layer_for_save_select_tag.dispatchEvent(new Event('change'))

    geojson_innerHTML = `${geojson_data_text_el.outerHTML}`

    geometry_info_innerHTML = `<b style="font-size: 14px">Геометричні параметри об'єкту: <br>Площа: ${(turf.area(geojson_data)/10000).toFixed(4)} га     |
      Периметр: ${(turf.length(geojson_data, {units: 'meters'})).toFixed(1)} м </b>`

       popup_window.innerHTML = `<div class="popup">
        <form id='properties_form' action="javascript:add_new_object_to_layer(layer_for_save_select_tag.value, document.getElementById('geojson_data_el').innerHTML)">

 		<h2>Оберіть шар для збереження об'єкту</h2>
 		<a class="close" href="#" onclick='close_popup_window()'>&times;</a>
 		${geojson_innerHTML}
 		${geometry_info_innerHTML}
 		<div class="content">
 			${layers_innerHTML}
 			<button type="submit">Зберегти</button>
 		</div>
 		</form>
 	</div>`


    layer_for_save_select_tag = document.getElementById("layer_for_save_select_tag")
    layer_properties_div = document.getElementById("layer_properties_div")

    layer_for_save_select_tag.onchange = function () {

        if (layer_for_save_select_tag.value === 'LayerDrawnByGeoman') {
            layer_properties_div.innerHTML = ``
        }

        else if (Object.entries(window[layer_for_save_select_tag.value].options.data_attributes).length === 0) {
            layer_properties_div.innerHTML = ``
        }

        else if (Object.entries(window[layer_for_save_select_tag.value].options.data_attributes).length > 0) {
            var table_inner = `<tr><td colspan="2">Встановіть значення атрибутів</td></tr>`
            for (y in window[layer_for_save_select_tag.value].options.data_attributes) {

                if (window[layer_for_save_select_tag.value].options.data_attributes[y] === 'number') {
                     table_inner += `<tr>
                        <td>${y}</td>
                        <td><input type="${window[layer_for_save_select_tag.value].options.data_attributes[y]}" id="${y}" step="0.0001"></td>
                    </tr>`


                }
                else {
                    table_inner += `<tr>
                        <td>${y}</td>
                        <td><input type="${window[layer_for_save_select_tag.value].options.data_attributes[y]}" id="${y}"></td>
                    </tr>`
                }

            }
            layer_properties_div.innerHTML = `<table>${table_inner}</table>`
        }

    }

    document.getElementById('properties_form').onclick = function () {
        console.log('click')
         if (layer_properties_div.innerHTML !== ``) {
        var input_list = layer_properties_div.getElementsByTagName('INPUT')
         var layer_properties = {}
        for (x in input_list) {
            if (input_list[x].tagName === 'INPUT') {
                layer_properties[input_list[x].id] = input_list[x].value
            }
        }
        geojson_data.properties = layer_properties
        console.log(geojson_data)
        }
        document.getElementById('geojson_data_el').innerHTML = JSON.stringify(geojson_data)


//         console.log(geojson_data)
    }
    document.getElementById('properties_form').dispatchEvent(new Event('change'))

    popup_window.style.visibility = 'visible';
    popup_window.style.opacity = 1

}

// function read_geojson()

function add_new_object_to_layer(layer_id, raw_geojson_data) {
    geojson_data = JSON.parse(raw_geojson_data)
    window[layer_id].addData(geojson_data)
    if (layer_id === 'LayerDrawnByGeoman') {
         for (x in LayerDrawnByGeoman._layers) {
                bindTooltip_geometry_info(LayerDrawnByGeoman._layers[x])
         }
    }


    setTimeout(() => {close_popup_window()}, 500);

    }

function show_popup_create_layer () {
      var popup_window = document.getElementById('popup_window')

      popup_window.innerHTML = `<div class="popup">
        <form action="javascript:get_new_layer_options_values()">
		<h2>Додати новий шар</h2>
		<a class="close" href="#" onclick='close_popup_window()'>&times;</a>
		<div class="content">
			<table style="border: 1px solid #000; border-collapse: collapse;">
  <tr>
    <td colspan=2 style="text-align: center">
        <label for="layer_name">Назва шару</label>
        <input id="layer_name" type="text" required>
    </td>
  </tr>
    <tr>
        <td>
            <label for="borderColor">Колір лінії межі</label>
            <input id="borderColor" type="color" value="#000000" >
        </td>
        <td>
            <label for="fillColor">Колір фону</label>
            <input id="fillColor" type="color" value="#ffffff" >
            <p><label for="transparency">Прозорість фону </label>
            <input id="transparency" type="number" min="0" max="100" value="100" maxlength="3" ></p>
        </td>
    </tr>

    <tr>
        <td>
            <p><input type="checkbox" id="stripe_checkbox" name="stripe_checkbox" onclick="set_stripes()" />
             <label for="stripe_checkbox">Штриховка</label></p>
            <input type="radio" id="diagonal_left_up_to_right_down" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="diagonal_left_up_to_right_down"><canvas id="stripe0" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <input type="radio" id="diagonal_left_down_to_right_up" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="diagonal_left_down_to_right_up"><canvas id="stripe1" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <input type="radio" id="crossing" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="crossing"><canvas id="stripe2" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <input type="radio" id="horizontal" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="horizontal"><canvas id="stripe3" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <input type="radio" id="vertical" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="vertical"><canvas id="stripe4" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <p><label for="strokeColor">Колір штриховки </label><input id="strokeColor" type="color" value="#000000" ></p>
        </td>
        <td>


            <p><input type="checkbox" id="snapIgnore" name="snapIgnore" />
            <label for="snapIgnore">Прилипання до шару</label></p>
        </td>
    </tr>
    <tr>
        <td colspan="2" style="text-align: center">
            Вигляд шару
            <canvas id="layer_final_view" width="400" height="200"  style="width:100px; height:50px;" ></canvas>
        </td>
    </tr>
</table>
<br>
<div id="attributes_table" style="height:150px; width: 350px; overflow: auto;">

</div>
  <br>
			<button type="submit">Додати новий шар на карту</button>

		</div>
		</form>
	</div>`
      set_elements_new_layer_events()
      popup_window.style.visibility = 'visible';
      popup_window.style.opacity = 1

}

function show_popup_upload_layer () {
      var popup_window = document.getElementById('popup_window')

      popup_window.innerHTML = `<div class="popup">
        <form action="javascript:get_upload_values()">
		<h2>Завантаження шару</h2>
		<a class="close" href="#" onclick='close_popup_window()'>&times;</a>
		<div class="content">
			<table style="border: 1px solid #000; border-collapse: collapse;">
  <tr>
    <td style="text-aling: left">
        <label for="layer_file">Оберіть файл</label>
        <input id="layer_file" type="file" required>
    </td>
    <td style="text-aling: left">
        <label for="layer_name">Назва шару</label>
        <input id="layer_name" type="text" required>
    </td>
  </tr>
    <tr>
        <td>
            <label for="borderColor">Колір лінії межі</label>
            <input id="borderColor" type="color" value="#000000" >
        </td>
        <td>
            <label for="fillColor">Колір фону</label>
            <input id="fillColor" type="color" value="#ffffff" >
            <p><label for="transparency">Прозорість фону </label>
            <input id="transparency" type="number" min="0" max="100" value="100" maxlength="3" ></p>
        </td>
    </tr>

    <tr>
        <td>
            <p><input type="checkbox" id="stripe_checkbox" name="stripe_checkbox" onclick="set_stripes()" />
             <label for="stripe_checkbox">Штриховка</label></p>
            <input type="radio" id="diagonal_left_up_to_right_down" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="diagonal_left_up_to_right_down"><canvas id="stripe0" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <input type="radio" id="diagonal_left_down_to_right_up" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="diagonal_left_down_to_right_up"><canvas id="stripe1" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <input type="radio" id="crossing" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="crossing"><canvas id="stripe2" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <input type="radio" id="horizontal" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="horizontal"><canvas id="stripe3" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <input type="radio" id="vertical" name="stripesRadio" onclick="set_layer_final_view()" />
            <label for="vertical"><canvas id="stripe4" name="stripe_example" width="200" height="200"  style="width:40px; height:40px;" ></canvas></label>
            <p><label for="strokeColor">Колір штриховки </label><input id="strokeColor" type="color" value="#000000" ></p>
        </td>
        <td>

            <p><input type="checkbox" id="pmIgnore" name="pmIgnore" />
            <label for="pmIgnore">Редагування шару</label></p>
            <p><input type="checkbox" id="snapIgnore" name="snapIgnore" />
            <label for="snapIgnore">Прилипання до шару</label></p>
        </td>
    </tr>
    <tr>
        <td colspan="2" style="text-align: center">
            Вигляд шару
            <canvas id="layer_final_view" width="400" height="200"  style="width:100px; height:50px;" ></canvas>
        </td>
    </tr>
</table>
			<button type="submit">Додати шар на карту</button>

		</div>
		</form>
	</div>`
      set_el_events()
      popup_window.style.visibility = 'visible';
      popup_window.style.opacity = 1

}

  function close_popup_window() {
      var popup_window = document.getElementById('popup_window')
      popup_window.innerHTML = ``
      popup_window.style.visibility = 'hidden';
      popup_window.style.opacity = 0

}

function randomPointInPoly (layer) {
    // https://gis.stackexchange.com/questions/163044/mapbox-how-to-generate-a-random-coordinate-inside-a-polygon
    var bounds = layer.getBounds();
    var x_min  = bounds.getEast();
    var x_max  = bounds.getWest();
    var y_min  = bounds.getSouth();
    var y_max  = bounds.getNorth();

    var lat_point = y_min + (Math.random() * (y_max - y_min));
    var lng_point = x_min + (Math.random() * (x_max - x_min));

    var point  = turf.point([lng_point, lat_point]);
    var poly   = layer.toGeoJSON();
    var inside = turf.booleanPointInPolygon(point, poly);

    if (inside) {
        return point
    } else {
        return randomPointInPoly(layer)
    }
}

var searchControl = new L.Control.Search({
    layer: silrada,  // Determines the name of variable, which includes our GeoJSON layer!
    propertyName: 'cadnum',
    marker: false,
    moveToLocation: function(latlng, title, map) {
    var zoom = map.getBoundsZoom(latlng.layer.getBounds());
    map.setView(latlng, zoom); // access the zoom
    }
});


searchControl.on('search:locationfound', function(e) {
    console.log('locationfound')
    point_in_layer = (randomPointInPoly(e.layer))
    lat = point_in_layer['geometry']['coordinates'][1]
    lng = point_in_layer['geometry']['coordinates'][0]
    map.fireEvent('click', {latlng: [lat, lng]})
})


searchControl.on('search:expanded', function(e) {
    var search_input = document.getElementById('searchtext9')
    search_input.setAttribute('inputmode','numeric')
    search_input.setAttribute('onsubmit','search:locationfound')
    var patternMask = IMask(search_input, {
    mask: '0000000000{:}00{:}000{:}0000', lazy: false

    });
    search_input.setSelectionRange(0, 0);
//     search_input.setAttribute('type','number')
})





map.addControl( searchControl );

L.control.zoom({
    position: 'topleft'
}).addTo(map);

var lc = L.control.locate({
    position: "topleft",
    drawCircle: false,
    strings: {
      title: "Show me where I am, yo!"
    },
    locateOptions: {
      enableHighAccuracy: true
    }
  })
  .addTo(map);

  var current_user_location_latlng;
  map.on('locationfound', function(e){current_user_location_latlng = e.latlng})


var legend_select_options = '',
info_select_options = '',
legend_container_content = 'ТУТ ПОВИННІ БУТИ УМОВНІ ПОЗНАЧЕННЯ',
info_container_content = 'ТУТ ПОВИННА МІСТИТИСЯ ІНФОРМАЦІЯ' , info_container_showed_html =  `
        <div class='info_container' id='information_container'>
        <div class='info_header' style="text-align:right;"><b>  ІНФОРМАЦІЯ      </b> </div>
        <div class='info_select'>
        <select id="info_selector" style="text-align: center; font-size: 18px">
        ${info_select_options}
        </select>
        </div>
        <div class='info_content' id='information_container_content'>
        ${info_container_content}
        </div>
        </div>
`,
legend_container_showed_html =  `
        <div class='info_container' id='legend_container'>
        <div class='info_header' style="text-align: right;"><b> УМОВНІ ПОЗНАЧЕННЯ   </b> </div>
        <div class='info_select'>
        <select id="legend_selector" style="text-align: center; font-size: 18px">
        ${legend_select_options}
        </select>
        </div>
        <div class='info_content' id='legend_container_content'>
        ${legend_container_content}
        </div>
        </div>
`,
info_container_hidden_icon = `<i class="fa-solid fa-info"></i>`,
legend_container_hidden_icon = `<i class="fa-solid fa-map"></i>`,
info_container_button_id = 'show_hide_info_control_container',
legend_container_button_id = 'show_hide_legend_control_container';

function add_info_container (container_showed_html, icon_html, button_id) {
    const container = L.DomUtil.create("div", 'leaflet-control-zoom leaflet-bar');
    const information_show_hide_button = document.createElement('a');
    information_show_hide_button.setAttribute('id', button_id)
    information_show_hide_button.setAttribute('class', 'leaflet-buttons-control-button')
    information_show_hide_button.setAttribute('role', 'button')
    information_show_hide_button.setAttribute('tabindex', '0')
    information_show_hide_button.setAttribute('href', '#')
    information_show_hide_button.innerHTML = icon_html

    container.appendChild(information_show_hide_button)
    information_show_hide_button.onclick =  function () {
        if (container.innerHTML == information_show_hide_button.outerHTML.replace('\\', '')) {
            information_show_hide_button.innerHTML = `<i class="fas fa-angle-down"></i>`;
            information_show_hide_button.setAttribute('style', 'display:inline-block; z-index:200');
            container.innerHTML = container_showed_html;
            container.children[0].children[0].appendChild(information_show_hide_button)
            }
        else {
            information_show_hide_button.innerHTML = icon_html
            information_show_hide_button.setAttribute('style', 'display:block')
            container.innerHTML = ''
            container.appendChild(information_show_hide_button)
            }
        }
        L.DomEvent.disableClickPropagation(container)
        L.DomEvent.disableScrollPropagation(container);

     return container;
     }

const information_control_container = L.Control.extend({
onAdd: map => { return add_info_container(info_container_showed_html, info_container_hidden_icon, info_container_button_id)
}
 });

map.addControl(new information_control_container({ position: "bottomleft" }));

const legend_control_container = L.Control.extend({
onAdd: map => {  return add_info_container(legend_container_showed_html, legend_container_hidden_icon, legend_container_button_id)
     }
 });

map.addControl(new legend_control_container({ position: "bottomright" }));


// L.control.scale({imperial: false, maxWidth:100, position: "bottomright"}).addTo(map);


// info_label.innerHTML = ``
const Geoman_label = L.Control.extend({
    onAdd: map => {
      const container = L.DomUtil.create("div");
     container.style.background = "white"
    container.setAttribute("id", 'geoman_info_div')
     return container;
   }
});

map.addControl(new Geoman_label({ position: "topleft" }));



var  info_label = document.getElementById('geoman_info_div');




// info_label.innerHTML = info_label.innerHTML
map.addEventListener("mousemove", e => {

lat = e.latlng.lat
lng = e.latlng.lng


if (!map.pm.globalDrawModeEnabled() && !map.pm.globalEditModeEnabled() && !map.pm.globalCutModeEnabled() && !map.pm.globalRemovalModeEnabled()  && !map.pm.globalRotateModeEnabled()   ) {
//     console.log('empry_label_while_mousemove')
 info_label.innerHTML = ``
        info_label.setAttribute("style", '')
}
});





function copy_value(value, icon_id) {
    
    var copy_icon = document.getElementById(icon_id)
    copy_icon.className = 'fa-solid fa-square-check';
    setTimeout(() => {copy_icon.className = 'fa fa-clone';}, 200);
    
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(value);
    } else {
        // text area method
        let textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
                try {
            document.execCommand('copy');
            console.log(value, icon_id)
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
        }
        textArea.remove();

    }
}

var marker;

// function convert_layer_to_json (layer) {
//             var layer_json = {}
//             for (i in layer) {
//                 layer_json[i] = layer[i]
//             for (x in layer[i]) {
//                 if (x[0]=='_') {layer_json[i][('p_' + x.slice(1,))] = layer[i][x];}
//                 else {layer_json[i][x] = layer[i][x];}
//                 }
//             }
//             sessionStorage['last_clicked_layer'] = layer_json
// }

function set_last_clicked_layer (layer) {
    var layer_json = {}
//     layer_json['feature'] = layer['feature'];
    layer_json['options'] = {};
    layer_json['options']['id'] = layer['options']['id']
    layer_json['options']['color'] = layer['options']['color']
    if (layer['options']['stripeColor']) {
        layer_json['options']['stripeColor'] = layer['options']['stripeColor']
    }
    layer_json['leaflet_id'] = layer['_leaflet_id'];
    console.log(layer_json)
    sessionStorage['last_clicked_layer'] = JSON.stringify(layer_json)
}

function reset_color_last_clicked_layer () {
    console.log(sessionStorage['last_clicked_layer'])
    console.log(sessionStorage['last_clicked_layer'] !== undefined)
    if (sessionStorage['last_clicked_layer'] !== undefined) {
//         Parcels.getLayer(JSON.parse(sessionStorage['last_clicked_layer']).leaflet_id)
        window[JSON.parse(sessionStorage['last_clicked_layer']).options.id].getLayer(JSON.parse(sessionStorage['last_clicked_layer']).leaflet_id).options.color = JSON.parse(sessionStorage['last_clicked_layer']).options.color;
        if (JSON.parse(sessionStorage['last_clicked_layer']).options.stripeColor) {
            window[JSON.parse(sessionStorage['last_clicked_layer']).options.id].getLayer(JSON.parse(sessionStorage['last_clicked_layer']).leaflet_id).options.stripeColor = JSON.parse(sessionStorage['last_clicked_layer']).options.stripeColor;
        }
    }
}

function change_color_clicked_layer (layer, color) {
    console.log(layer)
//     reset_color_last_clicked_layer()

    set_last_clicked_layer(layer)
    layer.options.color = color
    if (layer.options.stripeColor) {
        layer.options.stripeColor = color
    }
    layer.bringToFront()
    map.fitBounds(map.getBounds())
}

function show_info_container() {
    var show_hide_button = document.getElementById("show_hide_info_control_container")
    var info_container_content_div = document.getElementById("information_container_content")
    if (!info_container_content_div) {
        show_hide_button.click()
        info_container_content_div = document.getElementById("information_container_content")
        info_container_content_div.innerHTML = ``
    }
    else {info_container_content_div.innerHTML = ``}
}

function hide_info_container() {
    var show_hide_button = document.getElementById("show_hide_info_control_container")
    var info_container_content_div = document.getElementById("information_container_content")
    if (info_container_content_div) {
        show_hide_button.click()
    }
//     else {info_container_content_div.innerHTML = ``}
}


function set_info_select() {
    function get_layer_from_info_select (layer_list, layer_var) {
        var layer = new Array(0)
        for (x in layer_list)
        {
        layer.push(layer_var.getLayer(JSON.parse(layer_list[x])))
        }
        display_info(layer)
    }
    var info_selector = document.getElementById("info_selector")
        info_selector.innerHTML = ``
        if (sessionStorage['clicked_layers_list']) {
            var clicked_layers_list = JSON.parse(sessionStorage['clicked_layers_list'])
            for (x in clicked_layers_list) {
                var layers_list_option_tag = document.createElement('option')
                layers_list_option_tag.setAttribute('id', x)
                layers_list_option_tag.textContent = window[x].options.layername
                info_selector.appendChild(layers_list_option_tag)
            }
        }

        info_selector.onchange = function () {
            var info_selector_options = info_selector.options
            get_layer_from_info_select(clicked_layers_list[info_selector_options[info_selector_options.selectedIndex].id], window[info_selector_options[info_selector_options.selectedIndex].id])
        }
        info_selector.dispatchEvent(new Event('change'))
}

function string_includes (full_string, key_string) {
    if (full_string.includes(key_string)) {
        return full_string
    }
}

function set_legend_select() {

    var legend_selector = document.getElementById("legend_selector")
    var legend_container_content = document.getElementById("legend_container_content")

    var all_layer_list = get_active_overlay_layers_list()
    console.log(all_layer_list)

//     {'Parcels': Parcels.options.layername, 'Dobrobut_orenda': Dobrobut_orenda.options.layername, 'IKK': IKK.options.layername, 'Auction_parcels': Auction_parcels.options.layername, 'PSP_Lutovynivske': PSP_Lutovynivske.options.layername}
    legend_selector.innerHTML = ``
    for (x in all_layer_list) {
        var layers_list_option_tag = document.createElement('option')
        layers_list_option_tag.setAttribute('id', all_layer_list[x])
        layers_list_option_tag.textContent = window[all_layer_list[x]].options.layername
        legend_selector.appendChild(layers_list_option_tag)
    }
    legend_selector.onchange = function () {
        var legend_selector_options = legend_selector.options
        var legend_selector_option_id = legend_selector_options[legend_selector_options.selectedIndex].id
        legend_container_content.innerHTML = ``
        switch (legend_selector_option_id) {
            case 'Khorishky':
                var ownership_form_list = ["Комунальна власність", "Приватна власність", "Державна власність", "Не визначено"]
                legend_container_content.innerHTML = `За формою власності:`

                var ownership_colors_table = ``


                for (var i = 0; i < ownership_form_list.length; i++) {
                ownership_colors_table += `<tr>
                <th><canvas id="Parcels_legend_sign_${i}" width="200" height="200" style="width:40px; height:40px; "></canvas></th>
                <th style="text-align: left; text-decoration: none">${ownership_form_list[i]}</th>
                </tr>`

                }

                legend_container_content.innerHTML += `<table>${ownership_colors_table}</table>`
                for (var i = 0; i < ownership_form_list.length; i++) {
                set_canvas_element_fill_color('Parcels_legend_sign_' + i, getColor_Parcels(ownership_form_list[i]), 0.55,  getColor_Parcels(ownership_form_list[i]))
                }
                break;
            case 'Vakulivka':
                var ownership_form_list = ["Комунальна власність", "Приватна власність", "Державна власність", "Не визначено"]
                legend_container_content.innerHTML = `За формою власності:`

                var ownership_colors_table = ``


                for (var i = 0; i < ownership_form_list.length; i++) {
                ownership_colors_table += `<tr>
                <th><canvas id="Parcels_legend_sign_${i}" width="200" height="200" style="width:40px; height:40px; "></canvas></th>
                <th style="text-align: left; text-decoration: none">${ownership_form_list[i]}</th>
                </tr>`

                }

                legend_container_content.innerHTML += `<table>${ownership_colors_table}</table>`
                for (var i = 0; i < ownership_form_list.length; i++) {
                set_canvas_element_fill_color('Parcels_legend_sign_' + i, getColor_Parcels(ownership_form_list[i]), 0.55,  getColor_Parcels(ownership_form_list[i]))
                }
                break;

            case 'Dobrobut_orenda':
                legend_container_content.innerHTML += `<table><tr>
                <th><canvas id="Dobrobut_orenda_legend_sign" width="200" height="200"  style="width:40px; height:40px;" ></canvas></th>
                <th style="text-align: left; text-decoration: none;">Ділянки, що перебувають в оренді ТОВ АФ "Добробут"</th>
                </tr></table>`
                set_canvas_element_stripe('Dobrobut_orenda_legend_sign', Dobrobut_orenda.options.stripeId, Dobrobut_orenda.options.style.color, Dobrobut_orenda.options.style.fillColor, Dobrobut_orenda.options.style.fillOpacity, Dobrobut_orenda.options.stripeColor)

                break;
            case 'IKK':

                legend_container_content.innerHTML = `<table><tr>
                <th><canvas id="IKK_legend_sign" width="200" height="200" style="width:40px; height:40px;"></canvas></th>
                <th style="text-align: left; text-decoration: none;">Межа кадастрового квартала</th>
                </tr></table>`
                set_canvas_element_one_line('IKK_legend_sign', IKK.options.style.color)
                break;
            case 'Auction_parcels':
                legend_container_content.innerHTML += `<table><tr>
                <th><canvas id="Auction_parcels_legend_sign" width="200" height="200" style="width:40px; height:40px;" ></canvas></th>
                <th style="text-align: left; text-decoration: none;">Перспективні ділянки для продажу на аукціоні</th>
                </tr></table>`
                set_canvas_element_stripe('Auction_parcels_legend_sign', Auction_parcels.options.stripeId, Auction_parcels.options.style.color, Auction_parcels.options.style.fillColor, Auction_parcels.options.style.fillOpacity, Auction_parcels.options.stripeColor)
                break;

            case 'PSP_Lutovynivske':
                legend_container_content.innerHTML += `<table><tr>
                <th><canvas id="PSP_Lutovynivske_legend_sign" width="200" height="200" style="width:40px; height:40px;"></canvas></th>
                <th style="text-align: left; text-decoration: none;">Ділянки по справі ПСП "Лутовинівське"</th>
                </tr></table>`
                set_canvas_element_stripe('PSP_Lutovynivske_legend_sign', PSP_Lutovynivske.options.stripeId, PSP_Lutovynivske.options.style.color, PSP_Lutovynivske.options.style.fillColor, PSP_Lutovynivske.options.style.fillOpacity, PSP_Lutovynivske.options.stripeColor)
                break;
            default:
                legend_container_content.innerHTML += `<table><tr>
                <th><canvas id="${legend_selector_option_id}_legend_sign" width="200" height="200" style="width:40px; height:40px;" ></canvas></th>
                <th style="text-align: left; text-decoration: none;">${window[legend_selector_option_id].options.layername}</th>
                </tr></table>`
                set_canvas_element_stripe(legend_selector_option_id + '_legend_sign', window[legend_selector_option_id].options.stripeId, window[legend_selector_option_id].options.style.color, window[legend_selector_option_id].options.style.fillColor, window[legend_selector_option_id].options.style.fillOpacity, window[legend_selector_option_id].options.stripeColor)
                break;



        }
    }
        legend_selector.dispatchEvent(new Event('change'))
}

var show_hide_legend_control_container_button = document.getElementById("show_hide_legend_control_container")
show_hide_legend_control_container_button.addEventListener("click", function () {if (document.getElementById("legend_selector")) {set_legend_select()}})



function display_info(layer) {
    var info_container_content_div = document.getElementById("information_container_content")
    info_container_content_div.innerHTML = ``

    function display_attributes(selected_layer, info_container_div) {
        console.log(selected_layer)
        console.log(selected_layer.toGeoJSON())
        switch (selected_layer.options.id) {
            case 'Vakulivka':
                info_container_div.innerHTML = `
                <table style="font-size:22px">
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Кадастровий номер: </b> ${selected_layer.feature.properties.cadnum}</th>
            <th><i class="fa fa-clone" id="copy_cadnum" aria-hidden="true" style="cursor: pointer; ;" onclick="copy_value('${selected_layer.feature.properties.cadnum}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Тип власності: </b> ${selected_layer.feature.properties.ownership}</th>
            <th><i class="fa fa-clone" id="copy_ownership" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.ownership}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Категорія: </b> ${selected_layer.feature.properties.category}</th>
            <th><i class="fa fa-clone" id="copy_category" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.category}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Цільове призначення: </b> ${selected_layer.feature.properties.purpose}</th>
            <th><i class="fa fa-clone" id="copy_purpose" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.purpose}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Площа: </b> ${selected_layer.feature.properties.area + ' ' + selected_layer.feature.properties.unit_area}</th>
            <th><i class="fa fa-clone" id="copy_area" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.area}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Адреса: </b> ${selected_layer.feature.properties.address}</th>
            <th><i class="fa fa-clone" id="copy_address" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.address}', this.id)"></i></th>
            </tr>

            </table>
            <hr>
            <p><a href=https://e.land.gov.ua/back/cadaster/?cad_num=${selected_layer.feature.properties.cadnum} target="_blank" style="
	background-color: #fff;
	border-bottom: 1px solid #ccc;
	width: 100%;    
    font-size:22px;
	line-height: 1;
	display: block;
	text-align: justify;
	text-decoration: underline;
	color: blue;">Інформація про право власності та речові права (Е-сервіси ДЗК)</a></p>
                `
                break;
            case 'Khorishky':
                info_container_div.innerHTML = `
               <table style="font-size:22px">
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Кадастровий номер: </b> ${selected_layer.feature.properties.cadnum}</th>
            <th><i class="fa fa-clone" id="copy_cadnum" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.cadnum}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Тип власності: </b> ${selected_layer.feature.properties.ownership}</th>
            <th><i class="fa fa-clone" id="copy_ownership" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.ownership}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Категорія: </b> ${selected_layer.feature.properties.category}</th>
            <th><i class="fa fa-clone" id="copy_category" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.category}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Цільове призначення: </b> ${selected_layer.feature.properties.purpose}</th>
            <th><i class="fa fa-clone" id="copy_purpose" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.purpose}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Площа: </b> ${selected_layer.feature.properties.area + ' ' + selected_layer.feature.properties.unit_area}</th>
            <th><i class="fa fa-clone" id="copy_area" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.area}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Адреса: </b> ${selected_layer.feature.properties.address}</th>
            <th><i class="fa fa-clone" id="copy_address" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.address}', this.id)"></i></th>
            </tr>

            </table>
            <hr>
            <p><a href=https://e.land.gov.ua/back/cadaster/?cad_num=${selected_layer.feature.properties.cadnum} target="_blank" style="
	background-color: #fff;
	border-bottom: 1px solid #ccc;
	width: 100%;  
    font-size:22px;
	line-height: 1;
	display: block;
	text-align: justify;
	text-decoration: underline;
	color: blue;">Інформація про право власності та речові права (Е-сервіси ДЗК)</a></p>
                `
                break;
            case 'IKK':
                info_container_div.innerHTML = `
                <table style="font-size:22px">
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>КОАТУУ: </b> ${selected_layer.feature.properties.koatuu}</th>
            <th><i class="fa fa-clone" id="copy_koatuu" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.koatuu}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Кадастрова зона: </b> ${selected_layer.feature.properties.zona}</th>
            <th><i class="fa fa-clone" id="copy_zona" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.zona}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Кадастровий квартал: </b> ${selected_layer.feature.properties.kvart}</th>
            <th><i class="fa fa-clone" id="copy_kvart" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.kvart}', this.id)"></i></th>
            </tr>

            </table>
                `
                break;
            case 'Auction_parcels':
                info_container_div.innerHTML = `
                  <table style="font-size:22px">
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Кадастровий номер: </b> ${selected_layer.feature.properties.cadnum}</th>
            <th><i class="fa fa-clone" id="copy_cadnum" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.cadnum}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Тип власності: </b> ${selected_layer.feature.properties.ownership}</th>
            <th><i class="fa fa-clone" id="copy_ownership" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.ownership}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Категорія: </b> ${selected_layer.feature.properties.category}</th>
            <th><i class="fa fa-clone" id="copy_category" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.category}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Цільове призначення: </b> ${selected_layer.feature.properties.purpose}</th>
            <th><i class="fa fa-clone" id="copy_purpose" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.purpose}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Площа: </b> ${selected_layer.feature.properties.area + ' ' + selected_layer.feature.properties.unit_area}</th>
            <th><i class="fa fa-clone" id="copy_area" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.area}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Угіддя: </b> ${selected_layer.feature.properties.ugiddya}</th>
            <th><i class="fa fa-clone" id="copy_ugiddya" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.ugiddya}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Старостат (сільська/селищна рада): </b> ${selected_layer.feature.properties.silrada}</th>
            <th><i class="fa fa-clone" id="copy_silrada" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.silrada}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Фактичний користувач: </b> ${selected_layer.feature.properties.fact_user}</th>
            <th><i class="fa fa-clone" id="copy_fact_user" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.fact_user}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Примітки: </b> ${selected_layer.feature.properties.notes}</th>
            <th><i class="fa fa-clone" id="copy_notes" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.notes}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Рішення про перелік ділянок на торги: </b> ${selected_layer.feature.properties.Approval_parcel_list}</th>
            <th><i class="fa fa-clone" id="copy_Approval_parcel_list" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.Approval_parcel_list}','copy_Approval_parcel_list')"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Рішення про дозвіл на поділ: </b> ${selected_layer.feature.properties.Approval_permission_division}</th>
            <th><i class="fa fa-clone" id="copy_Approval_permission_division" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.Approval_permission_division}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Рішення про затвердження поділу: </b> ${selected_layer.feature.properties.Approval_approving_division}</th>
            <th><i class="fa fa-clone" id="copy_Approval_approving_division" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.Approval_approving_division}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Рішення про дозвіл на зміну цільового: </b> ${selected_layer.feature.properties.Approval_permission_change_destination}</th>
            <th><i class="fa fa-clone" id="copy_Approval_permission_change_destination" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.Approval_permission_change_destination}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Рішення про затвердження проекту: </b> ${selected_layer.feature.properties.Approval_approving_change_destination}</th>
            <th><i class="fa fa-clone" id="copy_Approval_approving_change_destination" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.Approval_approving_change_destination}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Рішення про проведення торгів: </b> ${selected_layer.feature.properties.Approval_permission_bidding}</th>
            <th><i class="fa fa-clone" id="copy_Approval_permission_bidding" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.Approval_permission_bidding}', this.id)"></i></th>
            </tr>

            </table>
                `
                break;

            case 'PSP_Lutovynivske':
                info_container_div.innerHTML = `
                <table style="font-size:22px">
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Кадастровий номер: </b> ${selected_layer.feature.properties.cadnum}</th>
            <th><i class="fa fa-clone" id="copy_cadnum" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.cadnum}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Тип власності: </b> ${selected_layer.feature.properties.ownership}</th>
            <th><i class="fa fa-clone" id="copy_ownership" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.ownership}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Категорія: </b> ${selected_layer.feature.properties.category}</th>
            <th><i class="fa fa-clone" id="copy_category" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.category}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Цільове призначення: </b> ${selected_layer.feature.properties.purpose}</th>
            <th><i class="fa fa-clone" id="copy_purpose" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.purpose}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Площа: </b> ${selected_layer.feature.properties.area + ' ' + selected_layer.feature.properties.unit_area}</th>
            <th><i class="fa fa-clone" id="copy_area" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.area}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Примітки: </b> ${selected_layer.feature.properties.notes}</th>
            <th><i class="fa fa-clone" id="copy_notes" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.notes}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Значення НГО, грн: </b> ${selected_layer.feature.properties.NGO_value }</th>
            <th><i class="fa fa-clone" id="copy_NGO_value" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.NGO_value}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Дата оцінки земельної ділянки: </b> ${selected_layer.feature.properties.NGO_date }</th>
            <th><i class="fa fa-clone" id="copy_NGO_date" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.NGO_date}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Дата державної реєстрації права (в державному реєстрі прав): </b> ${selected_layer.feature.properties.record_data_right }</th>
            <th><i class="fa fa-clone" id="copy_record_data_right" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.record_data_right}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Номер запису про право (в державному реєстрі прав): </b> ${selected_layer.feature.properties.record_number_right }</th>
            <th><i class="fa fa-clone" id="copy_record_number_right" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.record_number_right}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Належність земельної ділянки до державного акту: </b> ${selected_layer.feature.properties.belonging_state_act }</th>
            <th><i class="fa fa-clone" id="copy_belonging_state_act" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.belonging_state_act}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Походження земельної ділянки: </b> ${selected_layer.feature.properties.origin_parcel }</th>
            <th><i class="fa fa-clone" id="copy_origin_parcel" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.origin_parcel}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>№ земельної ділянки за актом приймання передачі: </b> ${selected_layer.feature.properties.transfer_parcel_DZK }</th>
            <th><i class="fa fa-clone" id="copy_transfer_parcel_DZK" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.transfer_parcel_DZK}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Кадастровий номер похідної земельної ділянки: </b> ${selected_layer.feature.properties.origin_parcel_cadnum }</th>
            <th><i class="fa fa-clone" id="copy_origin_parcel_cadnum" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.origin_parcel_cadnum}', this.id)"></i></th>
            </tr>

            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Площа  похідної земельної ділянки: </b> ${selected_layer.feature.properties.origin_parcel_area }</th>
            <th><i class="fa fa-clone" id="copy_origin_parcel_area" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.origin_parcel_area}', this.id)"></i></th>
            </tr>

            </table>
                `
                break;

//             case string_includes(selected_layer.options.id, 'user_layer'):
//                 if ()
            case 'Unclaimed_plots_layer':
                info_container_div.innerHTML = `
                <table style="font-size:22px">
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b> Прізвище, ім'я, по-батькові  власників земельних часток (паїв), які померли: </b> ${selected_layer.feature.properties.former_owner_name}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.former_owner_name}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.former_owner_name}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>№ зем. Ділянки по карті розпаювання: </b> ${selected_layer.feature.properties.parcel_number}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.parcel_number}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.parcel_number}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Кадастровий номер (за наявності): </b> ${selected_layer.feature.properties.cadnum}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.cadnum}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.cadnum}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Орендар: </b> ${selected_layer.feature.properties.lessee}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.lessee}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.lessee}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>КОД ЄДРПОУ/ІПН орендаря: </b> <a href="https://youcontrol.com.ua/catalog/company_details/${selected_layer.feature.properties.lessee_code}/" target="_blank" style="text-align: justify;
	text-decoration: underline;
	color: blue;">${selected_layer.feature.properties.lessee_code}</a></th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.lessee_code}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.lessee_code}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Договір оренди: </b>${selected_layer.feature.properties.lease_agreement_num}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.lease_agreement_num}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.lease_agreement_num}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Дата укладення договору: </b>${selected_layer.feature.properties.lease_start_date}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.lease_start_date}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.lease_start_date}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Дата закінчення договору оренди: </b>${selected_layer.feature.properties.lease_expiration_date}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.lease_expiration_date}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.lease_expiration_date}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Строк дії: </b>${selected_layer.feature.properties.lease_duration}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.lease_duration}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.lease_duration}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>НГО: </b>${selected_layer.feature.properties.normative_assesment_value}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.normative_assesment_value}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.normative_assesment_value}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Орендна плата: </b>${selected_layer.feature.properties.rent_value}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.rent_value}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.rent_value}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Розмір орендної плати у %: </b>${selected_layer.feature.properties.rent_percent}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.rent_percent}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.rent_percent}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Назва колишнього колгоспу: </b>${selected_layer.feature.properties.collective_farm_name}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.collective_farm_name}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.collective_farm_name}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Старостат (колишня сільська рада): </b>${selected_layer.feature.properties.administrative_unit_name}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.administrative_unit_name}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.administrative_unit_name}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Частка паю (1, 0,5, 0.3 і т.п.): </b>${selected_layer.feature.properties.parcel_fraction}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.parcel_fraction}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.parcel_fraction}', this.id)"></i></th>
            </tr>
            <tr>
            <th style="font-weight:normal; text-align:left"; ><b>Примітка: </b>${selected_layer.feature.properties.notes}</th>
            <th><i class="fa fa-clone" id="copy_${selected_layer.feature.properties.notes}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties.notes}', this.id)"></i></th>
            </tr>
                <table style="font-size:22px">`
                break
            default:
                if (selected_layer.feature.properties) {

                    var table_rows = ''
                    for (x in selected_layer.feature.properties) {
                        console.log(x)
                        console.log(selected_layer.feature.properties)
                        console.log(selected_layer.feature.properties[x])
                        table_rows += `<tr>
                        <th style="font-weight:normal; text-align:left"; ><b>${x}: </b> ${selected_layer.feature.properties[x] }</th>
                        <th><i class="fa fa-clone" id="copy_user_property_${x}" aria-hidden="true" style="cursor: pointer; " onclick="copy_value('${selected_layer.feature.properties[x]}',this.id)"></i></th>
                        </tr>`
                    }
                    if (selected_layer.options.pmIgnore !== undefined) {
                info_container_div.innerHTML = `<table>${table_rows}</table>`
                    }
                    else {info_container_div.innerHTML = `<table>${table_rows}</table><p>ШАР ДЛЯ РЕДАГУВАННЯ</p><button onclick="show_popup_change_properties_value('${selected_layer.options.id}', ${selected_layer._leaflet_id})">РЕДАГУВАТИ АТРИБУТИ</button>
                        <button onclick="delete_object_from_layer('${selected_layer.options.id}', ${selected_layer._leaflet_id})">ВИДАЛИТИ ОБ'ЄКТ</button>`

                    }
                }
        }
        reset_color_last_clicked_layer()
        change_color_clicked_layer(selected_layer, '#03f8fc')
        console.log(selected_layer)
        }
        if (layer.length > 1) {
            var created_layer_select_tag = document.createElement('select')
            var created_layer_info_div_tag = document.createElement('div')
            var text_p_tag = document.createElement('b')
            var text_p1_tag = document.createElement('b')
            created_layer_select_tag.setAttribute('id', "layer_select_tag")
            created_layer_select_tag.setAttribute('style', 'font-size:18px')
            created_layer_info_div_tag.setAttribute('id', "layer_info_div_tag")
            text_p_tag.textContent = "Об`єкт "
            info_container_content_div.appendChild(text_p_tag)
            info_container_content_div.appendChild(created_layer_select_tag)
            text_p1_tag.textContent = " із " + layer.length
            info_container_content_div.appendChild(text_p1_tag)

//             info_container_content_div.innerHTML +=
            info_container_content_div.appendChild(created_layer_info_div_tag)
            for (x in layer) {
                var layer_option_tag = document.createElement('option')
                layer_option_tag.setAttribute('id', x)
                layer_option_tag.textContent = parseInt(x)+1
                created_layer_select_tag.appendChild(layer_option_tag)
            }
            if (document.getElementById("layer_select_tag")) {
                layer_select_tag = document.getElementById("layer_select_tag")

                layer_select_tag.onchange = function () {display_attributes(layer[parseInt(layer_select_tag.value)-1], layer_info_div_tag)}
                layer_select_tag.dispatchEvent(new Event('change'))
                }
            }

        else if (layer.length === 1) {
            display_attributes(layer[0], info_container_content_div)
        }
}

function zoom_on_layer (layer) {
    layer_group = L.featureGroup(layer)
    map.fitBounds(layer_group.getBounds())
}

function get_geojsonlayer_from_point (layer_id, current_point_latlng) {
    console.log(layer_id)
    var layer_list = new Array(0)
    geojson_layer = window[layer_id]
    for (y in geojson_layer._layers) {
        if (geojson_layer._layers[y].feature['geometry']['type']=='Polygon') {
            var layer_polygon = turf.polygon(geojson_layer._layers[y].feature['geometry']['coordinates'])
        }
        else if (geojson_layer._layers[y].feature['geometry']['type']=='MultiPolygon') {
            var layer_polygon = turf.multiPolygon(geojson_layer._layers[y].feature['geometry']['coordinates'])
        }

        if (turf.booleanPointInPolygon(current_point_latlng, layer_polygon)) {
            layer_list.push(geojson_layer._layers[y]._leaflet_id)
        }
    }
    if (layer_list.length !== 0) {
        return layer_list}
    else {return undefined}
}


function get_active_overlay_layers_list () {

    var active_overlay_layers_list = new Array(0)
    console.log(control_layers)
    for (x in control_layers._layers) {
        if (
            (control_layers._layerControlInputs[x].type === "checkbox" && control_layers._layerControlInputs[x].checked === true && !control_layers._layers[x].layer._url)
        )// остання умова для виключення тайловий шарів

        {
            if (control_layers._layers[x].layer.options.id.includes("user_layer")) {
                active_overlay_layers_list.unshift(control_layers._layers[x].layer.options.id)
            }
            else {  active_overlay_layers_list.push(control_layers._layers[x].layer.options.id) }
        }


//         else if   (control_layers._layerControlInputs[x].type === "checkbox" && control_layers._layerControlInputs[x].checked === true && control_layers._layers[x].layer.dataLayerNames)
//Для pbf шарів, вони містять властивість _url, але при тому мають атрибутику
//         {
//             active_overlay_layers_list.push(control_layers._layers[x].layer.options.id)
//         }
    }
    return active_overlay_layers_list

}

function get_all_user_layer_list () {

    var active_user_layers_list = new Array(0)

    for (x in control_layers._layers) {
        if (
            (control_layers._layerControlInputs[x].type === "checkbox" && !control_layers._layers[x].layer._url && control_layers._layers[x].layer.options.id.includes("user_layer", 0))
        )// остання умова для виключення тайловий шарів
        {
            active_user_layers_list.push(control_layers._layers[x].layer.options.id)
        }

    }
    return active_user_layers_list

}

map.addEventListener('click', (event) => {
   
    
    var current_point_latlng = turf.point([lng, lat])
    if (!map.pm.globalDrawModeEnabled() && !map.pm.globalEditModeEnabled() && !map.pm.globalCutModeEnabled() && !map.pm.globalRemovalModeEnabled()  && !map.pm.globalRotateModeEnabled() && !map.pm.globalDragModeEnabled()) {


    sessionStorage['clicked_layers_list'] = ''

    var active_layers_list = get_active_overlay_layers_list()
    console.log(active_layers_list)
    var clicked_layers_list = {}
    for (x in active_layers_list) {
        if ( active_layers_list[x] == 'LayerDrawnByGeoman' ) {
        }
        else {
            clicked_layers_list[active_layers_list[x]] = get_geojsonlayer_from_point(active_layers_list[x], current_point_latlng);
        }

    }

    console.log(clicked_layers_list)
    sessionStorage['clicked_layers_list'] = JSON.stringify(clicked_layers_list)
    if (active_layers_list) {
        show_info_container()
        set_info_select()
        map.fitBounds(map.getBounds())
    }
    if (marker) {
    map.removeLayer(marker);
    }
    var goldIcon = new L.Icon({
        iconUrl: 'images/marker-icon-2x-gold.png',   
        shadowUrl: 'images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    marker = new L.Marker([lat, lng], {icon: goldIcon, renderer: L.canvas({pane: 'Geoman'})}).addTo(map);
    var popup_content = `<table>
            <tr>
            <th style="font-weight:normal; text-align:left"; font-size:22px><b>Широта: </b> ${lat}</th>
            <th><i class="fa fa-clone" id="copy_lat" aria-hidden="true" style="cursor: pointer; font-size:22px" onclick="copy_value('${lat.toFixed(6)}','copy_lat')"></i></th>
            </tr>.
            <tr>
            <th style="font-weight:normal; text-align:left"; font-size:22px><b>Довгота: </b> ${lng}</th>
            <th><i class="fa fa-clone" id="copy_lng" aria-hidden="true" style="cursor: pointer; font-size:22px" onclick="copy_value('${lng.toFixed(6)}','copy_lng')"></i></th>
            </tr>
            </table>
            <p id="copy_lat_lng" style="cursor: pointer;" onclick="copy_value('${lat.toFixed(6) + ', ' + lng.toFixed(6)}','copy_lat_lng')"><b>Копіювати координати</b></p>
            `
    marker.bindPopup(popup_content);

    map.addLayer(marker);

  }
//     else if (getComputedStyle(select_layers_button.parentNode.nextSibling).display === 'block') {
//           if (sessionStorage['selected_layers']) {
//
//                     var layer_id = JSON.parse(sessionStorage['selected_layers']).layer_id
//                     var selected_layers_id = get_geojsonlayer_from_point(layer_id, current_point_latlng);
//
//                     var select_color = '#bfffdf'
//                     var selected_layers_dict = JSON.parse(sessionStorage['selected_layers'])
//                     if (selected_layers_dict.layers_list === undefined) {
//                     selected_layers_dict.layers_list = new Array(0)
//                     }
//
//
//                     if (selected_layers_id !== undefined) {
//                         var select_layer = window[layer_id].getLayer(selected_layers_id[0])
//
//     //                     sessionStorage['last_clicked_layer'] = JSON.stringify(layer_json)
//     //                     console.log(select_layer.options.color)
//                         if (select_layer.options.color !== select_color) {
//                             var layer_json = {};
//                             layer_json['options'] = {};
//                             layer_json['options']['id'] = select_layer['options']['id']
//                             layer_json['options']['color'] = select_layer['options']['color']
//                             if (select_layer['options']['stripeColor']) {
//                                 layer_json['options']['stripeColor'] = select_layer['options']['stripeColor']
//                             }
//                             layer_json['leaflet_id'] = select_layer['_leaflet_id'];
//                             selected_layers_dict.layers_list.push(layer_json)
//
//                             change_color_clicked_layer(select_layer, select_color)
//                         }
//                         else if (select_layer.options.color === select_color) {
//                         for (x in selected_layers_dict.layers_list) {
//                             if (selected_layers_dict.layers_list[x].leaflet_id === selected_layers_id[0]) {
//
//                                 change_color_clicked_layer(select_layer, selected_layers_dict.layers_list[x].options.color)
//                                 selected_layers_dict.layers_list = selected_layers_dict.layers_list.filter(item => item.leaflet_id !== selected_layers_id[0]);
//
//                                 break
//
//                             }
//                         }
//
//
// //                             delete layer_list[selected_layers_id[0]]
//                         }
//                          console.log(selected_layers_dict.layers_list)
//
//                          selected_layers_dict.label = 'Обраний шар: ' + window[layer_id].options.layername + ' | Обрано об\'єктів: ' + selected_layers_dict.layers_list.length
//
//                         sessionStorage['selected_layers'] = JSON.stringify(selected_layers_dict)
// //                         console.log(JSON.parse(sessionStorage['selected_layers']).layers_list)
//
//
//
//                     }
//
//
//             }
//
//     }


})
