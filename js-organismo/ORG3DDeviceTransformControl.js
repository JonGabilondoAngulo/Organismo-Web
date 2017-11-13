/**
 * Created by jongabilondo on 24/09/2017.
 */


/**
 * Class to wrap the functionality of THREE.TransformControls on the 3D device.
 */
class ORG3DDeviceTransformControl {

    /**
     * Constructor
     * @param scene - The ORG3DScene
     * @param mode - "translate" | "rotate"
     */
    constructor(scene, mode) {
        const _this = this;
        this._scene = scene;
        this._THREEScene = scene.THREEScene;

        this._THREETransformControl = new THREE.TransformControls( scene.THREECamera, scene.rendererDOMElement);
        this._THREETransformControl.setMode( mode );
        this._THREETransformControl.setSpace( 'local' );
        this._THREETransformControl.addEventListener( 'change', function() {
            _this._transformControlChanged();
        } );

        // add it all to the scene
        this._THREETransformControl.attach( this._scene.THREEDeviceAndScreenGroup );
        this._THREEScene.add( this._THREETransformControl );
    }

    /**
     * Call this method to destroy the transform control.
     */
    destroy() {

        //var screenPosition = this._scene.deviceScreen.screenPlane.position;
        //var devicePosition = this._scene.device3DModel.THREEObject.position;
        //var quaternion = this._scene.deviceScreen.screenPlane.quaternion;

        if (this._THREETransformControl) {
            this._THREETransformControl.detach();
            this._THREETransformControl = null;
            this._THREEScene.remove(this._THREETransformControl);
        }
    }

    /**
     * Updates the proportions of the transform control according to camera position.
     * To be called from render loop.
     */
    update() {
        this._THREETransformControl.update();
    }

    // PRIVATE

    /**
     * When the transformation control has changed we get a call here.
     * In case of rotation this function will broadcast the new device attitude to the connected device.
     * @private
     */
    _transformControlChanged() {
        if (this._THREETransformControl) {
            const THREETransformedObject = this._THREETransformControl.object;
            if (THREETransformedObject) {
                    if (this._THREETransformControl.getMode() == "rotate") {

                        // Broadcast Attitude
                        if (ORG.deviceController) {
                            const msg = ORGMessageBuilder.attitudeUpdate(THREETransformedObject.quaternion);
                            ORG.deviceController.sendMessage(msg);
                        }

                    } else if (this._THREETransformControl.getMode() == "translate") {
                        // handle beacons intersection
                        ORG.scenario.devicePointUpdate(THREETransformedObject.position);
                    }
            }
        }
    }
}