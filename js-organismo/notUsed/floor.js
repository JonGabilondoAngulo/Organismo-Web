//
//var floor3DObject;
//var axis3DObject;
//
//function createFloor(inScene) {
//
//    /*var geometry = new THREE.Geometry();
//     geometry.vertices.push(new THREE.Vector3( - 2500, -450, 0 ) );
//     geometry.vertices.push(new THREE.Vector3( 2500, -450, 0 ) );
//
//     var linesMaterial = new THREE.LineBasicMaterial( { color: 0x787878, opacity: .2, linewidth: .1 } );
//
//     for ( var i = 0; i <= 100; i ++ ) {
//
//     var line = new THREE.Line( geometry, linesMaterial );
//     line.position.z = ( i * 50 ) - 2500;
//     inScene.add( line );
//
//     var line = new THREE.Line( geometry, linesMaterial );
//     line.position.x = ( i * 50 ) - 2500;
//     line.rotation.y = 90 * Math.PI / 180;
//     inScene.add( line );
//     }*/
//
//    axis3DObject = new THREE.AxisHelper(650);
//    axis3DObject.position.set(-2500,-450,-2500);
//    inScene.add(axis3DObject);
//
//    floor3DObject = new THREE.GridHelper(2000, 100);
//    floor3DObject.setColors( new THREE.Color(0xcccccc), new THREE.Color(0xcccccc) );
//    floor3DObject.position.set( 0,-450,0 );
//    scene.add(floor3DObject);
//
//
//    /* Mesh
//     var geometry = new THREE.PlaneGeometry( 1200, 1200, 20, 20 );
//     var material = new THREE.MeshBasicMaterial( { wireframe: true, color: 0xcccccc } );
//     var floor = new THREE.Mesh( geometry, material );
//     floor.material.side = THREE.DoubleSide;
//     floor.translateY(-450);
//     floor.rotation.x = 90 * (Math.PI/180);
//     return floor;*/
//}
//
//function deleteFloor(inScene) {
//    inScene.remove(floor3DObject);
//}