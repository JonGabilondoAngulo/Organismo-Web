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
        this._sprite = null;
        this._controlMoving = false;

        this._THREETransformControl = new THREE.TransformControls( scene.THREECamera, scene.rendererDOMElement);
        this._THREETransformControl.setMode( mode );
        this._THREETransformControl.setSpace('local');
        this._THREETransformControl.addEventListener('change', () => {
            _this._transformControlChange();
        });
        this._THREETransformControl.addEventListener('mouseUp', () => {
            _this._transformControlEnd();
        });
        this._THREETransformControl.addEventListener('mouseDown', () => {
            _this._transformControlBegin();
        });

        // add it all to the scene
        this._THREETransformControl.attach(this._scene.THREEDeviceAndScreenGroup);
        this._THREEScene.add( this._THREETransformControl );
    }

    /**
     * Call this method to destroy the transform control.
     */
    destroy() {
        this._removeTextSprite();

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

    _transformControlBegin() {
        this._controlMoving = true;
    }

    _transformControlEnd() {
        this._removeTextSprite();
        this._controlMoving = false;
    }

    /**
     * When the transformation control has changed we get a call here.
     * In case of rotation this function will broadcast the new device attitude to the connected device.
     * @private
     */
    _transformControlChange() {
        if (!this._controlMoving) {
            return;
        }
        if (!this._THREETransformControl) {
            return;
        }
        const THREETransformedObject = this._THREETransformControl.object;
        if (THREETransformedObject) {
            if (this._THREETransformControl.getMode() == "rotate") {

                // Broadcast Attitude
                if (ORG.deviceController) {
                    ORG.deviceController.sendDeviceAttitudeUpdate(ORGMessageBuilder.attitudeUpdate(THREETransformedObject.quaternion));
                }

            } else if (this._THREETransformControl.getMode() == "translate") {
                ORG.scenario.devicePointUpdate(THREETransformedObject.position);
                this._showPositionSprite(THREETransformedObject.position);
            }
        }
    }

    _showPositionSprite(position) {
        this._removeTextSprite();
        this._sprite = this._createaSpriteModel("X: " + position.x.toFixed(2) + "m\nY: " + position.y.toFixed(2) + "m\nZ: " + position.z.toFixed(2) + "m", position);
        this._THREEScene.add(this._sprite);
    }

    _createaSpriteModel(text, position) {
        let texture = new THREE.TextTexture({
            text: text,
            fontStyle: 'italic',
            textAlign: 'left',
            fontSize: 32,
            fontFamily: '"Times New Roman", Times, serif',
        });
        let material = new THREE.SpriteMaterial({map: texture, color: 0xffffbb});
        let sprite = new THREE.Sprite(material);
        sprite.position.set(position.x + 0.06, position.y + 0.07, position.z);
        sprite.scale.setX(texture.aspect).multiplyScalar(0.05);
        return sprite;
    }

    _removeTextSprite() {
        if (this._sprite && this._THREEScene) {
            this._THREEScene.remove(this._sprite);
            this._sprite = null;
        }
    }
}