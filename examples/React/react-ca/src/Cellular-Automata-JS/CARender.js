// this renders a given GridPrender to a HTML canvas\

import {
    CellularAutomata,
    Viewer,
    Vector,
    NSet,
} from './import';

class CARender
{
    constructor(configs)
    {
        // fills out and configs and stores a reference
        CARender.fillModesInObj(configs);
        this.configs = configs;

        // FPS controller stuff
        this.configs.fps = configs.fps;
        this.configs.fpsStep = configs.fpsStep;
        
        // viewer
        this.viewer = new Viewer(configs);
        
        this.Instantiate();
    }
    
    // instantiates or reinstantiates all relevant values for clearing the canvas
    Instantiate()
    {
        // initializes simulation
        this.configs.CellularAutomata = new CellularAutomata(this.configs);
        
        if (this.configs.cellColors === "game of life")
            this.configs.CellularAutomata.grid.setCells_val([new Vector(-1, 0), new Vector(0, 0), new Vector(1, 0)], 1);
        if (this.configs.cellColors === "wire world")
        {
            this.configs.CellularAutomata.grid.setCells_val([new Vector(-1, 0), new Vector(0, 0), new Vector(1, 0), new Vector(2, 0)], 3);
            this.configs.CellularAutomata.grid.setCells_val([new Vector(-2, 0)], 1)
        }
        
        // state management
        this.step = false;
        this.needDraw = true;
        
        // configs
        this.cellColorsLength = Object.keys(this.configs.cellColors).length;
        
        // input
        this.coordsSet = []; // list of lists that store a coord and value to set at that coord
        this.lineCoordsDone = new NSet(); // stores a set of coords
        this.lineCoordsAdd = new NSet();

        // fps controller
        this.fpsInterval = 1000 / this.configs.fps;
        this.fpsIntervalS = 1000 / this.configs.fpsStep;
        
        this.lastFrame = 0;
        this.lastFrameS = 0;
    }
    
    // reinstantiates with given javascript object
    ReInstantiate(obj)
    {
        this.configs = obj;

        this.configs.paused = obj.paused;
        this.configs.drawSpecificState = obj.drawSpecificState;
        this.configs.drawState = obj.drawState;
    }

    // sets the drawState and clamps values too big
    setDrawState(val)
    {
        this.configs.drawState = val;

        if(this.configs.drawState >= this.cellColorsLength)
        {
            this.configs.drawState = this.cellColorsLength-1;
        }
    }

