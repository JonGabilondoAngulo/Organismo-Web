/**
 * Created by jongabilondo on 22/03/2017.
 */


class ORG3DDeviceModel {

    constructor( threeObj ) {
        this.threeObj = threeObj; // It is a THREE.Group. Don't have geometry to compute bbox.
        this.threeScene = null;
    }

    addToScene( threeScene) {
        this.threeScene = threeScene;
        if (this.threeObj) {
            this.threeScene.add( this.threeObj);
        }
    }

    removeFromScene() {
        if (this.threeScene && this.threeObj) {
            this.threeScene.remove( this.threeObj);
        }
    }

    destroy() {
        this.removeFromScene();
        this.threeObj = null;
    }

    setOrientation( orientation ) {
        if (!this.threeObj) {
            return;
        }

        switch(orientation) {
            case "portrait" :
                var rotation = this.threeObj.rotation;
                var b = new THREE.Box3().setFromObject(this.threeObj);
                var position = b.getCenter();
                this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( -position.x, -position.y, -position.z ) );
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( -rotation.z ));
                this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( position.x, position.y, position.z ) );
                break;
            case "landscapeLeft" :
                var b = new THREE.Box3().setFromObject(this.threeObj);
                var position = b.getCenter();
                this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( -position.x, -position.y, -position.z ) );
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( THREE.Math.degToRad( -90 ) ));
                this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( position.x, position.y, position.z ) );
                break;
            case "landscapeRight" :
                var b = new THREE.Box3().setFromObject(this.threeObj);
                var position = b.getCenter();
                this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( -position.x, -position.y, -position.z ) );
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( THREE.Math.degToRad( 90 ) ));
                this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( position.x, position.y, position.z ) );
                break;
        }
    }

    getBoundingBox() {
        return new THREE.Box3().setFromObject(this.threeObj);
    }

}