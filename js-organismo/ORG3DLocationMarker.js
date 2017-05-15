/**
 * Created by jongabilondo on 15/05/2017.
 */

class ORG3DLocationMarker {

    constructor(point, text, threeScene) {
        this._marker = this.createMarker(point);
        this._point = point;
        this._threeScene = threeScene;
        this._threeScene.add( this._marker );

        this.updateDescriptor(text);
    }

    destructor() {
        if (this._threeScene) {
            if (this._marker) {
                this._threeScene.remove(this._marker);
                this._marker = null;
            }
            this.removeDescriptor();
         }
    }

    createMarker(point) {
        const radiusTop = 50;
        const radiusBottom = 50;
        const height = 20;
        const radialSegments = 30;
        const heightSegments = 8;
        const openEnded = false;
        const cylinderGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);
        var meshMaterial = new THREE.MeshPhongMaterial({ color: 0xee0000 });
        meshMaterial.side = THREE.DoubleSide;
        return THREE.SceneUtils.createMultiMaterialObject(cylinderGeo, [meshMaterial]);
    }

    createDescriptor(text) {
        //var loader = new THREE.FontLoader();
        //const _this = this;
        //loader.load( 'three.js/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

            const textGeom = new THREE.TextGeometry( text, {
                font: ORG.font_helvetiker_regular,
                size: 60,
                height: 5,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 10,
                bevelSize: 8,
                bevelSegments: 5
            } );

            const material = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
            return new THREE.Mesh( textGeom, material );
        //} );
    }

    removeDescriptor() {
        if (this._threeScene && this._descriptor) {
            this._threeScene.remove(this._descriptor);
            this._descriptor = null;
        }

    }

    updateDescriptor(text) {
        if (!this._threeScene) {
            return;
        }
        this.removeDescriptor();
        this._descriptor = this.createDescriptor(text);
        this._threeScene.add( this._descriptor );
    }
}