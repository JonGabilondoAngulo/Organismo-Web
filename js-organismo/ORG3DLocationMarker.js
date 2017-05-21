/**
 * Created by jongabilondo on 15/05/2017.
 */

/**
 * Wrapper class to create and handle the 3D location marker and the 3D description text in the 3D scene.
 */
class ORG3DLocationMarker {

    constructor(anchorPoint, text, threeScene) {
        this._descriptor = null;
        this._marker = null;

        this._anchorPoint = anchorPoint;
        this._threeScene = threeScene;

        this._marker = this._createMarker(this._anchorPoint);
        this._threeScene.add(this._marker);

        this.updateDescriptor(text);
    }

    destructor() {
        this._removeMarker();
        this._removeDescriptor();
    }

    updateDescriptor(text) {
        if (!this._threeScene) {
            return;
        }
        this._removeDescriptor();
        this._descriptor = this._createDescriptor(text);
        this._threeScene.add( this._descriptor );
    }

    setPositionY(y) {
        if (this._marker) {
            this._marker.position.setY(y);
        }
        this._placeDescriptor(this._descriptor);
    }


    //------------
    // PRIVATE
    //-------------

    _createMarker(anchorPoint) {
        const radiusTop = 30;
        const radiusBottom = 30;
        const height = 10;
        const radialSegments = 30;
        const heightSegments = 8;
        const openEnded = false;
        const cylinderGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);
        var meshMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ee });
        meshMaterial.side = THREE.DoubleSide;
        var marker = THREE.SceneUtils.createMultiMaterialObject(cylinderGeo, [meshMaterial]);
        marker.position.setY( anchorPoint.y);
        return marker;
    }

    _createDescriptor(text) {

        const textGeom = new THREE.TextGeometry(text, {
            font: ORG.font_helvetiker_regular,
            size: 40,
            height: 5,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 10,
            bevelSize: 8,
            bevelSegments: 5
        });

        const material = new THREE.MeshPhongMaterial({color: 0xeeeeee});
        const textMesh = new THREE.Mesh(textGeom, material);
        this._placeDescriptor(textMesh);
        return textMesh;
    }

    _removeMarker() {
        if (this._threeScene && this._marker) {
            this._threeScene.remove(this._marker);
            this._marker = null;
        }
    }

    _removeDescriptor() {
        if (this._threeScene && this._descriptor) {
            this._threeScene.remove(this._descriptor);
            this._descriptor = null;
        }
    }

    _placeDescriptor(textMesh) {
        if (this._marker && textMesh) {
            const kTextOffset = 100;

            textMesh.position.set( 0, 0, 0 );
            textMesh.rotation.set( 0, 0, 0 );
            textMesh.updateMatrix();
            textMesh.geometry.computeBoundingBox();

            const centerPoint = textMesh.geometry.boundingBox.getCenter();
            textMesh.geometry.rotateX(THREE.Math.degToRad( -90 ));
            textMesh.geometry.translate( -centerPoint.x, this._marker.position.y, kTextOffset );
        }
    }
}