//  Nick Maclean's JavaScript implementation of Conway's Game of Life
//  A custom sparse matrix is created using a javascript map to allow an infinite grid
//  I have attempted to make this as modular as possible to allow modifications for other 2d cellular automata's or rendering methods
//  This is still a WIP, so further modularizing will come
//  12/27/20

// To Use: include the the the included js files and a canvas element with the id "glcanvas"
// left click is used to move the viewer's position across the grid
// right click can be held or pressed to toggle cells' states
// p will pause the simulation
// space will manually step the simulation once


class GridPrerender
{
    constructor(init_loopState, init_pos, init_zoom, init_minZoom, init_maxZoom, init_windowSize, init_lerpFactor)
    {
        // enums
        GridPrerender.loopEnum = {
            noLoop: 0,
            drawLoop: 1,
            stepLoop: 2,
            step: 3
        }
        
        // configurations
        var defaultCellSize = 10;
        // var clr_bg = 'white';
        this.fps = 10; // move to driver?
        this.fpsS = 20;
        this.updateState = init_loopState;
    
        // initializes simulation
        this.GameofLife = new CellularAutomata();
        this.viewer = new Viewer(init_pos, init_zoom, init_windowSize, init_lerpFactor, init_minZoom, init_maxZoom);

        this.GameofLife.grid.setCells_true([new Vector(-1, 0), new Vector(0, 0), new Vector(1, 0)]);
    
        // misc globals
        this.xBounds = 0;
        this.yBounds = 0;

        this.fpsInterval = 1000 / this.fps;
        this.fpsIntervalS = 1000 / this.fpsS;
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
                var val = Cell.getColor(this.GameofLife.grid.getCell(new Vector(x, y)));
                
                cells[val].push(new Vector(cx, cy));
            }
        }

        return cells;
    }

    // handles input stored in the Viewer object
    handleInput()
    {
        // handles incoming coords
        var inCoords = NSet.difference(this.viewer.newCoords, this.viewer.coordsInLine);
        inCoords.forEach(val =>
        {
            this.GameofLife.grid.setCell(val, !this.GameofLife.grid.getCell(val));
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
}