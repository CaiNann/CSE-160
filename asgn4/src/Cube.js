import { drawTriangle3DUVNormal } from './Triangle.js';

export class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
  }
  
  buildBuffers() {
    const verts = [
        // front
        0,0,0, 1,1,0, 1,0,0,
        0,0,0, 0,1,0, 1,1,0,
        // top
        0,1,0, 0,1,1, 1,1,1,
        0,1,0, 1,1,1, 1,1,0,
        // bottom
        0,0,0, 1,0,0, 1,0,1,
        0,0,0, 1,0,1, 0,0,1,
        // left
        0,0,0, 0,0,1, 0,1,1,
        0,0,0, 0,1,1, 0,1,0,
        // right
        1,0,0, 1,1,0, 1,1,1,
        1,0,0, 1,1,1, 1,0,1,
        // back
        0,0,1, 1,0,1, 1,1,1,
        0,0,1, 1,1,1, 0,1,1,
    ];

    const uvs = [
        0,0, 1,1, 1,0,  0,0, 0,1, 1,1,  // front
        0,0, 0,1, 1,1,  0,0, 1,1, 1,0,  // top
        0,0, 1,0, 1,1,  0,0, 1,1, 0,1,  // bottom
        0,0, 1,0, 1,1,  0,0, 1,1, 0,1,  // left
        0,0, 0,1, 1,1,  0,0, 1,1, 1,0,  // right
        0,0, 1,0, 1,1,  0,0, 1,1, 0,1,  // back
    ];

    const normals = [
        0,0,-1, 0,0,-1, 0,0,-1,  0,0,-1, 0,0,-1, 0,0,-1,  // front
        0,1,0,  0,1,0,  0,1,0,   0,1,0,  0,1,0,  0,1,0,   // top
        0,-1,0, 0,-1,0, 0,-1,0,  0,-1,0, 0,-1,0, 0,-1,0,  // bottom
        -1,0,0, -1,0,0, -1,0,0,  -1,0,0, -1,0,0, -1,0,0,  // left
        1,0,0,  1,0,0,  1,0,0,   1,0,0,  1,0,0,  1,0,0,   // right
        0,0,1,  0,0,1,  0,0,1,   0,0,1,  0,0,1,  0,0,1,   // back
    ];

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    this.vertexCount = 36; // 6 faces * 2 triangles * 3 verts
}

render() {
    if (!this.vertexBuffer) this.buildBuffers();

    var rgba = this.color;
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
}
}