import { Cube } from './Cube.js';

function pushFace(vertices, uvs, a, b, c, d) {
    vertices.push(...a, ...b, ...c, ...a, ...c, ...d);
    uvs.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
}

export class GameMap {
    constructor(size = 32) {
        this.size = size;
        this.grid = this.generateMaze();
        this.eucalyptus = [];
        this.vertexBuffer = null;
        this.uvBuffer = null;
        this.vertexCount = 0;
        this.dirty = true;
        this.spawnEucalyptus(10);
    }

    spawnEucalyptus(count) {
        let half = this.size / 2;
        let placed = 0;
        while (placed < count) {
            let x = Math.floor(Math.random() * this.size);
            let z = Math.floor(Math.random() * this.size);
            // only place in empty cells, not at spawn
            if (this.grid[x][z] === 0 && !(x === half && z === half)) {
                this.eucalyptus.push({ x, z });
                placed++;
            }
        }
    }

    collectEucalyptus(camera) {
        let half = this.size / 2;
        let before = this.eucalyptus.length;
    
        let cx = Math.floor(camera.eye[0] + half);
        let cz = Math.floor(camera.eye[2] + half);
    
        this.eucalyptus = this.eucalyptus.filter(e => {
            let dx = e.x - cx;
            let dz = e.z - cz;
            return Math.sqrt(dx*dx + dz*dz) > 1;
        });
    
        // update HUD if something was collected
        if (this.eucalyptus.length !== before && this.eucalyptus.length > 4) {
            let collected = 5 - (this.eucalyptus.length - 5);
            document.getElementById('hud').innerText = `Eucalyptus: ${collected} / 5 (F to pick up)`;
    
            if (this.eucalyptus.length === 5) {
                document.getElementById('hud').innerText = `All collected! Return to the koala!`;
            }
        }
    }

    checkWin(camera) {
        if (this.eucalyptus.length > 5) return;
    
        // check if near center spawn
        let dx = camera.eye[0];
        let dz = camera.eye[2];
        let dist = Math.sqrt(dx*dx + dz*dz);
    
        if (dist < 2) {
            document.getElementById('hud').innerText = `You win! The koala is happy!`;
        }
    }

    drawEucalyptus() {
        let half = this.size / 2;
        for (let e of this.eucalyptus) {
            let wx = e.x - half + 0.5;
            let wz = e.z - half + 0.5;

            // draw as two crossed quads
            var leaf = new Cube();
            leaf.color = [0.2, 0.6, 0.1, 1.0];
            leaf.textureNum = -2;
            leaf.matrix.setTranslate(wx, -0.25, wz);
            leaf.matrix.scale(0.1, 1.0, 1.0);
            leaf.render();

            var leaf2 = new Cube();
            leaf2.color = [0.2, 0.6, 0.1, 1.0];
            leaf2.textureNum = -2;
            leaf2.matrix.setTranslate(wx, -0.25, wz);
            leaf2.matrix.rotate(90, 0, 1, 0);
            leaf2.matrix.scale(0.1, 1.0, 1.0);
            leaf2.render();
        }
    }

    generateMaze() {
        let grid = [];
        for (let x = 0; x < this.size; x++) {
            grid[x] = [];
            for (let z = 0; z < this.size; z++) {
                grid[x][z] = 3;
            }
        }

        function carve(x, z) {
            const dirs = [[0,2],[0,-2],[2,0],[-2,0]];
            dirs.sort(() => Math.random() - 0.5);
            for (let [dx, dz] of dirs) {
                let nx = x + dx;
                let nz = z + dz;
                if (nx < 1 || nx >= 31 || nz < 1 || nz >= 31) continue;
                if (grid[nx][nz] === 3) {
                    grid[x + dx/2][z + dz/2] = 0;
                    grid[nx][nz] = 0;
                    carve(nx, nz);
                }
            }
        }

        grid[1][1] = 0;
        carve(1, 1);

        // clear center spawn
        let c = Math.floor(this.size / 2);
        for (let x = c-1; x <= c+1; x++)
            for (let z = c-1; z <= c+1; z++)
                grid[x][z] = 0;

        return grid;
    }

    getBlock(x, z) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size) return -1;
        return this.grid[x][z];
    }

    setBlock(x, z, val) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size) return;
        this.grid[x][z] = val;
        this.dirty = true;
    }

    placeBlock(camera) {
        let [x, z] = this.getCameraBlock(camera);
        this.setBlock(x, z, this.getBlock(x, z) + 1);
    }

    deleteBlock(camera) {
        let [x, z] = this.getCameraBlock(camera);
        if (this.getBlock(x, z) > 0) this.setBlock(x, z, this.getBlock(x, z) - 1);
    }

    getCameraBlock(camera) {
        let dir = camera.getForwardDir();
        let half = this.size / 2;
        let x = Math.floor(camera.eye[0] + dir[0] * 1 + half);
        let z = Math.floor(camera.eye[2] + dir[2] * 1 + half);
        return [x, z];
    }

    buildBuffers() {
        let half = this.size / 2;
        let vertices = [];
        let uvs = [];

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                let height = this.grid[x][z];
                if (height >= 1) {
                    for (let y = 0; y < height; y++) {
                        let x0 = x - half, x1 = x0 + 1;
                        let z0 = z - half, z1 = z0 + 1;
                        let y0 = -0.75 + y * 0.5;
                        let y1 = y0 + 0.5;
        
                        pushFace(vertices, uvs,
                            [x0,y0,z0], [x1,y0,z0], [x1,y1,z0], [x0,y1,z0]);
                        pushFace(vertices, uvs,
                            [x1,y0,z1], [x0,y0,z1], [x0,y1,z1], [x1,y1,z1]);
                        pushFace(vertices, uvs,
                            [x0,y0,z1], [x0,y0,z0], [x0,y1,z0], [x0,y1,z1]);
                        pushFace(vertices, uvs,
                            [x1,y0,z0], [x1,y0,z1], [x1,y1,z1], [x1,y1,z0]);
                        pushFace(vertices, uvs,
                            [x0,y1,z0], [x1,y1,z0], [x1,y1,z1], [x0,y1,z1]);
                        pushFace(vertices, uvs,
                            [x0,y0,z1], [x1,y0,z1], [x1,y0,z0], [x0,y0,z0]);
                    }
                }
            }
        }

        this.vertexCount = vertices.length / 3;

        // upload to GPU once
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

        this.dirty = false;
    }

    draw() {
        if (this.dirty) this.buildBuffers();

        // bind vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // bind uv buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.uniform1i(u_whichTexture, 2);
        gl.uniformMatrix4fv(u_ModelMatrix, false, new Matrix4().elements); // identity
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }
}