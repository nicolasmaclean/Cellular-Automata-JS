// applies given rules using given struct for each cell

class CellularAutomata
{
    constructor()
    {
        this.grid = new Grid();
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
            var nVal = ConwayGOL(neighbors, true); // TODO: get its value if this is not game of life, instead of a hardcoded true
            
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
    }

    // custom list.includes bc std includes won't compare vectors correctly 
    list_contains(list, item)
    {
        for (var i in list)
        {
            if (Vector.equals(i, item))
            {
                console.log("equal " + item);
                return true;
            }
        }

        return false;
    }
}