import React from 'react';
import { JSONConverter, CARender } from '../import';

export default class CAInput extends React.Component
{
    constructor(props)
    {
        super(props);
        var i = CARender.prebuiltModes.indexOf(props.parentRef.renderer.configs.mode);
        this.state = {
            mode: i === -1 ? CARender.prebuiltModes.length : i,
            modeLength: i === -1 ? CARender.prebuiltModes.length+1 : CARender.prebuiltModes.length,
        }

        this.modes = {};
        this.modes[this.state.mode] = props.parentRef.renderer;
    }
    
    render()
    {
        var renderer = this.props.parentRef.renderer;
        var input = this.props.parentRef.userInput;
        var grid = renderer.configs.CellularAutomata.grid;
        
        var pausedText = renderer.configs.paused ? "Paused" : "Playing";
        var grabText = input.grabCanvas ? "Move" : "Draw";
        var states = [];
        var rules = [];
        
        var key = 0;
        
        for (let color in grid.cellColors)
        {
            states.push(
                <div className="cellState flexCol" key={0-key}>
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
            key++
        }
        
        for (let rule in renderer.configs.ruleDescriptions)
        {
            rules.push(
                <div className="ruleDescription" key ={0-key}>
                    <h3 className="rule">
                        {renderer.configs.ruleDescriptions[rule]}
                    </h3>
                </div>
            );
            key++
        }
        
        return (
            <div className="gridInput">
                <div className="header">
                    <div className="flexRow contentLeft noPadding">
                        <h1 className="title noMargin"> {renderer.configs.title} </h1>
                        <button className="arrowButton" onClick={ () =>
                        {
                            // increments mode and prevents overflow
                            var m = this.state.mode+1;
                            m %= this.state.modeLength;
                            
                            // creates CARender object with prebuilt mode as needed
                            if (this.modes[m] === undefined)
                            {
                                // creates appropiate configs obj
                                var obj = {
                                    width: this.props.parentRef.ogConfigs.width,
                                    height: this.props.parentRef.ogConfigs.height,
                                    mode: CARender.prebuiltModes[m],
                                }
                                
                                CARender.fillJSObjectBlanks(obj);
                                CARender.fillModesInObj(obj);
                                
                                // creates new render
                                var nRender = new CARender(obj);
                                
                                
                                // stores new render in this.modes cache
                                this.modes[m] = nRender;
                            }
                            
                            // points CAGrid references to the current mode
                            this.modes[m].needDraw = true;
                            this.props.parentRef.configs = this.modes[m].configs;
                            this.props.parentRef.renderer = this.modes[m];

                            // points userInput to current renderer
                            this.props.parentRef.userInput.ReInitialize(this.modes[m], this.modes[m].viewer)

                            // updates CA Subtitle Input
                            document.querySelector("#CASubtitleInput").value = this.modes[m].configs.subtitle;

                            // updates the mode state
                            this.setState({
                                mode: m
                            }) 

                        }}></button>
                    </div>

                    <div className="subheader">
                        <input id="CASubtitleInput" className={"inputText"} type="text" defaultValue={renderer.configs.subtitle} onChange={ (event) =>
                        {
                            console.log(renderer.configs.subtitle);
                            renderer.configs.subtitle = event.target.value;
                            console.log(renderer.configs.subtitle);
                        }}></input>
                    </div>
                </div>

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

                        <button className={"button clear"} onClick={ () => {renderer.Instantiate(); renderer.configs.generation = 0; this.forceUpdate()}}>
                            Clear
                        </button>

                        <button className={"button save"} onClick={ () => {JSONConverter.SaveCARender(renderer); this.forceUpdate()}}>
                            Save
                        </button>
                    </div>

                    {/* load a previous save */}
                    <div className="flexRow contentLeft">
                        <button className="button load" onClick={ () => 
                            {
                                JSONConverter.LoadCARender(document.querySelector("#CAFileUpload").files[0], (configs) =>
                                {
                                    // update CASubtitleInput to configs.subtitle
                                    configs.windowSize = this.props.parentRef.configs.windowSize;
                                    var map = configs.CellularAutomata;
                                    
                                    var m = Object.keys(this.modes).length;
                                    
                                    // creates new render
                                    var nRender = new CARender(configs);
                                    nRender.configs.CellularAutomata.grid.setNewMap(map);
                                    
                                    // stores new render in this.modes cache
                                    this.modes[m] = nRender;
                                
                                    // points CAGrid references to the current mode
                                    this.modes[m].needDraw = true;
                                    this.props.parentRef.configs = this.modes[m].configs;
                                    this.props.parentRef.renderer = this.modes[m];

                                    // points userInput to current renderer
                                    this.props.parentRef.userInput.ReInitialize(this.modes[m], this.modes[m].viewer)
                                        
                                    this.setState({
                                        mode: m,
                                        modeLength: m+1
                                    })

                                    // updates CA Subtitle Input
                                    document.querySelector("#CASubtitleInput").value = this.modes[m].configs.subtitle;
    
                                    this.forceUpdate(); 
                                }); 

                                }}>
                            Load
                        </button>
                        <input type="file" className={"file"} id="CAFileUpload" accept="application/json"/>
                        <button className="button fileButton" onClick={ () => { document.querySelector("#CAFileUpload").click(); } }>
                            Browse
                        </button>
                    </div>

                    {/* file input display */}
                    <div className="onePaddingLeft">
                        <h2>
                            {document.querySelector("#CAFileUpload") && document.querySelector("#CAFileUpload").files.length !== 0 ? document.querySelector("#CAFileUpload").files[0].name : "No File Selected"}
                        </h2>
                    </div>

                    <div className="ruleDescriptions">
                        <h2>
                            Rules
                        </h2>
                        {rules}
                    </div>
                </div>
            </div>
        )
    }
}