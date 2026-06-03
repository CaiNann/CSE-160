import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

const SUN_X = 70, SUN_Y = 20, SUN_Z = 80;

const scene = new THREE.Scene();

const cubeLoader = new THREE.CubeTextureLoader();

const skyboxTextures = cubeLoader.load([
  './public/sky_116_cubemap_2k/px.png', 
  './public/sky_116_cubemap_2k/nx.png', 
  './public/sky_116_cubemap_2k/py.png', 
  './public/sky_116_cubemap_2k/ny.png', 
  './public/sky_116_cubemap_2k/pz.png', 
  './public/sky_116_cubemap_2k/nz.png'
]);


skyboxTextures.colorSpace = THREE.SRGBColorSpace;

scene.background = skyboxTextures;
scene.fog = new THREE.Fog(0xff6633, 40, 120);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 8, 24);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
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

const sun = new THREE.DirectionalLight(0xffcc88, 3.0);
sun.position.set(SUN_X, SUN_Y, SUN_Z);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 200;
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
scene.add(sun);

scene.add(new THREE.AmbientLight(0xffaa66, 0.6));

const sunCanvas = document.createElement('canvas');
sunCanvas.width = 256;
sunCanvas.height = 256;
const sunCtx = sunCanvas.getContext('2d');

const radial = sunCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
radial.addColorStop(0.0,  'rgba(255, 255, 220, 1.0)'); 
radial.addColorStop(0.15, 'rgba(255, 240, 150, 0.95)');
radial.addColorStop(0.35, 'rgba(255, 180, 50,  0.6)');
radial.addColorStop(0.6,  'rgba(255, 100, 0,   0.25)');
radial.addColorStop(0.85, 'rgba(200, 50,  0,   0.08)');
radial.addColorStop(1.0,  'rgba(0,   0,   0,   0.0)');

sunCtx.fillStyle = radial;
sunCtx.fillRect(0, 0, 256, 256);

const sunTexture = new THREE.CanvasTexture(sunCanvas);
const sunSprite = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: sunTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })
);
sunSprite.position.set(SUN_X, SUN_Y, SUN_Z);
sunSprite.scale.set(80, 80, 1);
scene.add(sunSprite);

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

const textureLoader = new THREE.TextureLoader();

const sandColor = textureLoader.load('./public/sandy_gravel_02_diff_1k.jpg');
sandColor.wrapS = THREE.RepeatWrapping;
sandColor.wrapT = THREE.RepeatWrapping;
sandColor.repeat.set(10, 10);
sandColor.rotation = Math.PI / 7;
sandColor.center.set(0.5, 0.5);

const sandNormal = textureLoader.load('./public/sandy_gravel_02_nor_gl_1k.jpg');
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

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(7, 100),
  new THREE.MeshLambertMaterial({ color: 0xa08040 })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01;
road.receiveShadow = true;
scene.add(road);

function makeBuilding(offsetZ, side, width, height, depth, wallColor, roofColor, hasBalcony=false) {
  const xPos = side * (3.5 + depth / 2 + 0.3);
  const facing = side > 0 ? -1 : 1;

  // Main wall
  makeBox(depth, height, width, wallColor, xPos, height / 2, offsetZ);

  // Facade trim (front overhang)
  makeBox(0.3, 0.35, width + 0.3, 0x8B6914, xPos + facing * (depth / 2 + 0.15), height + 0.18, offsetZ);
  makeBox(0.15, height + 0.35, width + 0.3, wallColor, xPos + facing * (depth / 2 + 0.08), (height + 0.35) / 2, offsetZ);

  // Peaked roof
  const roofGeo = new THREE.CylinderGeometry(0, (width + 0.6) * 0.72, 1.6, 4, 1);
  const roofMesh = new THREE.Mesh(roofGeo, new THREE.MeshLambertMaterial({ color: roofColor }));
  roofMesh.position.set(xPos, height + 0.8, offsetZ);
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.castShadow = true;
  scene.add(roofMesh);

  // Door
  makeBox(0.12, 1.7, 0.9, 0x5C3A1E, xPos + facing * (depth / 2 + 0.15), 0.85, offsetZ);

  // Windows
  makeBox(0.1, 0.75, 0.75, 0xaaddff, xPos + facing * (depth / 2 + 0.15), 1.9, offsetZ - width * 0.27);
  makeBox(0.1, 0.75, 0.75, 0xaaddff, xPos + facing * (depth / 2 + 0.15), 1.9, offsetZ + width * 0.27);

  if (hasBalcony) makeBalcony(xPos, height, offsetZ, width, depth, facing);
}

