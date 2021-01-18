import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { CAGrid } from './Cellular-Automata-JS/react components/import.js';


var cellAutoGridRef = React.createRef();


var obj = {
    width: window.innerWidth*.5,
    height: window.innerHeight*.75,
}

console.log(window.innerWidth, window.innerHeight)
console.log(obj, window.innerHeight*.125)

var cellAutoGrid = <CAGrid configs={obj} ref={cellAutoGridRef} gridDataEnabled={true} gridInputEnabled={true}/>;
// var cellAutoGrid = <CAGrid ref={cellAutoGridRef} gridDataEnabled={true} gridInputEnabled={true}/>;

var elements = (
    <div id="group"
        // style={{
        //     marginTop: window.innerHeight*.125
        // }}
    >
        {cellAutoGrid}
    </div>
)

ReactDOM.render(elements, document.getElementById("root"));