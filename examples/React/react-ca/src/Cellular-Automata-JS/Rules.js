// static functions to implement different versions of cellular automata

// Conway's Game of Life rules all wrapped in a tidy function 
function ConwayGOL(liveNeighbors, currentState)
{
    if ((currentState && (liveNeighbors === 2)) || (liveNeighbors === 3)) 
        return 1;
    else
        return 0;
}

export default ConwayGOL;