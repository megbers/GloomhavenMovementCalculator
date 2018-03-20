if (!Array.prototype.remove) {
    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
}

var astar = {
    init: function(grid) {
        for(var x = 0; x < grid.length; x++) {
            for(var y = 0; y < grid[x].length; y++) {
                grid[x][y].f = 0;
                grid[x][y].g = 0;
                grid[x][y].h = 0;
                //grid[x][y].content = false;
                grid[x][y].visited = false;
                grid[x][y].closed = false;
                grid[x][y].debug = "";
                grid[x][y].parent = null;
                //console.log([grid[x][y].coords[0],grid[x][y].coords[1]])
            }
        }
    },

    search: function(grid, start, end, heuristic) {
        this.init(grid);
        heuristic = heuristic || this.manhattan;

        var openList = [];

        //// find the start and end points in the grid ////
        start = grid[start.pos[0]][start.pos[1]];
        end =  grid[end.pos[0]][end.pos[1]];

        console.log( start, end )

        openList.push(start);

        while(openList.length > 0) {

            // Grab the lowest f(x) to process next
            var lowInd = 0;
            for(var i=0; i<openList.length; i++) {
                if(openList[i].f < openList[lowInd].f) { lowInd = i; }
            }
            var currentNode = openList[lowInd];

            // End case -- result has been found, return the traced path
            if( currentNode == end ) {
                var curr = currentNode;
                var ret = [];
                while(curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors
            openList.remove( lowInd );
            currentNode.closed = true;

            var neighbors = this.neighbors(grid, currentNode);
            for(var i=0; i<neighbors.length; i++) {
                var neighbor = neighbors[i];

                if( neighbor.closed || neighbor.content == 2 ) { // not a valid node to process, skip to next neighbor
                    continue;
                }

                // g score is the shortest distance from start to current node, we need to check if
                //   the path we have arrived at this neighbor is the shortest one we have seen yet
                var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
                var gScoreIsBest = false;

                if(!neighbor.visited) {
                    // This the the first time we have arrived at this node, it must be the best
                    // Also, we need to take the h (heuristic) score since we haven't done so yet
                    gScoreIsBest = true;
                    neighbor.h = heuristic(neighbor.coords, end.coords, neighbor);
                    neighbor.visited = true;
                    openList.push(neighbor);
                }
                else if(gScore < neighbor.g) {
                    // We have already seen the node, but last time it had a worse g (distance from start)
                    gScoreIsBest = true;
                }

                if(gScoreIsBest) {
                    // Found an optimal (so far) path to this node.  Store info on how we got here and just how good it really is. ////
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h + "<br/>";
                }
            }
        }

        // No result was found -- empty array signifies failure to find path
        return [];
    },

    manhattan: function(pos0, pos1) { //// heuristics : use manhattan distances  ////
        var dx = pos1[0] - pos0[0];
        var dy = pos1[1] - pos0[1];

        return  Math.abs (dx + dy);
    },

    neighbors: function(grid, node) {
        var ret = [];
        var x = node.coords[0];
        var y = node.coords[1];

        if( grid[x] && grid[x][y-1] && grid[x][y-1].value.type != 6 ) {
            ret.push(grid[x][y-1]);
        }
        if( grid[x-1] && grid[x-1][y-1] && grid[x-1][y-1].value.type != 6 ) {
            ret.push(grid[x-1][y-1]);
        }
        if( grid[x+1] && grid[x+1][y] && grid[x+1][y].value.type != 6) {
            ret.push(grid[x+1][y]);
        }
        if( grid[x-1] && grid[x-1][y] && grid[x-1][y].value.type != 6) {
            ret.push(grid[x-1][y]);
        }
        if( grid[x+1] && grid[x+1][y+1] && grid[x+1][y+1].value.type != 6 ) {
            ret.push(grid[x+1][y+1]);
        }
        if( grid[x] && grid[x][y+1] && grid[x][y+1].value.type != 6 ) {
            ret.push(grid[x][y+1]);
        }

        return ret;
    }
};