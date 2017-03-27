/**
 * Created by jongabilondo on 25/03/2017.
 */


class ORG3DDeviceScreen {

    constructor(width, height, zPosition, threeScene) {
        var geometry,material;

        this._deviceScreenSize = { width:width, height:height};
        this._threeScene = threeScene;

        geometry = new THREE.PlaneBufferGeometry( width, height, 1, 1);
        geometry.dynamic = true;
        material = new THREE.MeshBasicMaterial({ map : null , color: 0xffffff, side: THREE.DoubleSide});
        //material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, map : null});
        //material = new THREE.MeshBasicMaterial( {color: 0x000000, map : null});
        this._threeScreenPlane = new THREE.Mesh( geometry, material );
        this._threeScreenPlane.position.set( 0 , 0, zPosition);
        this._threeScreenPlane.name = "screen";
        threeScene.add( this._threeScreenPlane);
        this._threeScreenPlane.geometry.computeBoundingBox ();
    }

    destroy() {
        if (this._threeScene && this._threeScreenPlane) {
            this._threeScene.remove( this._threeScreenPlane);
            this._threeScreenPlane = null;
        }
    }

    get scenePlane() {
        return this._threeScreenPlane;
    }

    get boundingBox() {
        return this._threeScreenPlane.geometry.boundingBox;
    }

    get screenSize() {
        return this._deviceScreenSize;
    }

    hide() {
        if (this._threeScreenPlane) {
            this._threeScreenPlane.visible = false;
        }
    }

    show() {
        if (this._threeScreenPlane) {
            this._threeScreenPlane.visible = true;
        }
    }

    setScreenshot(image) {
        var screenshotTexture = new THREE.Texture( image );
        screenshotTexture.minFilter = THREE.NearestFilter;
        var thisScreen = this;
        image.onload = function () {
            screenshotTexture.needsUpdate = true;
            thisScreen._threeScreenPlane.material.map = screenshotTexture;
            thisScreen._threeScreenPlane.material.needsUpdate = true;
            thisScreen._threeScreenPlane.needsUpdate = true;
        };
    }
}