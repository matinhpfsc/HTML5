function Player(image, imageIndex)
{
  this.location = new Vector2d(0,0);
  this.orientation = new Vector2d(0, 1);
  this.animationStartTimeStamp = null;
  this.image = image;
  this.imageIndex = imageIndex;
  this.speed = 0;
  
  this.move = function (timeStamp)
  {
    var playerCellPosition = new Vector2d(Math.floor((this.location.x + 24.5) / 50), Math.floor((this.location.y + 24.5) / 50));
    
    var cellLocation = playerCellPosition.mul(50);
    
    var distanceToCellLocation = (cellLocation.x - this.location.x) * this.orientation.x
			      + (cellLocation.y - this.location.y) * this.orientation.y;
  
    if (this.speed != 0)
    {
      if (this.animationStartTimeStamp == null)
      {
	this.animationStartTimeStamp = timeStamp;
      }
    }
    else
    {
      if (this.animationStartTimeStamp != null)
      {
	this.animationStartTimeStamp = null;
      }
    }
			      
    var currentPlayerSpeed = this.speed;
    if (currentPlayerSpeed > distanceToCellLocation)
    {
      //Pruefe, ob naechtse Zelle begehbar ist.
      if (gameMaze.getFieldValue(playerCellPosition.x + this.orientation.x, playerCellPosition.y + this.orientation.y) == 1)
      {
	currentPlayerSpeed = distanceToCellLocation;
      }
      else
      {
	  var distanceToOtherCellLocation = ((cellLocation.x - this.location.x) * Math.abs(this.orientation.y)
				+ (cellLocation.y - this.location.y) * Math.abs(this.orientation.x));

	  var currentPlayerOtherSpeed = Math.min(currentPlayerSpeed, Math.abs(distanceToOtherCellLocation));

	  var sgn = distanceToOtherCellLocation > 0 ? 1 : -1;
	  this.location.x += sgn * Math.abs(this.orientation.y) * currentPlayerOtherSpeed;
	  this.location.y += sgn * Math.abs(this.orientation.x) * currentPlayerOtherSpeed;
	  currentPlayerSpeed -= currentPlayerOtherSpeed;
      }
    }

    this.location = this.location.add(this.orientation.mul(currentPlayerSpeed));
  }
}

function Vector2d(x, y)
{
  this.x = x;
  this.y = y;

  this.mul = function(scalar)
  {
    return new Vector2d(this.x * scalar, this.y * scalar);
  };
  
  this.add = function(otherVector)
  {
    return new Vector2d(this.x + otherVector.x, this.y + otherVector.y);
  }
  
  this.equals = function(otherVector)
  {
    return this.x == otherVector.x && this.y == otherVector.y;
  }
}

UP = new Vector2d(0, -1);
DOWN = new Vector2d(0, +1);
LEFT = new Vector2d(-1, 0);
RIGHT = new Vector2d(+1, 0);

function ViewPort(width, height)  
{
  this.x = 0;
  this.y = 0;
  this.width = width;
  this.height = height;
}

function GameLoop(timeStamp)
{
  //TODO Spruenge begrenzen!

  for (var playerIndex = 0; playerIndex < allPlayers.length; playerIndex++)
  {
    allPlayers[playerIndex].move(timeStamp);
  }
  
  CorrectViewPort();
  DrawCanvas(timeStamp);
   
   if (Math.floor((humanPlayer.location.x + 25) / 50) == endCellColumn && Math.floor((humanPlayer.location.y  + 25) / 50) == endCellRow)
   {
     alert("Exit achieved");
   }
   else
   {
/*     if (start == 0)
     {
       start = timeStamp;
     }
     counter++;
     if ((timeStamp - start) > 10000)
     {
       var fps = counter / 10;
       alert(fps);
     }
     else*/
     {
    window.requestAnimFrame(GameLoop);
     }
   }
}

counter = 0;
start = 0;

function DrawCanvas(timeStamp)
{
  DrawMaze(viewPort);
  for (var playerIndex = 0; playerIndex < allPlayers.length; playerIndex++)
  {
    DrawPlayer(allPlayers[playerIndex], viewPort, timeStamp);
  }
  
  canvasContext.drawImage(doubleBufferCanvas, 0, 0);
}

function StartImageLoading()
{
   imageCount = 3;
   
   dungeonImage = new Image();
   dungeonImage.onload = OnImageLoaded;
   dungeonImage.src = "dungeon3.png"
   
   activeImage = new Image();
   activeImage.onload = OnImageLoaded;
   activeImage.src = "aktive.png";

   passiveImage = new Image();
   passiveImage.onload = OnImageLoaded;
   passiveImage.src = "passive.png";
}

