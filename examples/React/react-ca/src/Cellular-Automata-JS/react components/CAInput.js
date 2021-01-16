import React from 'react';

export default class CAInput extends React.Component
{
    render()
    {
        var renderer = this.props.renderRef;
        var input = this.props.inputRef;

        var pausedText = renderer.paused ? "Paused" : "Playing";
        console.log(pausedText);

        return (
            <div className="gridInput">
                <h1> Input </h1>

                <h2> Drawing: {renderer.lineCoordsDone.size() !== 0 ? "true" : "false"}</h2>
                <h2> Mouse Grabbing: {input.mouse_grabbing ? "true" : "false"} </h2>

                {/* pause/play button and simulation step button */}
                <div className="flexRow">
                    <button className={"button " + pausedText} onClick={() => {input.pauseToggle(); this.forceUpdate()}} > 
                        {pausedText} 
                    </button>

                    <button className="button fade" onClick={() => { input.singleStep() }} disabled={!renderer.paused}>
                        Step Once
                    </button>
                </div>

                <div className="flexRow statePicker">

                </div>
            </div>
        )
    }
}