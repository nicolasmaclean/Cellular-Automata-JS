import React from 'react';
import { CARender, Vector } from '../import';
import UserInput from '../UserInput';

export default function CAGrid(props)
{
    // references
    const canvasRef = React.useRef(null);
    const requestIdRef = React.useRef(null);

    // sets default input values
    var state = {};

    if (props.init_width === undefined)
    {
        state.init_width = 500;
    }
    else
    {
        state.init_width = props.init_width;
    }

    if (props.init_height === undefined)
    {
        state.init_height = 500;
    }
    else
    {
        state.init_height = props.init_height;
    }

    if (props.init_loopState === undefined)
    {
        state.init_loopState = 2;
    }
    else
    {
        state.init_loopState = props.init_loopState;
    }

    // cellular automata
    var renderer = new CARender(state.init_loopState, new Vector(state.init_width, state.init_height));
    var userInput = new UserInput(renderer.viewer);
  
    // update function
    const tick = () =>
    {
        // stops loop when canvas is offscreen. Note, the loop will resume when the canvas is back on screen.
        if (!canvasRef.current) return;
        
        var draw = canvasRef.current.getContext('2d');
        var loop = renderer.Update(draw);
    
        if (loop)
            requestIdRef.current = requestAnimationFrame(tick);
    };
  
    // acts as ComponentDidMount()
    React.useEffect(() =>
    {
        requestAnimationFrame(tick);
        userInput.attachEvents(canvasRef.current);

        // acts as ComponentDidUnmount()
        return () => {
            cancelAnimationFrame(requestIdRef.current);
        };
    });
  
    return <canvas id="glCanvas" ref={canvasRef} width={state.init_width} height={state.init_height}/>;
}