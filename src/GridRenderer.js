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


// enums
const loopEnum = {
    noLoop: 0,
    drawLoop: 1,
    stepLoop: 2
}

// configurations
var defaultCellSize = 10;
var clr_bg = '#c0c0c0';
// var clr_bg = 'white';
var fps = 10;
var fpsS = 20;
var update = loopEnum.stepLoop;

// viewer configs TODO: move into the viewer class
var minZoom = 8 / defaultCellSize;
var maxZoom = 90 / defaultCellSize;

// references
var canvas;
var draw;

var T_generations;
var T_drawing;
var T_lineCoords;
var T_coords;

var GameofLife;
var viewer;
var userInput;

// misc globals
var xBounds, yBounds;
var lastFrame, fpsInterval;
var lastFrameS, fpsIntervalS;
var generation = 0;


function Start()
{
    // gets HTML stuff ready
    canvas = document.querySelector("#glCanvas");
    draw = canvas.getContext('2d');

    T_generations = document.querySelector("#generation");
    T_drawing = document.querySelector("#drawing");
    T_lineCoords = document.querySelector("#drawingLine");
    T_coords = document.querySelector("#coord");

    // initializes other stuffs
    viewer = new Viewer(new Vector(0, 0), .8, new Vector(canvas.width, canvas.height), .2);
    viewer.moveToOrigin();
    userInput = new UserInput(viewer, canvas);
    fpsInterval = 1000 / fps;
    lastFrame = Date.now();
    fpsIntervalS = 1000 / fps;
    lastFrameS = Date.now();

    // initializes Cellular Automata Simulation
    GameofLife = new CellularAutomata();
    GameofLife.grid.setCells_true([new Vector(-1, 0), new Vector(-1, -1), new Vector(-1, -2)]);

    // draw inital grid
    PreUpdate();
    PostUpdate();

    // begins update loop
    Update();
}

// TODO: cut out as much redrawing as possible. only redraw parts of the canvas that need it, if there has been any changes to the cells displayed
function Update()
{
    // frame rate control
    var currentFrame = Date.now();
    elapsed = currentFrame - lastFrame;

    var currentFrameS = Date.now();
    elapsedS = currentFrameS - lastFrameS;

    // simulation loop
    if (!viewer.paused && update === loopEnum.stepLoop && elapsed > fpsInterval)
    {
        lastFrame = currentFrame - (elapsed % fpsInterval);
        
        PreUpdate();
        
        handleInput();
        GameofLife.step();
        generation++;
        
        PostUpdate();
    }
    
    // single step
    else if ((update !== loopEnum.stepLoop || viewer.paused) && viewer.step && elapsedS > fpsIntervalS) // add a fps controller
    {
        lastFrameS = currentFrameS - (elapsedS % fpsIntervalS);

        PreUpdate();

        handleInput();
        GameofLife.step();
        generation++;

        PostUpdate();

        viewer.step = false;
    }

    // draw loop
    else if (((viewer.paused || update === loopEnum.drawLoop) && viewer.needDraw) || viewer.needDraw || !viewer.targetPos.equals(viewer.pos))
    {
        handleInput();
        Draw();
        viewer.needDraw = false;
    }

    T_generations.innerHTML = generation;
    T_drawing.innerHTML = viewer.drawing;
    T_lineCoords.innerHTML = viewer.coordsInLine;
    T_coords.innerHTML = viewer.gridPosition();


    // continues update loop
    if(update !== loopEnum.noLoop)
        window.requestAnimationFrame(Update);
}

function PreUpdate()
{
    // clears the canvas
    draw.fillStyle = clr_bg;
    draw.fillRect(0, 0, canvas.width, canvas.height);

    viewer.Update();
}

function PostUpdate()
{
    DrawGrid();
    
    // TODO: separate this into a second "UI" canvas that is painted ontop of the grid canvas
    // adds border around bottom and right sides of canvas
    draw.strokeStyle = clr_bg;
    draw.moveTo(1, 1);
    draw.lineTo(1, canvas.height-1);
    draw.lineTo(canvas.width-1, canvas.height-1);
    draw.lineTo(canvas.width-1, 1);
    draw.lineTo(1, 1);
    draw.stroke();

    GameofLife.grid.pruneDefaultValues();
}

// calls pre/post update drawing
function Draw()
{
    PreUpdate();
    PostUpdate();
}

// TODO: try to batch cells in grid by color to lower fillstyle changes
function DrawGrid()
{
    // grid coords within the window bounds, inclusive
    xBounds = new Vector(Math.floor(-viewer.pos.x/viewer.cellSize), Math.floor((-viewer.pos.x+canvas.width)/viewer.cellSize));
    yBounds = new Vector(Math.floor(-viewer.pos.y/viewer.cellSize), Math.floor((-viewer.pos.y+canvas.height)/viewer.cellSize));

    for (var x = xBounds.x; x <= xBounds.y; x++)
    {
        for (var y = yBounds.x; y <= yBounds.y; y++)
        {
            // screen coords
            var cx = x*viewer.cellSize + viewer.pos.x;
            var cy = y*viewer.cellSize + viewer.pos.y;
            
            // draws cell
            draw.fillStyle = Cell.getColor(GameofLife.grid.getCell(new Vector(x, y)));
            DrawCell(cx, cy, viewer.cellSize);
        }
    }
}

// draws a square at x, y with width and height of side length TODO: move this the Cell class
function DrawCell(x, y, side)
{
    draw.fillRect(Math.floor(x) + 1, Math.floor(y) + 1, side - 1, side - 1);
    // draw.beginPath();
    // draw.arc(Math.floor(x)+1, Math.floor(y)+1, (side-1)/2, 0, 360)
    // draw.fill();
}

// handles input stored in the Viewer object
function handleInput()
{
    // handles incoming coords
    var inCoords = NSet.difference(viewer.newCoords, viewer.coordsInLine);
    inCoords.forEach(val =>
    {
        GameofLife.grid.setCell(val, !GameofLife.grid.getCell(val));
    })

    viewer.newCoords = new NSet();

    // handles line drawing
    if (!viewer.drawing)
    {
        viewer.coordsInLine = new NSet();
    }
    else 
    {
        viewer.coordsInLine.union(inCoords);
    }
}

window.onload = Start;