var amount = 5;
var interval;
var context;
var canvas;

var size = {};
var boundary = {};
var dot = {};

var prop = {};
var propName;
var increasing;
var oldPropName;
var oldIncreasing;
var body;
var autoPilot;

var main = function(){
	setConfig(125, $('#autoPilot').is(':checked'));
	setScore(0);
	loadContext();
	loadBoundary();
	setPosition(parseInt(boundary['lefttrue']) / 2, parseInt(boundary['toptrue']) / 2);
	setDirection('left', true);
	setSize(amount, amount);
	loadDot();
	trackKeys();
	trackCheckBox();
	move();
}
$(function(){
	$(main);
	$('#restart').click(function(){
		$(main);
	});
});
function setConfig(interval, autoPilot){
	this.interval = interval;
	this.autoPilot = autoPilot;
}
function loadContext(){
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	context.fillStyle = "rgba(0, 0, 200, 0.5)";
	context.clearRect(0, 0, canvas.width, canvas.height);
}
function loadDot(){
	dot['left'] = Math.floor(Math.random() * boundary['lefttrue']);
	dot['top'] = Math.floor(Math.random() * boundary['toptrue']);
	dot['left'] -= dot['left'] % 5;
	dot['top'] -= dot['top'] % 5;
	dot['left'] = dot['left'] < boundary['leftfalse'] ? dot['left'] + 5 : dot['left'];
	dot['top'] = dot['top'] < boundary['topfalse'] ? dot['top'] + 5 : dot['top'];
	context.fillRect(dot['left'], dot['top'], size['width'], size['height']);
}
function setSize(width, height){
	size['width'] = width;
	size['height'] = height;
}
function setScore(newScore){
	$('#score').text(newScore);
}
function setDirection(newPropName, newIncreasing){
	propName = newPropName;
	increasing = newIncreasing;
}
function setPosition(left, top){
	prop['left'] = left;
	prop['top'] = top;
	body = [];
}
function loadBoundary(){
	boundary['lefttrue'] = canvas.width;
	boundary['leftfalse'] = 0;
	boundary['toptrue'] = canvas.height;
	boundary['topfalse'] = 0;
}
function calculateProps(){
	var hasAnotherTurn = true;
	increasing = oldPropName != propName ? increasing : oldIncreasing;
	oldPropName = propName;
	oldIncreasing = increasing;
	prop[propName] = prop[propName] + (increasing ? + amount : - amount);
	
	if(body.length > 1) {
		for(part = body.length - 1; part > 0; part --){
			if(prop['left'] == body[part]['left'] && prop['top'] == body[part]['top']){
				hasAnotherTurn = false;
				break;
			}
		}
	}
	
	var thisProp = prop[propName];
	var thisBoundary = boundary[propName + increasing];
	if(increasing ? thisProp > thisBoundary : thisProp < thisBoundary){
		prop[propName] = boundary[propName + !increasing];
	}
	
	var hasGrowth;
	if(prop['left'] == dot['left'] && prop['top'] == dot['top']){
		context.clearRect(dot['left'], dot['top'], size['width'], size['height']);
		loadDot();
		hasGrowth = true;
		setScore(body.length);
		if(body.length % 10 == 0){
			interval -= interval * 0.1;
		}
	}
	
	context.fillStyle = !hasAnotherTurn ? "rgb(200,0,0)" : context.fillStyle;
	updateBody(hasGrowth);
	return hasAnotherTurn;
}
function updateBody(hasGrowth){
	if(!hasGrowth && body.length){
		var oldProp = body.pop();
		context.clearRect(oldProp['left'], oldProp['top'], size['width'], size['height']);
	}
	var newProp = {};
	newProp['left'] = prop['left'];
	newProp['top'] = prop['top'];
	body.unshift(newProp);
	context.fillRect(prop['left'], prop['top'], size['width'], size['height']);
}
function move(){
	setTimeout(function(){
		if(autoPilot) {
			$(document).unbind('keydown');
			doAutoPilot();
		} else {
			trackKeys();
		}
		if(calculateProps()){
			move();
		}
	}, interval);
}
function trackKeys(){
	$(document).keydown(function(event){
		switch(event.which){
			case 37:
				increasing = false;
				propName = 'left'
				break;
			case 38:
				propName = 'top';
				increasing = false;
				break;
			case 39:
				propName = 'left';
				increasing = true;
				break;
			case 40:
				propName = 'top';
				increasing = true;
				break;
		}
	});
}
function trackCheckBox(){
	$('#autoPilot').change(function(){
		autoPilot = $(this).is(':checked');
	});
}
function doAutoPilot(){
	if(!avoidCollision() && gettingDot()){
		gettingNewDirection();
	}
}
function gettingDot(){
	return (propName = Math.abs(prop[propName] - dot[propName]) < amount ? propName == 'left' ? 'top' : 'left' : propName) != oldPropName;
	}
function avoidCollision(){
	var otherPropName = propName == 'left' ? 'top' : 'left';
	for(part = body.length - 1; part > 0; part --){
		if(prop[propName] + ((oldPropName != propName ? increasing : oldIncreasing) ? + amount : - amount) == body[part][propName] && prop[otherPropName] == body[part][otherPropName]){
			propName = otherPropName;
			gettingNewDirection();
			return true;
		}
	}
	return false;
}
function gettingNewDirection(){
	var otherPropName = propName == 'left' ? 'top' : 'left';
	var closestPart = {};
	closestPart['distance'] = -1;
	closestPart['direction'] = -1;
	for(part = body.length - 1; part > 0; part --){
		if(prop[otherPropName] == body[part][otherPropName]){
			var isGreater = body[part][propName] > prop[propName];
			var indirect = Math.abs(boundary[propName + !isGreater] - prop[propName]) + Math.abs(boundary[propName + isGreater] - body[part][propName]);
			var direct = Math.abs(prop[propName] - body[part][propName]);
			var distance = indirect > direct ? direct : indirect;
			var direction = indirect > direct ? !isGreater : isGreater;
			closestPart['distance'] = distance < closestPart['distance'] || closestPart['distance'] == -1 ? distance : closestPart['distance'];
			closestPart['direction'] = distance == closestPart['distance'] ? direction : closestPart['direction'];
		}
	}
	var isGreater = dot[propName] > prop[propName];
	var dotDirection = Math.abs(boundary[propName + !isGreater] - prop[propName]) + Math.abs(boundary[propName + isGreater] - dot[propName]) > Math.abs(prop[propName] - dot[propName]) ? isGreater : !isGreater;
	increasing = closestPart['direction'] != -1 ? closestPart['direction'] : dotDirection;
}
