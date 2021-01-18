import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { CAGrid } from './Cellular-Automata-JS/react components/import.js';


var cellAutoGridRef = React.createRef();

var obj = {
    width: 700,
    height: 600,
    mode: "wire world",
    // mode: "game of life",
}

var cellAutoGrid = <CAGrid configs={obj} ref={cellAutoGridRef} gridDataEnabled={true} gridInputEnabled={true}/>;
// var cellAutoGrid = <CAGrid ref={cellAutoGridRef} gridDataEnabled={true} gridInputEnabled={true}/>;

var elements = (
    <div id="group">
        {cellAutoGrid}
    </div>
)

ReactDOM.render(elements, document.getElementById("root"));