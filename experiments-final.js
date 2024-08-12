document.addEventListener("DOMContentLoaded", function (event) {

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
				'width': document.documentElement.clientWidth,
				'height': document.documentElement.clientHeight
			};
		}
		// function to reduce the code in some way :(
		static updateStyle(name, node, props) {
			for (let prop in props) {
				try {
					node.style[prop] = props[prop];
				} catch (e) {
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
		static clearNode(element) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		}
		static createText(text) {
			return document.createTextNode(text);
		}
		static animateWithCSS(name, node, duration, ease, props, onFinish) {
			console.log('Animating ' + name);
			const durationToMS = duration * 1000;
			const offsetTime = 64;
			node.style['transition'] = 'all ' + duration + 's ' + ease;
			// Give some offset time so the css parser detect the style change and start the animation
			setTimeout(MagicUtils.updateStyle.bind(this, name, node, props), offsetTime);
			if (typeof (onFinish) === 'function') {
				setTimeout(onFinish, durationToMS + offsetTime);
			}
		}

		static animateText(element, text, onFinish) {
			const nodetext = MagicUtils.createText('');
			element.appendChild(nodetext);

			let textLimit = text.length;
			let textCount = 0;
			let interval = setInterval(function () {
				if (textCount <= textLimit) {
					let increase = 3;
					let newText = text.substr(0, textCount);
					nodetext.nodeValue = newText;
					textCount += increase;
				} else {
					clearInterval(interval);
					nodetext.nodeValue = text;
					if (typeof (onFinish) === 'function') {
						onFinish();
					}
				}
			}.bind(this), 16);
		}
		static animateList(listItems, element, onFinish) {
			let listNode, listItem, listCounter = 0;
			const nextItem = () => {
				if (listCounter < listItems.length) {
					listItem = listItems[listCounter];
					listNode = MagicUtils.createNode('li');
					element.appendChild(listNode);
					MagicUtils.animateText(listNode, listItem, () => {
						listCounter++;
						nextItem();
					});	
				} else if (typeof(onFinish) === 'function'){
					onFinish();
				}
			}
			nextItem();
		}
		static hover(node, over, out) {
			node.addEventListener('mouseenter', over.bind(this));
			node.addEventListener('mouseleave', out.bind(this));
		}
	}

	/* Sometimes animating using CSS is not enough XP */
	/* Here we have to thank Robert's Penner hard work. Thank you Robert! */
	class Easing {

		static easeInOutQuart(time, startValue, newValue, duration) {
			startValue = parseFloat(startValue);
			newValue = parseFloat(newValue) - startValue;
			if ((time /= duration / 2) < 1) {
				return newValue / 2 * time * time * time * time + startValue;
			}
			return -newValue / 2 * ((time -= 2) * time * time * time - 2) + startValue;
		}
		static easeOutQuart(time, startValue, newValue, duration) {
			startValue = parseFloat(startValue);
			newValue = parseFloat(newValue) - startValue;
			time /= duration;
			time--;
			return -newValue * (time * time * time * time - 1) + startValue;
		};

		static animate(item, time, initialProps, finalProps, duration, onFinish) {

			for (let prop in initialProps) {
				const from = initialProps[prop];
				const to = finalProps[prop];
				const subfix = (from.toString().split('px').length > 1 ? 'px' : '');
				const value = Easing.easeOutQuart(time, from, to, duration) + subfix;
				item.style[prop] = value;
			};

			if (time < duration) {
				time += 41;
				window.requestAnimationFrame(function () {
					Easing.animate(item, time, initialProps, finalProps, duration, onFinish);
				});
			} else {
				for (let prop in finalProps) {
					item.style[prop] = finalProps[prop];
				};
				if (typeof (onFinish) === 'function') {
					onFinish();
				}
			}
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
			setTimeout(function () {
				BODY.removeChild(this);
			}.bind(point), 400);

			setTimeout(function () {
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

	class StackGallery {

		constructor(container, visibleItems, margin, minOpacity, items) {
			this.container = document.getElementById(container);
			this.container.style.position = 'relative';

			this.containerW = this.container.clientWidth;
			this.containerH = this.container.clientHeight;
			this.visibleItems = visibleItems;
			this.itemsSpaces = (this.visibleItems - 1);
			this.minOpacity = minOpacity;
			this.items = items;
			this.initialZIndex = 1100;
			this.opacityDifference = Math.floor(100 - this.minOpacity) / this.visibleItems;
			this.margin = margin;
			this.topItem = this.items.length;

			this.itemsMargin = Math.floor(this.margin / this.itemsSpaces);
			this.itemsGap = Math.floor(this.itemsMargin / 2);
			this.calculateItemData();
			this.isAnimating = false;
			this.draw();
			this.nextItem();
		}

		calculateItemData() {
			this.itemsData = [];
			let posCounter;
			for (posCounter = 0; posCounter < this.visibleItems; posCounter++) {
				const truePosition = (this.visibleItems - posCounter);
				this.itemsData.push({
					width: (this.containerW - (this.itemsMargin * truePosition)) + 'px',
					height: (this.containerH - (this.itemsMargin * posCounter)) + 'px',
					left: (this.itemsGap * truePosition) + 'px',
					top: (this.itemsGap * posCounter) + 'px',
					opacity: ((this.opacityDifference * truePosition) + this.minOpacity) / 100
				});
			}
		}

		nextItem() {
			if (!this.isAnimating) {
				this.isAnimating = true;
				const maxIndex = this.items.length - 1;
				const nextItem = (this.topItem < maxIndex ? (this.topItem + 1) : 0);

				// Bottom element should only appear from zero opacity
				// Its final properties are the same than the bottom item of the itemsData
				// Intermediate elements should copy its properties from one element on top
				// Top element should only disappear to cero opacity
				// Its final properties are the same than the top item of the itemsData
				// Visible content are only the one which goes up and the one whos disappearing
				// If the element which is on top is zero then:
				// 3 appears / 2 becomes 1 / 1 becomes 0 / 0 disappears

				// Animate intermediate elements
				let item, itemCounter, itemMoving, itemSelector, newPositionData, animFunction;
				for (itemCounter = 1; itemCounter < this.visibleItems; itemCounter++) {
					newPositionData = this.itemsData[(itemCounter - 1)];

					itemSelector = ':nth-child(' + (itemCounter + 1) + ')';
					itemMoving = this.container.querySelector(itemSelector);

					Easing.animate(itemMoving, 0, {
						'top': itemMoving.style.top,
						'left': itemMoving.style.left,
						'opacity': itemMoving.style.opacity,
						'width': itemMoving.style.width,
						'height': itemMoving.style.height
					}, newPositionData, 400);
				}

				// Animate top and bottom elements
				const oldTopElement = this.container.querySelector(':nth-child(1)');
				const newTopElement = this.container.querySelector(':nth-child(2)');

				// Load the content of the element raising
				const newTopItem = this.items[nextItem];
				this.topItem = nextItem;

				const newImage = document.createElement("img");
				newImage.src = newTopItem;
				newTopElement.appendChild(newImage);

				// Create an anchor which will emerge from the bottom
				const newBottomElement = this.drawElement(this.itemsSpaces, {
					'opacity': 0
				});
				this.container.appendChild(newBottomElement);

				Easing.animate(oldTopElement, 0, {
						'opacity': 1,
						'marginTop': '0px'
					}, {
						'opacity': 0,
						'marginTop': -this.margin + 'px'
					},
					400,
					function () {
						this.parentElement.removeChild(this);
					}.bind(oldTopElement));

				Easing.animate(newBottomElement, 0, {
						'opacity': 0,
						'marginTop': this.margin + 'px'
					}, {
						'opacity': this.minOpacity / 100,
						'marginTop': '0px'
					},
					400, () => {
						this.isAnimating = false;
					});

				for (itemCounter = 1; itemCounter < this.visibleItems; itemCounter++) {
					const item = this.container.querySelector(':nth-child(' + itemCounter + ')');
					item.style.zIndex = this.initialZIndex + (this.visibleItems - itemCounter);
				}
			}
		}

		drawElement(index, overrideStyle) {
			const item = document.createElement('a');
			const itemData = {
				...this.itemsData[index],
				overrideStyle
			};
			item.style.position = 'absolute';
			item.style.cursor = 'pointer';
			item.style.left = itemData.left;
			item.style.top = itemData.top;
			item.style.opacity = itemData.opacity;
			item.style.display = 'flex';
			item.style.justifyContent = 'center';
			item.style.alignItems = 'center';
			item.style.width = itemData.width;
			item.style.height = itemData.height;
			item.style.backgroundColor = 'white';
			return item;
		}

		draw() {
			let image, itemCounter, item, itemData;
			for (itemCounter = 0; itemCounter < this.itemsData.length; itemCounter++) {
				item = this.drawElement(itemCounter);

				// Load the content only if the element is the top one
				if (this.topItem == itemCounter) {
					image = document.createElement('img');
					image.src = this.items[this.topItem];
					item.appendChild(image);
				}
				this.container.appendChild(item);
			}

			// ccontenedor
			this.container.addEventListener("click", this.nextItem.bind(this));
		}

	}

	class MagicStyles {
		static twoColumns() {
			return {
				"display": "flex",
				"maxWidth": "1280px",
				"justifyContent": "space-between",
				"alignItems":"center",
				"margin": "128px auto"
			}
		}
		static oneColumn() {
			return {
				"display": "flex",
				"maxWidth": "640px",
				"justifyContent": "space-between",
				"alignItems":"center",
				"margin": "128px auto"
			}
		}
		static columns() {
			return {
				"flex": "1"
			};
		}
		static contentA() {
			return {
				"paddingRight": "32px"
			}
		}
		static contentB() {
			return {
				"paddingLeft": "32px"
			}
		}
		static paragraphs() {
			return {
				'color': 'white',
				'fontSize': '14px',
				'margin-top': '32px',
				'position': 'relative',
				'top': '-20px'
			};
		}
		static list() {
			return {
				'listStylePosition': 'inside'
			};
		}
		static titles() {
			return {
				'fontFamily': 'Open Sans',
				'fontSize': '32px',
				'color': '#FF0000'
			}
		}
	}
	class Magic {
		constructor(magicButton) {
			this.magicButton = document.getElementById(magicButton);
			this.magicButton.addEventListener("click", function () {
				this.createMagicLayout();
				console.log("You did it!");
			}.bind(this));
		}
		createTwoColumns() {
			let twoColumns = MagicUtils.createNode('div');
			MagicUtils.updateStyle('twoColumns', twoColumns, MagicStyles.twoColumns());

			let columnA = MagicUtils.createNode('div');
			MagicUtils.updateStyle('columnA', columnA, MagicStyles.columns());
			twoColumns.appendChild(columnA);
			let contentA = MagicUtils.createNode('div');
			MagicUtils.updateStyle('contentA', contentA, MagicStyles.contentA());
			columnA.appendChild(contentA);

			let columnB = MagicUtils.createNode('div');
			MagicUtils.updateStyle('columnB', columnB, MagicStyles.columns());
			twoColumns.appendChild(columnB);
			let contentB = MagicUtils.createNode('div');
			MagicUtils.updateStyle('contentB', contentB, MagicStyles.contentB());
			columnB.appendChild(contentB);

			return {
				'twoColumns': twoColumns,
				'contentA': contentA,
				'contentB': contentB
			};
		}
		createOneColumn() {
			let oneColumn = MagicUtils.createNode('div');
			MagicUtils.updateStyle('oneColumn', oneColumn, MagicStyles.oneColumn());

			let column = MagicUtils.createNode('div');
			oneColumn.appendChild(column);

			return {
				'oneColumn': oneColumn,
				'column': column
			};
		}
		createMagicLayout() {
			// Raindrop effect when the user make click on any part of the window
			window.addEventListener("click", function (e) {
				new WaterDrop(e);
			});

			this.page = MagicUtils.createNode("div", "magicPage");

			// Here we will put the circuit effect
			this.canvasContainer = MagicUtils.createNode("div", "canvasContainer");
			MagicUtils.updateStyle('canvasContainer', this.canvasContainer, {
				'position': 'absolute',
				'zIndex': 1000,
				'width': '100%',
				'height': '100%'
			});
			this.page.appendChild(this.canvasContainer);

			this.mainContainer = MagicUtils.createNode("div", "mainContainer");
			MagicUtils.updateStyle('mainContainer', this.mainContainer, {
				'position': 'absolute',
				'top':'128px',
				'width':'100%',
				'zIndex': 1001,
			});
			this.page.appendChild(this.mainContainer);

			// Remove the scrollbar and add one to the new magic page :)
			BODY.style.overflow = 'hidden';
			const vs = MagicUtils.viewportSize();
			MagicUtils.updateStyle('page', this.page, {
				'backgroundColor': 'white',
				'fontFamily': 'Open Sans',
				'overflowY': 'scroll',
				'boxShadow': '0px 8px 32px rgba(0,0,0,0.128)',
				'borderRadius': '16px',
				'width': '32px',
				'height': '32px',
				'position': 'absolute',
				'opacity': 0,
				'top': Math.ceil((vs.height - 16) / 2) + 'px',
				'left': Math.ceil((vs.width - 16) / 2) + 'px'
			});
			BODY.appendChild(this.page);

			// animate using css
			MagicUtils.animateWithCSS('page', this.page, 0.4, 'ease-in', {
				'backgroundColor': '#120b2e',
				'top': '0px',
				'left': '0px',
				'width': '100%',
				'height': '100%',
				'borderRadius': 0,
				'opacity': 1
			}, this.createHeader.bind(this));
		}
		createHeader() {
			// Appear the header
			this.header = MagicUtils.createNode("div", "magicHeader");
			MagicUtils.updateStyle('header', this.header, {
				'position':'fixed',
				'top':'0px',
				'zIndex':'1002',
				'width':'100%',
				'height': 0,
				'opacity': 0,
				'display': 'flex',
				'justify-content': 'center',
				'align-items': 'center',
				'backgroundColor': 'white'
			});
			this.page.appendChild(this.header);
			MagicUtils.animateWithCSS('header', this.header, 0.4, 'ease-out', {
				'height': '128px',
				'opacity': 1
			}, this.createMenu.bind(this));
		}
		createMenu() {
			
			const menuButtonsCSS = {
				'padding': '0px',
				'margin':'0px 16px'
				'borderBottomWidth': '0px',
				'borderColor':'black',
				'borderStyle':'solid',
				'cursor': 'pointer',
				'fontSize': '12px',
				'transition': 'all 0.5s ease-out'
			};

			this.homeButton = MagicUtils.createNode('a', 'home-button');
			this.homeButton.addEventListener("click", this.loadHome.bind(this));
			this.header.appendChild(this.homeButton);
			MagicUtils.hover(
				this.homeButton,
				MagicUtils.animateWithCSS.bind(this, 'homeButton', this.homeButton, 0.2, 'ease-out', {'borderBottomWidth': '2px'}),
				MagicUtils.animateWithCSS.bind(this, 'homeButton', this.homeButton, 0.2, 'ease-out', {'borderBottomWidth': '0px'})
			);
			MagicUtils.updateStyle('homeButton', this.homeButton, menuButtonsCSS);
			MagicUtils.animateText(this.homeButton, "HOME", () => {

				this.aboutMeButton = MagicUtils.createNode('a', 'home-button');
				this.aboutMeButton.addEventListener("click", this.loadAboutMe.bind(this));
				this.header.appendChild(this.aboutMeButton);
				MagicUtils.hover(
					this.aboutMeButton,
					MagicUtils.animateWithCSS.bind(this, 'aboutMeButton', this.aboutMeButton, 0.2, 'ease-out', {'borderBottomWidth': '2px'}),
					MagicUtils.animateWithCSS.bind(this, 'aboutMeButton', this.aboutMeButton, 0.2, 'ease-out', {'borderBottomWidth': '0px'})
				);
				MagicUtils.updateStyle('aboutMeButton', this.aboutMeButton, menuButtonsCSS);
				MagicUtils.animateText(this.aboutMeButton, "ABOUT ME", () => {

					this.thisExperimentButton = MagicUtils.createNode('a', 'home-button');
					this.thisExperimentButton.addEventListener("click", this.loadThisExperiment.bind(this));
					this.header.appendChild(this.thisExperimentButton);
					MagicUtils.hover(
						this.thisExperimentButton,
						MagicUtils.animateWithCSS.bind(this, 'thisExperimentButton', this.thisExperimentButton, 0.2, 'ease-out', {'borderBottomWidth': '2px'}),
						MagicUtils.animateWithCSS.bind(this, 'thisExperimentButton', this.thisExperimentButton, 0.2, 'ease-out', {'borderBottomWidth': '0px'})
					);
					MagicUtils.updateStyle('thisExperimentButton', this.thisExperimentButton, menuButtonsCSS);
					MagicUtils.animateText(this.thisExperimentButton, "THIS EXPERIMENT", () => {
						
						this.loadHome();
						// Start here some magic because at this point the canvas container is already in the DOM tree :)
						this.circuitLines = [
							new CircuitLine('canvasContainer'),
							new CircuitLine('canvasContainer'),
							new CircuitLine('canvasContainer'),
							new CircuitLine('canvasContainer')
						];
						
					});
				});
			});
		}
		
		loadHome() {
			if (this.mainContainer.childElementCount>0) {
				console.log("clearing");
				Easing.animate(this.mainContainer, 0, {'opacity': 1}, {'opacity':0}, 400, () => {
					MagicUtils.clearNode(this.mainContainer);
					this.loadHome();
				});
			} else {
				Easing.animate(this.mainContainer, 0, {'opacity': 0}, {'opacity':1}, 400, () => {
					let sectionContainer = this.createTwoColumns();
					sectionContainer.twoColumns.setAttribute("id", "home-area");
					this.mainContainer.appendChild(sectionContainer.twoColumns);
					
					const stackGalleryDiv = MagicUtils.createNode('div', 'stack-gallery');
					MagicUtils.updateStyle('stackGallery', stackGalleryDiv, {
						"height":"480px"
					});
					sectionContainer.contentB.appendChild(stackGalleryDiv);

					const stackVisibleItems = 3;
					const stackMargin = 96;
					const stackContainer = "stack-gallery";
					const stackMinOpacity = 10;
					const stackItems = [
						'/images/dennis-ritchie.gif',
						'/images/linus-torvalds.gif',
						'/images/tim-berners-lee.gif',
						'/images/brendan-eich.gif',
						'/images/robert-penner.gif'
					];
					this.stackGallery = new StackGallery(stackContainer, stackVisibleItems, stackMargin, stackMinOpacity, stackItems);

					let thankYouTitle = 'Thank You!';
					let thankYouA = "If you are reading this, let me tell you that you are awesome, because by making click where you just did, you dared to support this experiment.";
					let thankYouB = "Going furter with the web project proposed by Holberton School is not an easy task because you are not able to use React, jQuery, Bootstrap or any other library.";
					let thankYouC = "The essence of the web was never been an easy task, it's indeed a wild life but we are not alone: Thanks to the great people who makes computing so fascinating.";

					// First we create the title
					let title = MagicUtils.createNode('h1', 'thankYouTitle');
					MagicUtils.updateStyle('Thank You title', title, MagicStyles.titles());
					sectionContainer.contentA.appendChild(title);
					MagicUtils.animateWithCSS('Thank you title', title, 1, 'ease-out', {
						'top': '0px'
					});
					MagicUtils.animateText(title, thankYouTitle, () => {
						// Then the first paragraph
						let paragraph = MagicUtils.createNode('p', 'thankYouA');
						MagicUtils.updateStyle('Thank You Text', paragraph, MagicStyles.paragraphs());
						sectionContainer.contentA.appendChild(paragraph);
						MagicUtils.animateWithCSS('Thank you text A', paragraph, 1, 'ease-out', {
							'top': '0px'
						});
						MagicUtils.animateText(paragraph, thankYouA, () => {
							// Then the second paragraph
							paragraph = MagicUtils.createNode('p', 'thankYouB');
							MagicUtils.updateStyle('Thank You Text B', paragraph, MagicStyles.paragraphs());
							sectionContainer.contentA.appendChild(paragraph);
							MagicUtils.animateWithCSS('Thank you text A', paragraph, 1, 'ease-out', {
								'top': '0px'
							});
							MagicUtils.animateText(paragraph, thankYouB, () => {
								// Then the third paragraph
								paragraph = MagicUtils.createNode('p', 'thankYouC');
								MagicUtils.updateStyle('Thank You Text C', paragraph, MagicStyles.paragraphs());
								sectionContainer.contentA.appendChild(paragraph);
								MagicUtils.animateWithCSS('Thank you text A', paragraph, 1, 'ease-out', {
									'top': '0px'
								});
								MagicUtils.animateText(paragraph, thankYouC, () => {
									
								});
							});
						});
					});
				});
			}
		}

		loadAboutMe() {
			if (this.mainContainer.childElementCount>0) {
				console.log("clearing about me");
				Easing.animate(this.mainContainer, 0, {'opacity': 1}, {'opacity':0}, 400, () => {
					MagicUtils.clearNode(this.mainContainer);
					this.loadAboutMe();
				});
			} else {
				Easing.animate(this.mainContainer, 0, {'opacity': 0}, {'opacity':1}, 400, () => {
					let sectionContainer = this.createTwoColumns();
					sectionContainer.twoColumns.setAttribute("id", "about-me-area");
					this.mainContainer.appendChild(sectionContainer.twoColumns);

					const stackGalleryDiv = MagicUtils.createNode('div', 'stack-gallery-james');
					MagicUtils.updateStyle('stackGallery', stackGalleryDiv, {
						"height":"480px"
					});
					sectionContainer.contentB.appendChild(stackGalleryDiv);

					const stackVisibleItems = 3;
					const stackMargin = 96;
					const stackContainer = "stack-gallery-james";
					const stackMinOpacity = 10;
					const stackItems = [
						'/images/software-engineer.gif',
						'/images/interest-design.gif',
						'/images/interest-development.gif',
						'/images/interest-open-source.gif'
						
					];
					this.stackGallery = new StackGallery(stackContainer, stackVisibleItems, stackMargin, stackMinOpacity, stackItems);

					let sectionTitle = 'About Me';
					let paragraphA = 'Hi, my name is Jaime Zaballa, but just call me James. This is the what I did for the Project "Make your own website" for Holberton School, I hope you like it.';
					let paragraphB = 'Are you wondering, If I can do programamming why I do not have a career as a Software Engineer ? Well I think the same: I reall want to be a software engineer and continue studying more.';
					let paragraphC = 'I really want a better Job but the main reason is I want to study better programs to, a master and a doctorate in computers.';

					// First we create the title
					let title = MagicUtils.createNode('h1', 'sectionTitle');
					MagicUtils.updateStyle('About me title', title, MagicStyles.titles());
					sectionContainer.contentA.appendChild(title);
					MagicUtils.animateWithCSS('About me title', title, 1, 'ease-out', {
						'top': '0px'
					});
					MagicUtils.animateText(title, sectionTitle, () => {
						// Then the first paragraph
						let paragraph = MagicUtils.createNode('p', 'paragraphA');
						MagicUtils.updateStyle('About me Text', paragraph, MagicStyles.paragraphs());
						sectionContainer.contentA.appendChild(paragraph);
						MagicUtils.animateWithCSS('About me text A', paragraph, 1, 'ease-out', {'top': '0px'});
						MagicUtils.animateText(paragraph, paragraphA, () => {
							// Then the second paragraph
							paragraph = MagicUtils.createNode('p', 'paragraphB');
							MagicUtils.updateStyle('About me text B', paragraph, MagicStyles.paragraphs());
							sectionContainer.contentA.appendChild(paragraph);
							MagicUtils.animateWithCSS('About me text A', paragraph, 1, 'ease-out', {'top': '0px'});
							MagicUtils.animateText(paragraph, paragraphB, () => {
								// Then the third paragraph
								paragraph = MagicUtils.createNode('p', 'paragraphC');
								MagicUtils.updateStyle('About me text C', paragraph, MagicStyles.paragraphs());
								sectionContainer.contentA.appendChild(paragraph);
								MagicUtils.animateWithCSS('About me text A', paragraph, 1, 'ease-out', {'top': '0px'});
								MagicUtils.animateText(paragraph, paragraphC, () => {
									
								});
							});
						});
					});
				});
			}
		}

		loadThisExperiment() {
			if (this.mainContainer.childElementCount>0) {
				console.log("clearing this experiment");
				Easing.animate(this.mainContainer, 0, {'opacity': 1}, {'opacity':0}, 400, () => {
					MagicUtils.clearNode(this.mainContainer);
					this.loadThisExperiment();
				});
			} else {
				Easing.animate(this.mainContainer, 0, {'opacity': 0}, {'opacity':1}, 400, () => {
					let sectionContainer = this.createOneColumn();
					sectionContainer.oneColumn.setAttribute("id", "this-experiment-area");
					this.mainContainer.appendChild(sectionContainer.oneColumn);

					let sectionTitle = 'What is this about?';
					let paragraphA = 'Each single part took some time to test and verify working on Firefox and Chrome. I start developing when Internet Explorer was a pain for every web developer and in that sense, now that web standards has prevail it is much more easier :).';
					let featuresList = [
						'Exactly 1000 lines of code! (well some empty lines XD)',
						'Animating CSS properties', 
						'Animating with requestAnimationFrame and easing equations', 
						'Animating text', 
						'Animating list',
						'The effect of circuits in the background', 
						'The effect on the click', 
						'The Stack Gallery to show off people who inspires me', 
						'Doing a lot of research in The Mozilla Documentation', 
						'Studying articles in the wikipedia', 
						'Looking for information in the w3school and stackoverflow', 
						'and so on...'
					];
					let paragraphC = 'What things can be improve? Well: ';
					let improvementsList = [
						"Add responsive",
						"Update the URL and use history to enable navigation", 
						"Doing animations testing to determinate which is the best option between css transition and requestAnimationFrame",
						"Normalize the use of repetitive code to simplify",
						"Add a repository for fasting code deployment instead or writing in the terminal",
						"Add a domain name so we can request a SSL certificate and make the site safe",
						"Create a section to explain the creation of every componente :)",
						"Put a contact area so you can contribute with this page :)"
					];

					// First we create the title
					let paragraph, title = MagicUtils.createNode('h1');
					MagicUtils.updateStyle('This experiment', title, MagicStyles.titles());
					sectionContainer.column.appendChild(title);
					MagicUtils.animateWithCSS('This experiment title', title, 1, 'ease-out', {'top': '0px'});
					MagicUtils.animateText(title, sectionTitle, () => {

						paragraph = MagicUtils.createNode('p');
						MagicUtils.updateStyle('This experiment', paragraph, MagicStyles.paragraphs());
						sectionContainer.column.appendChild(paragraph);
						MagicUtils.animateWithCSS('This experiment paragraphA', paragraph, 1, 'ease-out', {'top': '0px'});
						MagicUtils.animateText(paragraph, paragraphA, () => {

							let list = MagicUtils.createNode('ul');
							MagicUtils.updateStyle('This experiment', list, {...MagicStyles.paragraphs(), ...MagicStyles.list()});
							sectionContainer.column.appendChild(list);
							MagicUtils.animateWithCSS('This experiment list', list, 1, 'ease-out', {'top': '0px'});
							MagicUtils.animateList(featuresList, list, () => {

								paragraph = MagicUtils.createNode('p');
								MagicUtils.updateStyle('This experiment', paragraph, MagicStyles.paragraphs());
								sectionContainer.column.appendChild(paragraph);
								MagicUtils.animateWithCSS('This experiment paragraphC', paragraph, 1, 'ease-out', {'top': '0px'});
								MagicUtils.animateText(paragraph, paragraphC, () => {

									list = MagicUtils.createNode('ul');
									MagicUtils.updateStyle('This experiment', list, {...MagicStyles.paragraphs(), ...MagicStyles.list()});
									sectionContainer.column.appendChild(list);
									MagicUtils.animateWithCSS('This experiment list', list, 1, 'ease-out', {'top': '0px'});
									MagicUtils.animateList(improvementsList, list, () => {});
									
								});
								
							});
							
						});
						
					});
				});
			}
		}

	}
	let youDidIt = new Magic('magic-button');
});
