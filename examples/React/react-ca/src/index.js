import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import CAGrid from './Cellular-Automata-JS/react components/CAGrid.js';

ReactDOM.render(<h1> hi </h1>, document.getElementById("root"));

var obj = {
    cellColors: {0: 'white', 1: 'purple', 2: 'blue', 3: 'black'}
}

ReactDOM.render(<CAGrid configs={obj}/>, document.getElementById("root"));