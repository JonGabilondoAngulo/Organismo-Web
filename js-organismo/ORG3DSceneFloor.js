/**
 * Created by jongabilondo on 22/03/2017.
 */


/**
 * Class to represent the floor the THREE scene model.
 */
class ORG3DSceneFloor {

    constructor(size, step, showAxis, threeScene, defaultYPos) {

        this._THREEScene = threeScene;
        this._yPos = defaultYPos;

        if (showAxis) {
            this._THREEAxis = new THREE.AxisHelper(10);
            this._THREEAxis.position.set(-size/2, this._yPos,-size/2);
            this._THREEScene.add(this._THREEAxis);
        }

        this._THREEFloor = new THREE.GridHelper(size, step, new THREE.Color(0x666666), new THREE.Color(0x666666));
        this._THREEFloor.position.set( 0, this._yPos, 0 );
        this._THREEScene.add(this._THREEFloor);

        this._createXArrow(size);
        this._createXLabel(size);
    }

    get position() {
        return this._THREEFloor.position;
    }

    remove() {
        if (this._THREEFloor) {
            this._THREEScene.remove(this._THREEFloor);
            this._THREEFloor = null;
        }

        if (this._THREEAxis) {
            this._THREEScene.remove(this._THREEAxis);
            this._THREEAxis = null;
        }
    }

    setPosition( x, y, z) {
        if (this._THREEFloor) {
            this._THREEFloor.position.setY(y);
        }
        if (this._THREEAxis) {
            this._THREEAxis.position.setY(y);
        }
    }

    // PRIVATE

    _createXArrow(floorSize) {
        const zOffset = 80;
        const origin = new THREE.Vector3( -floorSize/2, 0, floorSize/2 + zOffset);
        const length = floorSize;
        const color = 0xffff00;
        var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), origin, length, color, length*0.03 );
        arrowHelper.position.setY(this._yPos);
        this._THREEScene.add( arrowHelper );
    }

    _createXLabel(floorSize) {

        const addressGeom = new THREE.TextGeometry(floorSize.toString() + " m", {
            font: ORG.font_helvetiker_regular,
            size: 60,
            height: 5,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 10,
            bevelSize: 8,
            bevelSegments: 5
        });

        const material = new THREE.MeshPhongMaterial({color: 0xeeeeee});
        var textMesh = new THREE.Mesh(addressGeom, material);
        textMesh.position.set( 0, 0, 0 );
        textMesh.rotation.set( THREE.Math.degToRad( -90 ), 0, 0 );
        textMesh.updateMatrix();
        textMesh.geometry.computeBoundingBox();
        const centerPoint = textMesh.geometry.boundingBox.getCenter();
        textMesh.position.set( -centerPoint.x, this._yPos, floorSize/2 + 70 );

        this._THREEScene.add( textMesh );
    }
}