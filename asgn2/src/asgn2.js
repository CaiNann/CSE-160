import { drawCustomImage } from './CustomDrawing.js';
import { Triangle, drawTriangle3D } from './Triangle.js';
import { Circle } from './Circle.js';
import { Cube } from './Cube.js';

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform mat4 u_ModelMatrix;\n" +
  "uniform mat4 u_GlobalRotateMatrix;\n" +
  "void main() {\n" +
  "  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n" +
  "}\n";

// Fragment shader program
var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "uniform vec4 u_FragColor;\n" + // uniform変数
  "void main() {\n" +
  "  gl_FragColor = u_FragColor;\n" +
  "}\n";

window.g_shapesList = [];
window.g_selectedColor = [1.0, 1.0, 1.0, 1.0];
window.g_selectedAngle = 0;
window.g_selectedShape = "point";
window.g_selectedSegments = 10;
window.canvas = null;  // add this
window.gl = null;      // add this
window.a_Position = null;
window.u_FragColor = null;
window.u_ModelMatrix = null;
window.u_GlobalRotateMatrix = null;
window.customImageButton = false;
window.gameState = "WAITING";
window.gameStartTime = null;
window.gameTimeoutID = null;

function getRGBColor() {
  return [
    document.getElementById("redSlider").value / 100,
    document.getElementById("greenSlider").value / 100,
    document.getElementById("blueSlider").value / 100,
    1.0,
  ];
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

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }
  
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }
  
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }  
  
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  
}

function addActionsForHtmlUI() {
  // Add event listeners for color selection
  document.getElementById("red").onclick = function () {
    g_selectedColor = [1.0, 0.0, 0.0, 1.0];
  };
  document.getElementById("green").onclick = function () {
    g_selectedColor = [0.0, 1.0, 0.0, 1.0];
  };
  
  // Add event listener for clear button
  document.getElementById("clear").onclick = function () {
    g_shapesList = [];
    renderAllShapes();
  };
  
  // Add event listeners for shape selection
  document.getElementById("point").onclick = function () {
    g_selectedShape = "point";
  };
  document.getElementById("triangle").onclick = function () {
    g_selectedShape = "triangle";
  };
  document.getElementById("circle").onclick = function () {
    g_selectedShape = "circle";
  };
  document.getElementById("custom").onclick = function () {
    customImageButton = true;
    document.getElementById("gameButton").hidden = false;
    document.getElementById("imageGroup").hidden = false;
    drawCustomImage();
  };
  
  // Add event listeners for color selection
  document.getElementById("redSlider").oninput = function () {
    g_selectedColor = getRGBColor();
  };
  document.getElementById("greenSlider").oninput = function () {
    g_selectedColor = getRGBColor();
  };
  document.getElementById("blueSlider").oninput = function () {
    g_selectedColor = getRGBColor();
  };
  
  // Add event listener for camera angle selection
  document.getElementById("angleSlider").oninput = function () {
    g_selectedAngle = parseFloat(this.value);
    renderAllShapes();
  };
  
  // Add event listener for segment count selection
  document.getElementById("segmentSlider").oninput = function () {
    g_selectedSegments = parseInt(this.value);
  };
  
  // Add event listener for game button
  document.getElementById("gameButton").onclick = function () {
    gameState = "PLAYING";
    document.getElementById("bottomText").innerText = "Wait for the green background...";
    document.getElementById("bottomText").hidden = false;
    playGame();
  };
}

function main() {
  //Set up canvas and webGL variables
  setupWebGL();
  //Setup GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  addActionsForHtmlUI();
  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 1.0, 0.0, 1.0);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

