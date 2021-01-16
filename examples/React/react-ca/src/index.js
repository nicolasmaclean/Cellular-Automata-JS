import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { CAGrid } from './Cellular-Automata-JS/react components/import.js';


var obj = {
    cellColors: {0: 'white', 1: 'purple', 2: 'blue', 3: 'black'},
    stateNames: ["poop", "pee", "poopee", "haha"],
}

var cellAutoGridRef = React.createRef();
var cellAutoGrid = <CAGrid configs={obj} ref={cellAutoGridRef} gridDataEnabled={true} gridInputEnabled={true}/>;

var elements = (
    <div id="group">
        <h1> hi </h1>
        {cellAutoGrid}
    </div>
)

ReactDOM.render(elements, document.getElementById("root"));