// this renders a given GridPrender to a HTML canvas\

class CARender
{
    constructor(init_loopState, init_windowSize, init_clr_bg = "#c0c0c0", init_fps = 10, init_fpsS = 20)
    {
        // configurations
        this.clr_bg = init_clr_bg;
        this.updateState = init_loopState;
        
        // initializes simulation
        this.CellularAutomata = new CellularAutomata();
        this.viewer = new Viewer(init_windowSize);
        
        this.CellularAutomata.grid.setCells_true([new Vector(-1, 0), new Vector(0, 0), new Vector(1, 0)]);
        
        // FPS controller stuff
        this.fps = init_fps;
        this.fpsS = init_fpsS;

        this.fpsInterval = 1000 / this.fps;
        this.fpsIntervalS = 1000 / this.fpsS;

        this.lastFrame = 0;
        this.lastFrameS = 0;
    }

    // TODO: add parameter to control if the fps stuff should be reset provided elapsed is big enough
    // returns the update state and advances the update state
    checkState(updateFPSTracking)
    {
        // frame rate control
        var currentFrame = Date.now();
        var elapsed = currentFrame - this.lastFrame;
        
        var currentFrameS = Date.now();
        var elapsedS = currentFrameS - this.lastFrameS;
        
        // simulation loop
        if (!this.viewer.paused && this.updateState === CARender.loopEnum.stepLoop && elapsed > this.fpsInterval)
        {
            if (updateFPSTracking)
            {
                this.lastFrame = currentFrame - (elapsed % this.fpsInterval);
            }
            
            return CARender.renderState.step;
        }
        
        // single step
        else if ((this.updateState !== CARender.loopEnum.stepLoop || this.viewer.paused) && this.viewer.step && elapsedS > this.fpsIntervalS) // add a fps controller
        {
            if (updateFPSTracking)
            {
                this.lastFrameS = currentFrameS - (elapsedS % this.fpsIntervalS);
            }
            
            this.viewer.step = false;

            return CARender.renderState.step;
        }
        
        // TODO: move viewer.pos == viewer.target pos to be handelled in viewer.update and have it modify viewer.needDraw
        // draw loop
        else if (((this.viewer.paused || this.updateState === CARender.loopEnum.drawLoop) && this.viewer.needDraw) || this.viewer.needDraw || !this.viewer.targetPos.equals(this.viewer.pos))
        {
            this.viewer.needDraw = false;
            return CARender.renderState.draw;
        }

        // no loop
        else if (this.updateState === CARender.loopEnum.noLoop)
        {
            return CARender.renderState.noLoop;
        }

        // nothing
        else
        {
            return CARender.renderState.nothing;
        }
    }

    // checks the state of the simulation/render and will step the simulation or render it if necessary. returns true if the update loop should continue.
    Update(drawContext, PreStepFunc = CARender.PreStepDraw, PostStepFunc = CARender.PostStepDraw, DrawStyleFunc = CARender.DrawStyle, DrawCellFunc = CARender.DrawCell)
    {
        // be careful this will update frame controller
        var renderState = this.checkState(true);

        // steps the simulation
        if (renderState === CARender.renderState.step)
        {
            this.handleInput();
            renderer.PreStep(drawContext, PreStepFunc);
            renderer.Step()
            renderer.PostStep(drawContext, PostStepFunc, DrawStyleFunc, DrawCellFunc);
        }

        // draws the grid
        else if (renderState === CARender.renderState.draw)
        {
            this.handleInput();
            renderer.Draw(drawContext, PreStepFunc, PostStepFunc, DrawStyleFunc, DrawCellFunc);
        }

        // does nothing
        else if (renderState === CARender.renderState.nothing)
        {
            // console.log("nothin");
        }

        // no loop
        else if (renderState === CARender.renderState.noLoop)
        {
            console.log("no loop");
            return false;
        }

        // flag to indicate loop should be continued
        return true;
    }

