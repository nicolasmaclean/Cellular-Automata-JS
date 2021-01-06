// this acts as a default update loop manager, but can be replaced for different methods of renderings

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
    var init_minZoom = .8;
    var init_maxZoom = 9;
    var init_lerpFactor = .2;

    // renderer configs
    var clr_bg = '#c0c0c0';

    //initialization
    prerender = new GridPrerender(init_loopState, init_pos, init_zoom, init_minZoom, init_maxZoom, new Vector(canvas.width, canvas.height), init_lerpFactor);
    renderer = new GridRenderer(prerender, clr_bg);
    var userInput = new UserInput(prerender.viewer, canvas);
    
    update();
}

// TODO: move some logic back into the prerenderer so that renderer is ONLY methods utilized for drawing
// TODO: isolate classes and code that need that need to be interchangable and make it easy to do so

function update()
{
    var loop = renderer.updateFunc();
    
    if (loop)
        window.requestAnimationFrame(update);
}

window.onload = main;