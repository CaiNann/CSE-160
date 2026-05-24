const _dir = [0, 0, 0];
const _right = [0, 0, 0];

export class Camera {
    constructor() {
        this.eye = [0, 0, 1];
        this.at = [0, 0, -100];
        this.up = [0, 1, 0];
    }

    _calcDir() {
        _dir[0] = this.at[0] - this.eye[0];
        _dir[1] = this.at[1] - this.eye[1];
        _dir[2] = this.at[2] - this.eye[2];
    }

    _calcDirFlat() {
        _dir[0] = this.at[0] - this.eye[0];
        _dir[1] = 0;
        _dir[2] = this.at[2] - this.eye[2];
    }

    _normalizeDir() {
        let len = Math.sqrt(_dir[0]**2 + _dir[1]**2 + _dir[2]**2);
        _dir[0] /= len; _dir[1] /= len; _dir[2] /= len;
    }

    _calcRight() {
        _right[0] = _dir[1]*this.up[2] - _dir[2]*this.up[1];
        _right[1] = _dir[2]*this.up[0] - _dir[0]*this.up[2];
        _right[2] = _dir[0]*this.up[1] - _dir[1]*this.up[0];
    }

    moveForward(map) {
        this._calcDirFlat();
        this._normalizeDir();

        let newX = this.eye[0] + _dir[0] * moveSpeed;
        let newZ = this.eye[2] + _dir[2] * moveSpeed;

        if (this.canMoveTo(newX, newZ, map)) {
            this.eye[0] = newX;  this.at[0] += _dir[0] * moveSpeed;
            this.eye[2] = newZ;  this.at[2] += _dir[2] * moveSpeed;
        }
    }

    moveBack(map) {
        this._calcDirFlat();
        this._normalizeDir();

        let newX = this.eye[0] - _dir[0] * moveSpeed;
        let newZ = this.eye[2] - _dir[2] * moveSpeed;

        if (this.canMoveTo(newX, newZ, map)) {
            this.eye[0] = newX;  this.at[0] -= _dir[0] * moveSpeed;
            this.eye[2] = newZ;  this.at[2] -= _dir[2] * moveSpeed;
        }
    }

    moveLeft(map) {
        this._calcDir();
        this._normalizeDir();
        this._calcRight();

        let newX = this.eye[0] - _right[0] * moveSpeed;
        let newZ = this.eye[2] - _right[2] * moveSpeed;

        if (this.canMoveTo(newX, newZ, map)) {
            this.eye[0] = newX;  this.at[0] -= _right[0] * moveSpeed;
            this.eye[2] = newZ;  this.at[2] -= _right[2] * moveSpeed;
        }
    }

    moveRight(map) {
        this._calcDir();
        this._normalizeDir();
        this._calcRight();

        let newX = this.eye[0] + _right[0] * moveSpeed;
        let newZ = this.eye[2] + _right[2] * moveSpeed;

        if (this.canMoveTo(newX, newZ, map)) {
            this.eye[0] = newX;  this.at[0] += _right[0] * moveSpeed;
            this.eye[2] = newZ;  this.at[2] += _right[2] * moveSpeed;
        }
    }

    lookLeft() {
        this._calcDir();
        let rotY = new Matrix4();
        rotY.setRotate(2, 0, 1, 0);
        let newDir = rotY.multiplyVector3(new Vector3(_dir));
        this.at[0] = this.eye[0] + newDir.elements[0];
        this.at[1] = this.eye[1] + newDir.elements[1];
        this.at[2] = this.eye[2] + newDir.elements[2];
    }

    lookRight() {
        this._calcDir();
        let rotY = new Matrix4();
        rotY.setRotate(-2, 0, 1, 0);
        let newDir = rotY.multiplyVector3(new Vector3(_dir));
        this.at[0] = this.eye[0] + newDir.elements[0];
        this.at[1] = this.eye[1] + newDir.elements[1];
        this.at[2] = this.eye[2] + newDir.elements[2];
    }

    mouseControl(e) {
        // Horizontal
        this._calcDir();
        let rotY = new Matrix4();
        rotY.setRotate(-e.movementX * 0.3, 0, 1, 0);
        let newDir = rotY.multiplyVector3(new Vector3([_dir[0], _dir[1], _dir[2]]));
        this.at[0] = this.eye[0] + newDir.elements[0];
        this.at[1] = this.eye[1] + newDir.elements[1];
        this.at[2] = this.eye[2] + newDir.elements[2];

        // Vertical
        this._calcDir();
        this._calcRight();
        let rotX = new Matrix4();
        rotX.setRotate(-e.movementY * 0.3, _right[0], _right[1], _right[2]);
        let newDir2 = rotX.multiplyVector3(new Vector3([_dir[0], _dir[1], _dir[2]]));
        this.at[0] = this.eye[0] + newDir2.elements[0];
        this.at[1] = this.eye[1] + newDir2.elements[1];
        this.at[2] = this.eye[2] + newDir2.elements[2];
    }

    getForwardDir() {
        this._calcDir();
        this._normalizeDir();
        return [_dir[0], _dir[1], _dir[2]];
    }

    canMoveTo(x, z, map) {
        let half = map.size / 2;
        let buffer = 0.15;

        let corners = [
            [x + buffer, z + buffer],
            [x + buffer, z - buffer],
            [x - buffer, z + buffer],
            [x - buffer, z - buffer],
        ];

        for (let [cx, cz] of corners) {
            let mx = Math.floor(cx + half);
            let mz = Math.floor(cz + half);
            if (mx < 0 || mx >= map.size || mz < 0 || mz >= map.size) return false;
            if (map.grid[mx][mz] !== 0) return false;
        }

        return true;
    }

    deleteBlock(map) {
        let dir = this.getForwardDir();
        let half = map.size / 2;
        let x = Math.floor(this.eye[0] + dir[0] + half);
        let z = Math.floor(this.eye[2] + dir[2] + half);
        if (x < 0 || x >= map.size || z < 0 || z >= map.size) return;
        if (map.grid[x][z] > 0) map.grid[x][z] -= 1;
        map.dirty = true;
    }

    placeBlock(map) {
        let dir = this.getForwardDir();
        let half = map.size / 2;
        let x = Math.floor(this.eye[0] + dir[0] + half);
        let z = Math.floor(this.eye[2] + dir[2] + half);
        if (x < 0 || x >= map.size || z < 0 || z >= map.size) return;
        map.grid[x][z] += 1;
        map.dirty = true;
    }
}