export function renderAllShapes() {
  // Apply camera rotation
  var cameraMatrix = new Matrix4();
  cameraMatrix.rotate(g_selectedAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, cameraMatrix.elements);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var grayColor = [0.59, 0.57, 0.54, 1.0];
  var whiteColor = [0.92, 0.88, 0.85, 1.0];
  var blackColor = [0.17, 0.13, 0.11, 1.0];

  var body = new Cube();
  body.color = grayColor;
  body.matrix.translate(-0.2, -0.3, 0.0);
  body.matrix.scale(0.5, 0.5, 0.3);
  body.render();
  var belly = new Cube();
  belly.color = whiteColor;
  belly.matrix = new Matrix4(body.matrix);
  belly.matrix.translate(0.1, 0, -0.001);
  belly.matrix.scale(0.8, 1, 0.8);
  belly.render();

  var head = new Cube();
  head.color = grayColor;
  head.matrix = new Matrix4(body.matrix);
  head.matrix.translate(0.15, 1, 0.05);
  head.matrix.scale(0.7, 0.5, 0.8);
  head.render();

  var nose = new Cube();
  nose.color = blackColor;
  nose.matrix = new Matrix4(head.matrix);
  nose.matrix.translate(0.4, 0.1, -0.1);
  nose.matrix.scale(0.2, 0.5, 0.9)
  nose.render();
  var bottomNose = new Cube();
  bottomNose.color = whiteColor;
  bottomNose.matrix = new Matrix4(nose.matrix);
  bottomNose.matrix.translate(0.0, -0.15, 0.0);
  bottomNose.matrix.scale(1, 0.5, 1);
  bottomNose.render();

  var rightEye = new Cube();
  rightEye.color = blackColor;
  rightEye.matrix = new Matrix4(head.matrix);
  rightEye.matrix.translate(0.7, 0.5, -0.001);
  rightEye.matrix.scale(0.1, 0.15, 0.001);
  rightEye.render();

  var leftEye = new Cube();
  leftEye.color = blackColor;
  leftEye.matrix = new Matrix4(head.matrix);
  leftEye.matrix.translate(0.2, 0.5, -0.001);
  leftEye.matrix.scale(0.1, 0.15, 0.001);
  leftEye.render();

  var rightEar = new Cube();
  rightEar.color = grayColor;
  rightEar.matrix = new Matrix4(head.matrix);
  rightEar.matrix.translate(0.6, 0.7, 0.2);
  rightEar.matrix.rotate(-10, 0, 0, 1);
  rightEar.matrix.scale(0.6, 0.7, 0.5);
  rightEar.render();
  var innerRightEar = new Cube();
  innerRightEar.color = whiteColor;
  innerRightEar.matrix = new Matrix4(rightEar.matrix);
  innerRightEar.matrix.translate(0.1, 0.1, -0.1);
  innerRightEar.matrix.scale(0.7, 0.7, 0.9);
  innerRightEar.render();

  var leftEar = new Cube();
  leftEar.color = grayColor;
  leftEar.matrix = new Matrix4(head.matrix);
  leftEar.matrix.translate(-0.2, 0.6, 0.2);
  leftEar.matrix.rotate(10, 0, 0, 1);
  leftEar.matrix.scale(0.6, 0.7, 0.5);
  leftEar.render();
  var innerLeftEar = new Cube();
  innerLeftEar.color = whiteColor;
  innerLeftEar.matrix = new Matrix4(leftEar.matrix);
  innerLeftEar.matrix.translate(0.2, 0.1, -0.1);
  innerLeftEar.matrix.scale(0.7, 0.7, 0.9);
  innerLeftEar.render();

  var rightShoulder = new Cube();
  rightShoulder.color = grayColor;
  rightShoulder.matrix = new Matrix4(body.matrix);
  rightShoulder.matrix.translate(0.9, 0.55, 0.1);
  rightShoulder.matrix.scale(0.3, 0.4, 0.7);
  rightShoulder.render();
  var rightArm = new Cube();
  rightArm.color = grayColor;
  rightArm.matrix = new Matrix4(rightShoulder.matrix);
  rightArm.matrix.translate(1, 0.1, 0.2);
  rightArm.matrix.rotate(45, 0, 1, 0);
  rightArm.matrix.scale(1, 0.8, 0.6);
  rightArm.render();
  var rightHand = new Cube();
  rightHand.color = grayColor;
  rightHand.matrix = new Matrix4(rightArm.matrix);
  rightHand.matrix.translate(1, 0.1, 0.2);
  rightHand.matrix.scale(0.5, 0.7, 0.5);
  rightHand.render();
  var rightHandFinger1 = new Cube();
  rightHandFinger1.color = blackColor;
  rightHandFinger1.matrix = new Matrix4(rightHand.matrix);
  rightHandFinger1.matrix.translate(1, 0.6, 0.1);
  rightHandFinger1.matrix.scale(0.8, 0.2, 0.5);
  rightHandFinger1.render();
 
  /*
  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.matrix.translate(0.7, 0.0, 0.0);
  leftArm.matrix.rotate(45, 0, 0, 1);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.render();
  
  var box = new Cube();
  box.color = [1, 0, 1, 1];
  box.matrix.translate(0,0,-0.50,0);
  box.matrix.rotate(-30,1,0,0)
  box.matrix.scale(0.5, 0.5, 0.5);
  box.render();
  */
}

function playGame() {
  gl.clearColor(1.0, 0.0, 0.0, 1.0); 
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawCustomImage();

  let randomDelay = Math.random() * 3000 + 2000;
  
  gameTimeoutID = setTimeout(() => {
    gameState = "GREEN";
    gameStartTime = performance.now();
    
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }, randomDelay);
}

function triggerGameOver() {
  clearTimeout(gameTimeoutID);
  gameState = "WAITING";
  gameStartTime = null;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawCustomImage();
  document.getElementById("bottomText").innerText = "Too early, Try again!";
}

function triggerVictory() {
  clearTimeout(gameTimeoutID);
  var timeTaken = performance.now() - gameStartTime;
  gameState = "WAITING";
  gameStartTime = null;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawCustomImage();
  console.log(timeTaken);
  if (timeTaken < 225) {
    document.getElementById("bottomText").innerText = "You win!";
  } else {
    document.getElementById("bottomText").innerText = "Too late, Try again!";
  }
}

window.onload = main;
