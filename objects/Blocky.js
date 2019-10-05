

class Blocky {
    constructor() {
        var geometry = new THREE.BoxGeometry(10, 10, 10);
        var material = new THREE.MeshPhongMaterial( {color: 0xffffff, flatShading: true} );
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 30, 0);

        this.velocity = new THREE.Vector3(0, -20, 0);
        this.previousdt;
    }

    onFrame(dt, now, gamestate) {
        this.previousdt = dt; // used in events to get an idea of what the dt usually is
    }

    walk(direction, maxSpeed) {
        let dt = this.previousdt;

        if (direction.x != 0) {
            this.velocity.x = Math.min(maxSpeed, Math.abs(this.velocity.x) + dt * WALK_ACC) * Math.sign(direction.x);
        }
        if (direction.y != 0) {
            this.velocity.y = Math.min(maxSpeed, Math.abs(this.velocity.y) + dt * WALK_ACC) * Math.sign(direction.y);
        }
        if (direction.z != 0) {
            this.velocity.z = Math.min(maxSpeed, Math.abs(this.velocity.z) + dt * WALK_ACC) * Math.sign(direction.z);
        }
    }

    updatePos(dt) {
        this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));
        // console.log(this.velocity);
    }
}
