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
      const v1prime = new Vector3([x1, y1, 0.0]);
      const v2prime = new Vector3([x2, y2, 0.0]);
      
      v1prime.mul(scalar);
      v2prime.mul(scalar);
      
      drawVector(v1prime, 'green');
      drawVector(v2prime, 'green');
      break;
      
    case 'div':
      var scalar = document.getElementById('scalarVal').value;
      const v1prime = new Vector3([x1, y1, 0.0]);
      const v2prime = new Vector3([x2, y2, 0.0]);
      
      v1prime.mul(scalar);
      v2prime.mul(scalar);
      
      drawVector(v1prime, 'green');
      drawVector(v2prime, 'green');
      break;
  }
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