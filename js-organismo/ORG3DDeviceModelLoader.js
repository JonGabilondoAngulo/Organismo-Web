/**
 * Created by jongabilondo on 22/03/2017.
 */

/**
 * Utilities class to load and show THREE models of different devices.
 */
class ORG3DDeviceModelLoader {

    /**
     * Asynchronous load of a 3D model object for the corresponding device.
     * When load is finished it will call to the organismo scene to add the model to the three.js scene.
     * @param scene the ORG.scene to add the 3D model to.
     */
    static loadDevice3DModel( device, scene, yPosition ) {
        if ( device.productName.startsWith('iPhone 5')) {
            this._load_iPhone_5( scene, device );
        } else if ( device.productName.startsWith('iPhone 6')) {
            this._load_iPhone_6( scene, device );
        }
    }

// PRIVATE

    static _load_iPhone_5( scene, device/*, yPosition*/ ) {
        var loader = new THREE.OBJLoader(  );
        loader.load( "3DModels/iPhone_5/iPhone5.obj", function ( object ) {

            // model loaded, scale and translate
            var deviceBox =  new THREE.Box3().setFromObject( object );
            const scale = device.bodySize.height / deviceBox.getSize().y;
            object.scale.set( scale, scale, scale );
            deviceBox =  new THREE.Box3().setFromObject( object );
            object.position.set( 0, 0/*yPosition*/, - ((deviceBox.getSize().z/2.0) + 0.0005) ); // Place device 0.5mm behind the screen
            scene.addDevice3DModel( new ORG3DDeviceModel( scene.THREEScene, object ) );
        } );
    }

    static _load_iPhone_6( scene, device/*, yPosition*/ ) {
        var loader = new THREE.OBJLoader(  );
        loader.load( "3DModels/iPhone_6/iPhone_6.obj", function ( object ) {

            // model loaded, scale and translate
            var deviceBox =  new THREE.Box3().setFromObject( object );
            const scale = device.bodySize.height / deviceBox.getSize().y;
            object.scale.set( scale, scale, scale );
            deviceBox =  new THREE.Box3().setFromObject( object );
            object.position.set( 0, - deviceBox.getSize().y/2.0, - ((deviceBox.getSize().z/2.0) + 0.0005) ); // Place device 0.5mm behind the screen
            scene.addDevice3DModel( new ORG3DDeviceModel( scene.THREEScene, object ) );

        } );
    }

}
