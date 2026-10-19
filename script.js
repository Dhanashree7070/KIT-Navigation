const canvas = document.getElementById("viewport");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(87, 27, 31);

// Create renderer using the canvas
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls for mouse movement
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 0.8;

const loader = new THREE.GLTFLoader();
const modelPath = "finalMP1.glb"; // Ensure the file is in the correct directory
let model;

loader.load(modelPath, function (gltf) {
    model = gltf.scene;
    model.scale.set(20, 20, 20);
    model.position.set(0, -300, 0);
    scene.add(model);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function (error) {
    console.error('Error loading GLB model:', error);
});

// Lighting
// Sunlight to match Blender's Sun lamp (intensity = 6)
const sunLight = new THREE.DirectionalLight(0xffffcc, 4);
sunLight.position.set(-1, 1, 0.5).normalize();
scene.add(sunLight);

// Optional: Enable shadows if desired
// sunLight.castShadow = true;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Softer fill light
scene.add(ambientLight);


camera.position.set(100, 100, 100); // Set a better initial camera position

// Function to convert latitude/longitude to 3D position
function latLonTo3D(lat, lon, scaleFactor = 1) {
    const x = lon * scaleFactor;
    const z = -lat * scaleFactor;
    return new THREE.Vector3(x, 5, z); // Adjust height as needed
}




if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            updateUserPosition(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}
render();

// Adjust canvas on window resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Compass rotation
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
        if (model) {
            let compassHeading = event.alpha || 0; // Get compass heading in degrees
            let radians = THREE.MathUtils.degToRad(-compassHeading); // Convert to radians (invert for correct rotation)
            model.rotation.y = radians;
        }
    }, true);
} else {
    console.log("Device orientation not supported");
}
