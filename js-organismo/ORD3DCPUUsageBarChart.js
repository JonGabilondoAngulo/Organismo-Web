/**
 * Created by jongabilondo on 14/11/2017.
 */

class ORD3DCPUUsageBarChart {

    constructor( barSize ) {

        this._barSize = barSize;
        this._barCount = 0;
        this._THREEGroup = new THREE.Group();

    }

    get THREEModel() {

        return this._THREEGroup;

    }

    set position( position ) {

        if ( this._THREEGroup ) {
            this._THREEGroup.position.copy( position );
        }

    }

    usageUpdate( usageData ) {

        const usagePercent = parseFloat( usageData["CPUUsage"] ) / 100;
        this._createBar( usagePercent );

    }

    _createBar( usagePercent ) {

        const kColor = 0xBBEEFF;
        const kMetalness = 0.7;
        const kBarHeight = this._barSize.y * usagePercent;

        var geometry = new THREE.CubeGeometry( this._barSize.x, kBarHeight ,this._barSize.z );
        var material = new THREE.MeshStandardMaterial( {color: kColor, metalness: kMetalness} );
        var cube = new THREE.Mesh( geometry, material );
        cube.translateX( - this._barCount * this._barSize.x );
        cube.translateY( kBarHeight / 2.0 );
        this._THREEGroup.add( cube );
        this._THREEGroup.translateX( this._barSize.x );
        this._barCount++;

    }
}