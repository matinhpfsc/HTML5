'use strict'

function Game()
{
   function doNothing() {};
   
   this.currentScene = new Scene(this, doNothing, doNothing, doNothing, {});
   this.lastTimeStamp = 0;
   this.maximumAnimationTimeSpan = 20;
   
   this.getRequestAnimFrameFunction = function()
      {
         //These part copied from http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/:
         //shim layer with setTimeout fallback
         return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function(callback) {
                      window.setTimeout(callback, 1000 / 60);
                  };
      };   
   
   window.requestAnimFrame = this.getRequestAnimFrameFunction();   
   this.getTimeSpan = function()
      {
         var timeStamp = Date.now();
         var timeSpan = timeStamp - this.lastTimeStamp;
         return Math.min(timeSpan, this.maximumAnimationTimeSpan); //To avoid greate jumps.
      };
   
   var owner = this;
   function loop()
      {
         owner.nextStep(owner.getTimeSpan());
         owner.lastTimeStamp = Date.now();
         window.requestAnimFrame(loop);
      };

   this.nextStep = function(deltaTime)
      {
         this.currentScene.calculateStep(deltaTime);
         this.currentScene.drawCanvas();
      };
      
   this.activate = function(scene)
      {
         //Remove the event handlers of the current scene.
         for (var eventName in this.currentScene.eventHandlers)
         {
            window.removeEventListener(eventName, this.currentScene.eventHandlers[eventName], false);
         }
         this.currentScene = scene;
         this.currentScene.init();
         //Add the event handlers of the current scene.
         for (var eventName in this.currentScene.eventHandlers)
         {
            window.addEventListener(eventName, this.currentScene.eventHandlers[eventName], false);
         }
      };

   this.addScene = function(initScene, calculateStep, drawCanvas, eventHandlers)
   {
      return new Scene(this, initScene, calculateStep, drawCanvas, eventHandlers);
   }
      
   loop();
}

function Scene(game, initScene, calculateStep, drawCanvas, eventHandlers)
{
   this.init = initScene;
   this.calculateStep = calculateStep;
   this.drawCanvas = drawCanvas;
   this.eventHandlers = eventHandlers;
   this.activate = function()
      {
         game.activate(this);
      };
}

function Vector2d(x, y)
{
   this.x = x;
   this.y = y;
   
   this.add = function(otherVector)
   {
      return new Vector2d(this.x + otherVector.x, this.y + otherVector.y);
   }

   this.sub = function(otherVector)
   {
      return new Vector2d(this.x - otherVector.x, this.y - otherVector.y);
   }
      
   this.mul = function(scalar)
   {
      return new Vector2d(this.x * scalar, this.y * scalar);
   }

   this.div = function(scalar)
   {
      return new Vector2d(this.x / scalar, this.y / scalar);
   }   
   
   this.normalize = function()
   {
      var length = this.getLength();

      if (length > 0)
      {
         return new Vector2d(this.x / length, this.y / length);
      }
      return new Vector2d(0, 0);
   }
   
   this.getLength = function()
   {
      return Math.sqrt(this.x * this.x + this.y * this.y);
   }
}
