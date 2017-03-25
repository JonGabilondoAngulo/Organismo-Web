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
    }

    destroy() {
        if (this._threeScene) {
            this._threeScene.remove( this._threeScreenPlane);
            this._threeScreenPlane = null;
        }
    }

    get screenBoundingBox() {
        return this._threeScreenPlane.geometry.boundingBox;
    }

    get screenSize() {
        return this._deviceScreenSize;
    }

    setScreenSize(width, height) {
        if (this._threeScreenPlane) {
//https://github.com/mrdoob/three.js/issues/1148
        }
    }

    hideScreen() {
        if (this._threeScreenPlane) {
            this._threeScreenPlane.visible = false;
        }
    }

    showScreen() {
        if (this._threeScreenPlane) {
            this._threeScreenPlane.visible = true;
        }
    }
}