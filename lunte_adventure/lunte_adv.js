
function Player()
{
  this.location = new Vector2d(0,0);
  this.orientation = new Vector2d(0, 1);
}

function Vector2d(x, y)
{
  this.x = x;
  this.y = y;
  this.mul = function(scalar)
  {
    return new Vector2d(this.x * scalar, this.y * scalar);
  };
}

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

  var playerCellPosition = new Vector2d(Math.floor((humanPlayer.location.x + 24.5) / 50), Math.floor((humanPlayer.location.y + 25.5) / 50));
  
  var cellLocation = playerCellPosition.mul(50);
  
  var distanceToCellLocation = (cellLocation.x - humanPlayer.location.x) * humanPlayer.orientation.x
			     + (cellLocation.y - humanPlayer.location.y) * humanPlayer.orientation.y;
  
  var currentPlayerSpeed = playerSpeed;
  if (playerSpeed > distanceToCellLocation)
  {
    //Pruefe, ob naechtse Zelle begehbar ist.
    if (mazeMatrix[playerCellPosition.y + humanPlayer.orientation.y][playerCellPosition.x + humanPlayer.orientation.x] == 1)
    {
      currentPlayerSpeed = Math.min(playerSpeed, distanceToCellLocation);
    }
    else
    {
	var distanceToOtherCellLocation = ((cellLocation.x - humanPlayer.location.x) * Math.abs(humanPlayer.orientation.y)
			      + (cellLocation.y - humanPlayer.location.y) * Math.abs(humanPlayer.orientation.x));

	var currentPlayerOtherSpeed = Math.min(playerSpeed, Math.abs(distanceToOtherCellLocation));
	if (distanceToOtherCellLocation > 0)
	{
	  humanPlayer.location.x += Math.abs(humanPlayer.orientation.y) * currentPlayerOtherSpeed;
	  humanPlayer.location.y += Math.abs(humanPlayer.orientation.x) * currentPlayerOtherSpeed;
	}
	else
	{
  	  humanPlayer.location.x -= Math.abs(humanPlayer.orientation.y) * currentPlayerOtherSpeed;
	  humanPlayer.location.y -= Math.abs(humanPlayer.orientation.x) * currentPlayerOtherSpeed;
	}
	currentPlayerSpeed = playerSpeed - currentPlayerOtherSpeed;
    }
  }

  humanPlayer.location.x += humanPlayer.orientation.x * currentPlayerSpeed;
  humanPlayer.location.y += humanPlayer.orientation.y * currentPlayerSpeed;

  CorrectViewPort();
  DrawCanvas();
   
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
    window.requestAnimationFrame(GameLoop);
     }
   }
}

counter = 0;
start = 0;

function DrawCanvas()
{
  DrawMaze(mazeMatrix, viewPort);
  DrawPlayer(viewPort);
  
  canvasContext.drawImage(doubleBufferCanvas, 0, 0);
}
            
function DivideChamber(mazeMatrix, chamberX, chamberY, chamberWidth, chamberHeight)
{
  var minimumCellSize = 1;
  minimumCellSize = Math.max(minimumCellSize, 1);

  var wallXPosition = GetWallXPosition(mazeMatrix, chamberX, chamberY, chamberWidth, chamberHeight, minimumCellSize);
  var wallYPosition = GetWallYPosition(mazeMatrix, chamberX, chamberY, chamberWidth, chamberHeight, minimumCellSize);

  var topDoorCap = 1;
  var bottomDoorCap = 1;
  var leftDoorCap = 1;
  var rightDoorCap = 1;
  
  var noDoorIndex = 0;
  if (wallXPosition != null && wallYPosition != null)
  {
    noDoorIndex = Math.floor(Math.random() * 4);
  }
  else
  {
    if (wallXPosition != null)
    {
      noDoorIndex = Math.floor(Math.random() * 2);
    }
    else
    {
      noDoorIndex = Math.floor(Math.random() * 2) + 2;
    }
  }
  
  
  if (noDoorIndex == 0)
  {
    topDoorCap = 0;
  }
  else
  {
    if (noDoorIndex == 1)
    {
      bottomDoorCap = 0;
    }
    else
    {
      if (noDoorIndex == 2)
      {
	rightDoorCap = 0;
      }
      else
      {
	if (noDoorIndex == 3)
	{
	  leftDoorCap = 0;
	}
      }
    }
  }
  
  if (wallXPosition != null)
  {
    for (var y = chamberY + topDoorCap; y < chamberY + chamberHeight - bottomDoorCap; y++)
    {
      mazeMatrix[y][wallXPosition] = 1;
    }
  }
  if (wallYPosition != null)
  {
    for (var x = chamberX + leftDoorCap; x < chamberX + chamberWidth - rightDoorCap; x++)
    {
      mazeMatrix[wallYPosition][x] = 1;
    }
  }

  if (wallXPosition != null && wallYPosition != null)
  {
    //LT
    DivideChamber(mazeMatrix, chamberX, chamberY, wallXPosition - chamberX, wallYPosition - chamberY);
    //RT
    DivideChamber(mazeMatrix, wallXPosition + 1, chamberY, chamberX + chamberWidth - (wallXPosition + 1), wallYPosition - chamberY);
    //LB
    DivideChamber(mazeMatrix, chamberX, wallYPosition + 1, wallXPosition - chamberX, chamberY + chamberHeight - (wallYPosition + 1));
    //RB
    DivideChamber(mazeMatrix, wallXPosition + 1, wallYPosition + 1, chamberX + chamberWidth - (wallXPosition + 1), chamberY + chamberHeight - (wallYPosition + 1));
  }
  else
  {
    if (wallXPosition != null)
    {
      //L
      DivideChamber(mazeMatrix, chamberX, chamberY, wallXPosition - chamberX, chamberHeight);
      //R
      DivideChamber(mazeMatrix, wallXPosition + 1, chamberY, chamberX + chamberWidth - (wallXPosition + 1), chamberHeight);
    }
    else
    {
      if (wallYPosition != null)
      {
	//T
	DivideChamber(mazeMatrix, chamberX, chamberY, chamberWidth, wallYPosition - chamberY);
	//B
	DivideChamber(mazeMatrix, chamberX, wallYPosition + 1, chamberWidth, chamberY + chamberHeight - (wallYPosition + 1));
      }
    }
  }
}

