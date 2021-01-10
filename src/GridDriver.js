// this is an example driver for using the Cellular-Automata-JS library with HTML canvas using the 2d drawing context

var canvas;
var draw;

var prerender;
var renderer;

function main()
{
    // HTML refs
    canvas = document.querySelector("#glCanvas");
    draw = canvas.getContext('2d');

    // prerender configs
    var init_loopState = 2;
    var init_pos = new Vector(-1, -1);
    var init_zoom = 1

    // renderer configs
    var clr_bg = '#c0c0c0';

    //initialization
    prerender = new GridPrerender(init_loopState, new Vector(canvas.width, canvas.height));
    renderer = new GridRenderer(prerender, clr_bg);
    var userInput = new UserInput(prerender.viewer, canvas);
    
    update();
}

// update loop
function update()
{
    var loop = renderer.updateFunc(draw, PreStepDrawFunc, PostStepDrawFunc, DrawStyleFunc, DrawCellFunc);
    
    if (loop)
        window.requestAnimationFrame(update);
}

// clears the canvas
function PreStepDrawFunc(drawContext, clr, windowSize)
{
    drawContext.fillStyle = clr;
    drawContext.fillRect(0, 0, windowSize.x, windowSize.y);
}

// draws a border around the grid
function PostStepDrawFunc(drawContext, clr, windowSize)
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
function DrawStyleFunc(drawContext, clr)
{
    drawContext.fillStyle = clr;
}

// draws a cell of given size at given screen coordinate, note cell color is not set in this method
function DrawCellFunc(drawContext, coord, cellSize)
{
    drawContext.fillRect(coord.x, coord.y, cellSize-1, cellSize-1);
}

window.onload = main;