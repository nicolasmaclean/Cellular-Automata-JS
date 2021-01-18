import React from 'react';
import { JSONConverter } from '../import';

export default class CAInput extends React.Component
{
    render()
    {
        var renderer = this.props.renderRef;
        var input = this.props.inputRef;
        var grid = renderer.configs.CellularAutomata.grid;

        var pausedText = renderer.configs.paused ? "Paused" : "Playing";
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
                    <h3 className="cellStateName"> {renderer.configs.stateNames[color]}</h3>
                </div>
            );
        }

        return (
            <div className="gridInput">
                <h1 className="title"> {renderer.configs.title} </h1>

                <div className="grid">
                    {/* State Draw Picker */}
                    <div className="statePicker">
                        {states}
                    </div>

                    <div className="onePaddingLeft">
                        <h2> Generation: {renderer.configs.generation} </h2>
                    </div>

                    {/* pause/play button and simulation step button */}
                    <div className="flexRow contentLeft">
                        <button className={"button " + pausedText} onClick={() => {input.pauseToggle(); this.forceUpdate()}} > 
                            {pausedText} 
                        </button>

                        <button className="button fade" onClick={() => { input.singleStep() }} disabled={!renderer.configs.paused}>
                            Step Once
                        </button>
                    </div>

                    {/* switch between draw/move, clear the simulation, and save */}
                    <div className="flexRow contentLeft">
                        <button className={"button " + grabText} onClick={ () => {input.grabCanvasToggle(); this.forceUpdate()}}>
                            {grabText}
                        </button>

                        <button className={"button clear"} onClick={ () => {this.props.renderRef.Instantiate(); renderer.configs.generation = 0; this.forceUpdate()}}>
                            Clear
                        </button>

                        <button className={"button save"} onClick={ () => {JSONConverter.SaveCARender(renderer); this.forceUpdate()}}>
                            Save
                        </button>
                    </div>

                    {/* load a previous save */}
                    <div className="flexRow contentLeft">
                        <button className="button load" onClick={ () => { console.log(document.querySelector("#CAFileUpload").files[0]); JSONConverter.LoadCARender(renderer, document.querySelector("#CAFileUpload").files[0]); this.forceUpdate(); } }>
                            Load
                        </button>
                        <input type="file" className={"file"} id="CAFileUpload" accept="application/json"/>
                        <button className="button fileButton" onClick={ () => { document.querySelector("#CAFileUpload").click(); } }>
                            Browse
                        </button>
                    </div>

                    <div className="onePaddingLeft">
                        <h2>
                            {document.querySelector("#CAFileUpload") && document.querySelector("#CAFileUpload").files.length !== 0 ? document.querySelector("#CAFileUpload").files[0].name : "No File Selected"}
                        </h2>
                    </div>
                </div>
            </div>
        )
    }
}