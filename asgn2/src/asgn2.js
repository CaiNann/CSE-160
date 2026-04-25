import { drawCustomImage } from './CustomDrawing.js';
import { Triangle, drawTriangle3D } from './Triangle.js';
import { Circle } from './Circle.js';
import { Cube } from './Cube.js';

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform mat4 u_ModelMatrix;\n" +
  "uniform mat4 u_GlobalXRotateMatrix;\n" +
  "uniform mat4 u_GlobalYRotateMatrix;\n" +
  "uniform mat4 u_GlobalZRotateMatrix;\n" +
  "void main() {\n" +
  "  gl_Position = u_GlobalXRotateMatrix * u_GlobalYRotateMatrix * u_GlobalZRotateMatrix * u_ModelMatrix * a_Position;\n" +
  "}\n";

// Fragment shader program
var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "uniform vec4 u_FragColor;\n" +
  "void main() {\n" +
  "  gl_FragColor = u_FragColor;\n" +
  "}\n";

window.g_selectedXAngle = 0;
window.g_selectedYAngle = 0;
window.g_selectedZAngle = 0;
window.canvas = null;
window.gl = null;
window.a_Position = null;
window.u_FragColor = null;
window.u_ModelMatrix = null;
window.u_GlobalXRotateMatrix = null;
window.u_GlobalYRotateMatrix = null;
window.u_GlobalZRotateMatrix = null;

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
  
  // Get the storage location of u_GlobalXRotateMatrix
  u_GlobalXRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalXRotateMatrix");
  if (!u_GlobalXRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalXRotateMatrix");
    return;
  }  

  // Get the storage location of u_GlobalYRotateMatrix
  u_GlobalYRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalYRotateMatrix");
  if (!u_GlobalYRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalYRotateMatrix");
    return;
  }  

  // Get the storage location of u_GlobalZRotateMatrix
  u_GlobalZRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalZRotateMatrix");
  if (!u_GlobalZRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalZRotateMatrix");
    return;
  }  
  
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  
}

