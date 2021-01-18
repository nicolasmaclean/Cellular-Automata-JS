// helper class for converting JS objects to JSON files and vice versa.
// Thanks to the StackOverflow answer from Shobhit Sharma

import { Vector, Grid, CellularAutomata } from'./import'

export default class JSONConverter
{
    // converts JavaScript object into a string. Note, it will also handle functions and arrow functions, not class methods
    static JSToJSON(obj)
    {
        return JSON.stringify(obj, function(key, value) {
            var fnBody;

            // appends prefix to arrow function to identify at parse
            if (value instanceof Function || typeof value == 'function')
            {
                fnBody = String(value);
                if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') { //this is ES6 Arrow Function
                    return '_NuFrRa_' + fnBody;
                }
                return fnBody;
            }

            if (value instanceof RegExp)
            {
                return '_PxEgEr_' + value;
            }

            if (value instanceof Vector)
            {
                return '_Vector_' + value;
            }

            // CellularAutomata.grid.mat is packaged as a json and then stringified
            if (value instanceof CellularAutomata)
            {
                return '_CellAu_' + JSON.stringify(JSONConverter.packageMapByState(value.grid.mat, Object.keys(obj.cellColors).length));
            }
            
            return value;
        });
    }

    // returns a js object with the possible map values as keys and the map keys as values in an array at each obj key
    static packageMapByState(map, stateAmt)
    {
        var obj = {};

        // initializes each cell state's array
        for (let i = 0; i < stateAmt; i++)
        {
            obj[i] = [];
        }

        // adds each map entry to the correct spot in the object
        map.forEach( (val, key, map) =>
        {
            obj[val].push(key);
        });

        return obj;
    }

    // unpackages map string
    static unpackageMapByState(str)
    {
        var obj = JSON.parse(str);
        var map = new Map();

        // cell state loop
        for (let state in obj)
        {
            for (let coord in obj[state])
            {
                map.set(obj[state][coord], Number(state));
            }
        }
        
        return map;
    }

    // converts JSON object, as a string, to a JavaScript object. Note, this uses previously appended prefixes to handle arrow functions and regex.
    static JSONToJS(string)
    {
        return JSON.parse(string, function(key, value) {
            var prefix;

            if (typeof value != 'string') {
                return value;
            }
            if (value.length < 8) {
              return value;
            }
    
            prefix = value.substring(0, 8);

            // if (false && value.match("/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/")) {
            //     return new Date(value);
            // }
    
            if (prefix === 'function')
            {
              return eval('(' + value + ')');
            }

            if (prefix === '_PxEgEr_')
            {
              return eval(value.slice(8));
            }

            if (prefix === '_NuFrRa_')
            {
                return eval(value.slice(8));
            }
            
            if (prefix === '_Vector_')
            {
                var VectorArr = eval(value.slice(8));
                return new Vector(VectorArr[0], VectorArr[1])
            }
            
            if (prefix === '_CellAu_')
            {
                return JSONConverter.unpackageMapByState(value.slice(8));
            }
            
            return value;
        });
    }

    // saves JS object as a JSON file
    static ConvertToJSONFile(obj)
    {
        var string = JSONConverter.JSToJSON(obj);
        var blob = new Blob([string], {type: 'application/json'});

        JSONConverter.saveBlob(blob, "save.json")
    }

    // saves given blob with given fileName
    static saveBlob(blob, fileName)
    {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
    
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // saves given CARender object
    static SaveCARender(render)
    {
        var obj = Object.assign({}, render.configs);
        obj.paused = render.paused;
        obj.drawSpecificState = render.drawSpecificState;
        obj.drawState = render.drawState;

        JSONConverter.ConvertToJSONFile(obj);
    }

    // loads JSON file and reinstantiates CARender based upon it
    static LoadCARender(render, json)
    {
        // stops attempting to load file if there is no file
        if (json === undefined)
        {
            return;
        }

        if (true)//JSONConverter.checkFile(json))
        {
            json.text();
            json.text().then( (text) => 
            {
                var obj = JSONConverter.JSONToJS(text);

                var map = obj.CellularAutomata;
                obj.CellularAutomata = new CellularAutomata(obj);
                obj.CellularAutomata.grid.setNewMap(map);

                render.ReInstantiate(obj);
            })
        }
    }
}