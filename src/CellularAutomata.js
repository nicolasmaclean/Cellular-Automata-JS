// applies given rules using given struct for each cell

class CellularAutomata
{
    constructor(configs)
    {
        this.grid = new Grid(configs.cellColors);
        this.configs = configs;
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
                if(!this.grid.hasCell(val))
                {
                    cellsToCheck.add(Grid.tostring(val));
                }
            });
            
            var nVal = this.applyRules(key);

            if(nVal !== 0)
            {
                nMap.set(Grid.tostring(key), nVal);
            }
        });


        // iterates through the neighbors stored in last foreach loop
        cellsToCheck.forEach(str_key => {
            var key = Grid.unstring(str_key);

            var nVal = this.applyRules(key);

            if(nVal !== 0)
            {
                nMap.set(Grid.tostring(key), nVal);
            }
        });

        this.grid.setNewMap(nMap);
        this.grid.pruneDefaultValues();
        this.configs.generation++;
    }

    applyRules(key)
    {
        // applies this.rules to each current live cell
        var neighbors = this.grid.getNeighborsValues(key);
        var val = this.getCell(key);

        for (let rule in this.configs.rules)
        {
            var n = this.configs.rules[rule](neighbors, val) 
            if (n[0])
            {
                return n[1];
            }
        }
        
        return 0;
    }

    // wrapper functions for sparce matrix access
    getCell(coord)
    {
        return this.grid.getCell(coord);
    }

    setCell(coord, val)
    {
        this.grid.setCell(coord, val);
    }

    cycleCell(coord)
    {
        this.grid.cycleCell(coord);
    }
}