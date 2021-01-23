// this is an example driver for using the Cellular-Automata-JS library with HTML canvas using the 2d drawing context

var canvas;
var draw;

var renderer;
var userInput;
var configs;

var txt_CAGeneration;

function main()
{
    // HTML refs
    canvas = document.querySelector("#glCanvas");
    draw = canvas.getContext('2d');

    // render configs
    configs = {
        width: canvas.width,
        height: canvas.height,
    }

    CARender.fillJSObjectBlanks(configs);
    CARender.fillModesInObj(configs)

    //initialization
    renderer = new CARender(configs);
    userInput = new UserInput(renderer);
    userInput.attachEvents(canvas, true, true)

    // sets innerHTML
    txt_CAGeneration = document.querySelector(".CAGeneration");
    txt_CAGeneration.innerHTML = configs.generation;

    document.querySelector(".CATitle").innerHTML = configs.title;
    
    var div_CARules = document.querySelector(".CARules");
    div_CARules.innerHTML = "";

    var ul_CARules = document.createElement("ul");
    div_CARules.appendChild(ul_CARules);
    
    // creates a list of rule descriptions
    for (let rule in configs.ruleDescriptions)
    {
        var li = document.createElement("li");
        ul_CARules.appendChild(li);
        li.innerHTML = configs.ruleDescriptions[rule];
    }

    update();
}

// TODO: make these HTML canvas functions default parameters
// update loop
function update()
{
    renderer.Update(draw, configs);

    txt_CAGeneration.innerHTML = configs.generation
    
    if (configs.loopState !== CARender.loopEnum.noLoop)
        window.requestAnimationFrame(update);
}

window.onload = main;