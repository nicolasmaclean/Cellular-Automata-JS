import React from 'react';

export default class CAInput extends React.Component
{
    render()
    {
        var renderer = this.props.renderRef;
        var input = this.props.inputRef;
        var grid = renderer.CellularAutomata.grid;

        var pausedText = renderer.paused ? "Paused" : "Playing";
        var grabText = input.grabCanvas ? "Move" : "Draw";
        var states = [];

        for (let color in grid.cellColors)
        {
            states.push(
                <div className="cellState flexCol" key={0-color}>
                    <div className="cellStateBackground" style={{
                        backgroundColor: grid.cellColors[color]
                    }}
                    onClick={
                        () => input.setSpecificState(color)
                    }>
                    </div>
                    <h3 className="cellStateName"> {renderer.stateNames[color]}</h3>
                </div>
            );
        }

        return (
            <div className="gridInput">
                <h1 className="title"> {this.props.title} </h1>

                <div className="grid">
                    {/* State Draw Picker */}
                    <div className="statePicker">
                        {states}
                    </div>

                    <div className="contentLeft">
                        <h2> Generation: {renderer.CellularAutomata.generation} </h2>
                    </div>

                    {/* pause/play button and simulation step button */}
                    <div className="flexRow contentLeft">
                        <button className={"button " + pausedText} onClick={() => {input.pauseToggle(); this.forceUpdate()}} > 
                            {pausedText} 
                        </button>

                        <button className="button fade" onClick={() => { input.singleStep() }} disabled={!renderer.paused}>
                            Step Once
                        </button>
                    </div>

                    {/* switch between draw/move, clear the simulation, and save */}
                    <div className="flexRow contentLeft">
                        <button className={"button " + grabText} onClick={ () => {input.grabCanvasToggle(); this.forceUpdate()}}>
                            {grabText}
                        </button>

                        <button className={"button clear"} onClick={ () => {console.log("clear"); this.forceUpdate()}}>
                            Clear
                        </button>

                        <button className={"button save"} onClick={ () => {console.log("save"); this.forceUpdate()}}>
                            Save
                        </button>
                    </div>

                    {/* load a previous save */}
                    <div className="flexRow contentLeft">
                        <button className={"button load"} onClick={ () => {console.log("load"); this.forceUpdate()}}>
                            Load Save From File
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}