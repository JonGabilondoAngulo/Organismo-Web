//

//function createScreenPlane(width, height, zPosition) {
//    var geometry,material,uiObject;
//    /*
//     var screenshotImage = new Image();
//     screenshotImage.src = "img/320x568-2.jpg";
//     var screenshotTexture = new THREE.Texture(screenshotImage);
//     //THREE.ImageUtils.loadTexture( "img/320x568-2.jpg" )
//
//     //var texture = new THREE.Texture(screenshotImage);
//     screenshotImage.onload = function () { screenshotTexture.needsUpdate = true; };
//     //screenshotTexture.needsUpdate = true;
//     */
//
//    geometry = new THREE.PlaneBufferGeometry( width, height, 1, 1);
//    material = new THREE.MeshBasicMaterial({ map : null , color: 0xffffff});
//    //material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, map : null});
//    //material = new THREE.MeshBasicMaterial( {color: 0x000000, map : null});
//    uiObject = new THREE.Mesh( geometry, material );
//    //uiObject.material.map = THREE.ImageUtils.loadTexture("img/320x568-2.jpg");
//    uiObject.position.set( 0 ,  0, zPosition);
//    return uiObject;
//}