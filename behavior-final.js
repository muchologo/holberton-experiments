document.addEventListener("DOMContentLoaded", function(event){

	let body = document.getElementsByTagName("body")[0];
	

	let tc = document.getElementById("home-thumbnails");

		
	let anchors = tc.getElementsByClassName("thumbnail");

	let OneRemToPX = parseInt(body.style.fontSize || 16);

	let keyUpListener = null;

	function getAbsolutePos(element) {
		for (var x=0, y=0; element != null; x+=element.offsetLeft, y+=element.offsetTop, element=element.offsetParent);
		return {'x':x, 'y':y};
	}

	function restoreImage(event) {
		if (event.which) {
			window.removeEventListener("keyup", keyUpListener);
			const posImage = getAbsolutePos(this.image);
			this.bigImage.style.top = posImage.y + 'px';
			this.bigImage.style.left = posImage.x + 'px';
			this.bigImage.style.width = this.image.width + 'px';
			this.bigImage.style.height = this.image.height + 'px';

			this.bigScreen.style.opacity = 0;

			setTimeout(function(){
				body.removeChild(this.bigImage);
				body.removeChild(this.bigScreen);
			}.bind({'bigImage':this.bigImage, 'bigScreen':this.bigScreen}), 500);
		}
	}

	// To add some extra space to the images when they are open
	// We add some space to each side of the image
	// We will need to get the window size for this to work
	// To keep the aspect ratio of the images and
	// get the position of the images to position the new bigImage to be animated
	function zoomOutImage(image) {
		const viewportW = document.documentElement.clientWidth;
		const viewportH = document.documentElement.clientHeight;
		const maxW = viewportW - (OneRemToPX * 8);
		const maxH = viewportH - (OneRemToPX * 8);
		const imageW = image.naturalWidth;
		const imageH = image.naturalHeight;

		let ratio = 1;
		if (imageW > maxW) {
			ratio = maxW / imageW;
		}
		if (imageH > maxH) {
			ratio = maxH / imageH;
		}
		const targetW = imageW * ratio;
		const targetH = imageH * ratio;
		const scrollY = window.pageYOffset;
		const xPos = Math.ceil((viewportW - targetW) / 2);
		const yPos = Math.ceil((viewportH - targetH) / 2) + scrollY;
		const posImage = getAbsolutePos(image);

		const bigScreen = document.createElement('div');
		bigScreen.style.top = scrollY + 'px';
		body.appendChild(bigScreen);

		const escapeMessage = document.createTextNode('Press ESC to return');
		const escapeButton = document.createElement('strong');
		escapeButton.appendChild(escapeMessage);
		escapeButton.style.display = 'inline-block';
		escapeButton.style.fontFamily = 'Open Sans';
		escapeButton.style.padding = '0.5rem';
		bigScreen.appendChild(escapeButton);

		const bigImage = new Image();
		bigImage.style.width = image.width + 'px';
		bigImage.style.height = image.height + 'px';
		bigImage.style.position = 'absolute';
		bigImage.style.top = posImage.y + 'px';
		bigImage.style.left = posImage.x + 'px';
		bigImage.src = image.src;
		body.appendChild(bigImage);

		setTimeout(function(){ 
			bigImage.style.width = targetW + 'px';
			bigImage.style.height = targetH + 'px';
			bigImage.style.top = yPos + 'px';
			bigImage.style.left = xPos + 'px';
			bigImage.style.opacity = 1;
			bigImage.className = 'small';
			
			bigScreen.style.left = '0px';
			bigScreen.style.width = viewportW + 'px';
			bigScreen.style.height = viewportH + 'px';
			bigScreen.style.opacity = 1;
			bigScreen.className = 'big-screen';
		}, 64);

		keyUpListener = restoreImage.bind({'image':image, 'bigImage':bigImage, 'bigScreen':bigScreen});
		window.addEventListener('keyup', keyUpListener);
		
	}
	
	for (let i=0; i<anchors.length; i++) {
		let anchor = anchors[i];
		let image = anchor.getElementsByTagName("img")[0];
		anchor.addEventListener("click", function(event){
			event.preventDefault();
			event.stopPropagation();
			zoomOutImage(this);
			
		}.bind(image));
	}

});
