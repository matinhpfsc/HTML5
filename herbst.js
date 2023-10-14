'use strict'

var leafs = [];
var fallingHeight = 500;

function Start()
{
    var fallContainer = document.getElementById("fall");
    var singleCharacterNodes = replaceTextWithSingleCharacterNodes(fallContainer);
    leafs = createLeafForEachNode(singleCharacterNodes);
        
    var game = new Game();
    var fallingScene = game.addScene(doNothing, moveLeafes, doNothing, {}); 
    
    fallingScene.activate();
} 

function replaceTextWithSingleCharacterNodes(element)
{
    if (element.nodeType == 3) // TEXT_NODE
    {
        return replaceTextNodeWithSingleCharacterSpans(element);
    }
    else // Normal node
    {
        if (element.textContent.length == 1)
        {
            return [element];
        }
        var characterNodes = [];
        var childNodes = Array.from(element.childNodes);
        for (var index = 0; index < childNodes.length; index++)
        {
            var childCharacterSpans = replaceTextWithSingleCharacterNodes(childNodes[index]);
            characterNodes = characterNodes.concat(childCharacterSpans);
        }
        return characterNodes;
    }
}

function replaceTextNodeWithSingleCharacterSpans(textNode)
{
    var text = textNode.textContent;

    var parentNode = null;
    if (textNode.parentNode.childNodes.length == 1)
    {
        parentNode = textNode.parentNode;
        textNode.parentNode.removeChild(textNode);
    }
    else
    {
        var containerSpan = document.createElement("span");
        textNode.parentNode.replaceChild(containerSpan, textNode);
        parentNode = containerSpan;
    }

    var characterSpans = [];
    for (var index = 0; index < text.length; index++)
    {
        var newSpan = document.createElement("span");
        newSpan.textContent = text[index];
        parentNode.appendChild(newSpan);
        characterSpans.push(newSpan);
    }
    return characterSpans;
}

function createLeafForEachNode(nodes)
{
    var leafs = [];
    for (var index = 0; index < nodes.length; index++)
    {
        var node = nodes[index];
        leafs.push(new Leaf(node, 5000 + Math.random() * 5000 + index * 200));
    }
    return leafs;
}

function Leaf(element, delay)
{
    this.delay = delay;
    this.speed = 0;
    this.top = 0;
    this.left = 0;
    this.maxLeft = (1 - (2 * (Math.trunc(delay / 1000) % 2))) * 10;
    this.time = -delay;
    this.element = element;
    this.element.style.position = "relative";
    this.currentColorRedValue = 0;
    this.currentColorGreenValue = 0;
    this.currentColorBlueValue = 0;

    this.currentColor = [0, 0, 0];
    this.targetColor = getRandomColor();
    
    this.move = function(delayTime)
        {
            this.time += delayTime;
            if (this.time < 0)
            {
                this.changeColor();
            }
            else
            {
                if (this.top < fallingHeight)
                {
                    this.changePosition(delayTime);
                }
            }
        }
        
    this.changeColor = function()
        {
            var weight = (1 + this.time / this.delay);
            this.element.style.color = "rgb(" + this.currentColor[0] + "," + this.currentColor[1] + "," + this.currentColor[2] + ")";
            this.currentColor[0] = weight * this.targetColor[0];
            this.currentColor[1] = weight * this.targetColor[1];
            this.currentColor[2] = weight * this.targetColor[2];
        }    

    this.changePosition = function(delayTime)
        {
            this.speed = (1 + Math.cos(this.time * Math.PI / 2000)) * 10 / 1000 + 50 / 1000;
            this.top += this.speed * delayTime;
            this.left = Math.sin(this.time * Math.PI / 3000) * this.maxLeft;
            this.element.style.top =  this.top + "px";
            this.element.style.left = this.left + "px";
            this.element.style.opacity = 1 - Math.pow(this.top / fallingHeight, 3);
        }
}

function getRandomColor()
{
    var colors = [
            [120, 0, 0],
            [0, 120, 0],
            [170, 170, 0],
        ];
    
    var colorIndex = Math.trunc(Math.random() * colors.length);
    return colors[colorIndex];
}

function doNothing() {}

function moveLeafes(delayTime) // ms
{
    for (var index = 0; index < leafs.length; index++)
    {
        var leaf = leafs[index];
        leaf.move(delayTime);
    }
}

Start();
