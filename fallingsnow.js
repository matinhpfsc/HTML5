
function Snow(x, y)
{
   this.X = x;
   this.Y = y;
   this.speed = Math.ceil(Math.random() * 2);
}

function GetAlphaValue(x, y)
{
   var sx = Math.floor(x);
   var sy = Math.floor(y);
   if (sx >= 0 && sx < windowWidth && sy >=0 && sy < windowHeight)
   {
      return alphaArray[sx][sy];
   }
   return 0;
}

function MoveSnow()
{
   for (var index = 0; index < snowCount; index++)
   {
      var snow = snowArray[index];
      var sx = Math.floor(snow.X);
      var sy = Math.floor(snow.Y);
      
      var middleX = sx + (snowSize / 2);
      var lowerY = sy + (snowSize / 2) + 1;
      
      var xSpeeds = new Array();
      for (var deltaX = -1; deltaX <= 1; deltaX++)
      {
         if (GetAlphaValue(middleX + deltaX, lowerY) == 0)
         {
            xSpeeds.push(deltaX);
         }
      }
      
      if (xSpeeds.length > 0)
      {
         var directionDecision = Math.floor(Math.random() * xSpeeds.length);
         snow.X += xSpeeds[directionDecision];

         snow.Y += snow.speed;
         if (snow.Y > windowHeight)
         {
            snow.Y = 0;
            snow.X = Math.floor(Math.random() * windowWidth);
         }
         else
         {
            if (snow.X < 0)
            {
               snow.X += windowWidth;
            }
            if (snow.X > windowWidth)
            {
               snow.X -= windowWidth;
            }
         }
      }
      else
      {
         fixedSnowCanvasContext.drawImage(snowImage, snow.X, snow.Y, snowSize, snowSize);
         
         alphaArray[sx + 1][sy + 0] = 1;
         alphaArray[sx + 0][sy + 1] = 1;
         alphaArray[sx + 1][sy + 1] = 1;
         alphaArray[sx + 2][sy + 1] = 1;
         alphaArray[sx + 1][sy + 2] = 1;

         snow.Y = 0;
         snow.X = Math.floor(Math.random() * windowWidth);
      }
   }
}

function DrawSnow()
{
   for (var index = 0; index < snowCount; index++)
   {
      var snow = snowArray[index];
      canvasContext.drawImage(snowImage, snow.X, snow.Y, snowSize, snowSize);
   }
}

function GameLoop()
{
   MoveSnow();   
   DrawCanvas();
}

function DrawCanvas()
{
   canvasContext.drawImage(backgroundImage, 0, 0, windowWidth, windowHeight);
   canvasContext.drawImage(fixedSnowCanvas, 0, 0);
   DrawSnow();
}
            
function CreateMask()
{
   fixedSnowCanvasContext.drawImage(treeImage, 0, 0, windowWidth, windowHeight);
   
   fixedSnowCanvasData = fixedSnowCanvasContext.getImageData(0, 0, windowWidth, windowHeight);
   
   alphaArray = new Array(windowWidth);
   for (var column = 0; column < windowWidth; column++)
   {
      alphaArray[column] = new Array(windowHeight);
      for (var row = 0; row < windowHeight; row++)
      {
         var index = (row * windowWidth + column) * 4;
         
         if (fixedSnowCanvasData.data[index + 3] < 175 && row < (windowHeight - 2) && column > 0 && column < (windowWidth - 1) )
         {
            alphaArray[column][row] = 0;
         }
         else
         {
            alphaArray[column][row] = 1;               
         }
      }
   }
}

function StartImageLoading()
{
   imageCount = 3;
   
   snowImage = new Image();
   snowImage.onload = OnImageLoaded;
   snowImage.src = "snow.png"
   
   treeImage = new Image();
   treeImage.onload = OnImageLoaded;
   treeImage.crossOrigin = "Anonymous";
   treeImage.src = "tree_small.png";

   backgroundImage = new Image();
   backgroundImage.onload = OnImageLoaded;
   backgroundImage.src = "background.png";
}

function OnImageLoaded()
{
   imageCount--;
   if (imageCount == 0)
   {
      CreateMask();
      setInterval(GameLoop, 40);
   }
}

function Start()
{
   var canvas = document.getElementById("myCanvas");

   windowWidth = canvas.width;
   windowHeight = canvas.height;
   snowCount = 300;
   snowSize = 3;
   snowArray = new Array(snowCount);

   for (var index = 0; index < snowCount; index++)
   {
      var x = Math.floor(Math.random() * windowWidth);
      var y = Math.floor(- index * (windowHeight / snowCount));
      snowArray[index] = new Snow(x, y);
   }
   
   canvasContext = canvas.getContext("2d");
   
   fixedSnowCanvas = document.createElement("canvas");
   fixedSnowCanvas.width = windowWidth;
   fixedSnowCanvas.height = windowHeight;
   fixedSnowCanvasContext = fixedSnowCanvas.getContext("2d");

   StartImageLoading();
}

Start();