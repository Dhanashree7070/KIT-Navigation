const toggelButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')

function toggleSidebar(){
    sidebar.classList.toggle('close')
    toggelButton.classList.toggle('rotate')

    Array.from(sidebar.getElementsByClassName('show')).forEach(ul =>{
        ul.classList.remove('show')
        ul.previousSibling.classList.remove('rotate')
    })
}
function toggleSubMenu(button){
    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('rotate')

    if(sidebar.classList.contains('close')){
        sidebar.classList.toggle('close')
        toggelButton.classList.toggle('rotate')
    }
}
const locations = [
    { name: "Main Building", coords: [16.65410, 74.26223] },
    { name: "Office", coords: [16.65404, 74.26211] },
    { name: "E&Tc Building", coords: [16.65372, 74.26250] },
    { name: "South Enclave", coords: [16.65382, 74.26203] },
    { name: "North Enclave", coords: [16.65424, 74.26177] },
    { name: "Civil Department", coords: [16.65452, 74.26218] },
    { name: "Biotech Department", coords: [16.65458, 74.26092] },
    { name: "Library", coords: [16.65485, 74.26144] },
    { name: "Parking", coords: [16.653563, 74.261120] },
    { name: "Biotech Canteen", coords: [16.65401, 74.26088] },
    { name: "Mechanical Department", coords: [16.65272, 74.26168] },
    { name: "CSE AIML-DS Department", coords: [16.65328, 74.26249] },
    { name: "KIT College Canteen", coords: [16.65326, 74.26246] },
    { name: "CSBS Department", coords: [16.653206280630226, 74.26257815723473] },
    { name: "Electrical Department", coords: [16.65396, 74.26237] },
    { name: "Garden", coords: [16.65450, 74.26169] },
    { name: "Play Ground", coords: [16.65456, 74.26277] },
    { name: "Main Entry Gate", coords: [16.654209247870394, 74.26683145446124] },
    { name: "College Boys Hostel", coords: [16.65550569457246, 74.26339268589457] },
    { "name": "Workshop", "coords": [16.65335, 74.26212] },
    { "name": "IMER Building", "coords": [16.6535431015462, 74.26325862426629] },
    { "name": "YD vihir", "coords": [16.653903677493027, 74.2632672501516] }

  ];

  const map = L.map('map').setView([16.65410, 74.26223], 18);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);
  const markers = [];

  // Add markers to map
  locations.forEach(loc => {
    const marker = L.marker(loc.coords).addTo(map).bindPopup(loc.name);
    loc.marker = marker;
    markers.push(marker);
  });

  
let currentMarker = null;

function showLocation(locationName) {
    const location = locations.find(loc => loc.name === locationName);

    if (location) {
        map.setView(location.coords, 19);

        // Remove old marker if exists
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Add new marker
        currentMarker = L.marker(location.coords).addTo(map)
            .bindPopup(`<b>${location.name}</b>`)
            .openPopup();
    } else {
        alert("Location not found: " + locationName);
    }
}
const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase();
      locations.forEach(loc => {
        const isMatch = loc.name.toLowerCase().includes(query);
        loc.marker.setOpacity(isMatch ? 1 : 0.2);
        
      });
    });

    document.getElementById("searchInput").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const input = this.value.trim();
            if (locations.includes(input)) {
                showLocation(input);
            }
        }
    });
    
    async function getShortestPath(source, target) {
      const response = await fetch("http://localhost:5000/shortest-path", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source, target })
      });
  
      const data = await response.json();
  
      if (data.error) {
          alert("Error: " + data.error);
          return;
      }
  
      // Draw the path on map
      const latlngs = data.coordinates;
      L.polyline(latlngs, { color: 'blue', weight: 4 }).addTo(map);
  
      // Zoom to the path
      map.fitBounds(latlngs);
  }
  let userLocation = null;

// Get user's real-time location
navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    userLocation = [lat, lon];
    
    // Show user's marker
    L.marker(userLocation, {
        title: "You are here",
        icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            iconSize: [30, 30]
        })
    }).addTo(map);
});



let routeLine; // Global polyline reference

async function showRoute(start, end) {
    const res = await fetch('http://127.0.0.1:5000/shortest-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: start, end: end })
    });

    const data = await res.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    if (window.routeLine) map.removeLayer(window.routeLine);
    window.routeLine = L.polyline(data.coordinates, { color: 'red' }).addTo(map);
    map.fitBounds(window.routeLine.getBounds());
    let steps = data.path.map((place, index) => {
        return `${index + 1}. ${place}`;
    }).join("\n");
    
    alert(`🧭 Route to Destination:\n\n${steps}\n\n🚶 Total Distance: ${Math.round(data.distance)} meters`);
    
}