function GetWallXPosition(mazeMatrix, chamberX, chamberY, chamberWidth, chamberHeight, minimumCellSize)
{
  var validWallPositions = new Array();
  for (var x = chamberX + minimumCellSize; x < chamberX + chamberWidth - minimumCellSize; x++)
  {
    if (mazeMatrix[chamberY - 1][x] == 1 && mazeMatrix[chamberY + chamberHeight][x] == 1)
    {
      validWallPositions[validWallPositions.length] = x;
    }
  }

  if (validWallPositions.length > 0)
  {
    var index = Math.floor(Math.random() * validWallPositions.length);
    return validWallPositions[index];
  }
  return null;
}

function GetWallYPosition(mazeMatrix, chamberX, chamberY, chamberWidth, chamberHeight, minimumCellSize)
{
  var validWallPositions = new Array();
  for (var y = chamberY + minimumCellSize; y < chamberY + chamberHeight - minimumCellSize; y++)
  {
    if (mazeMatrix[y][chamberX - 1] == 1 && mazeMatrix[y][chamberX + chamberWidth] == 1)
    {
      validWallPositions[validWallPositions.length] = y;
    }
  }
  
  if (validWallPositions.length > 0)
  {
    var index = Math.floor(Math.random() * validWallPositions.length);
    return validWallPositions[index];
  }
  return null;
}

function CreateLabyrint(width, height)
{
  var mazeMatrix = new Array();
  for (var cellRow = 0; cellRow < height; cellRow++)
  {
    mazeMatrix[cellRow] = new Array();
    for (var cellColumn = 0; cellColumn < width; cellColumn++)
    {
      var value = 0;
      if (cellColumn == 0 || cellRow == 0 || cellColumn + 1 == width || cellRow + 1 == height)
      {
	value = 1;
      }
      mazeMatrix[cellRow][cellColumn] = value;
    }
  }
  
  var side = Math.floor(Math.random() * 4);
  
  endCellColumn = 0
  endCellRow = 0;
  
  if (side == 0)
  {
    endCellRow = 0;
    endCellColumn = Math.floor(Math.random() * (width - 2)) + 1;
    mazeMatrix[0][endCellColumn] = 0;
  }
  else
  {
    if (side == 1)
    {
      endCellRow = Math.floor(Math.random() * (height - 2)) + 1;
      endCellColumn = width - 1;
    }
    else
    {
      if (side == 1)
      {
	endCellRow = height - 1;
	endCellColumn = Math.floor(Math.random() * (width - 2)) + 1;
      }
      else
      {
	endCellRow = Math.floor(Math.random() * (height - 2)) + 1;
	endCellColumn = 0;
      }
    }
    mazeMatrix[endCellRow][endCellColumn] = 0;
  }
    
  DivideChamber(mazeMatrix, 1, 1, width - 2, height - 2);
  
  return mazeMatrix;
}

function StartImageLoading()
{
   imageCount = 2;
   
   dungeonImage = new Image();
   dungeonImage.onload = OnImageLoaded;
   dungeonImage.src = "dungeon3.png"
   
   activeImage = new Image();
   activeImage.onload = OnImageLoaded;
   activeImage.src = "aktive.png";
}


