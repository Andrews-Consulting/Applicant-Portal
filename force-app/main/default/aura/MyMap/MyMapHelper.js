({
	jsLoaded : function(component) {
        var planes = component.get("v.planes");
        console.log(planes);
		setTimeout(function() {
            var map = L.map('map', {zoomControl: false}).setView([planes[0].y, planes[0].x], 14);
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
                {
                    attribution: 'Tiles © Esri'
                }).addTo(map);
    
            // Add marker
            for (var i = 0; i < planes.length; i++) {
                var marker = new L.marker([planes[i].y,planes[i].x],{title: planes[i].label})
                    .bindPopup(planes[i].label)
                    .addTo(map);
            }
		});
    }	

})