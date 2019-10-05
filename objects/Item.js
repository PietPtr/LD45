

class Item {
    constructor(type, z) {
        let x = (Math.random()-0.5) * ROAD_WIDTH * 0.9;

        var geometry = new THREE.PlaneGeometry( 0.3, 20, 32 );
        geometry.rotateX(0.5 * Math.PI);
        var material = new THREE.MeshBasicMaterial( {color: 0x545454, side: THREE.DoubleSide} );
        this.plane = new THREE.Mesh( geometry, material );
        this.plane.position.set(x, 0.1, z);
        world.scene().add( this.plane );

        this.type = type;
        this.mesh = resources.mesh(type);
        this.mesh.position.set(0, 3, 10);

        this.plane.add(this.mesh);
    }

    onFrame(dt, now) {
        this.mesh.rotation.y = Math.sin(now);
        this.mesh.position.y = Math.sin(now / 2) * 0.5 + 1;
    }

    collides(point) {
        return point.distanceTo(this.plane.position.clone().add(new THREE.Vector3(0, 0, 10))) < 3;
    }
}