function makeBalcony(xPos, height, offsetZ, width, depth, facing) {
  const bWidth = width * 0.7;
  const bDepth = 1.2;
  const bY = height * 0.55;
  const wallFace = depth / 2; // edge of the building

  // Floor
  makeBox(bDepth, 0.1, bWidth, 0x8B6914, xPos + facing * (wallFace + bDepth / 2), bY, offsetZ);

  // Railing posts
  for (let i = -0.5; i <= 0.5; i += 0.25) {
    makeBox(0.08, 0.5, 0.08, 0x8B6914, xPos + facing * (wallFace + bDepth), bY + 0.25, offsetZ + i * bWidth);
  }

  // Top railing bar
  makeBox(0.08, 0.08, bWidth * 1.05, 0x8B6914, xPos + facing * (wallFace + bDepth), bY + 0.5, offsetZ);

  // Side rails
  makeBox(0.08, 0.5, 0.08, 0x8B6914, xPos + facing * (wallFace + bDepth / 2), bY + 0.25, offsetZ - bWidth / 2);
  makeBox(0.08, 0.5, 0.08, 0x8B6914, xPos + facing * (wallFace + bDepth / 2), bY + 0.25, offsetZ + bWidth / 2);
}

// Left side buildings
makeBuilding( 0,  1, 6, 4.5, 3.5, 0xD4A96A, 0x8B4513, true);
makeBuilding(-8,  1, 4.5, 3.8, 3,   0xC49A5A, 0x704214);
makeBuilding( 8,  1, 4.5, 3.5, 3,   0xBF9560, 0x6B3D10);

// Right side buildings
makeBuilding( 0, -1, 6, 4.5, 3.5, 0xD4A96A, 0x8B4513, true);
makeBuilding(-8, -1, 4.5, 3.8, 3,   0xC49A5A, 0x704214);
makeBuilding( 8, -1, 4.5, 3.5, 3,   0xBF9560, 0x6B3D10);

// Hitching posts
function makeHitchingPost(x, z) {
  makeBox(0.1, 2.4, 0.1, 0x8B6914, x, 0.2, z - 0.55);
  makeBox(0.1, 2.4, 0.1, 0x8B6914, x, 0.2, z + 0.55);
  makeBox(0.1, 0.1, 1.2, 0x8B6914, x, 1.4, z);
}
makeHitchingPost(-4.5,  4);
makeHitchingPost( 4.5,  5.5);
makeHitchingPost(-4.5, -5.5);
makeHitchingPost( 4.5, -4);

// Water tower
function makeWaterTower(x, z) {
  // Legs
  const legPositions = [[-0.6,-0.6],[0.6,-0.6],[-0.6,0.6],[0.6,0.6]];
  for (const [lx, lz] of legPositions) {
    makeBox(0.12, 4, 0.12, 0x8B6914, x + lx, 2, z + lz);
  }
  // Cross braces
  const braceMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });

  const brace1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), braceMat);
  brace1.position.set(x, 1.2, z);
  brace1.rotation.y = Math.PI / 4;
  brace1.castShadow = true;
  scene.add(brace1);

  const brace2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), braceMat);
  brace2.position.set(x, 1.2, z);
  brace2.rotation.y = -Math.PI / 4;
  brace2.castShadow = true;
  scene.add(brace2);
  // Tank
  const tankGeo = new THREE.CylinderGeometry(1.1, 1.1, 1.8, 12);
  const tank = new THREE.Mesh(tankGeo, new THREE.MeshLambertMaterial({ color: 0x8B6914 }));
  tank.position.set(x, 4, z);
  tank.castShadow = true;
  scene.add(tank);
  // Roof cone
  const coneGeo = new THREE.ConeGeometry(1.2, 0.8, 12);
  const cone = new THREE.Mesh(coneGeo, new THREE.MeshLambertMaterial({ color: 0x704214 }));
  cone.position.set(x, 5.3, z);
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
  makeBox(0.25, 1.2, 0.25, 0x4a7c4e, x - 0.6, 2.85, z);
  makeBox(0.6, 0.25, 0.25, 0x4a7c4e, x - 0.3, 2.4, z);
  makeBox(0.25, 1.0, 0.25, 0x4a7c4e, x + 0.55, 2.45, z);
  makeBox(0.55, 0.25, 0.25, 0x4a7c4e, x + 0.28, 2.1, z);
}
makeCactus(-16,  4);
makeCactus( 16, -8);
makeCactus(-18, -10);



