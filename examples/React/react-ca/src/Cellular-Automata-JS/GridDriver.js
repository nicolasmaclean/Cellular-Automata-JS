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


// The following 5 functions are only here for reference. The first is an example of a custom cell, while the following 4 are the default rendering options.
// They can also be found in CARender.js as static methods picked as default rendering methods.
// when utilizing custom rendering functions call renderer.Update() with them. For example, if you were to use a custom DrawStyle function, you would need to 
// also provide DrawCell function, but not PreStepDraw or PostStepDraw. In this case if you wanted to only use a custom DrawStyle, you could pass CARender.DrawCell,
// which is a default methods.

// function drawCellCustom(drawContext, coord, cellSize)
// {
//     var radius = (cellSize-1)/2;
//     drawContext.beginPath();
//     drawContext.arc(coord.x + radius, coord.y + radius, radius, 0, 2 * Math.PI);
//     drawContext.fill(); 
// }

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
// }

window.onload = main;