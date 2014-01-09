function Maze(width, height)
{
  this.EMPTY = 0;
  this.WALL = 1;
  
  this.width = width;
  this.height = height;
  this.getFieldValue = function(cellColumn, cellRow)
  {
    if (cellColumn < 0 || cellRow < 0 || cellRow >= height || cellColumn >= width)
    {
      return this.EMPTY;
    }
    return mazeMatrix[cellRow][cellColumn];
  }

  var mazeMatrix = CreateLabyrint(width, height);
  
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
}