// MasterMind Game.

// This game will have flexibility over the number of pegs, number of colors,
// and number of rounds. They are declared as global variables now:

// Pegs: 4 or 5?
numPegs = 4;
// Colors: 6 - 8?
numColors = 6;
// Rounds: 8 - 10?
numRounds = 8;
// For convenience, I sometimes want to use these counts.
numRows = numRounds + 1;
numCols = numPegs + 1;

var canvas = document.getElementById("layer1");
var ctx = canvas.getContext("2d");
var canvas2 = document.getElementById("layer2");
var ctx2 = canvas2.getContext("2d");

// This will affect the dimension of a square on the board, left margin,
// and top margin respectively.
const sqDim = 50;
const LM = 20;
const TM = 20;

// I will initiate the color sequence here.
// In this order: Red, Blue, Green, Yellow, White, Purple (Magenta),
// Aqua (Cyan), Orange.

colorSequence = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFFFFF", "#FF00FF", "#00FFFF", "#FFA500"];

// This will generate the password.
function generatePassword(){
    secretPass = [];
    for (var i = 0; i < numPegs; i++){
        nextPegColor = Math.floor((Math.random()*numColors));
        secretPass.push(nextPegColor)
    }
    return secretPass;
}

function min(x,y) {
    return (x <= y ? x : y)
}

function initializeColorCount(){
    var arrayToReturn = [];
    for (var i = 0; i < numColors; i++){
        arrayToReturn.push(0);
    }
    return arrayToReturn;
}

function checkMyGuess(guess,answer){
    // arrays that count colors not matched perfectly
    var guessCC = initializeColorCount();
    var answerCC = initializeColorCount();
    // counts of black and white pegs to return
    var blackPegCount = 0;
    var whitePegCount = 0;
    // If the color is matched correctly in the right position,
    // add to the count of black pegs.
    // Otherwise, record its color to see if we get some matches in other
    // positions.
    for (var i = 0; i < numPegs; i++){
        if (guess[i] == answer[i]){
            blackPegCount++;
        }
        else{
            guessCC[guess[i]]++;
            answerCC[answer[i]]++;
        }
    }
    for (var i = 0; i < numColors; i++){
        whitePegCount += min(guessCC[i],answerCC[i]);
    }
    return [blackPegCount,whitePegCount];
}

// Left Margin is LM.
// The board will be drawn as follows:
// Constant squares of fixed width.
// # Rows = # of rounds + 1 (for the hidden answer)
// Thick border between zeroth and first row
// # Columns = # of pegs + 1 (for the hints)

function drawFirstLayer(){
    ctx.fillStyle = "#5A2729";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#999999";
    ctx.fillRect(LM,TM,sqDim*numPegs,sqDim*numRounds);
    ctx.fillRect(LM,TM+sqDim,sqDim*numCols,sqDim*numRounds);
    ctx.lineWidth = 1;
        ctx.moveTo(LM,TM);
        ctx.lineTo(LM+numPegs*sqDim,TM);
    for (var i = 1; i < numRows + 1; i++){
        ctx.moveTo(LM,TM+i*sqDim);
        ctx.lineTo(LM+numCols*sqDim,TM+i*sqDim);
    }
    for (var j = 0; j < numCols + 1; j++){
        if (j == 0 || j == numCols - 1){
            ctx.moveTo(LM+j*sqDim,TM);
            ctx.lineTo(LM+j*sqDim,TM+numRows*sqDim);
        }
        else{
            ctx.moveTo(LM+j*sqDim,TM+sqDim);
            ctx.lineTo(LM+j*sqDim,TM+numRows*sqDim);
        }
    }
        ctx.moveTo(LM+(numPegs + 0.5)*sqDim,TM+sqDim);
        ctx.lineTo(LM+(numPegs + 0.5)*sqDim,TM+numRows*sqDim);
    for (var k = 0; k < numRounds; k++){
        ctx.moveTo(LM+numPegs*sqDim,TM+(1.5 + k)*sqDim);
        ctx.lineTo(LM+(numPegs+1)*sqDim,TM+(1.5 + k)*sqDim);
    }
    for (var m = 0; m < numColors; m++){
        ctx.fillStyle = colorSequence[m];
        ctx.fillRect(LM+(numCols+1)*sqDim + 0.2*sqDim, TM+(m+1)*sqDim + 0.2*sqDim, 1.6*sqDim, 0.6*sqDim);
    }
    ctx.stroke();
}

function drawFourPegs(roundNum){
    var startingY = TM + (numRows - (roundNum + 1))*sqDim;
    var halfwayDown = startingY + 0.5*sqDim;
    var startingX = LM + (numPegs)*sqDim;
    var halfwayAcross = startingX + 0.5*sqDim;
    var Y = oldHints[roundNum];
    for (var i = 0; i < Y.length; i++){
        if (i < 2) var yCoord = startingY;
        else var yCoord = halfwayDown;
        if (i % 2 == 0) var xCoord = startingX;
        else var xCoord = halfwayAcross;
        ctx2.fillStyle = Y[i];
        ctx2.fillRect(xCoord+1,yCoord+1,0.5*sqDim-2,0.5*sqDim-2);
    }
}

function drawRow(roundNum){
    var currentRowTop = TM + (numRows - (roundNum + 1))*sqDim;
    var X = oldGuesses[roundNum];
    for (var j = 0; j < numPegs; j++){
        ctx2.fillStyle = colorSequence[X[j]];
        ctx2.fillRect(TM + j*sqDim+1,currentRowTop+1,sqDim-2,sqDim-2);
    }
}

function drawPreviousRound(roundNum){
    drawRow(roundNum);
    drawFourPegs(roundNum);
}

