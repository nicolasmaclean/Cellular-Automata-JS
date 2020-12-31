class UserInput
{
    constructor(viewer, canvas)
    {
        // static variables
        UserInput.viewer = viewer;
        UserInput.mouse_grabbing = false;
        UserInput.scrollDivider = 15;

        // adds mouse events
        canvas.onmousemove = function (event)
        {
            UserInput.mouseMove(event);
        };

        canvas.onmouseup = function (event)
        {
            UserInput.mouseUp_left(event);
        };

        canvas.onmousedown = function (event)
        {
            if (event.button === 0)
            {
                UserInput.mouseDown_left(event);
            }
        };

        canvas.onmouseleave = function (event)
        {
            UserInput.mouseUp_left(event);
            UserInput.viewer.needDraw = true;
            UserInput.viewer.drawing = false;
        };
        
        canvas.onwheel = function (event)
        {
            if (event.button === 0)
            {
                UserInput.mouseScroll(event);
            }
        };

        canvas.oncontextmenu = function (event) {
            event.preventDefault();
            UserInput.mouseClick_right(event);
        };

        document.onkeydown = function (event) {
            if (event.key === " ")
            {
                UserInput.spaceDown(event);
            }
            else if (event.key === "p" && !event.repeat)
            {
                UserInput.pDown(event);
            }
        }
    }

    // moves the viewer by mouse delta on mousemove event
    static mouseMove(e)
    {
        // tracks mouse position
        UserInput.viewer.mousePos = new Vector(e.clientX, e.clientY);

        // moves camera when the user is holding the canvas
        if (e.buttons === 1 && UserInput.mouse_grabbing)
        {
            UserInput.viewer.targetPos.add(new Vector(e.movementX, e.movementY));
            UserInput.viewer.needDraw = true;
        }

        // toggles cells states when the user holds left click 
        if (e.buttons === 2)
        {
            var coord = new Vector(e.clientX, e.clientY);
            coord = UserInput.viewer.screenToGrid(coord);

            // catches cells that were skipped by the mousemove event
            if (UserInput.viewer.coordsInLine.size() !== 0)
            {
                var lastCoord = UserInput.viewer.coordsInLine.get(UserInput.viewer.coordsInLine.size()-1);
                var dif = Vector.abs(Vector.sub(coord, lastCoord));

                // checks if there were cells missed
                if ( dif.x > 1 || dif.y > 1)
                {
                    // gets a set of coords between the new coord and the previous coord
                    var tweenerCoords = UserInput.lineGen(lastCoord, coord);
                    
                    tweenerCoords.forEach( (item) =>
                    {
                        UserInput.viewer.newCoords.add(item);
                    });
                }
            }

            UserInput.viewer.newCoords.add(coord);

            UserInput.viewer.needDraw = true;
            UserInput.viewer.drawing = true;
        }
    }
    
    // grabs canvas
    static mouseDown_left(e)
    {
        UserInput.mouse_grabbing = true;
        document.body.style.cursor = "grab";
    }
    
    // lets go of canvas
    static mouseUp_left(e)
    {
        UserInput.mouse_grabbing = false;
        document.body.style.cursor = "default";
    }
    
    // zooms in and out
    static mouseScroll(e)
    {
        UserInput.viewer.addZoom(-e.deltaY / UserInput.scrollDivider)
        UserInput.viewer.needDraw = true;
    }
    
    // selects cell and pushs to list
    static mouseClick_right(e)
    {
        UserInput.viewer.newCoords.add(UserInput.viewer.screenToGrid(new Vector(e.clientX, e.clientY)));
        UserInput.viewer.needDraw = true;
        UserInput.viewer.drawing = false;
    }

    // returns a set of integer coords between the given points using Bresenham's line algo from wikipedia
    static lineGen(v1, v2)
    {
        var x0 = Math.floor(v1.x);
        var y0 = Math.floor(v1.y);
        var x1 = Math.floor(v2.x);
        var y1 = Math.floor(v2.y);
        
        if (Math.abs(y1 - y0) < Math.abs(x1 - x0))
        {
            if (x0 > x1)
            return UserInput.plotLineLow(x1, y1, x0, y0);
            else
            return UserInput.plotLineLow(x0, y0, x1, y1);
        }
        else
        {
            if (y0 > y1)
            return UserInput.plotLineHigh(x1, y1, x0, y0);
            else
            return UserInput.plotLineHigh(x0, y0, x1, y1);
        }
        
    }
    
    static plotLineHigh(x0, y0, x1, y1)
    {
        var dx = x1 - x0;
        var dy = y1 - y0;
        var xi = 1;

        var coords = new NSet();

        if (dx < 0)
        {
            xi = -1;
            dx = -dx;
        }

        var D = (2 * dx) - dy;
        var x = x0;

        for (let y = y0; y <= y1; y++)
        {
            coords.add(new Vector(x, y));

            if (D > 0)
            {
                x = x + xi;
                D = D + (2 * (dx - dy));
            }
            else
            {
                D = D + 2*dx;
            }
        }

        return coords;
    }
    
    static plotLineLow(x0, y0, x1, y1)
    {
        var dx = x1 - x0;
        var dy = y1 - y0;
        var yi = 1;
        
        var coords = new NSet();
        
        if (dy < 0)
        {
            yi = -1;
            dy = -dy;
        }
        
        var D = (2 * dy) - dx;
        var y = y0;
        
        for (let x = x0; x <= x1; x++)
        {
            coords.add(new Vector(x, y));
            
            if (D > 0)
            {
                y = y + yi;
                D = D + (2 * (dy - dx));
            }
            else
            {
                D = D + 2*dy;
            }
        }

        return coords;
    }

    static spaceDown(e)
    {
        UserInput.viewer.step = true;
    }

    static pDown(e)
    {
        UserInput.viewer.paused = !UserInput.viewer.paused;
    }
}