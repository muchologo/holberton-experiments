document.addEventListener("DOMContentLoaded", function(event){

	// Let's try to use some cool funtionality and pray god it works in your browser
	// Otherwise, Would you mind to update? Say yes, I know you want to say yes :)

	const BODY = document.getElementsByTagName("body")[0];

	/* UTILITIES USED FOR THIS EXPERIMENT */
	class MagicUtils {
		static randRange(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		static randRangeFloat(min, max) {
			return (Math.random() * (max - min + 1)) + min;
		}
		static viewportSize() {
			return {
				'width':document.documentElement.clientWidth,
				'height':document.documentElement.clientHeight
			};
		}
		// function to reduce the code in some way :(
		static updateStyle (name, node, props) {
			for (let prop in props) { 
				try { 
					node.style[prop] = props[prop];
				} catch (e){
					console.log('UPS! Trying to setup the property ' + prop + ' on ' + name);
				}
			}
		}
		static createNode(element, id) {
			const node = document.createElement(element);
			if (id) {
				node.setAttribute("id", id);
			}
			return node;
		}
		static createText(text){
			return document.createTextNode(text);
		}
		static animateWithCSS(name, node, duration, ease, props, onFinish){
			console.log('Animating ' + name);
			const durationToMS = duration * 1000;
			const offsetTime = 64;
			node.style['transition'] = 'all ' + duration + 's ' + ease;
			// Give some offset time so the css parser detect the style change and start the animation
			setTimeout(MagicUtils.updateStyle.bind(this, name, node, props), offsetTime);
			if (typeof(onFinish) === 'function') {
				setTimeout(onFinish, durationToMS + offsetTime);
			}
		}

		static animateText(element, text, onFinish){
			const nodetext = MagicUtils.createText('');
			element.appendChild(nodetext);
			
			let textLimit = text.length;
			let textCount = 0;
			let interval = setInterval(function(){
				if (textCount <= textLimit) {
					let increase = 3;
					let newText = text.substr(0, textCount);
					nodetext.nodeValue = newText;
					textCount += increase;
				} else {
					clearInterval(interval);
					if (typeof(onFinish) === 'function') {
						onFinish();
					}
				}
			}.bind(this), 8);
		}
		static hover(node, over, out){
			node.addEventListener('mouseenter', over.bind(this));
			node.addEventListener('mouseleave', out.bind(this));
		}
	}
	
	/* ANIMATED ARROW ICON */
	class IconGoArrow {
		constructor(target) {
			this.target = document.getElementById(target);
			this.canvas = document.createElement('canvas');
			this.canvasW = 32;
			this.canvasH = 32;
			this.canvas.width = this.canvasW;
			this.canvas.height = this.canvasH;

			this.context = this.canvas.getContext('2d');
			this.target.appendChild(this.canvas);
			this.x = 0;
			this.draw();
		}
		draw() {
			let icon = new Path2D();
			icon.moveTo(this.x, 15);
			icon.lineTo(29, 15);
			icon.lineTo(21, 7);
			icon.lineTo(22, 6);
			icon.lineTo(32, 16);
			icon.lineTo(22, 26);
			icon.lineTo(21, 25);
			icon.lineTo(29, 17);
			icon.lineTo(this.x, 17);
			icon.closePath();
			this.context.fillStyle = 'white';
			this.context.fill(icon);
		}
		clear() {
			this.context.clearRect(0, 0, this.canvasW, this.canvasH);
		}
		over() {
			this.clear();
			if (this.x <= 29) {
				this.x += 2;
				this.draw();
				window.requestAnimationFrame(this.over.bind(this));
			} else {
				this.x = 29;
				this.draw();
			}
		}
		out() {
			this.clear();
			if (this.x > 0) {
				this.x -= 2;
				this.draw();
				window.requestAnimationFrame(this.out.bind(this));
			} else {
				this.x = 0;
				this.draw();
			}
		}
	}
	/* TO MAKE CLICKS LOOK A LITTLE BIT BETTER :) */
	class WaterDrop {
		constructor(event) {
			let point = document.createElement('div');
			point.style.transition = 'all 0.4s ease-out';
			point.style.width = '48px';
			point.style.height = '48px';
			point.style.opacity = '0.8';
			point.style.backgroundColor = 'red';
			point.style.position = 'absolute';
			point.style.borderRadius = '24px';
			point.style.top = (event.clientY - 24) + 'px';
			point.style.left = (event.clientX - 24) + 'px';
			
			BODY.appendChild(point);
			setTimeout(function() {
				BODY.removeChild(this);
			}.bind(point), 400);
			
			setTimeout(function() {
				this.style.opacity = 0;
				this.style.borderRadius = '32px';
				this.style.marginTop = '-8px';
				this.style.marginLeft = '-8px';
				this.style.width = '64px';
				this.style.height = '64px';
			}.bind(point), 64);
		}
	}
	/* YOU ARE GONE LOVE THIS :) */
	class CircuitLine {
		constructor(canvasContainer) {
			this.canvasContainer = document.getElementById(canvasContainer);
			this.canvasW = this.canvasContainer.clientWidth;
			this.canvasH = this.canvasContainer.clientHeight;

			// Create a canvas element to work as a layer for this line
			this.canvas = document.createElement('canvas');

			// We apply the filters to the canvas element because its faster than applying it to the ccontext
			this.opacity = MagicUtils.randRangeFloat(4, 16);
			this.blur = 1;
			this.canvas.style.filter = ['opacity(' + this.opacity + '%)', 'blur(' + this.blur + 'px)'].join(" ");
			// These styles are to use the canvas as layers
			this.canvas.style.position = 'absolute';
			this.canvas.style.top = 0;
			this.canvas.style.left = 0;
			this.canvas.width = this.canvasW;
			this.canvas.height = this.canvasH;

			// Append the canvas to the container
			this.canvasContainer.appendChild(this.canvas);
			// Create a white sheet for drawing
			this.context = this.canvas.getContext('2d');
			// A variable to store the current the "x" coordinate 
			// This variable may increase while the animation goes on
			this.currentXCoordinate = 0;
			// How much pixels does the "x" coordinate increase with the pass of the time
			this.xIncrease = MagicUtils.randRange(8, 32);
			// A variable to store the changes of "Y" coordinate of the line
			this.currentY = MagicUtils.randRange(0, this.canvasH);
			// A timestamp to know when occurs the last direction change on the line
			this.directionLastChange = new Date().getTime();
			// The amount of time in milliseconds which has to pass for the direction to change
			this.directionChangeThreshould = MagicUtils.randRange(1000, 3000);
			// The maximum amount of time in milliseconds a line can keep its direction change until it comes following a rect path again
			this.maxTimeDirectionChangeLast = MagicUtils.randRange(1000, 1500);
			// Variable to set how much time in milliseconds a line will change its "y" coordinate 
			// This change occurs at the same time that the "x" coordinate so it seems the line advances in a diagonal way
			this.timeDirectionChangeLast = null;
			this.timeDirectionChangeStart = 0;
			// A flag to indicate that the line should change its "y" coordinate
			this.directionChangeIsActive = 0;
			this.lineIsFading = false;
			this.timeFadingLast = 3000;
			this.timeFadingOn = 0;
			this.timeFadingStart = 0;
			this.timeSinceDirectionChangeStart = 0;
			// A variable to store the sign to indicate if the line will go up or down
			// It can be "one" or "minus one"
			this.directionSign = 0;
			// The weight of the stroke may be random
			this.strokeWidth = 1;
			// How many times we want the animation to execute per second
			this.framesPerSecond = 48;
			// Start the magic :)
			this.draw();
		}

		draw() {
			// Every draw the canvas should be clear
			this.context.clearRect(0, 0, this.canvasW, this.canvasH);
			// if the "x" coordinate is cero we setup the line parameters
			if (this.currentXCoordinate == 0) {
				this.context.beginPath();
				this.context.lineWidth = this.strokeWidth;
				this.context.moveTo(0, this.currentY);
			}
			// The time which had pass since the last change
			let currentTime = new Date().getTime();
			let timeSinceLastDirectionChange = currentTime - this.directionLastChange;
			if (timeSinceLastDirectionChange > this.directionChangeThreshould) {
				this.directionLastChange = currentTime;
				this.timeDirectionChangeStart = currentTime;
				this.directionChangeIsActive = true;
				this.timeDirectionChangeLast = MagicUtils.randRange(0, this.maxTimeDirectionChangeLast);
				this.directionSign = [1, -1][MagicUtils.randRange(0, 1)];
			}
			if (this.directionChangeIsActive) {
				// We increase the "Y" coordinate as much as the "X" coordinate to animate the line in a diagonal way
				// The increase is multiplied by the direction to make aleatory if the line goes up or down
				this.currentY = this.currentY + (this.xIncrease * this.directionSign);
				this.timeSinceDirectionChangeStart = currentTime - this.timeDirectionChangeStart;
				if (this.timeSinceDirectionChangeStart > this.timeDirectionChangeLast) {
					this.directionChangeIsActive = false;
				}
			}
			// By doing random the color of the line it blinks like a true circuit
			this.context.strokeStyle = 'white';
			this.context.lineTo(this.currentXCoordinate, this.currentY);
			this.context.stroke();

			// We calculate how many frames this function should execute per second
			const frameRate = Math.ceil(1000 / this.framesPerSecond);
			setTimeout(() => {
				this.currentXCoordinate += this.xIncrease;
				// If the "X" coordinate passes the border of the canvas
				// We make the line return to the begining and recalculate a new "Y" coordinate
				if ((this.currentXCoordinate > this.canvasW) || (this.currentY > this.canvasH)) {
					this.lineIsFading = true;
					this.timeFadingStart = new Date().getTime();
				}
				if (this.lineIsFading) {
					this.timeFadingOn = currentTime - this.timeFadingStart;
					this.opacity = this.opacity / 1.1;
					this.canvas.style.filter = ['opacity(' + this.opacity + '%)', 'blur(' + this.blur + 'px)'].join(" ");
					if ((this.timeFadingOn > this.timeFadingLast) || (this.opacity <= 1)) {
						this.lineIsFading = false;
						this.opacity = MagicUtils.randRangeFloat(4, 16);
						this.canvas.style.filter = ['opacity(' + this.opacity + '%)', 'blur(' + this.blur + 'px)'].join(" ");
						this.currentXCoordinate = 0;
						this.currentY = MagicUtils.randRange(0, this.canvasH);
					}
				}
				window.requestAnimationFrame(this.draw.bind(this));
			}, frameRate);
		}
	}

	class Magic {
		constructor(magicButton) {
			this.magicButton = document.getElementById(magicButton);
			this.magicButton.addEventListener("click", function(){
				this.createMagicLayout();
				console.log("You did it!");	
			}.bind(this));
		}
		createMagicLayout() {
			// Raindrop effect when the user make click on any part of the window
			window.addEventListener("click", function(e) {
				new WaterDrop(e);
			});

			this.page = MagicUtils.createNode("div", "magicPage");

			// Here we will put the circuit effect
			this.canvasContainer = MagicUtils.createNode("div", "canvasContainer");
			MagicUtils.updateStyle('canvasContainer', this.canvasContainer, {
				'position':'absolute',
				'zIndex':1000,
				'width': '100%',
				'height': '100%'
			});
			this.page.appendChild(this.canvasContainer);

			this.mainContainer = MagicUtils.createNode("div", "mainContainer");
			MagicUtils.updateStyle('mainContainer', this.mainContainer, {
				'position':'relative',
				'zIndex':1001,
			});
			this.page.appendChild(this.mainContainer);

			// Remove the scrollbar and add one to the new magic page :)
			BODY.style.overflow = 'hidden';
			const vs = MagicUtils.viewportSize();
			MagicUtils.updateStyle('page', this.page, {
				'backgroundColor':'white',
				'fontFamily':'Open Sans',
				'overflowY':'scroll',
				'boxShadow':'0px 8px 32px rgba(0,0,0,0.128)',
				'borderRadius':'16px',
				'width':'32px',
				'height':'32px',
				'position':'absolute',
				'opacity':0,
				'top':Math.ceil((vs.height - 16) / 2) + 'px',
				'left':Math.ceil((vs.width - 16) / 2) + 'px'
			});
			BODY.appendChild(this.page);

			// animate using css
			MagicUtils.animateWithCSS('page', this.page, 0.4, 'ease-in', {
				'backgroundColor':'#120b2e',
				'top':'0px',
				'left':'0px',
				'width':'100%',
				'height':'100%',
				'borderRadius':0,
				'opacity':1
			}, this.createHeader.bind(this));
		}
		createHeader(){
			// Appear the header
			this.header = MagicUtils.createNode("div", "magicHeader");
			MagicUtils.updateStyle('header', this.header, {
				'height':0,
				'opacity':0,
				'display':'flex',
				'justify-content':'center',
				'align-items':'center',
				'flex-direction':'column',
				'backgroundColor':'white'
			});
			this.mainContainer.appendChild(this.header);
			MagicUtils.animateWithCSS('header', this.header, 0.4, 'ease-out', {
				'height':'128px',
				'opacity':1
			}, this.createLogo.bind(this));
		}
		createLogo() {
			this.logo = MagicUtils.createNode('a', 'logo');
			this.logo.appendChild(MagicUtils.createText('J.Z'));
			MagicUtils.updateStyle('logo', this.logo, {
		  		'opacity':0,
				'fontSize':'32px',
				'marginBottom':'8px',
				'display':'inline-block'
			});
			this.header.appendChild(this.logo);
			MagicUtils.animateWithCSS('logo', this.logo, 0.4, 'ease-in', {
		  		'opacity':1,
			}, this.createMenu.bind(this));
		}
		createMenu() {
			this.menu = MagicUtils.createNode('ul', 'menu');
			const menuButtonsCSS = {
				'padding':'0 16px',
				'cursor':'pointer',
				'fontSize':'12px',
				'transition':'all 0.5s ease-out'
			};

			this.aboutMe = MagicUtils.createNode('a', 'about-me');
			MagicUtils.updateStyle('aboutMe', this.aboutMe, menuButtonsCSS);
			this.aboutMe.appendChild(MagicUtils.createText('ABOUT ME'));

			MagicUtils.hover(
				this.aboutMe,
				MagicUtils.animateWithCSS.bind(this, 'aboutme', this.aboutMe, 0.2, 'ease-out', {'color':'red'}), 
				MagicUtils.animateWithCSS.bind(this, 'aboutme', this.aboutMe, 0.2, 'ease-out', {'color':'black'})
			);

			this.menu.appendChild(this.aboutMe);

			this.contact = MagicUtils.createNode('a', 'contact');
			MagicUtils.updateStyle('contact', this.contact, menuButtonsCSS);
			this.contact.appendChild(MagicUtils.createText('CONTACT'));
			this.menu.appendChild(this.contact);

			this.pray = MagicUtils.createNode('a', 'pray');
			MagicUtils.updateStyle('pray', this.pray, menuButtonsCSS);
			this.pray.appendChild(MagicUtils.createText('PRAY'));
			this.menu.appendChild(this.pray);

			MagicUtils.updateStyle('menu', this.menu, {
				'opacity':0,
				'height':'1px',
				'margin':'0px',
				'padding':'0px',
				'overflow':'hidden',
				'fontSize':'16px',
				'fontWeight':'bold'
			});
			this.header.appendChild(this.menu);
			MagicUtils.animateWithCSS('menu', this.menu, 0.4, 'ease-out', {
				'opacity':1,
				'height':'32px',
			}, () => { 
				console.log("Let's the magic, begin...");
				this.showThankYou();
				// Start here some magic because at this point the canvas container is already in the DOM tree :)
				this.circuitLines = [
					new CircuitLine('canvasContainer'),
					new CircuitLine('canvasContainer'),
					new CircuitLine('canvasContainer'),
					new CircuitLine('canvasContainer')
				];
			});
		}
		showThankYou() {
			console.log("Really really thank you!");
			let thankYouText = "If you are reading this, let me tell you that you are awesome, because by making click where you just did, you dared to support this experiment. Going furter with the web project proposed by Holberton School is not an easy task because you are not able to use React, jQuery, Bootstrap or any other library. So here we are alone my friend, but do not worry because the essence of the web was never an easy task, it's indeed a wild life.";
			let paragraph = MagicUtils.createNode('p', 'thank-you-text');
			MagicUtils.updateStyle('Thank You Text', paragraph, {
				'width':'320px',
				'color':'white',
				'margin':'64px auto',
				'position':'relative',
				'top':'-20px'
			});
			this.mainContainer.appendChild(paragraph);
			MagicUtils.animateWithCSS('Thank you text', paragraph, 1, 'ease-out', {'top':'0px'});
			MagicUtils.animateText(paragraph, thankYouText, this.showFace.bind(this));
		}

		showFace() {
			/*
			var icon = new IconGoArrow('go-arrow');
			var button = document.getElementById("go-arrow");
			button.addEventListener("mouseenter", icon.over.bind(icon));
			button.addEventListener("mouseleave", icon.out.bind(icon));
			*/
			console.log("Animate the face in an EPIC mode");
		}

	}
	
	let youDidIt = new Magic('magic-button');

});