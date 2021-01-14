import React from 'react';
import { CARender } from '../import';
import UserInput from '../UserInput';

export default function CAGrid(props)
{
    // processes configurations
    var configs = props.configs

    if (configs === undefined)
    {
        configs = CARender.JSObjectDefault();
    }
    else
    {
        CARender.fillJSObjectBlanks(configs)
    }

    // references
    const canvasRef = React.useRef(null);
    const requestIdRef = React.useRef(null);

    // cellular automata
    var renderer = new CARender(configs);
    var userInput = new UserInput(renderer);
  
    // update function
    const tick = () =>
    {
        // stops loop when canvas is offscreen. Note, the loop will resume when the canvas is back on screen.
        if (!canvasRef.current) return;
        
        var draw = canvasRef.current.getContext('2d');
        var loop = renderer.Update(draw, configs);
    
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
    
    return <canvas id="glCanvas" ref={canvasRef} width={configs.width} height={configs.height}/>;
}