import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 40, 100);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 8, 24);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 5;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI / 2.1;
controls.update();

// Lighting
const sun = new THREE.DirectionalLight(0xfff5cc, 1.6);
sun.position.set(20, 40, 15);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 120;
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40;
sun.shadow.camera.bottom = -40;
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffe0a0, 0.5));

// Helper: simple box mesh
function makeBox(w, h, d, color, x, y, z, castShadow = true) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// Ground
const textureLoader = new THREE.TextureLoader();

const sandColor = textureLoader.load('../public/sandy_gravel_02_diff_1k.jpg');
sandColor.wrapS = THREE.RepeatWrapping;
sandColor.wrapT = THREE.RepeatWrapping;
sandColor.repeat.set(10, 10);
sandColor.rotation = Math.PI / 7;
sandColor.center.set(0.5, 0.5);

const sandNormal = textureLoader.load('../public/sandy_gravel_02_nor_gl_1k.jpg');
sandNormal.wrapS = THREE.RepeatWrapping;
sandNormal.wrapT = THREE.RepeatWrapping;
sandNormal.repeat.set(10, 10);
sandNormal.rotation = Math.PI / 7;
sandNormal.center.set(0.5, 0.5);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ map: sandColor, normalMap: sandNormal })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Dirt road
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(7, 100),
  new THREE.MeshLambertMaterial({ color: 0xa08040 })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01;
road.receiveShadow = true;
scene.add(road);

// Building factory
function makeBuilding(offsetZ, side, width, height, depth, wallColor, roofColor) {
  const xPos = side * (3.5 + width / 2 + 0.3);

  // Main wall
  makeBox(width, height, depth, wallColor, xPos, height / 2, offsetZ);

  // Facade trim (front overhang)
  makeBox(width + 0.3, 0.35, 0.3, 0x8B6914, xPos, height + 0.18, offsetZ + depth / 2 + 0.15);
  makeBox(width + 0.3, height + 0.35, 0.15, wallColor, xPos, (height + 0.35) / 2, offsetZ + depth / 2 + 0.08);

  // Peaked roof
  const roofGeo = new THREE.CylinderGeometry(0, (width + 0.6) * 0.72, 1.6, 4, 1);
  const roofMesh = new THREE.Mesh(roofGeo, new THREE.MeshLambertMaterial({ color: roofColor }));
  roofMesh.position.set(xPos, height + 0.8, offsetZ);
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.castShadow = true;
  scene.add(roofMesh);

  // Door
  makeBox(0.9, 1.7, 0.12, 0x5C3A1E, xPos, 0.85, offsetZ + depth / 2 + 0.06);

  // Windows
  makeBox(0.75, 0.75, 0.1, 0xaaddff, xPos - width * 0.27, 1.9, offsetZ + depth / 2 + 0.06);
  makeBox(0.75, 0.75, 0.1, 0xaaddff, xPos + width * 0.27, 1.9, offsetZ + depth / 2 + 0.06);
}

// Left side buildings
makeBuilding( 0,  1, 6, 4.5, 3.5, 0xD4A96A, 0x8B4513); // saloon
makeBuilding(-8,  1, 4.5, 3.8, 3,   0xC49A5A, 0x704214); // bank
makeBuilding( 8,  1, 4.5, 3.5, 3,   0xBF9560, 0x6B3D10); // general store

// Right side buildings
makeBuilding( 0, -1, 6, 4.5, 3.5, 0xD4A96A, 0x8B4513); // sheriff
makeBuilding(-8, -1, 4.5, 3.8, 3,   0xC49A5A, 0x704214); // stable
makeBuilding( 8, -1, 4.5, 3.5, 3,   0xBF9560, 0x6B3D10); // hotel