const loader = new GLTFLoader();

// Cowboy model by stevedaman on Sketchfab
// https://sketchfab.com/3d-models/western-cowboy-rigged-160bf043b71c458984c81c717b7483c9
function loadCowboy(x, z, rotationY) {
  loader.load('./public/western_cowboy_rigged.glb', (gltf) => {
    const cowboy = gltf.scene;
    cowboy.position.set(x, 0, z);
    cowboy.rotation.y = rotationY;
    cowboy.scale.set(0.3, 0.3, 0.3);

    cowboy.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }

      if (c.isBone) {
        if (c.name.includes('LeftArm') || c.name.includes('LeftUpArm') || c.name.includes('upper_armL')) {
          c.rotation.x = (Math.PI / 2) - 0.5;
        }
        if (c.name.includes('RightArm') || c.name.includes('RightUpArm') || c.name.includes('upper_armR')) {
          c.rotation.x = (Math.PI / 2) - 0.5;
        }
        
        if (c.name.includes('ForeArm') || c.name.includes('forearm')) {
          c.rotation.set(0, 0, 0); 
        }
      }
    });

    scene.add(cowboy);

    const spotlight = new THREE.SpotLight(0xffffff, 15.0, 30, Math.PI / 4, 0.5, 1);
    spotlight.position.set(x, 3, z); 
    spotlight.target = cowboy; 
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.set(1048, 1048);
    scene.add(spotlight);

  }, undefined, (error) => {
    console.error('Error loading cowboy:', error);
  });
}

loadCowboy(0,  10, Math.PI);
loadCowboy(0, -10, 0);

const particleCount = 600; 
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = []; 

for (let i = 0; i < particleCount; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 50; 
  positions[i * 3 + 1] = Math.random() * 6;          
  positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  
  velocities.push({
    x: (Math.random() - 0.5) * 0.02,          
    y: (Math.random() - 0.5) * 0.005,         
    z: 0.15 + Math.random() * 0.1        
  });
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: 0xd2a679,      
  size: 0.12,           
  transparent: true,
  opacity: 0.4,         
  blending: THREE.AdditiveBlending 
});

const sandstorm = new THREE.Points(particleGeometry, particleMaterial);
scene.add(sandstorm);

let t = 0;

function animate() {
  requestAnimationFrame(animate);
  
  t += 0.01;

  const positionsAttr = sandstorm.geometry.attributes.position;
  
  for (let i = 0; i < particleCount; i++) {
    let x = positionsAttr.getX(i);
    let y = positionsAttr.getY(i);
    let z = positionsAttr.getZ(i);
    const vel = velocities[i];

    x += vel.x + Math.sin(t * 2 + i) * 0.008; 
    y += vel.y;
    z += vel.z; 

    if (z > 50) {
      z = -50;
      x = (Math.random() - 0.5) * 50; 
      y = Math.random() * 6;
    }

    positionsAttr.setXYZ(i, x, y, z);
  }
  
  positionsAttr.needsUpdate = true;

  tumbleweeds[0].position.x = -2.5 + Math.sin(t * 0.4) * 1.5;
  tumbleweeds[0].position.z =  3   + (t * 0.3) % 20 - 10;
  tumbleweeds[0].rotation.x = t * 2;
  tumbleweeds[0].rotation.z = t;

  tumbleweeds[1].position.x =  2.1 - Math.sin(t * 0.3) * 1.2;
  tumbleweeds[1].position.z = -2   - (t * 0.2) % 20 - 5;
  tumbleweeds[1].rotation.x = -t * 1.5;
  tumbleweeds[1].rotation.z = -t * 0.8;

  controls.update();
  renderer.render(scene, camera);
}

animate();