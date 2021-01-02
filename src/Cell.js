// basic 2d cell with boolean value

class Cell
{
    constructor(bool)
    {
        this.val = bool;
        
    }
    
    get getValue()
    {
        return this.val;
    }
    
    // returns a js object with the colors of each state being the keys
    static getBatchObject()
    {
        var batch = {};
        
        for (let x in Cell.states)
        {
            batch[Cell.states[x]] = [];
        }
        
        return batch;
    }
    
    // the default value of a cell, the most common value held by a cell. This is needed for the sparse matrix to correctly prune values
    static defaultValue()
    {
        return false;
    }
    
    static getColor(val)
    {
        return val ? Cell.clr_live : Cell.clr_dead;
    }
};

Cell.clr_live = 'black';
Cell.clr_dead = 'white';

Cell.states = [Cell.clr_live, Cell.clr_dead];