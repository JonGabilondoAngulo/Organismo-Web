/**
 * Created by jongabilondo on 22/03/2017.
 */


/**
 * Class to wrapp the actions on the THREE model of the floor in the scene.
 */
class ORG3DSceneFloor {

    constructor(size, step, showAxis, threeScene, defaultYPos) {

        this._threeScene = threeScene;
        this._yPos = defaultYPos;

        if (showAxis) {
            this._threeAxis = new THREE.AxisHelper(650);
            this._threeAxis.position.set(-size/2, this._yPos,-size/2);
            this._threeScene.add(this._threeAxis);
        }

        this._threeFloor = new THREE.GridHelper(size, step, new THREE.Color(0x666666), new THREE.Color(0x666666));
        this._threeFloor.position.set( 0, this._yPos, 0 );
        this._threeScene.add(this._threeFloor);
    }

    get position() {
        return this._threeFloor.position;
    }

    remove() {
        if (this._threeFloor) {
            this._threeScene.remove(this._threeFloor);
            this._threeFloor = null;
        }

        if (this._threeAxis) {
            this._threeScene.remove(this._threeAxis);
            this._threeAxis = null;
        }
    }

    setPosition( x, y, z) {
        if (this._threeFloor) {
            this._threeFloor.position.setY(y);
        }
        if (this._threeAxis) {
            this._threeAxis.position.setY(y);
        }
    }
}