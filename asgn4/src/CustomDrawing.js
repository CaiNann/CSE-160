
import { drawTriangle } from './Triangle.js';


export function drawCustomImage() {
  drawLeftSideOfHat();
  drawRightSideOfHat();
  drawInitials();
  drawBrimOfHat();
  drawEyes();
  drawBandana();
  drawBandanaPattern();
}

function drawLeftSideOfHat() {
  gl.uniform4f(u_FragColor, 0.42, 0.29, 0.1, 1.0);
  let vertices = [
    -0.4, 0.5,
    -0.2, 0.9,
    -0.2, 0.5,
  ];
  drawTriangle(vertices);
  
  let vertices2 = [
    -0.2, 0.9,
    0.0, 0.8,
    -0.2, 0.8
  ];
  drawTriangle(vertices2);
  
  let vertices3 = [
    -0.2, 0.8,
    0.0, 0.8,
    -0.2, 0.5
  ];
  drawTriangle(vertices3);
  
  let vertices4 = [
    -0.2, 0.5,
    0.0, 0.8,
    0.0, 0.5
  ];
  drawTriangle(vertices4);
}

function drawRightSideOfHat() {
  gl.uniform4f(u_FragColor, 0.42, 0.29, 0.1, 1.0);
  let vertices = [
    0.4, 0.5,
    0.2, 0.9,
    0.2, 0.5,
  ];
  drawTriangle(vertices);
  
  let vertices2 = [
    0.2, 0.9,
    0.0, 0.8,
    0.2, 0.8
  ];
  drawTriangle(vertices2);
  
  let vertices3 = [
    0.2, 0.8,
    0.0, 0.8,
    0.2, 0.5
  ];
  drawTriangle(vertices3);
  
  let vertices4 = [
    0.2, 0.5,
    0.0, 0.8,
    0.0, 0.5
  ];
  drawTriangle(vertices4);
}

function drawInitials() {
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  
  let vertices = [
    -0.15, 0.7,
    -0.1, 0.75,
    -0.1, 0.7
  ];
  drawTriangle(vertices);
  
  let vertices2 = [
    -0.1, 0.75,
    -0.05, 0.75,
    -0.1, 0.7
  ];
  drawTriangle(vertices2);
  
  let vertices16 = [
    -0.1, 0.7,
    -0.05, 0.75,
    -0.05, 0.7
  ];
  drawTriangle(vertices16);
  
  let vertices3 = [
    -0.15, 0.7,
    -0.1, 0.7,
    -0.15, 0.65
  ];
  drawTriangle(vertices3);
  
  let vertices4 = [
    -0.15, 0.65,
    -0.1, 0.7,
    -0.1, 0.65
  ];
  drawTriangle(vertices4);
  
  let vertices5 = [
    -0.15, 0.65,
    -0.1, 0.65,
    -0.1, 0.6
  ];
  drawTriangle(vertices5);
  
  let vertices6 = [
    -0.1, 0.65,
    -0.05, 0.6,
    -0.1, 0.6
  ];
  drawTriangle(vertices6);
  
  let vertices17 = [
    -0.1, 0.65,
    -0.05, 0.65,
    -0.05, 0.6
  ];
  drawTriangle(vertices17);
  
  let vertices7 = [
    0.05, 0.7,
    0.1, 0.75,
    0.1, 0.7
  ];
  drawTriangle(vertices7);
  
  let vertices8 = [
    0.05, 0.7,
    0.05, 0.75,
    0.1, 0.75
  ];
  drawTriangle(vertices8);
  
  let vertices9 = [
    0.1, 0.75,
    0.15, 0.7,
    0.1, 0.7
  ];
  drawTriangle(vertices9);
  
  let vertices10 = [
    0.05, 0.65,
    0.1, 0.7,
    0.1, 0.65
  ];
  drawTriangle(vertices10);
  
  let vertices11 = [
    0.05, 0.65,
    0.05, 0.7,
    0.1, 0.7
  ];
  drawTriangle(vertices11);
  
  let vertices12 = [
    0.1, 0.7,
    0.15, 0.65,
    0.1, 0.65
  ];
  drawTriangle(vertices12);
  
  let vertices13 = [
    0.05, 0.6,
    0.1, 0.65,
    0.1, 0.6
  ];
  drawTriangle(vertices13);
  
  let vertices14 = [
    0.05, 0.6,
    0.05, 0.65,
    0.1, 0.65
  ];
  drawTriangle(vertices14);
  
  let vertices15 = [
    0.1, 0.65,
    0.15, 0.6,
    0.1, 0.6
  ];
  drawTriangle(vertices15);
}

