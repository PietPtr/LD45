
const resources = new ResourceManager();
const resourcePromises = [resources.loadModels(), resources.loadTextures(), resources.loadFonts()];
let world = undefined;
var riskySound;

Promise.all(resourcePromises).then(() => {
    world = new World();
    world.start();

    let startsound = () => {
        world.loop().listener = new THREE.AudioListener();
        world.loop().camera.add( world.loop().listener );

        world.loop().startSound = new THREE.Audio( world.loop().listener );

        var audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'resources/music/start.mp3', ( buffer ) => {
        	world.loop().startSound.setBuffer( buffer );
        	world.loop().startSound.setLoop( false );
        	world.loop().startSound.setVolume( 1 );
            world.loop().startSound.play();
        });

        riskySound = new THREE.Audio(world.loop().listener);
        audioLoader.load('resources/music/riskystuff.mp3', function(buffer) {
            riskySound.setBuffer(buffer);
        })


        world.loop().gamestate = 'Going';
        world.loop().player.startChase = new Date();
        document.getElementById('startscreen').style.display = 'none';
        window.removeEventListener('mousedown', startsound);
    };

    window.addEventListener('mousedown', startsound);
});
