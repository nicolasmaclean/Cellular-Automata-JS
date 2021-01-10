import React from 'react';
import { CARender, Vector } from '../import';

class CAGrid extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            renderer: new CARender(this.props.init_loopState, new Vector(this.props.init_width, this.props.init_height)),
            loop: true,
        }

        this.canvasRef = React.createRef();
    }

    // gets canvas draw context
    componentDidMount()
    {
        this.drawContext = this.canvasRef.current.getContext('2d');
    }

    // checks new CARender if update is needed
    shouldComponentUpdate(nextProps, nextState)
    {
        var CAState = nextState.renderer.checkState(false);
        console.log(CAState);

        if (CAState === CARender.renderState.nothing || !nextState.loop)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
    
    handleUpdate()
    {
        this.forceUpdate();
    }

    // provides react with a canvas and utilizes the update loop
    render()
    {
        // updates the simulation/draws the grid to the canvas
        if (this.drawContext !== undefined)
        {
            var l = this.state.renderer.Update(this.drawContext);
            this.setState({
                loop: l
            });
        }
    
        return (
            <div>
                <canvas ref= {this.canvasRef} width={this.props.init_width} height={this.props.init_height} onClick={this.handleUpdate}></canvas>
                <h1> hi </h1>
            </div>
        );
    }
}

export default CAGrid