function drawBrimOfHat() {
  gl.uniform4f(u_FragColor, 0.39, 0.26, 0.13, 1.0);
  let vertices = [
    -0.8, 0.6,
    -0.4, 0.5,
    -0.8, 0.5
  ];
  drawTriangle(vertices);
  
  let vertices2 = [
    -0.8, 0.5,
    -0.6, 0.5,
    -0.6, 0.35
  ];
  drawTriangle(vertices2);
  
  let vertices3 = [
    -0.6, 0.35,
    -0.8, 0.5,
    -0.4, 0.5
  ];
  drawTriangle(vertices3);
  
  let vertices4 = [
    -0.6, 0.35,
    -0.4, 0.5,
    -0.4, 0.35
  ];
  drawTriangle(vertices4);
  
  let vertices5 = [
    -0.4, 0.35,
    -0.4, 0.5,
    0.4, 0.5
  ];
  drawTriangle(vertices5);
  
  let vertices6 = [
    -0.4, 0.35,
    0.4, 0.5,
    0.4, 0.35
  ];
  drawTriangle(vertices6);
  
  let vertices7 = [
    0.4, 0.35,
    0.4, 0.5,
    0.6, 0.35
  ];
  drawTriangle(vertices7);
  
  let vertices8 = [
    0.4, 0.5,
    0.6, 0.5,
    0.6, 0.35
  ];
  drawTriangle(vertices8);
  
  let vertices9 = [
    0.4, 0.5,
    0.8, 0.6,
    0.8, 0.5
  ];
  drawTriangle(vertices9);
  
  let vertices10 = [
    0.6, 0.5,
    0.8, 0.5,
    0.6, 0.35
  ];
  drawTriangle(vertices10);
}

function drawEyes() {
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  let vertices = [
    -0.2, 0.25,
    -0.1, 0.15,
    -0.2, 0.15
  ];
  drawTriangle(vertices);
  
  let vertices2 = [
    0.2, 0.25,
    0.1, 0.15,
    0.2, 0.15
  ];
  drawTriangle(vertices2);
}

function drawBandana() {
  gl.uniform4f(u_FragColor, 0.5, 0.0, 0.0, 1.0);
  let vertices = [
    -0.4, 0.0,
    0.4, 0.0,
    0.0, -0.6
  ];
  drawTriangle(vertices);
}

function drawBandanaPattern() {
  gl.uniform4f(u_FragColor, 0.8, 0.8, 0.8, 1.0);
  let vertices = [
    -0.07, 0.0,
    0.07, 0.0,
    0.0, -0.1
  ];
  drawTriangle(vertices);
  
  let vertices2 = [
    -0.2, -0.2,
    -0.12, -0.1,
    -0.05, -0.2
  ];
  drawTriangle(vertices2);
  
  let vertices3 = [
    -0.2, -0.25,
    -0.05, -0.25,
    -0.12, -0.35
  ];
  drawTriangle(vertices3);
  
  let vertices4 = [
    0.2, -0.2,
    0.12, -0.1,
    0.05, -0.2
  ];
  drawTriangle(vertices4);
  
  let vertices5 = [
    0.2, -0.25,
    0.05, -0.25,
    0.12, -0.35
  ];
  drawTriangle(vertices5);
  
  let vertices6 = [
    -0.05, -0.35,
    0.0, -0.42,
    -0.05, -0.5
  ];
  drawTriangle(vertices6);
  
  let vertices7 = [
    0.05, -0.35,
    0.0, -0.42,
    0.05, -0.5
  ];
  drawTriangle(vertices7);
}
