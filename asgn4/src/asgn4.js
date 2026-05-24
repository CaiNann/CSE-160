import { Cube } from './Cube.js';
import { Camera } from './Camera.js';
import { GameMap } from './GameMap.js';
import { Sphere } from './Sphere.js';
import { Model } from './Model.js';

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  varying vec3 v_TexCoord;
  attribute vec3 a_Normal;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_ViewMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_TexCoord = (u_ModelMatrix * a_Position).xyz;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_TexCoord;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform int u_lightType;
  varying vec4 v_VertPos;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform samplerCube u_SamplerCube;
  uniform int u_whichTexture;
  uniform vec3 u_spotDirection;
  uniform vec3 u_lightColor;
  uniform float u_spotCutoff;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = textureCube(u_SamplerCube, v_TexCoord);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    //if (r < 1.0){
    //  gl_FragColor = vec4(1, 0, 0, 1);
    //} else if (r < 2.0) {
    //  gl_FragColor = vec4(0, 1, 0, 1);
    //}

    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r), 1);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    vec3 R = reflect(-L,N);
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    float specular = pow(max(dot(E,R), 0.0), 10.0);

    vec3 diffuse = vec3(gl_FragColor) * u_lightColor * nDotL * 0.7;
    vec3 specular_col = u_lightColor * specular;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    if (u_lightType == 1) {
      // normal phong
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    } else if (u_lightType == 2) {
      // spotlight
      float spotEffect = dot(-L, normalize(u_spotDirection));
      //gl_FragColor = vec4(spotEffect, spotEffect, spotEffect, 1.0);
      if (spotEffect > u_spotCutoff) {
        float intensity = (spotEffect - u_spotCutoff) / (1.0 - u_spotCutoff);
        intensity = intensity * 2.0;
        if (u_whichTexture == 0) {
          gl_FragColor = vec4(specular * intensity + diffuse * intensity + ambient, 1.0);
        } else {
          gl_FragColor = vec4(diffuse * intensity + ambient, 1.0);
        }
      } else {
        gl_FragColor = vec4(vec3(gl_FragColor) * 0.3, 1.0);
      }
    }
  }`

window.g_animating = true;
window.g_selectedXAngle = 0;
window.g_selectedYAngle = 0;
window.g_selectedZAngle = 0;
window.g_leftArmAngle = 0;
window.g_leftHandAngle = 0;
window.g_leftShoulderAngle = 0;
window.g_rightArmAngle = 0;
window.g_rightHandAngle = 0;
window.g_rightShoulderAngle = 0;
window.canvas = null;
window.gl = null;
window.a_Position = null;
window.u_FragColor = null;
window.u_ModelMatrix = null;
window.u_GlobalRotateMatrix = null;
window.u_ProjectionMatrix = null;
window.u_NormalMatrix = null;
window.u_ViewMatrix = null;
window.a_UV = null;
window.a_Normal = null;
window.u_Sampler0 = null;
window.u_Sampler1 = null;
window.u_SamplerCube = null;
window.u_whichTexture = null;
window.g_floorTexture = null;
window.g_cubemapTexture = null;
window.g_wallTexture = null;
window.g_skybox = new Cube();
window.g_floor = new Cube();
window.moveSpeed = 0.03;
window.g_camera = new Camera();
window.g_map = new GameMap();
window.g_keys = {};
window.g_eucalyptusCount = 0;
window.g_normalOn = false;
window.g_lightPos = [0, 1, -2];
window.u_lightPos = null;
window.u_cameraPos = null;
window.u_lightType = null;
window.g_lightType = 1;
window.g_lightOn = true;
window.u_spotDirection = null;
window.u_spotCutoff = null;
window.u_lightColor = null;
window.g_lightColor = [1.0, 1.0, 1.0];
window.g_model = null;

function initTextures() {

  gl.uniform1i(u_Sampler0, 0);
  gl.uniform1i(u_SamplerCube, 2);
  gl.uniform1i(u_Sampler1, 1);

  var wallTex = new Image();
  if (!wallTex) {
    console.log("Faield to create the wall image object");
    return false;
  }

  var floorTex = new Image(); // Create an image object
  if (!floorTex) {
    console.log("Faield to create the floor image object");
    return false;
  }

  // Register the event handler to be called on loading an image
  floorTex.onload = function(){ sendImageToTEXTURE0(floorTex); };
  wallTex.onload = function(){ sendImageToTEXTURE1(wallTex); };
  // Tell the browser to load an image
  floorTex.src = 'texture.png';
  wallTex.src = 'wall.jpg';

  sendCubemapToTEXTURE2([
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, src: 'px.png' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, src: 'nx.png' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, src: 'py.png' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, src: 'ny.png' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, src: 'pz.png' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, src: 'nz.png' },
  ]);

  return true;
}

function sendCubemapToTEXTURE2(faces) {
  g_cubemapTexture = gl.createTexture();
  if (!g_cubemapTexture) {
    console.log("Failed to create cubemap texture object");
    return false;
  }

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, g_cubemapTexture);

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let loaded = 0;
  faces.forEach(function(face) {
    var img = new Image();
    img.onload = function() {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, g_cubemapTexture);
      gl.texImage2D(face.target, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      loaded++;
      if (loaded === 6) {
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        console.log("Finished sendCubemapToTEXTURE2");
      }
    };
    img.src = face.src;
  });
}

function sendImageToTEXTURE0(image) {
  g_floorTexture = gl.createTexture(); // Create a texture object
  if (!g_floorTexture) {
    console.log("Faield to create the floor texter object");
    return false;
  }


  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable the texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, g_floorTexture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  console.log("Finished sendImageToTEXTURE0");
} 

function sendImageToTEXTURE1(image) {
  g_wallTexture = gl.createTexture(); // Create a texture object
  if (!g_wallTexture) {
    console.log("Faield to create the wall texter object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable the texture unit 0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, g_wallTexture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  console.log("Finished sendImageToTEXTURE1");
} 

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
  
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, "u_lightColor");
  if (!u_lightColor) {
    console.log("Failed to get the storage location of u_lightColor");
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
  if (!u_lightPos) {
    console.log("Failed to get the storage location of u_lightPos");
    return;
  }

  u_spotCutoff = gl.getUniformLocation(gl.program, "u_spotCutoff");
  if (!u_spotCutoff) {
    console.log("Failed to get the storage location of u_spotCutoff");
    return;
  }

  u_spotDirection = gl.getUniformLocation(gl.program, "u_spotDirection");
  if (!u_spotDirection) {
    console.log("Failed to get the storage location of u_spotDirection");
    return;
  }
  
  u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
  if (!u_cameraPos) {
    console.log("Failed to get the storage location of u_cameraPos");
    return;
  }

  u_lightType = gl.getUniformLocation(gl.program, "u_lightType");
  if (!u_lightType) {
    console.log("Failed to get the storage location of u_lightType");
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  if (!u_NormalMatrix) {
    console.log("Failed to get the storage location of u_NormalMatrix");
    return;
  }
  
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix");
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }  

  // Get the storage location of the u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log("Faield to get the storage location of u_Sampler0");
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log("Faield to get the storage location of u_Sampler1");
    return;
  }

  u_SamplerCube = gl.getUniformLocation(gl.program, 'u_SamplerCube');
  if (u_SamplerCube === null) {
    console.log("Failed to get the storage location of u_SamplerCube");
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log("Failed to get the storage location of u_whichTexture");
    return;
  }
  
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  
}

function addActionsForHtmlUI() {

  document.getElementById('normalOn').onclick = function() {g_normalOn=true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn=false;};

  document.getElementById('phong').onclick = function() {g_lightType=1;};
  document.getElementById('spotlight').onclick = function() {g_lightType=2;};
  document.getElementById('off').onclick = function() {g_lightType=0;};

  document.getElementById('lightX').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();} });
  document.getElementById('lightY').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();} });
  document.getElementById('lightZ').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();} });

  document.getElementById('lightR').addEventListener('input', e => g_lightColor[0] = e.target.value / 255);
  document.getElementById('lightG').addEventListener('input', e => g_lightColor[1] = e.target.value / 255);
  document.getElementById('lightB').addEventListener('input', e => g_lightColor[2] = e.target.value / 255);

  // Add listener for key and mouse movements
  document.onkeydown = function(ev) { g_keys[ev.key] = true; };
  document.onkeyup = function(ev) { g_keys[ev.key] = false; };
  canvas.addEventListener('click', function() {
    canvas.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      // mouse is captured, enable look
      document.addEventListener('mousemove', onMouseMove);
    } else {
      // mouse is released, disable look
      document.removeEventListener('mousemove', onMouseMove);
    }
  });

  function onMouseMove(e) {
    g_camera.mouseControl(e);
  }

  canvas.addEventListener('mousedown', function(e) {
    if (e.button === 0) {
      g_map.deleteBlock(g_camera);
    }
    if (e.button === 2) {
      g_map.placeBlock(g_camera);
    }
  });
}

// FPS tracking variables
let g_fpsLastTime = performance.now();
let g_fpsFrameCount = 0;
let g_fps = 0;

function updateFPS() {
  g_fpsFrameCount++;
  const now = performance.now();
  const elapsed = now - g_fpsLastTime;

  if (elapsed >= 500) {
    g_fps = (g_fpsFrameCount / elapsed) * 1000;
    document.getElementById("fps").textContent = `FPS: ${g_fps.toFixed(1)}`;
    g_fpsFrameCount = 0;
    g_fpsLastTime = now;
  }
}

async function main() {
  //Set up canvas and webGL variables
  setupWebGL();
  //Setup GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  g_model = new Model();
  g_model.color = [0.6, 0.6, 0.8, 1.0];
  await g_model.loadOBJ('bunny.obj');

  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  if (g_keys['w']) g_camera.moveForward(g_map);
  if (g_keys['s']) g_camera.moveBack(g_map);
  if (g_keys['a']) g_camera.moveLeft(g_map);
  if (g_keys['d']) g_camera.moveRight(g_map);
  if (g_keys['q']) g_camera.lookLeft();
  if (g_keys['e']) g_camera.lookRight();
  if (g_keys['f']) g_map.collectEucalyptus(g_camera);
  g_map.checkWin(g_camera);
  g_lightPos[0] = Math.cos(g_seconds);
  renderAllShapes();
  requestAnimationFrame(tick);
}

window.toggleAnimation = function() {
  g_animating = !g_animating;
  document.getElementById("animToggle").textContent = g_animating ? "Stop" : "Start";
  if (g_animating) tick();
}

export function renderAllShapes() {
  updateFPS();

  var projMat = new Matrix4();
  projMat.setPerspective(90, canvas.width/canvas.height, 0.1, 100)
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye[0], g_camera.eye[1], g_camera.eye[2],
    g_camera.at[0], g_camera.at[1], g_camera.at[2], 
    g_camera.up[0], g_camera.up[1], g_camera.up[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Apply camera rotation
  let globalRotate = new Matrix4();
  globalRotate.setRotate(0, 1, 0, 0);
  globalRotate.rotate(0, 0, 1, 0);
  globalRotate.rotate(0, 0, 0, 1);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotate.elements);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var grayColor = [0.59, 0.57, 0.54, 1.0];
  var whiteColor = [0.92, 0.88, 0.85, 1.0];
  var blackColor = [0.17, 0.13, 0.11, 1.0];

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, g_floorTexture);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, g_wallTexture);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, g_cubemapTexture);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye[0], g_camera.eye[1], g_camera.eye[2]);
  gl.uniform1i(u_lightType, g_lightType);
  gl.uniform3f(u_spotDirection, 0.0, -1.0, 0.0); // pointing straight down
  gl.uniform1f(u_spotCutoff, Math.cos(20 * Math.PI / 180)); // 20 degree cone
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);

  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1, -.1, -.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  g_map.draw();
  g_map.drawEucalyptus();

  gl.depthMask(false);
  g_skybox.textureNum = 1;
  g_skybox.matrix.setTranslate(g_camera.eye[0] - 25, g_camera.eye[1] - 25, g_camera.eye[2] - 25);
  g_skybox.matrix.scale(50, 50, 50);
  g_skybox.render();
  gl.depthMask(true);

  g_floor.textureNum = 0;
  if (g_normalOn) g_floor.textureNum = -3;
  g_floor.matrix.setTranslate(0, -0.75, 0.0);
  g_floor.matrix.scale(32, 0.01, 32);
  g_floor.matrix.translate(-0.5, 0, -0.5);
  g_floor.render();

  if (g_model) {
    g_model.color = [0.6, 0.6, 0.8, 1.0];
    g_model.textureNum = -2;
    if (g_normalOn) g_model.textureNum = -3;
    g_model.matrix = new Matrix4();
    g_model.matrix.setTranslate(0, -0.75, -0.5);
    g_model.matrix.scale(0.2, 0.2, 0.2);
    g_model.render();
}

  var ball = new Sphere();
  ball.textureNum = -2;
  if (g_normalOn) ball.textureNum = -3;
  ball.matrix.translate(0, 1.5, 0);
  ball.matrix.scale(0.6, 0.6, 0.6);
  ball.render();

  var body = new Cube();
  body.color = grayColor;
  body.textureNum = -2;
  if (g_normalOn) body.textureNum = -3;
  body.matrix.translate(-0.2, -0.3, 0.0);
  var bodyMatrix = new Matrix4(body.matrix);
  body.matrix.scale(0.5, 0.5, 0.3);
  body.render();
  var belly = new Cube();
  belly.color = whiteColor;
  belly.textureNum = -2;
  if (g_normalOn) belly.textureNum = -3;
  belly.matrix = new Matrix4(bodyMatrix);
  belly.matrix.translate(0.1, 0.001, -0.001);
  belly.matrix.scale(0.3, 0.5, 0.3);
  belly.render();

  var head = new Cube();
  head.color = grayColor;
  if (g_normalOn) head.textureNum = -3;
  head.matrix = new Matrix4(bodyMatrix);
  head.matrix.translate(0.1, 0.5, 0.05);
  var headMatrix = new Matrix4(head.matrix);
  head.matrix.scale(0.3, 0.3, 0.2);
  head.render();

  var nose = new Cube();
  nose.color = blackColor;
  if (g_normalOn) nose.textureNum = -3;
  nose.matrix = new Matrix4(headMatrix);
  nose.matrix.translate(0.13, 0.07, -0.01);
  var noseMatrix = new Matrix4(nose.matrix);
  nose.matrix.scale(0.05, 0.12, 0.02)
  nose.render();
  var bottomNose = new Cube();
  bottomNose.color = whiteColor;
  if (g_normalOn) bottomNose.textureNum = -3;
  bottomNose.matrix = new Matrix4(noseMatrix);
  bottomNose.matrix.translate(0.001, -0.03, 0.001);
  bottomNose.matrix.scale(0.045, 0.05, 0.02);
  bottomNose.render();

  var rightEye = new Cube();
  rightEye.color = blackColor;
  if (g_normalOn) rightEye.textureNum = -3;
  rightEye.matrix = new Matrix4(headMatrix);
  rightEye.matrix.translate(0.21, 0.15, -0.001);
  rightEye.matrix.scale(0.05, 0.04, 0.001);
  rightEye.render();

  var leftEye = new Cube();
  leftEye.color = blackColor;
  if (g_normalOn) leftEye.textureNum = -3;
  leftEye.matrix = new Matrix4(headMatrix);
  leftEye.matrix.translate(0.05, 0.15, -0.001);
  leftEye.matrix.scale(0.05, 0.04, 0.001);
  leftEye.render();

  var rightEar = new Cube();
  rightEar.color = grayColor;
  if (g_normalOn) rightEar.textureNum = -3;
  rightEar.matrix = new Matrix4(headMatrix);
  rightEar.matrix.translate(0.21, 0.23, 0.05);
  rightEar.matrix.rotate(-10, 0, 0, 1);
  var rightEarMatrix = new Matrix4(rightEar.matrix);
  rightEar.matrix.scale(0.15, 0.19, 0.1);
  rightEar.render();
  var innerRightEar = new Cube();
  innerRightEar.color = whiteColor;
  if (g_normalOn) innerRightEar.textureNum = -3;
  innerRightEar.matrix = new Matrix4(rightEarMatrix);
  innerRightEar.matrix.translate(0.04, 0.04, -0.01);
  innerRightEar.matrix.scale(0.09, 0.12, 0.08);
  innerRightEar.render();

  var leftEar = new Cube();
  leftEar.color = grayColor;
  if (g_normalOn) leftEar.textureNum = -3;
  leftEar.matrix = new Matrix4(headMatrix);
  leftEar.matrix.translate(-0.07, 0.21, 0.05);
  leftEar.matrix.rotate(10, 0, 0, 1);
  var leftEarMatrix = new Matrix4(leftEar.matrix);
  leftEar.matrix.scale(0.15, 0.19, 0.1);
  leftEar.render();
  var innerLeftEar = new Cube();
  innerLeftEar.color = whiteColor;
  if (g_normalOn) innerLeftEar.textureNum = -3;
  innerLeftEar.matrix = new Matrix4(leftEarMatrix);
  innerLeftEar.matrix.translate(0.02, 0.04, -0.01);
  innerLeftEar.matrix.scale(0.09, 0.12, 0.08);
  innerLeftEar.render();

  var rightShoulderMatrix = new Matrix4(bodyMatrix);
  rightShoulderMatrix.translate(0.45, 0.35, 0.1);
  if (g_animating) {
    rightShoulderMatrix.rotate(-5 + 25* Math.sin(g_seconds), 0, 1, 0);
  } else {
    rightShoulderMatrix.rotate(g_rightShoulderAngle, 0, 1, 0);
  }
  var rightShoulder = new Cube();
  rightShoulder.color = grayColor;
  if (g_normalOn) rightShoulder.textureNum = -3;
  rightShoulder.matrix = new Matrix4(rightShoulderMatrix);
  rightShoulder.matrix.translate(0, -0.08, -0.05);
  rightShoulder.matrix.scale(0.21, 0.2, 0.2);
  rightShoulder.render();
  var rightArmMatrix = new Matrix4(rightShoulderMatrix);
  rightArmMatrix.translate(0.18, 0.01, 0.04);
  rightArmMatrix.rotate(g_rightArmAngle, 0, -1, 0);
  var rightArm = new Cube();
  rightArm.color = grayColor;
  if (g_normalOn) rightArm.textureNum = -3;
  rightArm.matrix = new Matrix4(rightArmMatrix);
  rightArm.matrix.translate(-0.06, -0.06, -0.04);
  rightArm.matrix.scale(0.3, 0.15, 0.08);
  rightArm.render();
  var rightHandMatrix = new Matrix4(rightArmMatrix);
  rightHandMatrix.translate(0.22, 0.01, -0.01);
  if (g_animating) {
    rightHandMatrix.rotate(20 * Math.sin(g_seconds), 0, 0, -1);
  } else {
    rightHandMatrix.rotate(g_rightHandAngle, 0, 0, -1);
  }
  var rightHand = new Cube();
  rightHand.color = grayColor;
  if (g_normalOn) rightHand.textureNum = -3;
  rightHand.matrix = new Matrix4(rightHandMatrix);
  rightHand.matrix.translate(0, -0.045, -0.02);
  rightHand.matrix.scale(0.145, 0.1, 0.045);
  rightHand.render();
  var rightHandFinger1Matrix = new Matrix4(rightHandMatrix);
  rightHandFinger1Matrix.translate(0.14, 0.035, -0.01);
  var rightHandFinger1 = new Cube();
  rightHandFinger1.color = blackColor;
  if (g_normalOn) rightHandFinger1.textureNum = -3;
  rightHandFinger1.matrix = new Matrix4(rightHandFinger1Matrix);
  rightHandFinger1.matrix.translate(0, -0.005, 0);
  rightHandFinger1.matrix.rotate(45, 0, 0, 1)
  rightHandFinger1.matrix.scale(0.04, 0.02, 0.015);
  rightHandFinger1.render();
  var rightHandFinger2Matrix = new Matrix4(rightHandMatrix);
  rightHandFinger2Matrix.translate(0.14, 0.002, -0.01);
  var rightHandFinger2 = new Cube();
  rightHandFinger2.color = blackColor;
  if (g_normalOn) rightHandFinger2.textureNum = -3;
  rightHandFinger2.matrix = new Matrix4(rightHandFinger2Matrix);
  rightHandFinger2.matrix.translate(0, 0.01, 0);
  rightHandFinger2.matrix.scale(0.04, 0.02, 0.015);
  rightHandFinger2.render();
  var rightHandFinger3Matrix = new Matrix4(rightHandMatrix);
  rightHandFinger3Matrix.translate(0.14, 0.035, -0.01);
  var rightHandFinger3 = new Cube();
  rightHandFinger3.color = blackColor;
  if (g_normalOn) rightHandFinger3.textureNum = -3;
  rightHandFinger3.matrix = new Matrix4(rightHandFinger3Matrix);
  rightHandFinger3.matrix.translate(0, -0.05, 0);
  rightHandFinger3.matrix.scale(0.04, 0.02, 0.015);
  rightHandFinger3.render();
  var rightHandFinger4Matrix = new Matrix4(rightHandMatrix);
  rightHandFinger4Matrix.translate(0.14, 0.002, -0.01);
  var rightHandFinger4 = new Cube();
  rightHandFinger4.color = blackColor;
  if (g_normalOn) rightHandFinger4.textureNum = -3;
  rightHandFinger4.matrix = new Matrix4(rightHandFinger4Matrix);
  rightHandFinger4.matrix.translate(0, -0.045, 0);
  rightHandFinger4.matrix.scale(0.04, 0.02, 0.015);
  rightHandFinger4.render();

  var leftShoulderMatrix = new Matrix4(bodyMatrix);
  leftShoulderMatrix.translate(0, 0.4, 0.1);
  leftShoulderMatrix.rotate(g_leftShoulderAngle, 0, 1, 0);
  var leftShoulder = new Cube();
  if (g_normalOn) leftShoulder.textureNum = -3;
  leftShoulder.color = grayColor;
  leftShoulder.matrix = new Matrix4(leftShoulderMatrix);
  leftShoulder.matrix.translate(-0.12, -0.13, -0.05);
  leftShoulder.matrix.scale(0.21, 0.2, 0.2);
  leftShoulder.render();
  var leftArmMatrix = new Matrix4(leftShoulderMatrix);
  leftArmMatrix.translate(-0.12, -0.06, 0.04);
  leftArmMatrix.rotate(g_leftArmAngle, 0, -1, 0);
  var leftArm = new Cube();
  leftArm.color = grayColor;
  if (g_normalOn) leftArm.textureNum = -3;
  leftArm.matrix = new Matrix4(leftArmMatrix);
  leftArm.matrix.translate(-0.2, -0.045, -0.05);
  leftArm.matrix.scale(0.3, 0.15, 0.1);
  leftArm.render();
  var leftHandMatrix = new Matrix4(leftArmMatrix);
  leftHandMatrix.translate(-0.18, 0.01, -0.01);
  leftHandMatrix.rotate(g_leftHandAngle, 0, 0, -1);
  var leftHand = new Cube();
  leftHand.color = grayColor;
  if (g_normalOn) leftHand.textureNum = -3;
  leftHand.matrix = new Matrix4(leftHandMatrix);
  leftHand.matrix.translate(-0.12, -0.03, -0.02);
  leftHand.matrix.scale(0.145, 0.1, 0.045);
  leftHand.render();
  var leftHandFinger1Matrix = new Matrix4(leftHandMatrix);
  leftHandFinger1Matrix.translate(-0.02, 0.05, -0.01);
  var leftHandFinger1 = new Cube();
  leftHandFinger1.color = blackColor;
  if (g_normalOn) leftHandFinger1.textureNum = -3;
  leftHandFinger1.matrix = new Matrix4(leftHandFinger1Matrix);
  leftHandFinger1.matrix.translate(-0.13, 0.015, 0);
  leftHandFinger1.matrix.rotate(45, 0, 0, -1)
  leftHandFinger1.matrix.scale(0.04, 0.02, 0.015);
  leftHandFinger1.render();
  var leftHandFinger2Matrix = new Matrix4(leftHandMatrix);
  leftHandFinger2Matrix.translate(-0.02, 0.05, -0.01);
  var leftHandFinger2 = new Cube();
  leftHandFinger2.color = blackColor;
  if (g_normalOn) leftHandFinger2.textureNum = -3;
  leftHandFinger2.matrix = new Matrix4(leftHandFinger2Matrix);
  leftHandFinger2.matrix.translate(-0.13, -0.03, 0);
  leftHandFinger2.matrix.scale(0.04, 0.02, 0.015);
  leftHandFinger2.render();
  var leftHandFinger3Matrix = new Matrix4(leftHandMatrix);
  leftHandFinger3Matrix.translate(-0.02, 0.05, -0.01);
  var leftHandFinger3 = new Cube();
  leftHandFinger3.color = blackColor;
  if (g_normalOn) leftHandFinger3.textureNum = -3;
  leftHandFinger3.matrix = new Matrix4(leftHandFinger3Matrix);
  leftHandFinger3.matrix.translate(-0.13, -0.055, 0);
  leftHandFinger3.matrix.scale(0.04, 0.02, 0.015);
  leftHandFinger3.render();
  var leftHandFinger4Matrix = new Matrix4(leftHandMatrix);
  leftHandFinger4Matrix.translate(-0.02, 0.05, -0.01);
  var leftHandFinger4 = new Cube();
  leftHandFinger4.color = blackColor;
  if (g_normalOn) leftHandFinger4.textureNum = -3;
  leftHandFinger4.matrix = new Matrix4(leftHandFinger4Matrix);
  leftHandFinger4.matrix.translate(-0.13, -0.08, 0);
  leftHandFinger4.matrix.scale(0.04, 0.02, 0.015);
  leftHandFinger4.render();

  var leftThigh = new Cube();
  leftThigh.color = grayColor;
  if (g_normalOn) leftThigh.textureNum = -3;
  leftThigh.matrix = new Matrix4(body.matrix);
  leftThigh.matrix.translate(-0.05, -0.05, -0.1);
  leftThigh.matrix.scale(0.3, 0.4, 1.1);
  leftThigh.render();
  var leftLeg = new Cube();
  leftLeg.color = grayColor;
  if (g_normalOn) leftLeg.textureNum = -3;
  leftLeg.matrix = new Matrix4(leftThigh.matrix);
  leftLeg.matrix.translate(-0.15, 0.1, -0.55);
  leftLeg.matrix.rotate(-15, 0, -1, 0);
  leftLeg.matrix.scale(0.8, 0.8, 0.8);
  leftLeg.render();
  var leftFoot = new Cube();
  leftFoot.color = grayColor;
  if (g_normalOn) leftFoot.textureNum = -3;
  leftFoot.matrix = new Matrix4(leftLeg.matrix);
  leftFoot.matrix.translate(0.2, 0.1, -0.3);
  leftFoot.matrix.scale(0.5, 0.8, 0.4);
  leftFoot.render();
  var leftToe1 = new Cube();
  leftToe1.color = blackColor;
  if (g_normalOn) leftToe1.textureNum = -3;
  leftToe1.matrix = new Matrix4(leftFoot.matrix);
  leftToe1.matrix.translate(0.4, 0.85, -0.4);
  leftToe1.matrix.rotate(30, 0, 0, 1);
  leftToe1.matrix.rotate(15, 0, -1, 0);
  leftToe1.matrix.scale(0.2, 0.1, 0.5);
  leftToe1.render();
  var leftToe2 = new Cube();
  leftToe2.color = blackColor;
  if (g_normalOn) leftToe2.textureNum = -3;
  leftToe2.matrix = new Matrix4(leftFoot.matrix);
  leftToe2.matrix.translate(0.4, 0.6, -0.4);
  leftToe2.matrix.scale(0.15, 0.15, 0.7);
  leftToe2.render();
  var leftToe3 = new Cube();
  leftToe3.color = blackColor;
  if (g_normalOn) leftToe3.textureNum = -3;
  leftToe3.matrix = new Matrix4(leftFoot.matrix);
  leftToe3.matrix.translate(0.4, 0.35, -0.4);
  leftToe3.matrix.scale(0.15, 0.15, 0.7);
  leftToe3.render();
  var leftToe4 = new Cube();
  leftToe4.color = blackColor;
  if (g_normalOn) leftToe4.textureNum = -3;
  leftToe4.matrix = new Matrix4(leftFoot.matrix);
  leftToe4.matrix.translate(0.4, 0.1, -0.4);
  leftToe4.matrix.scale(0.15, 0.15, 0.7);
  leftToe4.render();

  var rightThigh = new Cube();
  rightThigh.color = grayColor;
  if (g_normalOn) rightThigh.textureNum = -3;
  rightThigh.matrix = new Matrix4(body.matrix);
  rightThigh.matrix.translate(0.75, -0.05, -0.1);
  rightThigh.matrix.scale(0.3, 0.4, 1.1);
  rightThigh.render();
  var rightLeg = new Cube();
  rightLeg.color = grayColor;
  if (g_normalOn) rightLeg.textureNum = -3;
  rightLeg.matrix = new Matrix4(rightThigh.matrix);
  rightLeg.matrix.translate(0.4, 0.1, -0.7);
  rightLeg.matrix.rotate(-15, 0, 1, 0);
  rightLeg.matrix.scale(0.8, 0.8, 0.8);
  rightLeg.render();
  var rightFoot = new Cube();
  rightFoot.color = grayColor;
  if (g_normalOn) rightFoot.textureNum = -3;
  rightFoot.matrix = new Matrix4(rightLeg.matrix);
  rightFoot.matrix.translate(0.2, 0.1, -0.3);
  rightFoot.matrix.scale(0.5, 0.8, 0.4);
  rightFoot.render();
  var rightToe1 = new Cube();
  rightToe1.color = blackColor;
  if (g_normalOn) rightToe1.textureNum = -3;
  rightToe1.matrix = new Matrix4(rightFoot.matrix);
  rightToe1.matrix.translate(0.4, 0.95, -0.4);
  rightToe1.matrix.rotate(30, 0, 0, -1);
  rightToe1.matrix.rotate(15, 0, 1, 0);
  rightToe1.matrix.scale(0.2, 0.1, 0.5);
  rightToe1.render();
  var rightToe2 = new Cube();
  rightToe2.color = blackColor;
  if (g_normalOn) rightToe2.textureNum = -3;
  rightToe2.matrix = new Matrix4(rightFoot.matrix);
  rightToe2.matrix.translate(0.4, 0.6, -0.4);
  rightToe2.matrix.scale(0.15, 0.15, 0.7);
  rightToe2.render();
  var rightToe3 = new Cube();
  rightToe3.color = blackColor;
  if (g_normalOn) rightToe3.textureNum = -3;
  rightToe3.matrix = new Matrix4(rightFoot.matrix);
  rightToe3.matrix.translate(0.4, 0.35, -0.4);
  rightToe3.matrix.scale(0.15, 0.15, 0.7);
  rightToe3.render();
  var rightToe4 = new Cube();
  rightToe4.color = blackColor;
  if (g_normalOn) rightToe4.textureNum = -3;
  rightToe4.matrix = new Matrix4(rightFoot.matrix);
  rightToe4.matrix.translate(0.4, 0.1, -0.4);
  rightToe4.matrix.scale(0.15, 0.15, 0.7);
  rightToe4.render();
}

window.onload = main;
