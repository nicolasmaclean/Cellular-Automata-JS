import { Vector, NSet } from './import'

class UserInput
{
    // canvas be left out if you would like to manually call attachEvents later
    constructor(render, init_scrollDivider = 15)
    {
        // instantance variables
        this.render = render;
        this.render.viewer = render.viewer;
        this.scrollDivider = init_scrollDivider;

        this.keybinds = {
                pause: "p",         // pauses sim
                step: " ",          // steps sim once
                grabCanvas: "o",    // toggle left click between grabbing canvas and drawing cells
        };

        // state variables
        this.mouse_grabbing = false;
        this.eventsDidAttach = false;
        this.grabCanvas = true;

    } 
        
    // attaches all events to the given canvas
    attachEvents(canvas, attachKey = true, attachMouse = true)
    {
        // skips if events have already been attached
        if (this.eventsDidAttach)
        {
            return;
        }
        else
        {
            this.eventsDidAttach = true;
        }

        // attaches requested events
        if (attachMouse)
        {
            this.attachMouseEvent(canvas);
        }
        
        if (attachKey)
        {
            this.attachKeyEvents();
        }
    }

    // attaches all mouses events
    attachMouseEvent(canvas)
    {
        // moves canvas or draws cells
        canvas.onmousemove = function (event)
        {
            this.mouseMove(event);
        }.bind(this);

        // grabs canvas or nothing
        canvas.onmousedown = function (event)
        {
            if(this.grabCanvas)
            {
                this.grabGrid();
            }
            else{
                this.startDrawing(event);
            }
        }.bind(this);
        
        // releases canvas or toggles cell
        canvas.onmouseup = function (event)
        {
            if (this.grabCanvas)
            {
                this.releaseGrid();
            }
            else
            {
                this.toggleCellHandler(event);
            }
        }.bind(this);
        
        // releases canvas and stops drawing
        canvas.onmouseleave = function (event)
        {
            this.releaseGrid();
            this.stopDrawing();
            this.disableCursorStyle();
        }.bind(this);
        
        // enables cursor styling
        canvas.onmouseenter = function (event) {
            this.enableCursorStyle();
        }.bind(this);
        
        // zooms
        canvas.onwheel = function (event)
        {
            this.mouseScrollHandler(event);
        }.bind(this);
    }

    // attaches all keyboard events
    attachKeyEvents()
    {
        document.onkeydown = function (event) {
            if (event.key === this.keybinds.step)
            {
                this.singleStep();
            }
            else if (event.key === this.keybinds.pause && !event.repeat)
            {
                this.pauseToggle();
            }
            else if (event.key === this.keybinds.grabCanvas && !event.repeat)
            {
                this.grabCanvasToggle();
            }
        }.bind(this);
    }

    // moves the viewer by mouse delta on mousemove event
    mouseMove(e)
    {
        // grabs canvas to move it
        if (this.grabCanvas && e.buttons === 1 && this.mouse_grabbing)
        {
            this.moveGridHandeler(e);
        }
        
        // toggles cells states when the user holds left click 
        else if (!this.grabCanvas && e.buttons === 1)
        {
            this.drawCellsHandeler(e);
        }
    }

    // wapper for this.moveGrid to process mouse event info
    moveGridHandeler(e)
    {
        this.moveGrid(new Vector(e.movementX, e.movementY));
    }

    // moves viewer position by given movement vector
    moveGrid(movement)
    {
        this.render.viewer.targetPos.add(new Vector(movement.x, movement.y));
        this.render.needDraw = true;
    }
    
    // grabs canvas
    grabGrid()
    {
        this.mouse_grabbing = true;
    }
    
    // lets go of canvas
    releaseGrid()
    {
        this.mouse_grabbing = false;
    }

    // this.zoom wrapper that processes mouse event info
    mouseScrollHandler(e)
    {
        this.zoom(-e.deltaY / this.scrollDivider)
    }
    
    // zooms in and out
    zoom(inc)
    {
        this.render.viewer.addZoom(inc)
        this.render.needDraw = true;
    }

    // wrapper for this.drawCell() that processes mouse event info
    drawCellsHandeler(e)
    {
        this.drawCells(new Vector(e.clientX, e.clientY));
    }

    // wrapper for this.startDrawing that processes mouse event info
    startDrawingHandeler(e)
    {
        this.startDrawing(new Vector(e.clientX, e.clientY));
    }
    
    // draws the first cell in a line
    startDrawing(screenCoord)
    {
        this.render.lineCoordsAdd.add(this.render.viewer.screenToGrid(screenCoord));
        this.render.needDraw = true;
    }

    // draws cells
    drawCells(screenCoord)
    {
        // copies input and converts to grid space
        var coord = new Vector(screenCoord.x, screenCoord.y);
        coord = this.render.viewer.screenToGrid(coord);

        // catches cells that were skipped by the mousemove event
        if (this.render.lineCoordsDone.size() !== 0)
        {
            var lastCoord = this.render.lineCoordsDone.get(this.render.lineCoordsDone.size()-1);
            var dif = Vector.abs(Vector.sub(coord, lastCoord));

            // checks if there were cells missed
            if ( dif.x > 1 || dif.y > 1)
            {
                // gets a set of coords between the new coord and the previous coord
                var tweenerCoords = UserInput.lineGen(lastCoord, coord);
                
                tweenerCoords.forEach( (item) =>
                {
                    this.render.lineCoordsAdd.add(item);
                });
            }
        }

        this.render.lineCoordsAdd.add(coord);
        this.render.needDraw = true;
    }
    
    // stops drawing cells
    stopDrawing()
    {
        this.render.lineCoordsDone = new NSet();
        this.render.lineCoordsAdd = new NSet();
    }

    // this.toggleCell wrapper that processes mouse event info
    toggleCellHandler(e)
    {
        this.toggleCell(new Vector(e.clientX, e.clientY));
    }

    // toggles given cell
    toggleCell(screenCoords)
    {
        var gridCoord = this.render.viewer.screenToGrid(screenCoords);
        this.render.coordsSet.push([gridCoord, this.render.CellularAutomata.getCell(gridCoord)]);
        this.stopDrawing();
    }
    
    // steps the simulation once if it is paused or in the draw loop
    singleStep()
    {
        this.render.step = true;
    }
    
    // pauses simulation if in the simulation loop
    pauseToggle()
    {
        this.render.paused = !this.render.paused;
    }

    // switches left click between grabbing the canvas and drawing cells
    grabCanvasToggle()
    {
        this.grabCanvas = !this.grabCanvas;
        this.enableCursorStyle();
    }

    // enables cursor styles
    enableCursorStyle()
    {
        if (this.grabCanvas)
        {
            document.body.style.cursor = "grab";
        }
        else
        {
            document.body.style.cursor = "url('./drawCursor.png'), crossHair";
        }
    }

    // disables cursor styles
    disableCursorStyle()
    {
        document.body.style.cursor = "initial"
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
}

export default UserInput;