(function(){

    var canvas = document.getElementById('hexmap');

    var hexHeight,
        hexRadius,
        hexRectangleHeight,
        hexRectangleWidth,
        hexagonAngle = 0.523598776, // 30 degrees in radians
        sideLength = 20,
        boardWidth = 20,
        boardHeight = 20,
        currentSelected = {hexX: -1, hexY: -1};
    var board = [];
    for(var i = 0; i < boardWidth; i++) {
        board[i] = [];
        for(var j = 0; j < boardHeight; j++) {
            board[i][j] = {position:{hexX:i, hexY:j, distanceX: i + Math.ceil(j/2), distanceY: j}, value : {type: 0, initiative: 99}};
        }
    }

    hexHeight = Math.sin(hexagonAngle) * sideLength;
    hexRadius = Math.cos(hexagonAngle) * sideLength;
    hexRectangleHeight = sideLength + 2 * hexHeight;
    hexRectangleWidth = 2 * hexRadius;

    if (canvas.getContext){
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#CCCCCC";
        ctx.lineWidth = 1;

        drawBoard(ctx, boardWidth, boardHeight);

        canvas.addEventListener("click", function(eventInfo) {
            var position = getMousePosition(eventInfo);

            console.log(position);

            ctx.clearRect(0, 0, canvas.width, canvas.height);


            drawBoard(ctx, boardWidth, boardHeight);
            // Check if the mouse's coords are on the board
            if(position.hexX >= 0 && position.hexX < boardWidth) {
                if(position.hexY >= 0 && position.hexY < boardHeight) {

                    if(currentSelected.hexX == position.hexX && currentSelected.hexY == position.hexY) {
                        console.log("Hex already selected, incrementing");
                        board[position.hexX][position.hexY].position = position;
                        if(board[position.hexX][position.hexY].value.type < 6) {
                            board[position.hexX][position.hexY].value.type = board[position.hexX][position.hexY].value.type + 1
                        } else {
                            board[position.hexX][position.hexY].value.type = 0;
                        }
                    } else {
                        console.log("Hex not selected, selecting now");
                        currentSelected.hexX = position.hexX;
                        currentSelected.hexY = position.hexY;
                    }

                    drawHexagon(ctx, position.screenX, position.screenY, true, true);
                    updateController(position);
                }
            }

        });

        document.getElementById("updateButton").addEventListener("click", function() {
            console.log("Updating");
            var hexX = document.getElementById('xText').value;
            var hexY = document.getElementById('yText').value;

            var e = document.getElementById('typeSelect');
            board[hexX][hexY].value.type = e.options[e.selectedIndex].value;
            //board[hexX][hexY].value.type = document.getElementById('typeText').value;

            board[hexX][hexY].value.initiative = document.getElementById('initiativeText').value;
            board[hexX][hexY].value.move = document.getElementById('moveText').value;
            board[hexX][hexY].value.melee = document.getElementById('meleeText').value;
            board[hexX][hexY].value.range = document.getElementById('rangeText').value;

            board[hexX][hexY].value.distanceX = document.getElementById('distanceXText').value;
            board[hexX][hexY].value.distanceY = document.getElementById('distanceYText').value;
            board[hexX][hexY].value.range = document.getElementById('rangeText').value;

            console.log(board[hexX][hexY].value);

            drawBoard(ctx, boardWidth, boardHeight);
        });

        document.getElementById("goButton").addEventListener("click", function() {
            var startEnd = getFocus();
            getMovedTo(startEnd);
            drawBoard(ctx, boardWidth, boardHeight);
        });
    }

    function getMousePosition(eventInfo) {
        var x,
            y,
            hexX,
            hexY,
            screenX,
            screenY,
            rect,
            position = {};
        rect = canvas.getBoundingClientRect();

        x = eventInfo.clientX - rect.left;
        y = eventInfo.clientY - rect.top;

        hexY = Math.floor(y / (hexHeight + sideLength));
        hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);

        screenX = hexX * hexRectangleWidth + ((hexY % 2) * hexRadius);
        screenY = hexY * (hexHeight + sideLength);

        position.x = x;
        position.y = y;
        position.hexY = hexY;
        position.hexX = hexX;
        position.distanceX = hexX + Math.ceil(hexY/2);
        position.distanceY = hexY;
        position.screenX = screenX;
        position.screenY = screenY;

        return position;
    }

    function updateController(position) {
        var value = board[position.hexX][position.hexY].value;

        document.getElementById('distanceXText').value = position.distanceX;
        document.getElementById('distanceYText').value = position.distanceY;
        document.getElementById('xText').value = position.hexX;
        document.getElementById('yText').value = position.hexY;
        //document.getElementById('typeText').value = value.type;
        document.getElementById('typeSelect').value = value.type;
        document.getElementById('initiativeText').value = value.initiative;
        document.getElementById('moveText').value = value.move;
        document.getElementById('meleeText').value = value.melee;
        document.getElementById('rangeText').value = value.range;

        if(value.type == 3) {
            document.getElementById('initiativeTextControls').style.display = 'block';
        } else {
            document.getElementById('initiativeTextControls').style.display = 'none';
        }
        if(value.type == 2) {
            document.getElementById('monsterSpecificControls').style.display = 'block';
        } else {
            document.getElementById('monsterSpecificControls').style.display = 'none';
        }
    }

    function drawBoard(canvasContext, width, height) {
        for(var i = 0; i < width; ++i) {
            for(var j = 0; j < height; ++j) {
                drawHexagon(
                    ctx,
                    i * hexRectangleWidth + ((j % 2) * hexRadius),
                    j * (sideLength + hexHeight),
                    true
                );
            }
        }
    }

    function drawHexagon(canvasContext, x, y, fill, selected) {

        var fill = fill || false;
        if(fill){
            var hexY = Math.floor(y / (hexHeight + sideLength));
            var hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);

            setFillStyle(board[hexX][hexY].value.type, selected, board[hexX][hexY].value.focus, board[hexX][hexY].value.moved);
        }

        canvasContext.beginPath();
        canvasContext.moveTo(x + hexRadius, y);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
        canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
        canvasContext.lineTo(x, y + sideLength + hexHeight);
        canvasContext.lineTo(x, y + hexHeight);
        canvasContext.closePath();

        if(fill) {
            canvasContext.fill();
            canvasContext.stroke();
        } else {
            canvasContext.stroke();
        }
    }

    function setFillStyle(type, selected, focus, moved) {
        if(selected) {
            ctx.fillStyle = "#BBBBBB";
        } else if(focus) {
            ctx.fillStyle = "#BBBBFF";
        } else if(moved) {
            ctx.fillStyle = "#FFAAAA";
        } else if(type == 1) {
            ctx.fillStyle = "#AA0000";
        } else if(type == 2) {
            ctx.fillStyle = "#FF0000";
        } else if(type == 3) {
            ctx.fillStyle = "#0000FF";
        } else if(type == 4) {
            ctx.fillStyle = "#00FF00";
        } else if(type == 5) {
            ctx.fillStyle = "#FF00FF";
        } else if(type == 6) {
            ctx.fillStyle = "#000000";
        } else {
            ctx.fillStyle = "#FFFFFF";
        }
    }

    //================================Actual Calc================
    function getFocus() {
        var players = [];
        var monsters = [];
        var currentMonster = {};
        for(var i=0; i<boardWidth; i++) {
            for(var j=0; j<boardHeight; j++) {
                if(board[i][j].value.type == 1) {
                    monsters.push(board[i][j]);
                } else if(board[i][j].value.type == 3) {
                    players.push(board[i][j]);
                } else if(board[i][j].value.type == 2) {
                    currentMonster = board[i][j];
                }
            }
        }

        var lowestDistance = 1000;
        var lowestPlayer = {value:{initiative:1000}};
        for(var i=0; i<players.length; i++) {
            var distance = calculateDistance(players[i].position, currentMonster.position);
            if(distance < lowestDistance || (distance == lowestDistance && lowestPlayer.value.initiative > players[i].value.initiative)) {
                lowestDistance = distance;
                lowestPlayer = players[i];
                lowestPlayer.value.focus = true;
            }
        }
        console.log("Lowest Player: ", lowestPlayer);
        board[lowestPlayer.position.hexX][lowestPlayer.position.hexY] = lowestPlayer;

        return {focusedPlayer:lowestPlayer, activeMonster:currentMonster};
    }

    function getMovedTo(startEnd) {

        var grid = [];
        for(var i = 0; i < boardWidth+20; i++) {
            grid[i] = [];
            for(var j = 0; j < boardHeight+20; j++) {
                grid[i][j] = {};
            }
        }

        for(var i = 0; i < boardWidth; i++) {
            for(var j = 0; j < boardHeight; j++) {
                var hex = board[i][j];
                hex.coords = [hex.position.distanceX, hex.position.distanceY];
                // console.log(hex);
                grid[hex.position.distanceX][hex.position.distanceY] = hex;
            }
        }


        var start = {pos:[startEnd.activeMonster.position.distanceX, startEnd.activeMonster.position.distanceY]};
        var end = {pos:[startEnd.focusedPlayer.position.distanceX, startEnd.focusedPlayer.position.distanceY]};
        var resultWithDiagonals = astar.search(grid, start, end, function(a, b, hex) {
            if(!a || !b || hex.value.type == 6) {
                return 1000;
            }
            var az = a[0] - b[0];
            var bz = a[1] - b[1];
            return Math.max(Math.abs(az), Math.abs(bz), Math.abs(az - bz));
        });

        document.getElementById('moveList').innerHTML = "";
        var moveResults = "";
        for(var i=0; i < resultWithDiagonals.length; i++) {
            var step = resultWithDiagonals[i];
            board[step.position.hexX][step.position.hexY].value.moved = true;
            moveResults = moveResults + step.position.hexX + ", " + step.position.hexY +"<br/>"+ step.debug + "===========<br/>";
        }
        document.getElementById('moveList').innerHTML = moveResults;
        console.log(resultWithDiagonals);
    }

    function calculateDistance(point1, point2) {
        var xDifference = point1.distanceX - point2.distanceX;
        var yDifference = point1.distanceY - point2.distanceY;
        var dDifference = yDifference - xDifference;

        return Math.max(Math.abs(xDifference), Math.abs(yDifference), Math.abs(dDifference));
    }

})();