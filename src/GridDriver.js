// this is an example driver for using the Cellular-Automata-JS library with HTML canvas using the 2d drawing context

var canvas;
var draw;

var renderer;

function main()
{
    // HTML refs
    canvas = document.querySelector("#glCanvas");
    draw = canvas.getContext('2d');

    // render configs
    var init_loopState = 2;
    var init_windowSize = new Vector(canvas.width, canvas.height);

    //initialization
    renderer = new CARender(init_loopState, init_windowSize);
    var userInput = new UserInput(renderer.viewer, canvas);
    
    update();
}

// TODO: make these HTML canvas functions default parameters
// update loop
function update()
{
    var loop = renderer.Update(draw);
    
    if (loop)
        window.requestAnimationFrame(update);
}

/* The following 4 functions are only here for reference. They can also be found in CARender.js as static methods picked as default rendering methods.
// when utilizing custom rendering functions call renderer.Update() with them. For example, if you were to use a custom PostStepDraw function, you would need to 
// also provide DrawStyle and DrawCell functions, but not PreStepDraw. In this case if you wanted to only use a custom PostStepDraw, you could pass CARender.DrawStyle
// and CARender.DrawCell, which are the default methods.

// clears the canvas
// function PreStepDrawFunc(drawContext, clr, windowSize)
// {
//     drawContext.fillStyle = clr;
//     drawContext.fillRect(0, 0, windowSize.x, windowSize.y);
// }

// // draws a border around the grid
// function PostStepDrawFunc(drawContext, clr, windowSize)
// {
//     drawContext.strokeStyle = clr;
//     drawContext.moveTo(1, 1);
//     drawContext.lineTo(1, windowSize.y-1);
//     drawContext.lineTo(windowSize.x-1, windowSize.y-1);
//     drawContext.lineTo(windowSize.x-1, 1);
//     drawContext.lineTo(1, 1);
//     drawContext.stroke();
// }

// // sets the fill style prior to drawing a batch of cells
// function DrawStyleFunc(drawContext, clr)
// {
//     drawContext.fillStyle = clr;
// }

// // draws a cell of given size at given screen coordinate, note cell color is not set in this method
// function DrawCellFunc(drawContext, coord, cellSize)
// {
//     drawContext.fillRect(coord.x, coord.y, cellSize-1, cellSize-1);
// } */

window.onload = main;