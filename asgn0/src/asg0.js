// DrawRectangle.js
function main() {
  // Retrieve <canvas> element <- (1)
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return;
  }
  
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  //Instantiate vector
  const v1 = new Vector3([2.25, 2.25, 0.0]);
  drawVector(v1, "red");
} 

function handleDrawEvent() {
  var x1 = document.getElementById('xCoord1').value;
  var y1 = document.getElementById('yCoord1').value;
  
  var x2 = document.getElementById('xCoord2').value;
  var y2 = document.getElementById('yCoord2').value;
  
  const v1 = new Vector3([x1, y1, 0.0]);
  const v2 = new Vector3([x2, y2, 0.0]);
  
  var canvas = document.getElementById('example')
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  var x1 = document.getElementById('xCoord1').value;
  var y1 = document.getElementById('yCoord1').value;
  
  var x2 = document.getElementById('xCoord2').value;
  var y2 = document.getElementById('yCoord2').value;
  
  const v1 = new Vector3([x1, y1, 0.0]);
  const v2 = new Vector3([x2, y2, 0.0]);
  
  drawVector(v1, 'red');
  drawVector(v2, 'blue');
  
  var operation = document.getElementById('operationSelect').value;
  switch (operation) {
    case 'mul':
      var scalar = document.getElementById('scalarVal').value;
      var v1prime = new Vector3([x1, y1, 0.0]);
      var v2prime = new Vector3([x2, y2, 0.0]);
      
      v1prime.mul(scalar);
      v2prime.mul(scalar);
      
      drawVector(v1prime, 'green');
      drawVector(v2prime, 'green');
      break;
      
    case 'div':
      var scalar = document.getElementById('scalarVal').value;
      var v1prime = new Vector3([x1, y1, 0.0]);
      var v2prime = new Vector3([x2, y2, 0.0]);
      
      v1prime.div(scalar);
      v2prime.div(scalar);
      
      drawVector(v1prime, 'green');
      drawVector(v2prime, 'green');
      break;
    
    case 'add':
      var v3 = v1.add(v2);
      drawVector(v3, 'green');
      break;
    
    case 'sub':
      var v3 = v1.sub(v2);
      drawVector(v3, 'green');
      break;
      
    case 'mag':
      console.log("Magnitude v1: " + v1.magnitude().toString());
      console.log("Magnitude v2: " + v2.magnitude().toString());
      break;
      
    case 'norm':
      var v1prime = new Vector3([x1, y1, 0.0]);
      var v2prime = new Vector3([x2, y2, 0.0]);
      
      v1prime.normalize();
      v2prime.normalize();
      
      drawVector(v1prime, 'green');
      drawVector(v2prime, 'green');
      break;
      
    case 'dot':
      console.log("Angle: " + angleBetween(v1, v2));
      break;
      
    case 'area':
      console.log("Area of the triangle: " + areaTriangle(v1, v2));
  }
}

function areaTriangle(v1, v2) {
  return (Vector3.cross(v1, v2).magnitude() / 2);
}

function angleBetween(v1, v2) {
  var dot = Vector3.dot(v1, v2);
  var angle = (Math.acos(dot / (v1.magnitude() * v2.magnitude()))) * (180 / Math.PI);
  return angle;
}

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
  }
  
  var ctx = canvas.getContext('2d');
  
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(200, 200);
  ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20)
  ctx.stroke();
}