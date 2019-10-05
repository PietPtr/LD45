

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

        this.exploded = false;
    }

    explode() {
        if (!this.exploded) {
            // world.scene().remove(this.mesh);
            var spriteMap = resources.map('collision.png');
            var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff, overdraw: true, side: THREE.DoubleSide } );
            this.sprite = new THREE.Sprite( spriteMaterial );
            this.sprite.position.copy(this.mesh.position);
            this.sprite.scale.multiplyScalar(10, 10, 10);
            this.exploded = true;
            world.scene().add(this.sprite);

            var geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 0xff6400} );
            var cube = new THREE.Mesh( geometry, material );
            cube.position.copy(this.mesh.position);
            this.explosion = cube;
            world.scene().add( cube );
        }
    }

    onFrame(dt, time, playerPos) {
        let diff = playerPos.clone().sub(this.mesh.position);
        if (diff.length() > 2 && this.mesh.position.z < playerPos.z - 10) {
            this.velocity.copy(diff.normalize());
        }

        let grassMod = 1;

        if (this.mesh.position.x > ROAD_WIDTH/2 || this.mesh.position.x < -ROAD_WIDTH/2) {
            grassMod = GRASS_MODIFIER * 1.1;
        }

        this.mesh.position.add(this.velocity.clone().multiplyScalar(this.speed * dt * grassMod));

        this.mesh.rotation.y = this.velocity.angleTo(new THREE.Vector3(0, 0, 1)) * Math.sign(diff.x);
        if (this.exploded) {
            this.explosion.scale.multiplyScalar(1.5);
            if (this.explosion.scale.x > 1000) {
                this.remove();
            }
        }
    }

    remove() {
        world.scene().remove(this.mesh);
        world.scene().remove(this.explosion);
        let index = world.loop().cops.indexOf(this);
        if (index != -1) {
            world.loop().cops.splice(index, 1);
        }
    }
}
