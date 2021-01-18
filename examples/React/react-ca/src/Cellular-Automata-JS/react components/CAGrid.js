import React from 'react';
import { CARender, UserInput } from '../import';
import { CAInput } from './import';

export default class CAGrid extends React.Component
{
    constructor(props)
    {
        super(props);
        
        // references
        this.canvasRef = React.createRef();
        this.requestIdRef = React.createRef();
        this.dataRef = React.createRef();
        this.inputRef = React.createRef();
        
        // processes configurations
        this.configs = props.configs
        
        if (this.configs === undefined)
        {
            this.configs = CARender.JSObjectDefault();
        }
        else
        {
            CARender.fillJSObjectBlanks(this.configs)
        }
        
        // cellular automata
        this.renderer = new CARender(this.configs);
        this.userInput = new UserInput(this.renderer);
        
        // appends requested/necessary elements to be rendereroooo
        var elements = []
        
        if (this.props.gridInputEnabled)
        {
            elements.push(<CAInput className ="CAGridInput" ref={this.inputRef} renderRef={this.renderer} inputRef={this.userInput} key={3}/>);
        }
        
            this.child = (
                <div className="flexRow wholeDeal">
                <canvas className="glCanvas flexItem" ref={this.canvasRef} width={this.configs.width} height={this.configs.height} key={1}/>
                <div className="CAPerp flexItem">
                    {elements}
                </div>
            </div>
        );
        
        this.state = {
            needDraw: 0,
        };
    }
    
    // update loop
    tick()
    {
        // stops loop when canvas is offscreen. Note, the loop will resume when the canvas is back on screen.
        if (!this.canvasRef.current) return;
        
        var update = this.renderer.checkState(false);
        var loop = this.renderer.Update(this.draw, this.configs);
        
        if (update !== CARender.renderState.nothing)
        {
                if (this.props.gridInputEnabled)
                {
                    this.inputRef.current.forceUpdate();
                }
            }
            
            if (loop)
            this.requestIdRef.current = requestAnimationFrame(this.tick.bind(this));
        }
        
        // animation cycle begins after the first render or once the canvas brought back on the screen
    componentDidMount()
    {
        this.draw = this.canvasRef.current.getContext('2d');
        requestAnimationFrame(this.tick.bind(this));

        this.userInput.attachEvents(this.canvasRef.current);
    }

    // stops animation cycle when the canvas is destroyed or taken off screen
    componentWillUnmount()
    {
        cancelAnimationFrame(this.requestIdRef.current);
    }

    // creates a canvas for the Cellular Automata simulation to be displayed on
    render()
    {
        return this.child;
    }
}