import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { CAGrid } from './Cellular-Automata-JS/react components/import.js';


var cellAutoGridRef = React.createRef();


var obj = {
    width: window.innerWidth*.5,
    height: window.innerHeight*.75,
}

var cellAutoGrid = <CAGrid configs={obj} ref={cellAutoGridRef} gridDataEnabled={true} gridInputEnabled={true}/>;

var elements = (
    <div id="group">
        {cellAutoGrid}
    </div>
)

ReactDOM.render(elements, document.getElementById("root"));