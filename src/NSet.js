// a custom set class
// objects using this class must have an equals function for comparison

class NSet
{
    // creates an empty set
    constructor()
    {
        this.arr = [];
    }

    loadSet(set)
    {
        set.forEach( (item) =>
        {
            this.arr.push(item);
        });
    }

    // retrieves item at position
    // [] array retrival also works
    get(i)
    {
        return this.arr[i];
    }

    // attempts to add given item
    add(item)
    {
        if (!this.has(item))
        {
            this.arr.push(item);
        }

    }

    // returns if requested value is in the set
    has(item)
    {
        return this.search(item) !== -1
    }

    size()
    {
        return this.arr.length;
    }

    // attempts to delete item at requested position
    delete(i)
    {
        this.arr.splice(i, 1);
        // delete this.arr[i];
    }

    // returns index of requested item or -1 if the item is not in the set
    search(item)
    {
        for (let x = 0; x < this.arr.length; x++)
        {
            if (this.get(x).equals(item))
                return x;
        }

        return -1;
    }

    forEach(func)
    {
        for (let i = 0; i < this.arr.length; i++)
        {
            var x = this.get(i);
            func(x);
        }
    }

    // adds items from set B to the current set
    union(B)
    {
        // shortcuts if a given set is empty
        if (B.size === 0)
        {
            return;
        }
        else if (this.size === 0)
        {
            this.arr = B.arr;
        }
        else
        {
            B.forEach( (item) => {
                this.add(item);
            });
        }
    }

    // removes items in set B from the current set
    difference(B)
    {
        // shortcut for empty given sets
        if(this.size === 0 || B.size === 0)
        {
            return;
        }
        else
        {
            for (let x = B.arr.length-1; x >= 0; x--) 
            {
                var item = B.get(x);
                var i = this.search(item);

                if(i !== -1)
                {
                    this.delete(i);
                }
            }
        }
    }
    
    // replaces the current set with a new set of items in both sets
    intersect(B)
    {
        this.arr = NSet.intersect(this, B).arr;
    }

    // returns a new set containing all elements of each given set
    static union(A, B)
    {
        // shortcuts if a given set is empty
        if (B.size === 0)
            return A;
        
        if(A.size === 0)
            return B;

        
        var s = new NSet();
        s.loadSet(A);

        B.forEach( (item) => {
            s.add(item);
        });

        return s
    }

    // returns a new set of elements in set A and not in Set B
    static difference(A, B)
    {
        // shortcut for empty given sets
        if(A.size === 0 || B.size === 0)
            return A;


        var s = new NSet();
        s.loadSet(A);

        for (let x = B.arr.length-1; x >= 0; x--) 
        {
            var item = B.get(x);
            var i = A.search(item);

            if(i !== -1)
            {
                s.delete(i);
            }
        }
        
        return s;
    }

    // returns the intersection of sets A and B
    static intersect(A, B)
    {
        if (A.size === 0 || B === 0)
            return new NSet();

        var s = new NSet();

        A.forEach( (item) => {
            if (B.has(item))
                s.add(item);
        });

        return s;
    }

    // prints the given set's contents to the console
    log()
    {
        console.log(this.arr);
    }

    toString()
    {
        var str = "["

        this.forEach( (item => {
            str += item + " ";    
        }))

        str = str.trim();
        str += "]";

        return str;
    }
}