// Hitching posts
function makeHitchingPost(x, z) {
  makeBox(0.1, 2.4, 0.1, 0x8B6914, x - 0.55, 1.2, z);
  makeBox(0.1, 2.4, 0.1, 0x8B6914, x + 0.55, 1.2, z);
  makeBox(1.2, 0.1, 0.1, 0x8B6914, x, 2.4, z);
}
makeHitchingPost(-1.8,  5.5);
makeHitchingPost( 1.8,  5.5);
makeHitchingPost(-1.8, -5.5);
makeHitchingPost( 1.8, -5.5);

// Water tower
function makeWaterTower(x, z) {
  // Legs
  const legPositions = [[-0.6,-0.6],[0.6,-0.6],[-0.6,0.6],[0.6,0.6]];
  for (const [lx, lz] of legPositions) {
    makeBox(0.12, 4, 0.12, 0x8B6914, x + lx, 2, z + lz);
  }
  // Cross braces
  makeBox(1.4, 0.1, 0.1, 0x8B6914, x, 1.2, z);
  makeBox(0.1, 0.1, 1.4, 0x8B6914, x, 1.2, z);
  // Tank
  const tankGeo = new THREE.CylinderGeometry(1.1, 1.1, 1.8, 12);
  const tank = new THREE.Mesh(tankGeo, new THREE.MeshLambertMaterial({ color: 0x8B6914 }));
  tank.position.set(x, 5, z);
  tank.castShadow = true;
  scene.add(tank);
  // Roof cone
  const coneGeo = new THREE.ConeGeometry(1.2, 0.8, 12);
  const cone = new THREE.Mesh(coneGeo, new THREE.MeshLambertMaterial({ color: 0x704214 }));
  cone.position.set(x, 6.3, z);
  cone.castShadow = true;
  scene.add(cone);
}
makeWaterTower(14, -6);

// Tumbleweed
function makeTumbleweed(x, y, z, r) {
  const geo = new THREE.SphereGeometry(r, 6, 4);
  const mat = new THREE.MeshLambertMaterial({ color: 0xb8a060, wireframe: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}
const tumbleweeds = [
  makeTumbleweed(-2.5, 0.35, 3, 0.35),
  makeTumbleweed( 2.1, 0.28, -2, 0.28),
];

// Rocks
function makeRock(x, z, s) {
  const geo = new THREE.SphereGeometry(s, 5, 4);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x999080 }));
  mesh.position.set(x, s * 0.5, z);
  mesh.rotation.y = Math.random() * Math.PI;
  mesh.scale.y = 0.65;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}
makeRock(-14, 8, 0.5); makeRock(12, 10, 0.35); makeRock(-10, -12, 0.6);
makeRock(15, -5, 0.4);  makeRock(-16, -3, 0.3); makeRock(13, 3, 0.45);

// Cactus
function makeCactus(x, z) {
  makeBox(0.3, 2.5, 0.3, 0x4a7c4e, x, 1.25, z);
  makeBox(0.25, 1.2, 0.25, 0x4a7c4e, x - 0.6, 1.8, z);
  makeBox(0.6, 0.25, 0.25, 0x4a7c4e, x - 0.3, 2.4, z);
  makeBox(0.25, 1.0, 0.25, 0x4a7c4e, x + 0.55, 1.6, z);
  makeBox(0.55, 0.25, 0.25, 0x4a7c4e, x + 0.28, 2.1, z);
}
makeCactus(-16,  4);
makeCactus( 16, -8);
makeCactus(-18, -10);

// Animate tumbleweed rolling
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.01;

  tumbleweeds[0].position.x = -2.5 + Math.sin(t * 0.4) * 1.5;
  tumbleweeds[0].position.z =  3   + t * 0.3 % 20 - 10;
  tumbleweeds[0].rotation.x = t * 2;
  tumbleweeds[0].rotation.z = t;

  tumbleweeds[1].position.x =  2.1 - Math.sin(t * 0.3) * 1.2;
  tumbleweeds[1].position.z = -2   - t * 0.2 % 20 - 5;
  tumbleweeds[1].rotation.x = -t * 1.5;
  tumbleweeds[1].rotation.z = -t * 0.8;

  controls.update();
  renderer.render(scene, camera);
}
animate();