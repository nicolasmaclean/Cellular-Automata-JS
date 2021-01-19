// stores info about the user's position in grid/screen space

import { Vector } from './import'

class Viewer
{
    constructor(configs)
    {
        this.configs = configs;

        // data
        this.pos = new Vector(0, 0); // move to input pos instantly 
        this.targetPos = this.pos.copy();
        
        this.zoom = configs.zoom;
        this.maxZoom = configs.maxZoom;
        this.minZoom = configs.minZoom;
        
        // config
        this.lerpFactor = .2;
        this.defaultCellSize = 10;
        this.cellSize = this.defaultCellSize * this.zoom;
        
        // moves to given position
        this.moveToPosInstant(configs.position);
    }

    // TODO: this sucks ass. Fix it.
    // sets the zoom variable. updates viewer position and cellsize accordingly
    setZoom(z)
    {
        var zoomP = this.zoom;
        this.zoom = z;

        // clamps zoom
        if (this.zoom < this.minZoom)
            this.zoom = this.minZoom;
        else if (this.zoom > this.maxZoom)
            this.zoom = this.maxZoom;

        // zoom percentage
        if (this.zoom > zoomP)
        {
            zoomP = -(this.zoom - zoomP) / zoomP;
        }
        else
        {
            zoomP = (zoomP - this.zoom) / this.zoom;
        }

        // offset so zoom is from the middle, not the top right right of the canvas
        this.targetPos.add(new Vector(this.configs.windowSize.x*zoomP/4, this.configs.windowSize.y*zoomP/4));

        this.cellSize = this.defaultCellSize * this.zoom;
    }

    addZoom(a)
    {
        this.setZoom(this.zoom + a);
    }

    // converts screen coord to grid space
    screenToGrid(coord)
    {
        var gridCoord = Vector.sub(coord, this.pos);
        gridCoord.div_int(this.cellSize);
        gridCoord = Vector.floor(gridCoord);

        return gridCoord;
    }

    // converts grid coord to screen space
    gridToScreen(coord)
    {
        var screenCoord = coord.copy();
        screenCoord.mult_int(this.cellSize);
        screenCoord.add(this.pos);

        return screenCoord;
    }

    // returns a vector of viewer.pos converted to grid coordinates
    gridPosition()
    {
        var gridCoord = this.pos.copy();
        gridCoord.div_int(this.cellSize);
        gridCoord.ceil();
        gridCoord.x = -gridCoord.x

        return gridCoord;
    }

    moveToOrigin()
    {
        this.moveToPos(new Vector(0, 0));
    }

    // moves viewer.pos to given grid coord
    moveToPos(vector)
    {
        var nPos = this.translateCoordToCenterScreen(vector);
        nPos = this.gridToScreen(nPos);
        this.targetPos = nPos;
    }

    // instant move viewer.pos to given grid coord
    moveToPosInstant(vector)
    {
        // var nPos = this.translateCoordToCenterScreen(vector);
        // var nPos = this.gridToScreen(vector);
        var nPos = vector;
        this.targetPos = nPos;
        this.pos = nPos;
    }

    // adds offset to given grid coord so it is in the center of the screen
    translateCoordToCenterScreen(vector)
    {
        var v = Vector.div_int(this.configs.windowSize, this.cellSize);
        v.div_int(2);
        return Vector.add(vector, v);
    }

    Update()
    {
        if (Vector.distanceSQ(this.pos, this.targetPos) < 1)
        {
            this.pos = this.targetPos;
        }
        else
        {
            this.pos.lerp(this.targetPos, this.lerpFactor);
        }
    }
}

export default Viewer