function addActionsForHtmlUI() {
  
  // Add event listener for X camera angle selection
  document.getElementById("XangleSlider").oninput = function () {
    g_selectedXAngle = parseFloat(this.value);
    renderAllShapes();
  };

  // Add event listener for Y camera angle selection
  document.getElementById("YangleSlider").oninput = function () {
    g_selectedYAngle = parseFloat(this.value);
    renderAllShapes();
  };

  // Add event listener for Z camera angle selection
  document.getElementById("ZangleSlider").oninput = function () {
    g_selectedZAngle = parseFloat(this.value);
    renderAllShapes();
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

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

export function renderAllShapes() {
  // Apply camera rotation
  var cameraXMatrix = new Matrix4();
  cameraXMatrix.rotate(g_selectedXAngle, 0, 1, 0);
  var cameraYMatrix = new Matrix4();
  cameraYMatrix.rotate(g_selectedYAngle, 1, 0, 0);
  var cameraZMatrix = new Matrix4();
  cameraZMatrix.rotate(g_selectedZAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalXRotateMatrix, false, cameraXMatrix.elements);
  gl.uniformMatrix4fv(u_GlobalYRotateMatrix, false, cameraYMatrix.elements);
  gl.uniformMatrix4fv(u_GlobalZRotateMatrix, false, cameraZMatrix.elements);
  
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
  belly.matrix.translate(0.1, 0.001, -0.001);
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
  bottomNose.matrix.translate(0.001, -0.15, 0.001);
  bottomNose.matrix.scale(0.99, 0.5, 1);
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
  rightArm.matrix.translate(0.6, 0.1, 0.45);
  rightArm.matrix.rotate(45, 0, 1, 0);
  rightArm.matrix.scale(1.5, 0.8, 0.6);
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
  rightHandFinger1.matrix.translate(1, 0.7, 0.2);
  rightHandFinger1.matrix.rotate(45, 0, 1, 1);
  rightHandFinger1.matrix.scale(0.4, 0.2, 0.2);
  rightHandFinger1.render();
  var rightHandFinger2 = new Cube();
  rightHandFinger2.color = blackColor;
  rightHandFinger2.matrix = new Matrix4(rightHand.matrix);
  rightHandFinger2.matrix.translate(1, 0.5, 0.1);
  rightHandFinger2.matrix.scale(0.4, 0.2, 0.2);
  rightHandFinger2.render();
  var rightHandFinger3 = new Cube();
  rightHandFinger3.color = blackColor;
  rightHandFinger3.matrix = new Matrix4(rightHand.matrix);
  rightHandFinger3.matrix.translate(1, 0.25, 0.1);
  rightHandFinger3.matrix.scale(0.4, 0.2, 0.2);
  rightHandFinger3.render();
  var rightHandFinger4 = new Cube();
  rightHandFinger4.color = blackColor;
  rightHandFinger4.matrix = new Matrix4(rightHand.matrix);
  rightHandFinger4.matrix.translate(1, 0, 0.1);
  rightHandFinger4.matrix.scale(0.4, 0.2, 0.2);
  rightHandFinger4.render();

  var leftShoulder = new Cube();
  leftShoulder.color = grayColor;
  leftShoulder.matrix = new Matrix4(body.matrix);
  leftShoulder.matrix.translate(-0.2, 0.55, 0.1);
  leftShoulder.matrix.scale(0.3, 0.4, 0.7);
  leftShoulder.render();
  var leftArm = new Cube();
  leftArm.color = grayColor;
  leftArm.matrix = new Matrix4(leftShoulder.matrix);
  leftArm.matrix.translate(-0.65, 0.1, -0.6);
  leftArm.matrix.rotate(45, 0, -1, 0);
  leftArm.matrix.scale(1.5, 0.8, 0.6);
  leftArm.render();
  var leftHand = new Cube();
  leftHand.color = grayColor;
  leftHand.matrix = new Matrix4(leftArm.matrix);
  leftHand.matrix.translate(-0.5, 0.1, 0.2);
  leftHand.matrix.scale(0.5, 0.7, 0.5);
  leftHand.render();
  var leftHandFinger1 = new Cube();
  leftHandFinger1.color = blackColor;
  leftHandFinger1.matrix = new Matrix4(leftHand.matrix);
  leftHandFinger1.matrix.translate(-0.3, 0.9, 0.1);
  leftHandFinger1.matrix.rotate(45, 0, -1, -1);
  leftHandFinger1.matrix.scale(0.4, 0.2, 0.2);
  leftHandFinger1.render();
  var leftHandFinger2 = new Cube();
  leftHandFinger2.color = blackColor;
  leftHandFinger2.matrix = new Matrix4(leftHand.matrix);
  leftHandFinger2.matrix.translate(-0.4, 0.5, 0.5);
  leftHandFinger2.matrix.scale(0.4, 0.2, 0.2);
  leftHandFinger2.render();
  var leftHandFinger3 = new Cube();
  leftHandFinger3.color = blackColor;
  leftHandFinger3.matrix = new Matrix4(leftHand.matrix);
  leftHandFinger3.matrix.translate(-0.4, 0.25, 0.5);
  leftHandFinger3.matrix.scale(0.4, 0.2, 0.2);
  leftHandFinger3.render();
  var leftHandFinger4 = new Cube();
  leftHandFinger4.color = blackColor;
  leftHandFinger4.matrix = new Matrix4(leftHand.matrix);
  leftHandFinger4.matrix.translate(-0.4, 0, 0.5);
  leftHandFinger4.matrix.scale(0.4, 0.2, 0.2);
  leftHandFinger4.render();

  var leftThigh = new Cube();
  leftThigh.color = grayColor;
  leftThigh.matrix = new Matrix4(body.matrix);
  leftThigh.matrix.translate(-0.05, -0.05, -0.1);
  leftThigh.matrix.scale(0.3, 0.4, 1.1);
  leftThigh.render();
  var leftLeg = new Cube();
  leftLeg.color = grayColor;
  leftLeg.matrix = new Matrix4(leftThigh.matrix);
  leftLeg.matrix.translate(-0.15, 0.1, -0.55);
  leftLeg.matrix.rotate(-15, 0, -1, 0);
  leftLeg.matrix.scale(0.8, 0.8, 0.8);
  leftLeg.render();
  var leftFoot = new Cube();
  leftFoot.color = grayColor;
  leftFoot.matrix = new Matrix4(leftLeg.matrix);
  leftFoot.matrix.translate(0.2, 0.1, -0.3);
  leftFoot.matrix.scale(0.5, 0.8, 0.4);
  leftFoot.render();
  var leftToe1 = new Cube();
  leftToe1.color = blackColor;
  leftToe1.matrix = new Matrix4(leftFoot.matrix);
  leftToe1.matrix.translate(0.4, 0.85, -0.4);
  leftToe1.matrix.rotate(30, 0, 0, 1);
  leftToe1.matrix.rotate(15, 0, -1, 0);
  leftToe1.matrix.scale(0.2, 0.1, 0.5);
  leftToe1.render();
  var leftToe2 = new Cube();
  leftToe2.color = blackColor;
  leftToe2.matrix = new Matrix4(leftFoot.matrix);
  leftToe2.matrix.translate(0.4, 0.6, -0.4);
  leftToe2.matrix.scale(0.15, 0.15, 0.7);
  leftToe2.render();
  var leftToe3 = new Cube();
  leftToe3.color = blackColor;
  leftToe3.matrix = new Matrix4(leftFoot.matrix);
  leftToe3.matrix.translate(0.4, 0.35, -0.4);
  leftToe3.matrix.scale(0.15, 0.15, 0.7);
  leftToe3.render();
  var leftToe4 = new Cube();
  leftToe4.color = blackColor;
  leftToe4.matrix = new Matrix4(leftFoot.matrix);
  leftToe4.matrix.translate(0.4, 0.1, -0.4);
  leftToe4.matrix.scale(0.15, 0.15, 0.7);
  leftToe4.render();

  var rightThigh = new Cube();
  rightThigh.color = grayColor;
  rightThigh.matrix = new Matrix4(body.matrix);
  rightThigh.matrix.translate(0.75, -0.05, -0.1);
  rightThigh.matrix.scale(0.3, 0.4, 1.1);
  rightThigh.render();
  var rightLeg = new Cube();
  rightLeg.color = grayColor;
  rightLeg.matrix = new Matrix4(rightThigh.matrix);
  rightLeg.matrix.translate(0.4, 0.1, -0.7);
  rightLeg.matrix.rotate(-15, 0, 1, 0);
  rightLeg.matrix.scale(0.8, 0.8, 0.8);
  rightLeg.render();
  var rightFoot = new Cube();
  rightFoot.color = grayColor;
  rightFoot.matrix = new Matrix4(rightLeg.matrix);
  rightFoot.matrix.translate(0.2, 0.1, -0.3);
  rightFoot.matrix.scale(0.5, 0.8, 0.4);
  rightFoot.render();
  var rightToe1 = new Cube();
  rightToe1.color = blackColor;
  rightToe1.matrix = new Matrix4(rightFoot.matrix);
  rightToe1.matrix.translate(0.4, 0.95, -0.4);
  rightToe1.matrix.rotate(30, 0, 0, -1);
  rightToe1.matrix.rotate(15, 0, 1, 0);
  rightToe1.matrix.scale(0.2, 0.1, 0.5);
  rightToe1.render();
  var rightToe2 = new Cube();
  rightToe2.color = blackColor;
  rightToe2.matrix = new Matrix4(rightFoot.matrix);
  rightToe2.matrix.translate(0.4, 0.6, -0.4);
  rightToe2.matrix.scale(0.15, 0.15, 0.7);
  rightToe2.render();
  var rightToe3 = new Cube();
  rightToe3.color = blackColor;
  rightToe3.matrix = new Matrix4(rightFoot.matrix);
  rightToe3.matrix.translate(0.4, 0.35, -0.4);
  rightToe3.matrix.scale(0.15, 0.15, 0.7);
  rightToe3.render();
  var rightToe4 = new Cube();
  rightToe4.color = blackColor;
  rightToe4.matrix = new Matrix4(rightFoot.matrix);
  rightToe4.matrix.translate(0.4, 0.1, -0.4);
  rightToe4.matrix.scale(0.15, 0.15, 0.7);
  rightToe4.render();
 
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

window.onload = main;
