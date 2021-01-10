// this renders a given GridPrender to a HTML canvas\

class GridRenderer
{
    constructor(prerender, clr_bg)
    {
        this.lastFrame = 0;
        this.lastFrameS = 0;

        this.prerender = prerender;
        this.clr_bg = clr_bg;

        this.updateFunc = function (drawContext, PreStepFunc, PostStepFunc, DrawStyleFunc, DrawCellFunc)
        {
            // be careful this will update frame controller
            var renderState = renderer.checkState(prerender);

            // steps the simulation
            if (renderState === GridRenderer.renderState.step)
            {
                prerender.handleInput();
                renderer.PreStep(drawContext, PreStepFunc);
                renderer.Step()
                renderer.PostStep(drawContext, PostStepFunc, DrawStyleFunc, DrawCellFunc);
            }

            // draws the grid
            else if (renderState === GridRenderer.renderState.draw)
            {
                prerender.handleInput();
                renderer.Draw(drawContext, PreStepFunc, PostStepFunc, DrawStyleFunc, DrawCellFunc);
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
                return false;
            }

            // flag to indicate loop should be continued
            return true;
        };
    }

    // TODO: add parameter to control if the fps stuff should be reset provided elapsed is big enough
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
        
        // TODO: move viewer.pos == viewer.target pos to be handelled in viewer.update and have it modify viewer.needDraw
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
        var windowSize = this.prerender.viewer.windowSize;
        PreStepFunc(drawContext, clr, windowSize);
        
        prerender.viewer.Update();
    }

    // post simulation
    PostStep(drawContext, PostStepFunc, DrawStyleFunc, DrawCellFunc)
    {
        var gridData = this.prerender.drawGridData();
        var cellSize = this.prerender.viewer.cellSize;
        GridRenderer.DrawGrid(gridData, cellSize, draw, DrawStyleFunc, DrawCellFunc);
        
        // TODO: separate this into a second "UI" canvas that is painted ontop of the grid canvas
        var bg = this.clr_bg;
        var windowSize = this.prerender.viewer.windowSize;
        PostStepFunc(drawContext, bg, windowSize);
    }

    // draws the grid retrieved from prerender
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
}

// enum
GridRenderer.renderState = {
    step: 0,
    draw: 1,
    nothing: 2,
    noLoop: 3
}