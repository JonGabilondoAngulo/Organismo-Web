/**
 * Created by jongabilondo on 22/03/2017.
 */


class ORG3DDeviceModelLoader {

    /**
     * Asynchronous load of a 3D model object for the corresponding device.
     * When load is finished it will call to the organismo scene to add the model to the three.js scene.
     * @param scene the ORG.scene to add the 3D model to.
     */
    static loadDevice3DModel( device, scene ) {
        if ( device.productName.startsWith('iPhone 5')) {
            this._load_iPhone_5( scene );
        } else if ( device.productName.startsWith('iPhone 6')) {
            this._load_iPhone_6( scene );
        }
    }

// PRIVATE

    static _load_iPhone_6( scene ) {
        var loader = new THREE.OBJLoader(  );
        loader.load( "3DModels/iPhone/iPhone_6.obj", function ( object ) {
            object.position.set(0,-480,-24);
            object.scale.set(124,124,124);
            scene.addDevice3DModel( new ORG3DDeviceModel(object) );
        } );
    }

    static _load_iPhone_5( scene ) {
        var loader = new THREE.OBJLoader(  );
        loader.load( "3DModels/iPhone_5/iPhone5.obj", function ( object ) {
            object.scale.set(0.8,0.8,0.8);
            object.position.set(0,0,-28);
            scene.addDevice3DModel( new ORG3DDeviceModel(object) );
        } );
    }
}
