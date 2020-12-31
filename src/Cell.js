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

    // the default value of a cell, the most common value held by a cell. This is needed for the sparse matrix to correctly prune values
    static defaultValue()
    {
        return false;
    }

    static getColor(val)
    {
        return val ? 'black' : 'white';
    }
};