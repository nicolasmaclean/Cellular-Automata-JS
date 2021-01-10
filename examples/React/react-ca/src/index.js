import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import CAGrid from './Cellular-Automata-JS/react components/CAGrid.js';

ReactDOM.render(<h1> hi </h1>, document.getElementById("root"));
ReactDOM.render(<CAGrid init_loopState={2} init_width={500} init_height={600}/>, document.getElementById("root"));