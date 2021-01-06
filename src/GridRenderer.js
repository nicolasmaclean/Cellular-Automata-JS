// this renders a given GridPrender to a HTML canvas\

class GridRenderer
{
    constructor(prerender, clr_bg)
    {
        this.lastFrame = 0;
        this.lastFrameS = 0;

        this.prerender = prerender;
        this.clr_bg = clr_bg;

        this.updateFunc = function ()
        {
            // be careful this will update frame controller
            var renderState = renderer.checkState(prerender);

            // steps the simulation
            if (renderState === GridRenderer.renderState.step)
            {
                renderer.PreStep(draw);
                renderer.Step()
                renderer.PostStep(draw);
            }

            // draws the grid
            else if (renderState === GridRenderer.renderState.draw)
            {
                prerender.handleInput();
                renderer.Draw(draw);
            }

            // does nothing
            else if (renderState === GridRenderer.renderState.nothing)
            {
                // console.log("nothin");
            }

            // no loop
            else if (renderState === GridRenderer.renderState.noLoop)
            {
                console.log("no loop");
            }

            if (renderState !== GridRenderer.renderState.noLoop)
            {
                return true;
            }

            else
            {
                return false;
            }
        };
    }

    // returns the update state and advances the update state
    checkState(prerender)
    {
        // frame rate control
        var currentFrame = Date.now();
        var elapsed = currentFrame - this.lastFrame;
        
        var currentFrameS = Date.now();
        var elapsedS = currentFrameS - this.lastFrameS;
        
        // simulation loop
        if (!prerender.viewer.paused && prerender.updateState === GridPrerender.loopEnum.stepLoop && elapsed > prerender.fpsInterval)
        {
            this.lastFrame = currentFrame - (elapsed % prerender.fpsInterval);
            
            return GridRenderer.renderState.step;
        }
        
        // single step
        else if ((prerender.updateState !== GridPrerender.loopEnum.stepLoop || prerender.viewer.paused) && prerender.viewer.step && elapsedS > prerender.fpsIntervalS) // add a fps controller
        {
            this.lastFrameS = currentFrameS - (elapsedS % prerender.fpsIntervalS);
            
            prerender.viewer.step = false;

            return GridRenderer.renderState.step;
        }
        
        // draw loop
        else if (((prerender.viewer.paused || prerender.updateState === GridPrerender.loopEnum.drawLoop) && prerender.viewer.needDraw) || prerender.viewer.needDraw || !prerender.viewer.targetPos.equals(prerender.viewer.pos))
        {
            prerender.viewer.needDraw = false;
            return GridRenderer.renderState.draw;
        }

        // no loop
        else if (prerender.updateState === GridPrerender.loopEnum.noLoop)
        {
            return GridRenderer.renderState.noLoop;
        }

        // nothing
        else
        {
            return GridRenderer.renderState.nothing;
        }
    }

    // simulation
    Step()
    {
        prerender.handleInput();
        prerender.GameofLife.step();
    }
    
    // perfroms draw without stepping the simulation
    Draw(draw)
    {
        this.PreStep(draw);
        this.PostStep(draw);
    }

    // pre simulation
    PreStep(draw)
    {
        // clears the canvas
        draw.fillStyle = this.clr_bg;
        draw.fillRect(0, 0, canvas.width, canvas.height);
        
        prerender.viewer.Update();
    }

    // post simulation
    PostStep(draw)
    {
        GridRenderer.DrawGrid(this.prerender, draw);
        
        // TODO: separate this into a second "UI" canvas that is painted ontop of the grid canvas
        // adds border around bottom and right sides of canvas
        draw.strokeStyle = this.clr_bg;
        draw.moveTo(1, 1);
        draw.lineTo(1, canvas.height-1);
        draw.lineTo(canvas.width-1, canvas.height-1);
        draw.lineTo(canvas.width-1, 1);
        draw.lineTo(1, 1);
        draw.stroke();

        prerender.GameofLife.grid.pruneDefaultValues();
    }

    // draws the grid retrieved from prerender
    static DrawGrid(prerender, draw)
    {
        // retrieves cells to draw batched by color
        var cells = prerender.drawGridData();
        var cellSize = prerender.viewer.cellSize;
        
        // cycles through colors
        for (let clr in cells)
        {
            draw.fillStyle = clr;
            
            // cycles through coordinates
            for (let coordIndex in cells[clr])
            {
                GridRenderer.DrawCell(draw, cells[clr][coordIndex], cellSize);
            }
        }
    }

    // draws given cell
    static DrawCell(draw, coord, cellSize)
    {
        draw.fillRect(coord.x, coord.y, cellSize-1, cellSize-1);
    }
}

GridRenderer.renderState = {
    step: 0,
    draw: 1,
    nothing: 2,
    noLoop: 3
}