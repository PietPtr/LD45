
const resources = new ResourceManager();
const resourcePromises = [resources.loadModels(), resources.loadTextures(), resources.loadFonts()];
let world = undefined;


// debug made easier
let loop;


Promise.all(resourcePromises).then(() => {
    world = new World();

    loop = world.gameloops['default']

    world.start();

});