    // TODO: add parameter to control if the fps stuff should be reset provided elapsed is big enough
    // returns the update state and advances the update state
    checkState(update)
    {
        // frame rate control
        var currentFrame = Date.now();
        var elapsed = currentFrame - this.lastFrame;
        
        var currentFrameS = Date.now();
        var elapsedS = currentFrameS - this.lastFrameS;
        
        // simulation loop
        if (!this.configs.paused && this.configs.loopState === CARender.loopEnum.stepLoop && elapsed > this.fpsInterval)
        {
            if (update)
            {
                this.lastFrame = currentFrame - (elapsed % this.fpsInterval);
            }
            
            return CARender.renderState.step;
        }
        
        // single step
        else if ((this.configs.loopState !== CARender.loopEnum.stepLoop || this.configs.paused) && this.step && elapsedS > this.fpsIntervalS) // add a fps controller
        {
            if (update)
            {
                this.lastFrameS = currentFrameS - (elapsedS % this.fpsIntervalS);
                this.step = false;
            }

            return CARender.renderState.step;
        }
        
        // TODO: move viewer.pos == viewer.target pos to be handelled in viewer.update and have it modify viewer.needDraw
        // draw loop
        else if (((this.configs.paused || this.configs.loopState === CARender.loopEnum.drawLoop) && this.needDraw) || this.needDraw || !this.viewer.targetPos.equals(this.viewer.pos))
        {
            if (update)
            {
                this.needDraw = false;
            }
            return CARender.renderState.draw;
        }

        // no loop
        else if (this.configs.loopState === CARender.loopEnum.noLoop)
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
    Update(drawContext, configs)
    // Update(drawContext, DrawCellFunc = CARender.DrawCell, DrawStyleFunc = CARender.DrawStyle, PreStepFunc = CARender.PreStepDraw, PostStepFunc = CARender.PostStepDraw)
    {
        // stores references to configs functions
        var DrawCellFunc = configs.DrawCellFunc;
        var DrawStyleFunc = configs.DrawStyleFunc;
        var PreStepFunc = configs.PreStepFunc;
        var PostStepFunc = configs.PostStepFunc;

        // be careful this will update frame controller
        var renderState = this.checkState(true);

        // steps the simulation
        if (renderState === CARender.renderState.step)
        {
            this.handleInput();
            this.PreStep(drawContext, PreStepFunc);
            this.Step()
            this.PostStep(drawContext, PostStepFunc, DrawStyleFunc, DrawCellFunc);
        }

        // draws the grid
        else if (renderState === CARender.renderState.draw)
        {
            this.handleInput();
            this.Draw(drawContext, PreStepFunc, PostStepFunc, DrawStyleFunc, DrawCellFunc);
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
        var cells = this.configs.CellularAutomata.grid.createBatchObject();
        
        // grid coords within the window bounds, inclusive
        this.xBounds = new Vector(Math.floor(-this.viewer.pos.x/this.viewer.cellSize), Math.floor((-this.viewer.pos.x+this.configs.windowSize.x)/this.viewer.cellSize));
        this.yBounds = new Vector(Math.floor(-this.viewer.pos.y/this.viewer.cellSize), Math.floor((-this.viewer.pos.y+this.configs.windowSize.y)/this.viewer.cellSize));
        
        for (var x = this.xBounds.x; x <= this.xBounds.y; x++)
        {
            for (var y = this.yBounds.x; y <= this.yBounds.y; y++)
            {
                // cell info
                var cx = x*this.viewer.cellSize + this.viewer.pos.x;
                var cy = y*this.viewer.cellSize + this.viewer.pos.y;
                var val = this.configs.CellularAutomata.getCell(new Vector(x, y));
                var clr = this.configs.CellularAutomata.grid.cellColors[val];

                if (val === undefined || clr === undefined)
                    console.log(val, clr, x, y, cx, cy)
                
                cells[clr].push(new Vector(cx, cy));
            }
        }

        return cells;
    }

    // TODO: update the way it cycles through cell states
    // handles input stored in the Viewer object
    handleInput()
    {
        // toggles coords in the line that haven't already been processed
        NSet.difference(this.lineCoordsAdd, this.lineCoordsDone).forEach( val => 
        {
            if (this.configs.drawSpecificState)
            {
                this.configs.CellularAutomata.setCell(val, this.configs.drawState);
            }
            else
            {
                this.configs.CellularAutomata.cycleCell(val);
            }
        })

        // updates the sets
        this.lineCoordsDone.union(this.lineCoordsAdd);
        this.lineCoordsAdd = new NSet();

        // sets given coords with their requested value
        for (let x in this.coordsSet)
        {
            this.configs.CellularAutomata.setCell(x[0], x[1]);
        }
    }

    // simulation
    Step()
    {
        this.handleInput();
        this.configs.CellularAutomata.step();
    }
    
    // perfroms draw without stepping the simulation
    Draw(draw, PreStepFunc, PostStepFunc, DrawStyleFunc, DrawCellFunc)
    {
        this.PreStep(draw, PreStepFunc);
        this.PostStep(draw, PostStepFunc, DrawStyleFunc, DrawCellFunc);
    }

    // pre simulation
    PreStep(drawContext, PreStepFunc)
    {
        // clears the canvas
        var clr = this.configs.clr_bg;
        PreStepFunc(drawContext, clr, this.configs.windowSize);
        
        this.viewer.Update();
    }

    // post simulation
    PostStep(drawContext, PostStepFunc, DrawStyleFunc, DrawCellFunc)
    {
        var gridData = this.drawGridData();
        var cellSize = this.viewer.cellSize;
        CARender.DrawGrid(gridData, cellSize, drawContext, DrawStyleFunc, DrawCellFunc);
        
        // TODO: separate this into a second "UI" canvas that is painted ontop of the grid canvas
        var bg = this.configs.clr_bg;
        PostStepFunc(drawContext, bg, this.configs.windowSize);
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
        drawContext.fillRect(0, 0, this.configs.windowSize.x, this.configs.windowSize.y);
    }

    // draws a border around the grid
    static PostStepDraw(drawContext, clr, windowSize)
    {
        drawContext.strokeStyle = clr;
        drawContext.moveTo(1, 1);
        drawContext.lineTo(1, this.configs.windowSize.y-1);
        drawContext.lineTo(this.configs.windowSize.x-1, this.configs.windowSize.y-1);
        drawContext.lineTo(this.configs.windowSize.x-1, 1);
        drawContext.lineTo(1, 1);
        drawContext.stroke();
    }

    // sets the fill style prior to drawing a batch of cells
    static DrawStyle(drawContext, clr)
    {
        drawContext.fillStyle = clr;
    }

    // fills in missing properties with default values
    static fillJSObjectBlanks(obj)
    {
        var defaultObj = CARender.JSObjectDefault();
        
        if (obj.width === undefined) { obj.width = defaultObj.width}
        if (obj.height === undefined) { obj.height = defaultObj.height}
        if (obj.windowSize === undefined) { obj.windowSize = new Vector(obj.width, obj.height)}
        
        if (obj.x === undefined) { obj.x = defaultObj.x}
        if (obj.y === undefined) { obj.y = defaultObj.y}
        if (obj.position === undefined) { obj.position = new Vector(obj.x, obj.y)}

        // if (obj.cellColors === undefined) { obj.cellColors = defaultObj.cellColors}
        // if (obj.rules === undefined) { obj.rules = defaultObj.rules}
        // if (obj.stateNames === undefined) { obj.stateNames = defaultObj.stateNames}
        // if (obj.ruleDescriptions === undefined) { obj.ruleDescriptions = defaultObj.ruleDescriptions}
        // if (obj.title === undefined) { obj.title = defaultObj.title}
        if (obj.mode === undefined) { obj.mode = defaultObj.mode; }

        if (obj.generation === undefined) { obj.generation = defaultObj.generation}
        // if (obj.CellularAutomata === undefined) { obj.CellularAutomata = defaultObj.CellularAutomata}
        if (obj.clr_bg === undefined) { obj.clr_bg = defaultObj.clr_bg}
        
        if (obj.loopState === undefined) { obj.loopState = defaultObj.loopState}
        if (obj.paused === undefined) { obj.paused = defaultObj.paused}
        if (obj.drawSpecificState === undefined) { obj.drawSpecificState = defaultObj.drawSpecificState}
        if (obj.drawState === undefined) { obj.drawState = defaultObj.drawState}

        if (obj.zoom === undefined) { obj.zoom = defaultObj.zoom}
        if (obj.maxZoom === undefined) { obj.maxZoom = defaultObj.maxZoom}
        if (obj.minZoom === undefined) { obj.minZoom = defaultObj.minZoom}

        if (obj.fps === undefined) { obj.fps = defaultObj.fps}
        if (obj.fpsStep === undefined) { obj.fpsStep = defaultObj.fpsStep}
        
        if (obj.DrawCellFunc === undefined) { obj.DrawCellFunc = defaultObj.DrawCellFunc}
        if (obj.DrawStyleFunc === undefined) { obj.DrawStyleFunc = defaultObj.DrawStyleFunc}
        if (obj.PreStepFunc === undefined) { obj.PreStepFunc = defaultObj.PreStepFunc}
        if (obj.PostStepFunc === undefined) { obj.PostStepFunc = defaultObj.PostStepFunc}
    }

    // returns the default configuration
    static JSObjectDefault()
    {
        var obj = {
            // title: "Brian Silverman's Wire World",
            // cellColors: "wire world", // allow a custom javascript obj of colors, "game of life" or "wire world" or some other predefined one, or use wireworld as default
            // rules: "wire world", // allow a custom array of rule functions, "game of life" or "wire world" or some other predefined one, or use wireworld as default
            // stateNames: "wire world",
            // ruleDescriptions: "wire world",
            mode: "wire world",
            generation: 0,

            width: 700,
            height: 600,

            x: 0,
            y: 0,

            clr_bg: "#c0c0c0",
            fps: 10,
            fpsStep: 20,
            
            loopState: 2,
            paused: false,
            drawSpecificState: true,
            drawState: 1,

            zoom: 1,
            maxZoom: 9,
            minZoom: .8,
        
            DrawCellFunc: (drawContext, coord, cellSize) =>
            {
                drawContext.fillRect(coord.x, coord.y, cellSize-1, cellSize-1);
            },
            DrawStyleFunc: (drawContext, clr) =>
            {
                drawContext.fillStyle = clr;
            },
            PreStepFunc: (drawContext, clr, windowSize) =>
            {
                drawContext.fillStyle = clr;
                drawContext.fillRect(0, 0, windowSize.x, windowSize.y);
            },
            PostStepFunc: (drawContext, clr, windowSize) =>
            {
                drawContext.strokeStyle = clr;
                drawContext.moveTo(1, 1);
                drawContext.lineTo(1, windowSize.y-1);
                drawContext.lineTo(windowSize.x-1, windowSize.y-1);
                drawContext.lineTo(windowSize.x-1, 1);
                drawContext.lineTo(1, 1);
                drawContext.stroke();
            },
        };

        obj.windowSize = new Vector(obj.width, obj.height);
        obj.position = new Vector(obj.x, obj.y);
        
        var centerOffset = Vector.div_int(obj.windowSize, obj.zoom * 10);
        centerOffset.div_int(2);
        obj.position.add(centerOffset);
        // console.log(obj.position.x, obj.position.y);
        // obj.CellularAutomata = new CellularAutomata(obj);

        return obj;
    }

    // fills in string modes for cell colors and rules. For example, it would convert cellColor: "wire world" into {0: 'white', 1: 'yellow', 2: 'red', 3: 'black'}
    static fillModesInObj(configs)
    {
        if (CARender.prebuiltModes.includes(configs.mode))
        {
            configs.title = configs.mode;
            configs.cellColors = configs.mode;
            configs.rules = configs.mode;
            configs.stateNames = configs.mode;
            configs.ruleDescriptions = configs.mode;
            configs.subtitle = "prebuilt";
        }
        else
        {
            // removes case sensitivity
            if (typeof configs.cellColors === "string")
            {
                configs.cellColors.toLowerCase();
            }

            if (typeof configs.rules === "string")
            {
                configs.rules.toLowerCase();
            }

            if (typeof configs.stateNames === "string")
            {
                configs.stateNames.toLowerCase();
            }

            if (typeof configs.ruleDescriptions === "string")
            {
                configs.stateNames.toLowerCase();
            }
        }

        // checks for cell colors
        if (configs.cellColors === "wire world")
        {
            configs.cellColors = {0: 'white', 1: 'yellow', 2: 'red', 3: 'black'};
        }
        else if (configs.cellColors === "game of life")
        {
            configs.cellColors = {0: 'white', 1: 'black'};
        }

        // checks for rules
        if (configs.rules === "wire world")
        {
            configs.rules = [
                (neighborsValues, curVal) => {return [curVal === 0, 0];},
                (neighborsValues, curVal) => {return [curVal === 1, 2];},
                (neighborsValues, curVal) => {return [curVal === 2, 3];},
                (neighborsValues, curVal) => {
                    // gets live neighbor count
                    var liveNeighbors = neighborsValues.filter( (val) => { return val === 1; } );
                    liveNeighbors = liveNeighbors.length;
                    
                    // gets the outcome of the rule
                    var result = (curVal === 3 && (liveNeighbors === 2 || (liveNeighbors === 1)));
                    
                    // formats the output
                    return [curVal === 3, result ? 1 :  3];},
            ];
        }
        else if (configs.rules === "game of life")
        {
            configs.rules = [ (neighborsValues, curVal) => {
                // gets live neighbor count
                var liveNeighbors = neighborsValues.filter( (val) => { return val === 1; } );
                liveNeighbors = liveNeighbors.length;

                // gets the outcome of the rule
                var result = (curVal === 1 && (liveNeighbors === 2)) || (liveNeighbors === 3);

                // formats the output
                return [result, result ? 1 :  0];
            }]
        }

        // checks for state names
        if (configs.stateNames === "wire world")
        {
            configs.stateNames = ["Background", "Electron Head", "Electron Tail", "Wire"];
        }
        else if (configs.stateNames === "game of life")
        {
            configs.stateNames = ["Dead", "Alive"];
        }

        // checks for title
        if (configs.title === "wire world")
        {
            configs.title = "Brian Silverman's Wire World";
        }
        else if (configs.title === "game of life")
        {
            configs.title = "Conway's Game of Life";
        }

        // checks for rule descriptions
        if (configs.ruleDescriptions === "wire world")
        {
            configs.ruleDescriptions = ["background ALWAYS remain background", 
                "electron head becomes electron tail", 
                "electron tail becomes wire", 
                "wire becomes electron head IF there are 1 or 2 neighboring electron heads"
            ];
        }
        else if (configs.ruleDescriptions === "game of life")
        {
            configs.ruleDescriptions = ["(over population) live cells with 4 or more live neighbors 'dies'",
                "(under population) live cells with less than 2 live neighbors 'dies'",
                "(birth) dead cells with 3 live neighbors become alive",
                "live cells with 2 or 3 neighbors remain alive",
            ];
        }
    }
}

// GAME OF LIFE
// example rule function to be passes through. The output should be an array of length 2. The first element is a boolean that specifies if this 
// result is the final result. The second element is the new cell state.
// function GameOfLifeRule(neighborsValues, curVal)
// {
//     // gets live neighbor count
//     var liveNeighbors = neighborsValues.filter( (val) => { return val === 1; } );
//     liveNeighbors = liveNeighbors.length;

//     // gets the outcome of the rule
//     var result = (curVal === 1 && (liveNeighbors === 2)) || (liveNeighbors === 3);

//     // formats the output
//     return [result, result ? 1 :  0];
// }

// WIRE WORLD
// second example that shows how to implement wireworld. There are 4 cell states and I use 4 rules as shown below to implement it.

// background remains background
// function wireWorld1(neighborsValues, curVal)
// {
//     return [curVal === 0, 0];
// }

// electron head becomes electron tail
// function wireWorld2(neighborsValues, curVal)
// {
//     return [curVal === 1, 2];
// }

// electron tail becomes wire
// function wireWorld3(neighborsValues, curVal)
// {
//     return [curVal === 2, 3];
// }

// wire becomes electron head if there electron(s) adjacent
// function wireWorld4(neighborsValues, curVal)
// {
//     // gets live neighbor count
//     var liveNeighbors = neighborsValues.filter( (val) => { return val === 1; } );
//     liveNeighbors = liveNeighbors.length;
    
//     // gets the outcome of the rule
//     var result = (curVal === 3 && (liveNeighbors === 2 || (liveNeighbors === 1)));
    
//     // formats the output
//     return [curVal === 3, result ? 1 :  3];
// }

// Game of Life and Wire World rules/colors set as static variables for easy default modes
// live and dead
// var GOLColors = { 0: 'white', 1: 'black' };
// var GOLRules = [GameOfLifeRule];

// // background, electron head, electron tail, wire
// var WWRules = [wireWorld1, wireWorld2, wireWorld3, wireWorld4];

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

CARender.prebuiltModes = [
    "game of life",
    "wire world",
]

export default CARender;