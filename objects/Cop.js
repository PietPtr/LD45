

class Cop {
    constructor(player) {
        this.mesh = resources.mesh('cop');
        let playerpos = player.group.position.clone();
        this.mesh.position.set(Math.random() * (ROAD_WIDTH * 0.9), playerpos.y, playerpos.z - 50);
        world.scene().add(this.mesh);

        this.rotaccel = 0;
        this.rotrate = 0;
        this.rotation = 0;

        this.acceleration = 0.13;
        this.speed = player.speed + 10;
        this.velocity = new THREE.Vector3(0, 0, 1);
    }

    onFrame(dt, time, playerPos) {
        // let heading = new THREE.Vector3(0, 0, 0.01).applyAxisAngle(UP, this.rotation);
        // let diff = heading.clone().add(this.velocity.clone()).normalize();
        // this.velocity.add(diff).normalize();

        // let playerPos = world.loop().player.group.position.clone();
        let diff = playerPos.clone().sub(this.mesh.position);
        if (diff.length() > 2 && this.mesh.position.z < playerPos.z - 10) {
            this.velocity.copy(diff.normalize());
        } else {
            // this.velocity.set(0, 0, 1);
        }

        this.mesh.position.add(this.velocity.clone().multiplyScalar(this.speed * dt));
        //
        // const ROT_ACCEL = 6;
        // const FRICTION = 3;
        // let xdiff = Math.sign(world.loop().player.group.position.clone().sub(this.mesh.position).x);
        // this.rotaccel = xdiff > 5 ? Math.sign(xdiff) : 0;
        // this.rotrate += this.rotaccel * dt;
        // this.rotrate -= (this.rotrate / 3) * FRICTION * dt;
        // this.rotation += this.rotrate * dt;

        this.mesh.rotation.y = this.velocity.angleTo(new THREE.Vector3(0, 0, 1)) * Math.sign(diff.x);
    }
}
