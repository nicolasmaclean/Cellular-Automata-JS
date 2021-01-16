import React from 'react';

export default class CAGridData extends React.Component
{
    constructor(props)
    {
        super(props);

        this.startTime = Date.now();
    }

    render()
    {
        var renderer = this.props.renderRef;

        return (
            <div className="gridData">
                <h1> Data </h1>
                <h2> Generation: {renderer.CellularAutomata.generation} </h2>
                <h2> Time since start: {((Date.now() - this.startTime) / 1000).toFixed(1)}s </h2>
            </div>
        )
    }
}