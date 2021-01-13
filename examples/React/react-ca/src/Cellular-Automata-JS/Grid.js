// a sparse matrix that stores the value of each cell
// TODO: setCell, getCell needs to be reconfigured if a version other than gamme of life is use
// TODO: move functions like getNeighbors into cell.js or rules.js so that they are more customizable

import { Vector } from './import';

class Grid
{
    constructor(cellStateAmt, cellColors)
    {
        this.mat = new Map();
        this.cellStateAmt = cellStateAmt; // default cell states are binary
        this.cellColors = cellColors;
    }
    
    // returns a javascript object with colors storing list of coords
    createBatchObject()
    {
        var batch = {};
        
        for (let x = 0; x < this.cellStateAmt; x++)
        {
            batch[this.cellColors[x]] = [];
        }

        return batch;
    }

    // tostring to convert a vector into a string, which is used as a key for the map
    static tostring(v)
    {
        return v.x + " " + v.y;
    }
    
    // unstringifies the key tostring
    static unstring(str)
    {
        var arr = str.split(" ");
    
        return new Vector(parseFloat(arr[0]), parseFloat(arr[1]));
    }

    // prunes false values to uphold sparse matrix
    pruneDefaultValues()
    {
        var defaultValue = 0;
        
        this.mat.forEach((val, key) => {
            if (val === defaultValue)
            {
                this.removeCell(Grid.unstring(key));
            }
        });
    }

    // gets cell value if its a valid key or gets the default value
    getCell(pos)
    {
        var str = Grid.tostring(pos);
        
        if (this.hasCell(pos))
            return this.mat.get(str);
        else
            return 0;
    }

    // returns if the requested position is in the map
    hasCell(pos)
    {
        var str = Grid.tostring(pos);
        return this.mat.has(str);
    }

    // sets the value of the cell at pos with val
    setCell(pos, val)
    {
        var str = Grid.tostring(pos);
        this.mat.set(str, val);
    }

    // sets given cells to given values, in the format: arr[x, 0] = key, arr[x, 1] = val
    setCells(arr)
    {
        arr.forEach(cell => {
            this.setCell(cell[0], cell[1]);
        })
    }

    // sets all given cell positions to given value
    setCells_val(arr, val)
    {
        arr.forEach(cell => {
            this.setCell(cell, val);
        })
    }

    // removes a cell from the grid
    removeCell(pos)
    {
        if (this.hasCell(pos))
        {
            this.mat.delete(Grid.tostring(pos));
        }
    }

    // returns a list nieghboring coords
    getNeighboringCells(pos)
    {
        var neighbors = []
        
        for (var x = -1; x <= 1; x++)
            for (var y = -1; y <= 1; y++)
                if ((x !== 0 || y !== 0))
                    neighbors.push(new Vector(pos.x + x, pos.y + y));

        return neighbors;
    }

    getNeighborsValues(pos)
    {
        var neighbors = []
        
        for (var x = -1; x <= 1; x++)
            for (var y = -1; y <= 1; y++)
                if ((x !== 0 || y !== 0))
                    neighbors.push(this.getCell(new Vector(pos.x + x, pos.y + y)));

        return neighbors;
    }

    // returns the amount of live neighbors for given cell
    getLiveNeighbors(pos)
    {
        var neighbors = 0;
        
        for (var x = -1; x <= 1; x++)
            for (var y = -1; y <= 1; y++)
                if ( (x !== 0 || y !== 0) && this.getCell(Vector.add(pos, new Vector(x, y))) )
                    neighbors++;

        return neighbors;
    }

    // replaces the current map with the new one
    setNewMap(nMap)
    {
        this.mat = nMap;
    }

    // a custom forEach function that loops through mat and calls the given function with the key in each iteration
    forEach(func)
    {
        this.mat.forEach( (value, key) => {
            var k = Grid.unstring(key);
            func(k);
        });
    }

    // cycles the requested cell to the next state
    cycleCell(coord)
    {
        this.setCell( coord, (this.getCell(coord)+1) % this.cellStateAmt);
    }
}

export default Grid;