function GetSpriteIndex(cellColumn, cellRow)
{
  if (gameMaze.getFieldValue(cellColumn, cellRow) == 0)
  {
    return 8;
  }
  else
  {
    var left = gameMaze.getFieldValue(cellColumn - 1, cellRow);
    var right = gameMaze.getFieldValue(cellColumn + 1, cellRow);
    var top = gameMaze.getFieldValue(cellColumn, cellRow - 1);
    var bottom = gameMaze.getFieldValue(cellColumn, cellRow + 1);

    var number = left * 8 + bottom * 4 + right * 2 + top * 1;
        
    return mazeSpriteIndexes[number];
  }  
}

function CorrectViewPort()
{
  var width = gameMaze.width;
  var height = gameMaze.height;
  
  var currentPlayer = humanPlayer;
  
  if (currentPlayer.location.x - viewPort.x > windowWidth - 150)
  {
    viewPort.x = currentPlayer.location.x - windowWidth + 150 ;
  }
  if (currentPlayer.location.x - viewPort.x < 100)
  {
    viewPort.x = currentPlayer.location.x - 100 ;
  }
  if (currentPlayer.location.y - viewPort.y > windowHeight - 150)
  {
    viewPort.y = currentPlayer.location.y - windowHeight + 150 ;
  }
  if (currentPlayer.location.y - viewPort.y < 100)
  {
    viewPort.y = currentPlayer.location.y - 100 ;
  }
  
  if (viewPort.x + windowWidth > width * 50)
  {
    viewPort.x = width * 50 - windowWidth;
  }
  if (viewPort.x < 0)
  {
    viewPort.x = 0;
  }
  if (viewPort.y + windowHeight > height * 50)
  {
    viewPort.y = height * 50 - windowHeight;
  }
  if (viewPort.y < 0)
  {
    viewPort.y = 0;
  }  
}

function DrawMaze(viewPort)
{
  var width = gameMaze.width;
  var height = gameMaze.height;
    
  var startColumn = Math.floor(viewPort.x / 50);
  var startRow = Math.floor(viewPort.y / 50);
  
  var endColumn = Math.ceil((viewPort.x + viewPort.width) / 50);
  var endRow = Math.ceil((viewPort.y + viewPort.height) / 50);
    
  width = Math.min(width, endColumn);
  height = Math.min(height, endRow);
  
  for (var cellColumn = startColumn; cellColumn < width; cellColumn++)
  {
    for (var cellRow = startRow; cellRow < height; cellRow++)
    {
      var spriteIndex = GetSpriteIndex(cellColumn, cellRow);
      
      var spriteY = Math.floor(spriteIndex / 5);
      var spriteX = spriteIndex % 5;
      doubleBufferCanvasContext.drawImage(dungeonImage, 50 * spriteX, 50 * spriteY, 50, 50, cellColumn * 50 - viewPort.x, cellRow * 50 - viewPort.y, 50, 50);
    }
  }  
}

function DrawPlayer(currentPlayer, viewPort, timeStamp)
{
  var animationIndex = 0;
  if (currentPlayer.animationStartTimeStamp != null)
  {
    animationIndex = Math.floor((timeStamp - currentPlayer.animationStartTimeStamp) / 100) % 8;
  }
  var spriteIndex = 0;
  if (currentPlayer.orientation.x > 0)
  {
    spriteIndex = 24;
  }
  if (currentPlayer.orientation.x < 0)
  {
    spriteIndex = 8;
  }
  if (currentPlayer.orientation.y > 0)
  {
    spriteIndex = 16;
  }
  spriteIndex += currentPlayer.imageIndex * 4 * 8 + animationIndex;
  var spriteY = Math.floor(spriteIndex / 8);
  var spriteX = spriteIndex % 8;
  doubleBufferCanvasContext.drawImage(currentPlayer.image, 50 * spriteX, 50 * spriteY, 50, 50, currentPlayer.location.x - viewPort.x, currentPlayer.location.y - viewPort.y, 50, 50);
}

function OnImageLoaded()
{
   imageCount--;
   if (imageCount == 0)
   {
     var width = 16 * 2;
     var height = 12 * 2;
     
     viewPort = new ViewPort(windowWidth, windowHeight);
     
     allPlayers = new Array();
     
     humanPlayer = new Player(activeImage, 1);
     humanPlayer.location.x = 50;
     humanPlayer.location.y = 50;
     allPlayers.push(humanPlayer);
     
     enemyPlayers = new Array();
     
     enemyPlayer = new Player(passiveImage, 1);
     enemyPlayer.location.x = 50 * (width - 2);
     enemyPlayer.location.y = 50 * (height - 2);
     enemyPlayer.speed = 2;
     allPlayers.push(enemyPlayer);
     enemyPlayers.push(enemyPlayer);

     enemyPlayer = new Player(passiveImage, 0);
     enemyPlayer.location.x = 50 * (width - 2);
     enemyPlayer.location.y = 50 * 1;
     enemyPlayer.speed = 2;
     allPlayers.push(enemyPlayer);
     enemyPlayers.push(enemyPlayer);
     
     enemyPlayer = new Player(activeImage, 4);
     enemyPlayer.location.x = 50 * 1;
     enemyPlayer.location.y = 50 * (height - 2);
     enemyPlayer.speed = 2;
     allPlayers.push(enemyPlayer);
     enemyPlayers.push(enemyPlayer);
     
     gameMaze = new Maze(width, height);
     
     window.addEventListener("keydown", OnKeyDown, false);
     window.addEventListener("keyup", OnKeyUp, false);

      doubleBufferCanvas = document.createElement("canvas");
      doubleBufferCanvas.width = windowWidth;
      doubleBufferCanvas.height = windowHeight;
      doubleBufferCanvasContext = doubleBufferCanvas.getContext("2d");

     setInterval(ComputerControledMove, 250);
      
     GameLoop(null);
   }
}

