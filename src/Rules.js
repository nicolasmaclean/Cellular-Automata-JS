// static functions to implement different versions of cellular automata

// Conway's Game of Life rules all wrapped in a tidy function 
function ConwayGOL(liveNeighbors, currentState)
{
    return currentState && (liveNeighbors == 2) || (liveNeighbors == 3); 
}