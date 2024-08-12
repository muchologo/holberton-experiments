class CircuitUtils {

	static randRange(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	static randRangeFloat(min, max) {
	  return (Math.random() * (max - min + 1)) + min;
	}
	static hexRandomBrightness(hex, min, max) {
	  // replace any non digit character
	  hex = hex.replace(/^\s*#|\s*$/g, '');
	  // Convert 3 hex colors to 6 hex colors
	  if (hex.length == 3) {
		hex = hex.replace(/(.)/g, '$1$1');
	  }
	  // Extract the RGB channels from the hex
	  let r = parseInt(hex.substr(0, 2), 16),
		g = parseInt(hex.substr(2, 2), 16),
		b = parseInt(hex.substr(4, 2), 16);
	  // Apply brightness algoritm
	  let brightness = this.randRange(min, max);
	  return '#' +
		((0 | (1 << 8) + r + (256 - r) * brightness / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + g + (256 - g) * brightness / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + b + (256 - b) * brightness / 100).toString(16)).substr(1);
	}
  }
  
  class CircuitLine {
	constructor(canvasContainer) {
	  this.canvasContainer = document.getElementById(canvasContainer);
	  this.canvasW = this.canvasContainer.clientWidth;
	  this.canvasH = this.canvasContainer.clientHeight;
  
	  // Create a canvas element to work as a layer for this line
	  this.canvas = document.createElement('canvas');
	  
	  // We apply the filters to the canvas element because its faster than applying it to the ccontext
	  this.opacity = CircuitUtils.randRangeFloat(20, 60);
	  this.blur = CircuitUtils.randRangeFloat(0, 2);
	  this.canvas.style.filter = ['opacity('+this.opacity+'%)', 'blur('+this.blur+'px)'].join(" ");
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
	  this.xIncrease = CircuitUtils.randRange(2, 8);
	  // A variable to store the changes of "Y" coordinate of the line
	  this.currentY = CircuitUtils.randRange(0, this.canvasH);
	  // A timestamp to know when occurs the last direction change on the line
	  this.directionLastChange = new Date().getTime();
	  // The amount of time in milliseconds which has to pass for the direction to change
	  this.directionChangeThreshould = CircuitUtils.randRange(4000, 8000);
	  // The maximum amount of time in milliseconds a line can keep its direction change until it comes following a rect path again
	  this.maxTimeDirectionChangeLast = CircuitUtils.randRange(1000, 2000);
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
		this.timeDirectionChangeLast = CircuitUtils.randRange(0, this.maxTimeDirectionChangeLast);
		this.directionSign = [1, -1][CircuitUtils.randRange(0, 1)];
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
	  this.context.strokeStyle = CircuitUtils.hexRandomBrightness('#0000ff', 16, 24);
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
			this.opacity = Math.ceil(this.opacity / 1.1);
		  this.canvas.style.filter = ['opacity('+this.opacity+'%)', 'blur('+this.blur+'px)'].join(" ");
			this.timeFadingOn = currentTime - this.timeFadingStart;
		  if ((this.timeFadingOn > this.timeFadingLast) || this.opacity<=10) {
			  this.lineIsFading = false;
			this.opacity = CircuitUtils.randRangeFloat(20, 90);
				this.canvas.style.filter = ['opacity('+this.opacity+'%)', 'blur('+this.blur+'px)'].join(" ");
				this.currentXCoordinate = 0;
			  this.currentY = CircuitUtils.randRange(0, this.canvasH);
		  }
		}
		window.requestAnimationFrame(this.draw.bind(this));
	  }, frameRate);
	}
  }
  
  new CircuitLine('canvas-container');
  new CircuitLine('canvas-container');
  new CircuitLine('canvas-container');
  new CircuitLine('canvas-container');
  new CircuitLine('canvas-container');
  new CircuitLine('canvas-container');
  new CircuitLine('canvas-container');
  new CircuitLine('canvas-container');
  