function ComputerControledMove()
{
  for (var playerIndex = 0; playerIndex < enemyPlayers.length; playerIndex++)
  {
  var currentPlayer = enemyPlayers[playerIndex];
  var playerCellPosition = new Vector2d(Math.floor((currentPlayer.location.x + 24.5) / 50), Math.floor((currentPlayer.location.y + 25.5) / 50));

  if (gameMaze.getFieldValue(playerCellPosition.x + currentPlayer.orientation.x, playerCellPosition.y + currentPlayer.orientation.y) == 1)
  {
      var possibleWays = new Array();
      if (gameMaze.getFieldValue(playerCellPosition.x + 0, playerCellPosition.y + 1) == 0 && !currentPlayer.orientation.equals(new Vector2d(0, -1)))
      {
	possibleWays.push(new Vector2d(0, 1));
      }
      if (gameMaze.getFieldValue(playerCellPosition.x + 1, playerCellPosition.y + 0) == 0 && !currentPlayer.orientation.equals(new Vector2d(-1, 0)))
      {
	possibleWays.push(new Vector2d(1, 0));
      }
      if (gameMaze.getFieldValue(playerCellPosition.x + 0, playerCellPosition.y - 1) == 0 && !currentPlayer.orientation.equals(new Vector2d(0, 1)))
      {
	possibleWays.push(new Vector2d(0, -1));
      }
      if (gameMaze.getFieldValue(playerCellPosition.x - 1, playerCellPosition.y + 0) == 0 && !currentPlayer.orientation.equals(new Vector2d(1, 0)))
      {
	possibleWays.push(new Vector2d(-1, 0));
      }

      if (possibleWays. length > 0)
      {
	currentPlayer.orientation = possibleWays[Math.floor(Math.random() * possibleWays.length)];
      }
      else
      {
	currentPlayer.orientation = currentPlayer.orientation.mul(-1);
      }
  }
  }
}

function OnKeyDown(e)
{
  var currentPlayer = humanPlayer;
  if (e.keyCode == 40)
  {
    currentPlayer.orientation = DOWN;
    currentPlayer.speed = 4;
    return;
  }
  if (e.keyCode == 38)
  {
    currentPlayer.orientation = UP;
    currentPlayer.speed = 4;
    return;
  }
  if (e.keyCode == 39)
  {
    currentPlayer.orientation = RIGHT;
    currentPlayer.speed = 4;
    return;
  }
  if (e.keyCode == 37)
  {
    currentPlayer.orientation = LEFT;
    currentPlayer.speed = 4;
    return;
  }
}

function OnKeyUp(e)
{
  humanPlayer.speed = 0;
}

function Start()
{
  //Set image indexes for the maze
  mazeSpriteIndexes = new Array(16);
  mazeSpriteIndexes[0] = 20;
  mazeSpriteIndexes[1] = 30;
  mazeSpriteIndexes[2] = 32;
  mazeSpriteIndexes[3] = 31;
  mazeSpriteIndexes[4] = 25;
  mazeSpriteIndexes[5] = 26;
  mazeSpriteIndexes[6] = 21;
  mazeSpriteIndexes[7] = 29;
  mazeSpriteIndexes[8] = 33;
  mazeSpriteIndexes[9] = 28;
  mazeSpriteIndexes[10] = 22;
  mazeSpriteIndexes[11] = 24;
  mazeSpriteIndexes[12] = 23;
  mazeSpriteIndexes[13] = 19;
  mazeSpriteIndexes[14] = 34;
  mazeSpriteIndexes[15] = 27;
  
   var canvas = document.getElementById("myCanvas");

   windowWidth = canvas.width;
   windowHeight = canvas.height;
   
   canvasContext = canvas.getContext("2d");
   
   window.requestAnimFrame = GetRequestAnimFrameFunction();
   
   StartImageLoading();
}

function GetRequestAnimFrameFunction()
{
  //These part copied from http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/:
  // shim layer with setTimeout fallback
  return  window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function(callback)
      {
	window.setTimeout(callback, 1000 / 60);
      };
}

Start();