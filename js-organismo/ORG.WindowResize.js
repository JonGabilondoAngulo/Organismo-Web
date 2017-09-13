// This helper makes it easy to handle window resize.
// It will update renderer and camera when window is resized.
//

ORG.WindowResize	= function(renderer, camera, canvas) {

	var callback	= function(){
		// notify the renderer of the size change
		var canvasHeight = window.innerHeight - 66;

        renderer.setSize( canvas.offsetWidth, canvasHeight);
        camera.aspect	= canvas.offsetWidth / canvasHeight;
		camera.updateProjectionMatrix();

        canvas.style.height = canvasHeight  + 'px'; //otherwise the canvas is not adapting to the renderer area
	}

	callback(); // ugly to provoke resize now

	// bind the resize event
	window.addEventListener('resize', callback, false);

	// return .stop() the function to stop watching window resize
	return {
		//Stop watching window resize
		stop	: function(){
			window.removeEventListener('resize', callback);
		}
	};
}