    // returns a js object with cell colors as keys and stored as their values
    drawGridData()
    {
        var cells = Cell.getBatchObject();

        // grid coords within the window bounds, inclusive
        this.xBounds = new Vector(Math.floor(-this.viewer.pos.x/this.viewer.cellSize), Math.floor((-this.viewer.pos.x+canvas.width)/this.viewer.cellSize));
        this.yBounds = new Vector(Math.floor(-this.viewer.pos.y/this.viewer.cellSize), Math.floor((-this.viewer.pos.y+canvas.height)/this.viewer.cellSize));

        for (var x = this.xBounds.x; x <= this.xBounds.y; x++)
        {
            for (var y = this.yBounds.x; y <= this.yBounds.y; y++)
            {
                // cell info
                var cx = x*this.viewer.cellSize + this.viewer.pos.x;
                var cy = y*this.viewer.cellSize + this.viewer.pos.y;
                var val = Cell.getColor(this.CellularAutomata.getCell(new Vector(x, y)));
                
                cells[val].push(new Vector(cx, cy));
            }
        }

        return cells;
    }

    // update the way it cycles through cell states
    // handles input stored in the Viewer object
    handleInput()
    {
        // handles incoming coords
        var inCoords = NSet.difference(this.viewer.newCoords, this.viewer.coordsInLine);
        inCoords.forEach(val =>
        {
            this.CellularAutomata.setCell(val, !this.CellularAutomata.getCell(val));
        })

        this.viewer.newCoords = new NSet();

        // handles line drawing
        if (!this.viewer.drawing)
        {
            this.viewer.coordsInLine = new NSet();
        }
        else 
        {
            this.viewer.coordsInLine.union(inCoords);
        }
    }

    // simulation
    Step()
    {
        this.handleInput();
        this.CellularAutomata.step();
    }
    
    // perfroms draw without stepping the simulation
    Draw(draw, PreStepFunc, PostStepFunc, DrawStyleFunc, DrawCellFunc)
    {
        this.PreStep(draw, PreStepFunc);
        renderer.PostStep(draw, PostStepFunc, DrawStyleFunc, DrawCellFunc);
    }

    // pre simulation
    PreStep(drawContext, PreStepFunc)
    {
        // clears the canvas
        var clr = this.clr_bg;
        var windowSize = this.viewer.windowSize;
        PreStepFunc(drawContext, clr, windowSize);
        
        this.viewer.Update();
    }

    // post simulation
    PostStep(drawContext, PostStepFunc, DrawStyleFunc, DrawCellFunc)
    {
        var gridData = this.drawGridData();
        var cellSize = this.viewer.cellSize;
        CARender.DrawGrid(gridData, cellSize, draw, DrawStyleFunc, DrawCellFunc);
        
        // TODO: separate this into a second "UI" canvas that is painted ontop of the grid canvas
        var bg = this.clr_bg;
        var windowSize = this.viewer.windowSize;
        PostStepFunc(drawContext, bg, windowSize);
    }

    // draws the grid retrieved from this
    static DrawGrid(gridData, cellSize, drawContext, DrawStyleFunc, DrawCellFunc)
    {
        // cycles through colors
        for (let clr in gridData)
        {
            // sets fill color/style to take advantage of color batching
            DrawStyleFunc(drawContext, clr);
            
            // cycles through coordinates
            for (let coordIndex in gridData[clr])
            {
                var coord = gridData[clr][coordIndex];

                // draws current cell
                DrawCellFunc(drawContext, coord, cellSize);
            }
        }
    }

    // The following 4 functions serve as default rendering options for HTML canvas utilizing the 2d context
    // draws a cell of given size at given screen coordinate, note cell color is not set in this method
    static DrawCell(drawContext, coord, cellSize)
    {
        drawContext.fillRect(coord.x, coord.y, cellSize-1, cellSize-1);
    }

    // clears the canvas
    static PreStepDraw(drawContext, clr, windowSize)
    {
        drawContext.fillStyle = clr;
        drawContext.fillRect(0, 0, windowSize.x, windowSize.y);
    }

    // draws a border around the grid
    static PostStepDraw(drawContext, clr, windowSize)
    {
        drawContext.strokeStyle = clr;
        drawContext.moveTo(1, 1);
        drawContext.lineTo(1, windowSize.y-1);
        drawContext.lineTo(windowSize.x-1, windowSize.y-1);
        drawContext.lineTo(windowSize.x-1, 1);
        drawContext.lineTo(1, 1);
        drawContext.stroke();
    }

    // sets the fill style prior to drawing a batch of cells
    static DrawStyle(drawContext, clr)
    {
        drawContext.fillStyle = clr;
    }
}

// enums
CARender.renderState = {
    step: 0,
    draw: 1,
    nothing: 2,
    noLoop: 3
}

CARender.loopEnum = {
    noLoop: 0,
    drawLoop: 1,
    stepLoop: 2,
    step: 3
}