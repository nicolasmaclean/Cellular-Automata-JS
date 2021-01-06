// stores info about the user's position in grid/screen space
class Viewer
{
    constructor(init_pos, init_zoom, init_windowSize, init_lerpFactor, init_maxZoom, init_minZoom)
    {
        // data
        this.pos = new Vector(0, 0); // move to input pos instantly 
        this.targetPos = this.pos.copy();

        this.zoom = init_zoom;
        this.maxZoom = init_maxZoom;
        this.minZoom = init_minZoom;
        this.windowSize = init_windowSize;

        // config
        this.lerpFactor = init_lerpFactor;
        this.defaultCellSize = 10;
        this.cellSize = this.defaultCellSize * this.zoom;
        
        // state tracking
        this.needDraw = false; // move this into user input
        this.drawing = false;
        this.step = false;
        this.paused = false;
        
        // user input
        this.newCoords = new NSet();
        this.coordsInLine = new NSet();
        this.mousePos = new Vector(0, 0);

        this.moveToPosInstant(init_pos);
    }

    // sets the zoom variable. updates viewer position and cellsize accordingly
    setZoom(z)
    {
        var zoomP = this.zoom;
        this.zoom = z;

        // clamps zoom
        if (this.zoom < minZoom)
            this.zoom = minZoom;
        else if (this.zoom > maxZoom)
            this.zoom = maxZoom;

        // zoom percentage
        if (this.zoom > zoomP)
        {
            zoomP = -(this.zoom - zoomP) / zoomP;
        }
        else
        {
            zoomP = (zoomP - this.zoom) / this.zoom;
        }

        // offset viewer position based on mouse position
        var offsetP = this.mousePos;
        offsetP.div(this.windowSize);

        this.targetPos.add(new Vector(this.windowSize.x*zoomP*offsetP.x, this.windowSize.y*zoomP*offsetP.y));

        this.cellSize = defaultCellSize * this.zoom;
    }

    addZoom(a)
    {
        this.setZoom(this.zoom + a);
    }

    // converts screen coord to grid space
    screenToGrid(coord)
    {
        var gridCoord = Vector.sub(coord, this.pos);
        gridCoord.sub_int(this.cellSize/2);
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
        var nPos = this.translateCoordToCenterScreen(vector);
        nPos = this.gridToScreen(nPos);
        this.targetPos = nPos;
        this.pos = nPos;
    }

    // adds offset to given grid coord so it is in the center of the screen
    translateCoordToCenterScreen(vector)
    {
        var v = Vector.div_int(this.windowSize, this.cellSize);
        v.div_int(2);
        return Vector.add(vector, v);
    }

    Update()
    {
        this.pos.lerp(this.targetPos, this.lerpFactor);
    }
}