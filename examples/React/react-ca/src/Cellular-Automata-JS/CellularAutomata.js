// applies given rules using given struct for each cell

import { Grid, ConwayGOL, Cell } from './import'

class CellularAutomata
{
    constructor()
    {
        this.grid = new Grid();
        this.generation = 0;
        this.ruleset = [ConwayGOL];
    }

    // performs one step of the simulation
    step()
    {
        var cellsToCheck = new Set();
        var nMap = new Map();

        // iterates through all live cells and adds their neighbors to a list
        this.grid.forEach(key => {
            // gets neighbors that will need to be checked later
            var liveNeighbors = this.grid.getNeighboringCells(key);
            
            // keeps track of neighbors that will need to be checked
            liveNeighbors.forEach(val => {
                if(!this.grid.hasCell(val)) // this is still messed up
                {
                    cellsToCheck.add(Grid.tostring(val));
                }
            });
            
            // performs conway's rules to the current cell
            var neighbors = this.grid.getLiveNeighbors(key);
            // var nVal = this.getCell(key);

            // for (let rule in this.ruleset) // fix rule iteration stuff here and line 55
            // {
            //     nVal = rule(neighbors, nVal);
            // }
            var nVal = ConwayGOL(neighbors, true);
            
            if(nVal !== Cell.defaultValue())
            {
                nMap.set(Grid.tostring(key), nVal);
            }
        });


        // iterates through the neighbors stored in last foreach loop
        cellsToCheck.forEach(str_key => {
            var key = Grid.unstring(str_key);
            var neighbors = this.grid.getLiveNeighbors(key);
            // value = this.grid.getCell(key);

            var nVal = ConwayGOL(neighbors, false); // TODO: use value if this is not game of life
            if(nVal)
                nMap.set(Grid.tostring(key), nVal);
        });

        this.grid.setNewMap(nMap);
        this.grid.pruneDefaultValues();
        this.generation++;
    }

    getCell(coord)
    {
        return this.grid.getCell(coord);
    }

    setCell(coord, val)
    {
        this.grid.setCell(coord, val);
    }
}

export default CellularAutomata;