function GetMazeMatrixValue(mazeMatrix, cellColumn, cellRow)
{
  if (cellColumn < 0 || cellRow < 0 || cellRow >= mazeMatrix.length || cellColumn >= mazeMatrix[cellRow].length)
  {
    return 0;
  }
  return mazeMatrix[cellRow][cellColumn];
}


function GetSpriteIndex(mazeMatrix, cellColumn, cellRow)
{
  if (GetMazeMatrixValue(mazeMatrix, cellColumn, cellRow) == 0)
  {
    return 8;
  }
  else
  {
    var left = GetMazeMatrixValue(mazeMatrix, cellColumn - 1, cellRow);
    var right = GetMazeMatrixValue(mazeMatrix, cellColumn + 1, cellRow);
    var top = GetMazeMatrixValue(mazeMatrix, cellColumn, cellRow - 1);
    var bottom = GetMazeMatrixValue(mazeMatrix, cellColumn, cellRow + 1);

    var number = left * 8 + bottom * 4 + right * 2 + top * 1;
        
    return mazeSpriteIndexes[number];
  }  
}

function CorrectViewPort()
{
  var width = mazeMatrix[0].length;
  var height = mazeMatrix.length;
  
  if (humanPlayer.location.x - viewPort.x > windowWidth - 150)
  {
    viewPort.x = humanPlayer.location.x - windowWidth + 150 ;
  }
  if (humanPlayer.location.x - viewPort.x < 100)
  {
    viewPort.x = humanPlayer.location.x - 100 ;
  }
  if (humanPlayer.location.y - viewPort.y > windowHeight - 150)
  {
    viewPort.y = humanPlayer.location.y - windowHeight + 150 ;
  }
  if (humanPlayer.location.y - viewPort.y < 100)
  {
    viewPort.y = humanPlayer.location.y - 100 ;
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

function DrawMaze(mazeMatrix, viewPort)
{
  var width = mazeMatrix[0].length;
  var height = mazeMatrix.length;
    
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
      var spriteIndex = GetSpriteIndex(mazeMatrix, cellColumn, cellRow);
      
      var spriteY = Math.floor(spriteIndex / 5);
      var spriteX = spriteIndex % 5;
      doubleBufferCanvasContext.drawImage(dungeonImage, 50 * spriteX, 50 * spriteY, 50, 50, cellColumn * 50 - viewPort.x, cellRow * 50 - viewPort.y, 50, 50);
    }
  }  
}

function DrawPlayer(viewPort)
{
  var spriteIndex = 0;
  if (humanPlayer.orientation.x > 0)
  {
    spriteIndex = 24;
  }
  if (humanPlayer.orientation.x < 0)
  {
    spriteIndex = 8;
  }
  if (humanPlayer.orientation.y > 0)
  {
    spriteIndex = 16;
  }
  var spriteY = Math.floor(spriteIndex / 8);
  var spriteX = spriteIndex % 8;
  doubleBufferCanvasContext.drawImage(activeImage, 50 * spriteX, 50 * spriteY, 50, 50, humanPlayer.location.x - viewPort.x, humanPlayer.location.y - viewPort.y, 50, 50);
}

function OnImageLoaded()
{
   imageCount--;
   if (imageCount == 0)
   {
     var width = 16 * 2;
     var height = 12 * 2;
     
     viewPort = new ViewPort(windowWidth, windowHeight);
     
     humanPlayer = new Player();
     humanPlayer.location.x = 50;
     humanPlayer.location.y = 50;
     playerSpeed = 0;
     
     mazeMatrix = CreateLabyrint(width, height);
     
     //DrawMaze(mazeMatrix, viewPort);
     
     window.addEventListener("keydown", OnKeyDown, false);
     window.addEventListener("keyup", OnKeyUp, false);

      doubleBufferCanvas = document.createElement("canvas");
      doubleBufferCanvas.width = windowWidth;
      doubleBufferCanvas.height = windowHeight;
      doubleBufferCanvasContext = doubleBufferCanvas.getContext("2d");

     //setInterval(GameLoop, 40);
     GameLoop(null);
   }
}

function OnKeyDown(e)
{
  if (e.keyCode == 40)
  {
    humanPlayer.orientation.x = 0;
    humanPlayer.orientation.y = +1;
    playerSpeed = 4;
    return;
  }
  if (e.keyCode == 38)
  {
    humanPlayer.orientation.x = 0;
    humanPlayer.orientation.y = -1;
    playerSpeed = 4;
    return;
  }
  if (e.keyCode == 39)
  {
    humanPlayer.orientation.x = +1;
    humanPlayer.orientation.y = 0;
    playerSpeed = 4;
    return;
  }
  if (e.keyCode == 37)
  {
    humanPlayer.orientation.x = -1;
    humanPlayer.orientation.y = 0;
    playerSpeed = 4;
    return;
  }
}

function OnKeyUp(e)
{
  playerSpeed = 0;
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
   
   StartImageLoading();
}

Start();