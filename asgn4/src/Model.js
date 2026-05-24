export class Model {
    constructor() {
        this.vertices = [];
        this.normals = [];
        this.textureNum = -2;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.vertexCount = 0;
    }

    async loadOBJ(path) {
        const response = await fetch(path);
        const text = await response.text();
        this.parseOBJ(text);
    }

    parseOBJ(text) {
        const posArr = [];
        const normArr = [];
        const verts = [];
        const normals = [];

        for (const line of text.split('\n')) {
            const parts = line.trim().split(/\s+/);
            if (parts[0] === 'v') {
                posArr.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (parts[0] === 'vn') {
                normArr.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (parts[0] === 'f') {
                // triangulate by fanning from first vertex
                for (let i = 1; i <= parts.length - 3; i++) {
                    const tri = [parts[1], parts[i + 1], parts[i + 2]];
                    for (const part of tri) {
                        const indices = part.split('/');
                        const vi = parseInt(indices[0]) - 1;
                        const ni = parseInt(indices[2]) - 1;
                        verts.push(...posArr[vi]);
                        if (normArr.length > 0 && !isNaN(ni) && normArr[ni]) {
                            normals.push(...normArr[ni]);
                        } else {
                            normals.push(0, 1, 0); // default up normal as fallback
                        }
                    }
                }
            }
            //console.log('first few verts:', posArr.slice(0, 5));
            //console.log('total verts:', posArr.length);
        }

        this.vertexCount = verts.length / 3;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

        if (normals.length > 0) {
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        }
    }

    render() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        if (this.normalBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Normal);
        } else {
            gl.disableVertexAttribArray(a_Normal);
        }

        gl.disableVertexAttribArray(a_UV);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
        gl.enableVertexAttribArray(a_UV);
    }
}