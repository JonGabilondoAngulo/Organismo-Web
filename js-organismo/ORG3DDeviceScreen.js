/**
 * Created by jongabilondo on 25/03/2017.
 */


/**
 * Class to create and handle the THREE object of the device screen.
 */
class ORG3DDeviceScreen {

    constructor(width, height, yPosition, zPosition, threeScene) {
        this._removeHighlight = false;
        this._nextHighlightPlane = null;
        this._currentHighlightPlane = null;
        this._threeScreenPlane = null;
        this._nextScreenshotImage = null;

        this._deviceScreenSize = { width:width, height:height};
        this._THREEScene = threeScene;

        var geometry = new THREE.PlaneBufferGeometry(width, height, 1, 1);
        geometry.dynamic = true;
        var material = new THREE.MeshBasicMaterial({ map : null , color: 0xffffff, side: THREE.DoubleSide});
        this._threeScreenPlane = new THREE.Mesh(geometry, material );
        this._threeScreenPlane.position.set(0 , yPosition, zPosition );
        this._threeScreenPlane.name = "screen";
        threeScene.add( this._threeScreenPlane );
        this._threeScreenPlane.geometry.computeBoundingBox ();
    }

    destroy() {
        if (!this._THREEScene) {
            return;
        }
        if (this._threeScreenPlane) {
            this._THREEScene.remove(this._threeScreenPlane);
        }
        if (this._currentHighlightPlane) {
            this._THREEScene.remove(this._currentHighlightPlane);
        }
        this._threeScreenPlane = null;
        this._nextHighlightPlane = null;
        this._currentHighlightPlane = null;
    }

    get screenPlane() {
        return this._threeScreenPlane;
    }

    get boundingBox() {
        return this._threeScreenPlane.geometry.boundingBox;
    }

    get screenSize() {
        return this._deviceScreenSize;
    }

    get screenPosition() {
        return this._threeScreenPlane.position; // The screen is created at 0,0 then applied a transformation matrix. This position is not the world position.
    }

    get screenWorldPosition() {
        //return this._threeScreenPlane.matrixWorld.getPosition();
        var position = this.screenPosition.clone();
        position.setFromMatrixPosition(this._threeScreenPlane.matrixWorld);
        return position;
    }

    set nextScreenshotImage(image) {
        this._nextScreenshotImage = image;
    }

    set rotationZ(degrees) {
        this._threeScreenPlane.rotation.set(0,0,degrees);
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
        // the image should be loaded by now
        //image.onload = function () {
            screenshotTexture.needsUpdate = true;
            thisScreen._threeScreenPlane.material.map = screenshotTexture;
            thisScreen._threeScreenPlane.material.needsUpdate = true;
            thisScreen._threeScreenPlane.needsUpdate = true;
        //};
    }

    /***
     * Create a highlight plane covering the area of the given element. It will be shown in the next renderUpdate.
     * @param element3D - A ORG3DUIElement that can be WDA/Org ...
     */
    highlightUIElement(element3D) {
        if (element3D) {
            // Calculate element bounds in device screen in 3D world
            const kZOffsetFromScreen = 0.0005;
            const elementBox2InScreen = element3D.getBoundsInDeviceScreen(ORG.device, this);
            const elementSize = elementBox2InScreen.getSize();
            const elementBox2Center = elementBox2InScreen.getCenter();
            const position = new THREE.Vector3(elementBox2Center.x, elementBox2Center.y, this.screenPosition.z + kZOffsetFromScreen);

            // Create the plane
            this._nextHighlightPlane = this._createHighlightPlane(elementSize, position);
            this._removeHighlight = false;
        } else {
            this._removeHighlight = true;
        }
    }

    /***
     * Time to update the 3D model. Called by the render loop.
     */
    renderUpdate() {

        // update screenshot
        if (this._nextScreenshotImage) {
            this.setScreenshot(this._nextScreenshotImage);
            this._nextScreenshotImage = null;
        }

        // update highlight
        if (this._removeHighlight) {
            if (this._currentHighlightPlane) {
                this._THREEScene.remove(this._currentHighlightPlane);
            }
            this._currentHighlightPlane = null;
            this._nextHighlightPlane = null;
            this._removeHighlight = false;
        }

        if (this._nextHighlightPlane) {
            if (this._currentHighlightPlane) {
                this._THREEScene.remove(this._currentHighlightPlane);
            }
            this._THREEScene.add(this._nextHighlightPlane);
            this._currentHighlightPlane = this._nextHighlightPlane
            this._nextHighlightPlane = null;
        }
    }

    /***
     * Create a THREE plane that will be used as a highlight on top of the screen.
     * @param size. Vector2
     * @param position. Vector3
     * @returns {THREE.Mesh of plane}
     * @private
     */
    _createHighlightPlane(size, position) {
        var geometry, material, highlightPlane;
        const kOpacity = 0.5;
        const kColor = 0xee82ee; // FFC0CB FFE4E1 FB6C1 FF69B4

        geometry = new THREE.PlaneBufferGeometry( size.width, size.height, 1, 1);
        material = new THREE.MeshBasicMaterial({ map : null , color: kColor, side: THREE.DoubleSide, transparent: true, opacity: kOpacity});
        highlightPlane = new THREE.Mesh( geometry, material );
        highlightPlane.position.copy( position );

        return highlightPlane;
    }

}