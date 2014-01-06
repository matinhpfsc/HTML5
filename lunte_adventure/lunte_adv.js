
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
  //var targetCellColumn = 0;
  //var targetCellRow = 0;

  var playerCellX = Math.floor((playerX + 24.5) / 50);
  var playerCellY = Math.floor((playerY + 25.5) / 50);
  
  var cellLocationX = playerCellX * 50;
  var cellLocationY = playerCellY * 50;
  
  var distanceToCellLocation = (cellLocationX - playerX) * orientationX
			     + (cellLocationY - playerY) * orientationY;
  
  var currentPlayerSpeed = playerSpeed;
  if (playerSpeed > distanceToCellLocation)
  {
    //Pruefe, ob naechtse Zelle begehbar ist.
    if (mazeMatrix[playerCellY + orientationY][playerCellX + orientationX] == 1)
    {
      currentPlayerSpeed = Math.min(playerSpeed, distanceToCellLocation);
    }
    else
    {
	var distanceToOtherCellLocation = ((cellLocationX - playerX) * Math.abs(orientationY)
			      + (cellLocationY - playerY) * Math.abs(orientationX));

	var currentPlayerOtherSpeed = Math.min(playerSpeed, Math.abs(distanceToOtherCellLocation));
	if (distanceToOtherCellLocation > 0)
	{

	  playerX += Math.abs(orientationY) * currentPlayerOtherSpeed;
	  playerY += Math.abs(orientationX) * currentPlayerOtherSpeed;
	}
	else
	{
  	  playerX -= Math.abs(orientationY) * currentPlayerOtherSpeed;
	  playerY -= Math.abs(orientationX) * currentPlayerOtherSpeed;
	}
	currentPlayerSpeed = playerSpeed - currentPlayerOtherSpeed;
    }
  }

  playerX += orientationX * currentPlayerSpeed;
  playerY += orientationY * currentPlayerSpeed;

  CorrectViewPort();
   DrawCanvas();
   
   if (Math.floor((playerX + 25) / 50) == endCellColumn && Math.floor((playerY  + 25) / 50) == endCellRow)
   {
     alert("Exit achieved");
   }
   else
   {
    window.requestAnimationFrame(GameLoop);
   }
}

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

function GetSpriteIndex(mazeMatrix, cellColumn, cellRow)
{
  if (mazeMatrix[cellRow][cellColumn] == 0)
  {
    return 8;
  }
  else
  {
    var top = 0;
    var right = 0;
    var bottom = 0;
    var left = 0;
    
    if (cellColumn > 0)
    {
      if (mazeMatrix[cellRow][cellColumn - 1] == 1)
      {
	left = 1;
      }
      else
      {
	left = 0;
      }
    }
    else
    {
      left = 0;
    }

    if (cellColumn < mazeMatrix[cellRow].length - 1)
    {
      if (mazeMatrix[cellRow][cellColumn + 1] == 1)
      {
	right = 1;
      }
      else
      {
	right = 0;
      }
    }
    else
    {
      right = 0;
    }

    //---
    
    if (cellRow > 0)
    {
      if (mazeMatrix[cellRow - 1][cellColumn] == 1)
      {
	top = 1;
      }
      else
      {
	top = 0;
      }
    }
    else
    {
      top = 0;
    }

    if (cellRow < mazeMatrix.length - 1)
    {
      if (mazeMatrix[cellRow + 1][cellColumn] == 1)
      {
	bottom = 1;
      }
      else
      {
	bottom = 0;
      }
    }
    else
    {
      bottom = 0;
    }

    var number = left * 8 + bottom * 4 + right * 2 + top * 1;
    
    if (number == 10)
    {
      return 22;
    }
    if (number == 15)
    {
      return 27;
    }
    if (number == 5)
    {
      return 26;
    }
    if (number == 1)
    {
      return 30;
    }
    if (number == 4)
    {
      return 25;
    }
    if (number == 2)
    {
      return 32;
    }
    if (number == 8)
    {
      return 33;
    }
    if (number == 3)
    {
      return 31;
    }
    if (number == 6)
    {
      return 21;
    }
    if (number == 12)
    {
      return 23;
    }
    if (number == 9)
    {
      return 28;
    }
    if (number == 7)
    {
      return 29;
    }
    if (number == 14)
    {
      return 34;
    }
    if (number == 13)
    {
      return 19;
    }
    if (number == 11)
    {
      return 24;
    }
    
    return 20;
  }  
}

function CorrectViewPort()
{
  var width = mazeMatrix[0].length;
  var height = mazeMatrix.length;
  
  if (playerX - viewPort.x > windowWidth - 150)
  {
    viewPort.x = playerX - windowWidth + 150 ;
  }
  if (playerX - viewPort.x < 100)
  {
    viewPort.x = playerX - 100 ;
  }
  if (playerY - viewPort.y > windowHeight - 150)
  {
    viewPort.y = playerY - windowHeight + 150 ;
  }
  if (playerY - viewPort.y < 100)
  {
    viewPort.y = playerY - 100 ;
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
  if (orientationX > 0)
  {
    spriteIndex = 24;
  }
  if (orientationX < 0)
  {
    spriteIndex = 8;
  }
  if (orientationY > 0)
  {
    spriteIndex = 16;
  }
  var spriteY = Math.floor(spriteIndex / 8);
  var spriteX = spriteIndex % 8;
  doubleBufferCanvasContext.drawImage(activeImage, 50 * spriteX, 50 * spriteY, 50, 50, playerX - viewPort.x, playerY - viewPort.y, 50, 50);
}

function OnImageLoaded()
{
   imageCount--;
   if (imageCount == 0)
   {
     var width = 16 * 2;
     var height = 12 * 2;
     
     viewPort = new ViewPort(windowWidth, windowHeight);
     
     playerX = 50;
     playerY = 50;
     playerSpeed = 0;
     playerDirectionX = 0;
     playerDirectionY = 0;
     orientationX = 0;
     orientationY = 1;
     
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
    orientationX = 0;
    orientationY = +1;
    playerSpeed = 4;
    return;
  }
  if (e.keyCode == 38)
  {
    orientationX = 0;
    orientationY = -1;
    playerSpeed = 4;
    return;
  }
  if (e.keyCode == 39)
  {
    orientationX = +1;
    orientationY = 0;
    playerSpeed = 4;
    return;
  }
  if (e.keyCode == 37)
  {
    orientationX = -1;
    orientationY = 0;
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
   var canvas = document.getElementById("myCanvas");

   windowWidth = canvas.width;
   windowHeight = canvas.height;
   
   canvasContext = canvas.getContext("2d");
   
   StartImageLoading();
}

Start();