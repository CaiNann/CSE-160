// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform float u_PointSize;\n" +
  "void main() {\n" +
  "  gl_Position = a_Position;\n" +
  "  gl_PointSize = u_PointSize;\n" +
  "}\n";

// Fragment shader program
var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "uniform vec4 u_FragColor;\n" + // uniform変数
  "void main() {\n" +
  "  gl_FragColor = u_FragColor;\n" +
  "}\n";

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_PointSize;
let g_selectedColor = getRGBColor();
let g_selectedSize = 5.0;
let g_selectedShape = "point";

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
  
  // Get the storage location of u_PointSize
  u_PointSize = gl.getUniformLocation(gl.program, "u_PointSize");
  if (!u_PointSize) {
    console.log("Failed to get the storage location of u_PointSize");
    return;
  }
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
  
  // Add event listener for shape size selection
  document.getElementById("sizeSlider").oninput = function () {
    g_selectedSize = parseFloat(this.value);
  };
}

function main() {
  //Set up canvas and webGL variables
  setupWebGL();
  //Setup GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  addActionsForHtmlUI();
  
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
    if (ev.buttons === 1) {
      click(ev); 
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);
  
  if (g_selectedShape === "point") {
    var shape = new Point();
    shape.position = [x, y, 0.0];
    shape.color = g_selectedColor;
    shape.size = g_selectedSize;
    g_shapesList.push(shape);
  } else if (g_selectedShape === "triangle") {
    var shape = new Triangle();
    shape.position = [x, y, 0.0];
    shape.color = g_selectedColor;
    shape.size = g_selectedSize;
    g_shapesList.push(shape);
  }

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

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}
