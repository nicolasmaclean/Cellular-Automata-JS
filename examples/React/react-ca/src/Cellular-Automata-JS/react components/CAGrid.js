import React from 'react';
import { CARender, Vector } from '../import';

export default function CAGrid(props)
{
    // references
    const canvasRef = React.useRef(null);
    const requestIdRef = React.useRef(null);

    // cellular automata variables
    var renderer = new CARender(props.init_loopState, new Vector(props.init_width, props.init_height));
  
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
  
    // starts/resumes update loop when the canvas is rendered on screen
    React.useEffect(() =>
    {
        requestAnimationFrame(tick);

        // garbage collection
        return () => {
            cancelAnimationFrame(requestIdRef.current);
          };
    });
  
    return <canvas ref={canvasRef} width={props.init_width} height={props.init_height}/>;
}