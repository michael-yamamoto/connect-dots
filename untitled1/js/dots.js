/**
 * Created by michyama on 4/23/2015.
 */
/*
    Assumptions:
       Instruction diagrams were not literal, as in they do not actually want an ASCII representation

 */



var canvas = document.getElementById("myCanvas");
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

var points = [];
var connectedPoints = [];
var solution = [];

// That's how you define the value of a pixel //
function drawPixel (x, y, r, g, b, a) {
    var index = (x + y * canvasWidth) * 4;

    canvasData.data[index + 0] = r;
    canvasData.data[index + 1] = g;
    canvasData.data[index + 2] = b;
    canvasData.data[index + 3] = a;
}

// That's how you update the canvas, so that your //
// modification are taken in consideration //
function updateCanvas() {
    ctx.putImageData(canvasData, 0, 0);
}

//draws 5x5 red box
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
function clickCanvas(event)
{
    var xVal = event.clientX;
    var yVal = event.clientY;
    drawRect(xVal-10,yVal-10);

    var point = {x:xVal-10, y:yVal-10};
    points.push(point);

}

function clearCanvas(event)
{
    ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
    clearPoints();
    clearConnectedPoints();
}

function clearConnectedPoints()
{
    while (connectedPoints.length > 0)
    {
        connectedPoints.pop();
    }
    connectedPoints.length = 0;
    connectedPoints = [];
}

function clearPoints()
{
    while (points.length > 0)
    {
        points.pop();
    }
    points = [];
    points.length = 0;
}

function clearSolution()
{
    solution.length = 0;
}


//beginPath() and closePath() required otherwise old lines get redrawn after reset
//+3 to have line start/end at center of box
/*
function connectClosest(event)
{
    var currentPoint = points[0];
    var nextPoint;
    connectedPoints.push(currentPoint);

    ctx.beginPath();

    while(connectedPoints.length < points.length)
    {
        nextPoint = findNearestUntouchedPoint(currentPoint);
        drawLine(currentPoint.x + 3, currentPoint.y + 3, nextPoint.x + 3, nextPoint.y + 3);
        connectedPoints.push(nextPoint);
        currentPoint = nextPoint;
    }
    //draw line to starting point
    drawLine(currentPoint.x + 3, currentPoint.y + 3, connectedPoints[0].x + 3, connectedPoints[0].y + 3);
    ctx.closePath();

}
*/

function connectClosest(event)
{
    ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );

    redrawPoints();

    //findSolution();
    do
    {
        findSolution();
        rotatePoint();
        clearConnectedPoints();
        //alert("checkSolution = " + checkSolution());
    }while ( checkSolution() != 0);
    //alert("solution.length = " + solution.length);
    drawSolution();
    clearSolution();
    clearConnectedPoints();
}

function findSolution()
{
    clearSolution();
    //alert("findSolution");
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

//0 good, -1 bad
function checkSolution()
{
    //alert("checkSolution");
    for(var i = 0; i < solution.length; i++)
    {
        //alert("i = " + i);
        for(var j = 0; j < solution.length; j++)
        {
            //alert("j = " + j);
            //testing
            /*
            drawCompareLines(solution[0].x1,
                solution[0].y1,
                solution[0].x2,
                solution[0].y2,
                solution[j].x1,
                solution[j].y1,
                solution[j].x2,
                solution[j].y2);
                */

            /*
            alert(solution[j].x1 + "," + solution[j].y1 + " to " + solution[j].x2 + "," + solution[j].y2 + " and "
            + solution[j + 1].x1 + "," + solution[j + 1].y1 + " to " + solution[j + 1].x2 + "," + solution[j + 1].y2);
            */

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
                /*
                alert("line intersects!" + " "
                    + solution[j].x1 + "," + solution[j].y1 + " "
                    + solution[j].x2 + "," + solution[j].y2 + " "
                    + solution[j+1].x1 + "," + solution[j+1].y1 + " "
                    + solution[j+1].x2 + "," + solution[j+1].y2 + " "
                );*/
                //line intersects so return bad solution
                return -1;
            }
        }
        //check next line vs other lines until all lines checked against each other
        rotateSolution();
        //alert("solution.length = " + solution.length + " i = " + i);
        //alert("i = " + i);
    }
    return 0;
}

//test function to show which 2 lines are currently being checked for intersection
function drawCompareLines(x1,y1, x2, y2,  x3, y3, x4, y4)
{
    ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
    redrawPoints();
    ctx.beginPath();
    drawLine(x1+3,y1+3,x2+3,y2+3);
    drawLine(x3+3,y3+3,x4+3,y4+3);
    ctx.closePath();
}

function drawSolution()
{
    ctx.beginPath();
    for(var i = 0; i < solution.length; i++)
    {
        drawLine(solution[i].x1 + 3, solution[i].y1 + 3, solution[i].x2 + 3, solution[i].y2 + 3);
        //alert("Just added line: " + solution[i].x1 + "," + solution[i].y1 + " to " + solution[i].x2 + "," + solution[i].y2);
    }
    ctx.closePath();
}

function rotateSolution()
{
    var tempLine = solution.shift();
    solution.push(tempLine);
}

function rotatePoint()
{
    var tempPoint = points.shift();
    points.push(tempPoint);
}

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

function findNearestUntouchedPoint(startingPoint)
{
    //var smallestDist = findDistance(startingPoint.x, startingPoint.y, points[])
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

function displayPointData(event)
{
    var dataString = "";
    for(var i = 0; i < points.length; i++)
    {
        dataString = dataString + points[i].x + "," + points[i].y + " ";
    }

    alert(dataString);
}

/*
function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}
*/




function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

    //if lines are at same point, that doesn't count as intersecting
    if ( (p0_x == p2_x) && (p0_y == p2_y) )
    {
        //alert("point1start = point2start");
        return false;
    }
    else if ( (p0_x == p3_x) && (p0_y == p3_y) )
    {
        //alert("point1start = point2end");
        return false;
    }
    else if ( (p1_x == p2_x) && (p1_y == p2_y) )
    {
        //alert("point1end = point2start");
        return false;
    }
    else if ( (p1_x == p3_x) && (p1_y == p3_y) )
    {
        //alert("point1end = point2end");
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