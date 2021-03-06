/**
 * Created by michyama on 4/23/2015.
 */
/*
    Assumptions:
       Instruction diagrams were not literal, as in they do not actually want an ASCII representation
       Does not need to solve for all possible solutions

    Notes:
        You can add more dots to an already solved puzzle and press solve again for a new solution
        You can press solve again for a possible alternate solution
        If no solution is found, you can add more points and check for a solution again
 */



var canvas = document.getElementById("myCanvas");
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

var points = [];            //array of points created by user
var connectedPoints = [];   //array of points that have at least one connection
var solution = [];          //array of lines between points (x1,y1 x2,y2)



//draws 5x5 red box, placed where user clicks
function drawRect(x, y)
{
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x,y,5,5);
}

function drawLine(x1, y1, x2, y2)
{
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

//draw box where user clicked within canvas
//use -10 to place at point of arrow
//event sometimes returns null values from clicks (browser/js bug), so if statement is required
function clickCanvas(event)
{
    var xVal = event.clientX;
    var yVal = event.clientY;

    if (xVal != null && yVal != null)
    {
        drawRect(xVal-10,yVal-10);

        var point = {x:xVal-10, y:yVal-10};
        points.push(point);
    }
}

function clearCanvas(event)
{
    ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
    clearPoints();
    clearConnectedPoints();
}

//clear connectedPoints array
function clearConnectedPoints()
{
    connectedPoints.length = 0;
}

//clear points array
function clearPoints()
{
    points.length = 0;
}

//clear solution array
function clearSolution()
{
    solution.length = 0;
}

//main function, executes when solve button is pressed
function connectDots(event)
{
    var n = 0;
    ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );

    redrawPoints();

    do
    {
        n++;
        findSolution();
        rotatePoint();
        clearConnectedPoints();

        //prevent infinite loop if no solution found
        //TODO figure out actual equation for possible number of combinations to try
        if(n > points.length * 10)
        {
            alert("No solution found!");
            clearConnectedPoints();
            clearSolution();
            break;
        }
    }while ( checkSolution() != 0);

    drawSolution();
    clearSolution();    //TODO maybe delete, might be redundant
    clearConnectedPoints();
}

//creates solution regardless if lines cross
//works by finding nearest unconnected point
function findSolution()
{
    clearSolution();        //clear solution array for new solution
    var currentPoint = points[0];
    var nextPoint;
    var line;

    connectedPoints.push(currentPoint);

    while(connectedPoints.length < points.length)
    {
        nextPoint = findNearestUntouchedPoint(currentPoint);
        line = {x1: currentPoint.x, y1: currentPoint.y, x2: nextPoint.x, y2: nextPoint.y};
        solution.push(line);

        connectedPoints.push(nextPoint);
        currentPoint = nextPoint;
    }

    line = {x1: currentPoint.x, y1: currentPoint.y, x2: connectedPoints[0].x, y2: connectedPoints[0].y};
    solution.push(line);

}

//checks solution to see if lines cross
//0 good, -1 bad
function checkSolution()
{
    for(var i = 0; i < solution.length; i++)
    {
        for(var j = 0; j < solution.length; j++)
        {
            if(line_intersects(
                    solution[0].x1,
                    solution[0].y1,
                    solution[0].x2,
                    solution[0].y2,
                    solution[j].x1,
                    solution[j].y1,
                    solution[j].x2,
                    solution[j].y2
                ) == true)
            {
                //line intersects so return bad solution
                return -1;
            }
        }
        //check next line vs other lines until all lines checked against each other
        rotateSolution();
    }
    return 0;
}

//draws lines from points that are stored in solutions array
function drawSolution()
{
    ctx.beginPath();
    for(var i = 0; i < solution.length; i++)
    {
        drawLine(solution[i].x1 + 3, solution[i].y1 + 3, solution[i].x2 + 3, solution[i].y2 + 3);
    }
    ctx.closePath();
}

//moves lines stored at position 0 to back of array
function rotateSolution()
{
    var tempLine = solution.shift();
    solution.push(tempLine);
}

//moves point at position 0 to back of array
function rotatePoint()
{
    var tempPoint = points.shift();
    points.push(tempPoint);
}

//redraws points user created
function redrawPoints()
{
    for(var i = 0; i < points.length; i++)
    {
        drawRect(points[i].x, points[i].y);
    }
}

//finds distance between two points
function findDistance(x1, y1, x2, y2)
{
    var dist = Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
    return Math.abs(dist);
}

//finds nearest unconnected point
function findNearestUntouchedPoint(startingPoint)
{
    var smallestDist = Number.MAX_VALUE;
    var distance = 0;
    var shortestPoint;

    for(var i = 0; i < points.length; i++)
    {
        distance = findDistance(startingPoint.x, startingPoint.y, points[i].x, points[i].y);
        if( (distance > 0) && (distance < smallestDist) )
        {
            //jquery
            //if not found in array
            //find new shortest, unconnected point
            if($.inArray(points[i], connectedPoints) == -1)
            {
                smallestDist = distance;
                shortestPoint = points[i];
            }
        }
    }

    return shortestPoint;
}

//checks to see if 2 lines intersect
function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

    //if lines end at same point, that doesn't count as intersecting
    if ( (p0_x == p2_x) && (p0_y == p2_y) )
    {
        return false;
    }
    else if ( (p0_x == p3_x) && (p0_y == p3_y) )
    {
        return false;
    }
    else if ( (p1_x == p2_x) && (p1_y == p2_y) )
    {
        return false;
    }
    else if ( (p1_x == p3_x) && (p1_y == p3_y) )
    {
        return false;
    }
    else {
        var s1_x, s1_y, s2_x, s2_y;
        s1_x = p1_x - p0_x;
        s1_y = p1_y - p0_y;
        s2_x = p3_x - p2_x;
        s2_y = p3_y - p2_y;

        var s, t;
        s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            // Collision detected
            return true;
        }
    }

    return false; // No collision
}