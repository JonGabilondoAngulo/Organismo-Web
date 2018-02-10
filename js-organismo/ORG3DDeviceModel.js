/**
 * Created by jongabilondo on 22/03/2017.
 */


/**
 * Class to keep the THREE model of the device and to wrap the actions on it.
 * It contains only the body of the device, not the display.
 */
class ORG3DDeviceModel {

    /**
     * Constructor
     * @param threeObj - A THREE.Group representing the Device.
     */
    constructor( scene, threeObj ) {
        this.threeObj = threeObj; // It is a THREE.Group. Don't have geometry to compute bbox.
        this.threeScene = scene;
    }


    /**
     * Removes the object from the 3D scene and disposes the object.
     */
    destroy() {
        this.removeFromScene();
        this.threeObj = null;
    }

    get THREEObject() {
        return this.threeObj;
    }

    removeFromScene() {
        if (this.threeScene && this.threeObj) {
            this.threeScene.remove( this.threeObj);
        }
    }

    setOrientation( orientation ) {
        if (!this.threeObj) {
            return;
        }

        var b = new THREE.Box3().setFromObject(this.threeObj);
        var position = b.getCenter();
        this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( -position.x, -position.y, -position.z ) );

        switch(orientation) {
            case "portrait" :
                var rotation = this.threeObj.rotation;
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( -rotation.z ));
                break;
            case "landscapeLeft" :
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( THREE.Math.degToRad( -90 ) ));
                break;
            case "landscapeRight" :
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( THREE.Math.degToRad( 90 ) ));
                break;
        }
        this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( position.x, position.y, -position.z ) );
    }

    setOrientation2(orientation) {
        if (!this.threeObj) {
            return;
        }

        //const positionBackup = this.threeObj.position.clone();
        //this.threeObj.position.set(positionBackup.x, positionBackup.y, -positionBackup.z);
        //
        /*switch (orientation) {
            case ORGDevice.ORIENTATION_PORTRAIT: {
                this.threeObj.rotation.set(0, 0, 0);
            } break;
            case ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN: {
                this.threeObj.rotation.set(0, 0, THREE.Math.degToRad(180));
            } break;
            case ORGDevice.ORIENTATION_LANDSCAPE_RIGHT: {
                this.threeObj.rotation.set(0, 0, THREE.Math.degToRad(-90));
            } break;
            case ORGDevice.ORIENTATION_LANDSCAPE_LEFT:
                this.threeObj.rotation.set(0, 0, THREE.Math.degToRad(90));
                break;
        }*/
        //this.threeObj.position.copy(positionBackup);


        // Make the rotation at 0, 0, 0.
        //const b = new THREE.Box3().setFromObject(this.threeObj);
        //const position = b.getCenter();
        ////this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( -position.x, -position.y, -position.z ) );
        //

        var rotation = this.threeObj.rotation;
        this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ(-rotation.z));

        switch (orientation) {
            case ORGDevice.ORIENTATION_PORTRAIT: {
                //var rotation = this.threeObj.rotation;
                //this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ(-rotation.z));
            } break;
            case ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN: {
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(180)));
            } break;
            case ORGDevice.ORIENTATION_LANDSCAPE_RIGHT: {
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(-90)));
            } break;
            case ORGDevice.ORIENTATION_LANDSCAPE_LEFT:
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( THREE.Math.degToRad(90)));
                break;
        }
        //this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( position.x, position.y, position.z ) );
    }

    getBoundingBox() {
        return new THREE.Box3().setFromObject(this.threeObj);
    }

}