function drawSecondLayer(){
    ctx2.clearRect(0,0,canvas2.width,canvas2.height);
    ctx2.lineWidth = 5;
    ctx2.moveTo(LM,TM+sqDim);
    ctx2.lineTo(LM+numPegs*sqDim,TM+sqDim);
    ctx2.stroke();
    if (oldGuesses.length > 0){
        for (var i = 0; i < currentRound - 1; i++){
            drawPreviousRound(i);
        }
    }
    var currentRowTop = TM + (numRows - currentRound)*sqDim;
    if (activeColor != -1){
        ctx2.strokeRect(LM+(numCols+1)*sqDim, TM+(activeColor+1)*sqDim, 2*sqDim, sqDim);
    }
    readyToSubmit = true;
    for (var i = 0; i < numPegs; i++){
        if (myGuess[i] != -1){
            ctx2.fillStyle = colorSequence[myGuess[i]];
            ctx2.fillRect(TM + i*sqDim+1,currentRowTop+1,sqDim-2,sqDim-2);
        }
        else readyToSubmit = false;
    }
    if (readyToSubmit){
        ctx2.fillStyle = "#999999";
        ctx2.fillRect(TM + sqDim*numCols + 0.2*sqDim,currentRowTop + 0.3*sqDim, 0.6*sqDim, 0.4*sqDim);
        ctx2.fillStyle = "#000000";
        ctx2.font = "9px Arial";
        ctx2.fillText("Submit", TM + sqDim*numCols + 0.2*sqDim,currentRowTop + 0.55*sqDim);
    }
    if (gameWon){
        var X = thePassword;
        for (var j = 0; j < numPegs; j++){
            ctx2.fillStyle = colorSequence[X[j]];
            ctx2.fillRect(LM + j*sqDim+1,TM+1,sqDim-2,sqDim-2);
        }    
    }
}

function startTurn(){
    currentRound++;
    if (currentRound > numRounds)
        alert("You lost!");
    readyToSubmit = false;
    activeColor = -1;
    myGuess = initializeGuess();
    drawSecondLayer();
}

function isAColor([xC,yC]){
    for (var m = 0; m < numColors; m++){
        if (yC >= TM + (m+1)*sqDim && yC < TM + (m+2)*sqDim)
            return m;
    }
    return -1;
}

function submitGuess(){
    pegs = checkMyGuess(myGuess,thePassword);
    if (pegs[0] == numPegs){
        alert("You've cracked the code!");
        gameWon = true;
    }
    oldGuesses.push(myGuess);
    pegArray = [];
    for (var i = 0; i < pegs[0]; i++)
        pegArray.push("#000000");
    for (var i = 0; i < pegs[1]; i++)
        pegArray.push("#FFFFFF");
    oldHints.push(pegArray);
    startTurn();
}

function sillyClick(event){
    xM = event.clientX;
    yM = event.clientY;
    // currentRowTop gives the y-Coordinate of the top of the active Guess Row
    var currentRowTop = TM + (numRows - currentRound)*sqDim;
    if (xM >= LM + (numCols+1)*sqDim && xM < LM + (numCols + 3)*sqDim){   
        var firstCheck = isAColor([xM,yM]);
        if (firstCheck != -1) activeColor = firstCheck;
    }
    else{
        if (xM >= LM && xM <= LM + (numCols)*sqDim){
            if (yM >= currentRowTop && yM < currentRowTop + sqDim){
                var space = ((xM - LM) - ((xM - LM) % sqDim)) / sqDim;
                if (myGuess[space] == activeColor) myGuess[space] = -1;
                else myGuess[space] = activeColor;
            }
        }
    }
    if (readyToSubmit){
        if (xM >= TM + sqDim*numCols + 0.2*sqDim && xM < TM + sqDim*numCols + 0.8*sqDim){
            if (yM >= currentRowTop + 0.3*sqDim && yM < currentRowTop + 0.7*sqDim){
                submitGuess();
            }
        }
    }
    drawSecondLayer();
}
function initializeGuess(){
    var willBeMyGuess = [];
    for (var i = 0; i < numPegs; i++){
        willBeMyGuess.push(-1);
    }
    return willBeMyGuess;
}

drawFirstLayer();
gameWon = false;
oldGuesses = [];
oldHints = [];
thePassword = generatePassword();
currentRound = 0;
startTurn();




/*
myGuess = [0,1,2,0];
realAnswer = [0,1,0,1];
console.log(myGuess);
console.log(realAnswer);
TT = dummyGuess(myGuess,realAnswer);
console.log(TT);
Z = checkMyGuess(myGuess,realAnswer);
console.log(Z);
*/

// Y = checkGuess(myGuess,realAnswer);
// console.log(Y);

// How do I write the Check Guess Function?
// Idea 1. Do two passes. First pass counts how many times the colors in
// corresponding indices match (i.e., how many "black pegs" / "right color right place")
// Idea 2. One pass through, as follows:
// Initialize color count arrays at 0 for both the guess and the realpass.
// Initialize blackPegCount and whitePegCount at 0.
// For each index i:
// Check whether guess[i] and realpass[i] match.
// If they do, add 1 to blackPegCount.
// If they don't (and only if they don't), add the colors to the respective
// color count arrays.
// When finished, sum up min(guessColorCount[i],realPassColorCount[i]) across
// all i.

// Example. Guess: 0120, Real Pass: 0101
// Pass: 0 = 0, add a blackpeg. 1 = 1, add a blackpeg. 2 != 0, and 0 != 1,
// the guessColorCount looks like [1,0,1] and the realPassCC looks like [1,1,0]
// Adding up, we get min(1,1) + min(0,1) + min(1,0)
