/*
TODO:

when placing blocks, full lines nust be abolished

score needs to be counted

all tetricie types with rotations need implementing 

level up (speed up interval?)

*/
//constants
const COLS = 10;
const ROWS = 20;
var COLOUR = new Array();
COLOUR['none'] = '#555555';
COLOUR['square'] = '#ff0000';
COLOUR['line'] = '#00ff00';
COLOUR['lleft'] = '#0000ff';
COLOUR['lright'] = '#00ffff';
COLOUR['zleft'] = '#ff00ff';
COLOUR['zright'] = '#ffff00';
COLOUR['t'] = '#ff8800';
var LEVEL = new Array(
{lev:1,int:1200,lines:5,m:1},
{lev:2,int:1100,lines:8,m:2},
{lev:3,int:1000,lines:10,m:3},
{lev:4,int:900,lines:8,m:5},
{lev:5,int:800,lines:10,m:8},
{lev:6,int:700,lines:12,m:10},
{lev:7,int:650,lines:10,m:12},
{lev:8,int:600,lines:12,m:15},
{lev:9,int:550,lines:15,m:20},
{lev:10,int:500,lines:30,m:25},
{lev:'bonus',int:400,lines:999,m:50});

var MLINE = new Array(5,15,30,50);

//globals
var scoreLabel = document.getElementById('score');
var linesLabel = document.getElementById('lines');
var levelLabel = document.getElementById('level');

var squares = new Array();
var nextSquares = new Array();
var currentTetrice;
var nextTetrice;
var checkY = new Array(0,0,0,0);
var score=0;
var li = 0;
var lilft = LEVEL[li].lines;
var intID;
var msg = document.getElementById("bugs");
//init board

//create grid
function initGrid(){
  var gs = '<table>';
for(var r = 0; r < ROWS; r++){
   gs += '<tr>';
   for(var c = 0; c < COLS; c++){
   gs += '<td><div class=\'gamesquare\' id=\'gs'+c+'-'+r+'\'/></td>';
   }
   gs += '</tr>';
}
gs += '</table>';
document.getElementById('game').innerHTML = gs;
var ns = '<table>';
for(var r=0; r<4; r++){
  ns += '<tr>';
  for(c =0; c<4; c++){
   ns += '<td><div class=\'gamesquare\' id=\'ns'+c+'-'+r+'\'/></td>';
  }
  ns += '</tr>';
}
ns += '</table>';
document.getElementById('nextgrid').innerHTML = ns;

}

window.addEventListener('load', function(e){
},false);

//use function to create mapping from 2d to 1d array
function getIndex(x,y){
  if(x>=COLS || x < 0){
    return -1;
  }
  if(y>=ROWS || y<0){
    return -1;
  }
  return COLS*y + x;
}

function getIndexN(x,y){
  if(x>=4|| x < 0){
    return -1;
  }
  if(y>=4 || y<0){
    return -1;
  }
  return 4*y + x;
}

//create board
function initGameBoard(){
  for(var r = 0; r < ROWS; r++){
    for(var c = 0; c < COLS; c++){ 
      var qid = 'gs'+c+'-'+r;
      var gamesquare = document.getElementById(qid);
      if(gamesquare == null){
        document.write("null square");
      }
      gamesquare.set = false;//bottom squares
      gamesquare.type ='none';
      squares[getIndex(c,r)] = gamesquare;
    }
  }
  // init next tetrice
 for(var nc = 0; nc<4;nc++){
    for(var nr = 0;nr<4;nr++){
     var nid = 'ns'+nc+'-'+nr;
     var nextSquare = document.getElementById(nid);
     nextSquares[getIndexN(nc,nr)] = nextSquare;
    }
  }
  // init buttons   

document.getElementById("drop").onclick = function(e){clickedDrop();};
document.getElementById("spin").onclick = function(e){ clickedSpin();};
document.getElementById("left").onclick = function(e){ clickedLeft();};
document.getElementById("right").onclick =function(e){ clickedRight();};

//init keys
document.body.onkeydown = function(event){
    event = event || window.event;
    var keycode = event.charCode || event.keyCode;
    if(keycode === 37){
        //left
        clickedLeft();
    }
    if(keycode === 38){
        //up
        clickedSpin();
    }
    if(keycode === 39){
        //right
        clickedRight();
    }
    if(keycode === 40){
        //down
        clickedDrop();
    }
};
}



function lowerTetrice(){
if(currentTetrice.tData.checkBelow()){
    undraw(currentTetrice);
currentTetrice.tData.decrease(); draw(currentTetrice);
return true;
  }else{
     newTetrice();
     return false;
  }
}

function checkLines(){
  var toRemove = new Array();
  for(var i = 0; i<4; i++){
    for(var c = 0; c < COLS; c++){
       if(c==COLS-1 && squares[getIndex(c,checkY[i])].set){ 
        var contains = false;
        for(var j = 0; j < toRemove.length; j++){
             if(toRemove[j]==checkY[i]){
            contains=true;
          }
        }
        if(!contains){
          toRemove.push(checkY[i]);
        }
        break;
     }
     if(squares[getIndex(c,checkY[i])].set==false){
        break;
      }
    }
  }
  var sm=toRemove.length;
  if(sm > 0){
   toRemove.sort(function(a,b){ return a-b;});
    countScore(sm);
    for(var r=0;r<sm;r++){
      highLightRow(toRemove[r]);
    }
    clearInterval(intID);
   setTimeout(function(){
     for(var r=0;r<sm;r++){
      removeRow(toRemove[r]);
     }
     draw(currentTetrice);
    },200);
  }
}

function highLightRow(row){
 for(var c=0; c<COLS; c++){
   squares[getIndex(c,row)].style.backgroundColor = '#ffffff';
 }
}

function removeRow(row){

 for(var c=0; c<COLS; c++){
   var s=  squares[getIndex(c,0)];
   s.set = false;
   s.type = 'none';
   for(var r=row; r>0; r--){
     var s1 = squares[getIndex(c,r)];
     var s2 = squares[getIndex(c,r-1)];
    //rem.push(getType(s2.type));
     s1.set=s2.set;
     s1.type = s2.type;
     s1.style.backgroundColor=COLOUR[s1.type];
   }
 //  document.write(rem+'\n');
  }
  
}

function countScore(lines){
  score+=MLINE[lines-1]*LEVEL[li].m;
lilft-=lines;
  if(lilft<=0||lines==4){
    li++;
    if(li>10){
     li=10;
    }
    msg.innerHTML="LEVEL UP!";
    setTimeout(function(){
      msg.innerHTML="Made by Edward Kent";},2000);
    lilft=LEVEL[li].lines;
  }
  scoreLabel.innerHTML=score;
  linesLabel.innerHTML=lilft;
  levelLabel.innerHTML=LEVEL[li].lev;
}

function randomTetrice(){
     var r = Math.floor(Math.random()*7);
     switch(r){
       case 0:
         return new Square();
       case 1:
         return new Line();
       case 2:
         return new ZLeft();
       case 3:
         return new ZRight();
       case 4:
         return new LLeft();
       case 5:
         return new LRight();
       case 6:
         return new T();
      }
}

function newTetrice(){
 clearInterval(intID);
currentTetrice.tData.setToBack();
  checkLines();
  intID = setInterval(function(){lowerTetrice();},LEVEL[li].int);
  currentTetrice = nextTetrice;
  draw(currentTetrice);
  if(!check(currentTetrice)){
    dead();
  }
  nextTetrice = randomTetrice();
  handleNext();
}

function handleNext(){
  var drawX = new Array();
  var drawY = new Array();
  drawX[0] = nextTetrice.tData.pos1x;
  drawX[1] = nextTetrice.tData.pos2x;
  drawX[2] = nextTetrice.tData.pos3x;
  drawX[3] = nextTetrice.tData.pos4x;
  drawY[0] = nextTetrice.tData.pos1y;
  drawY[1] = nextTetrice.tData.pos2y;
  drawY[2] = nextTetrice.tData.pos3y;
  drawY[3] = nextTetrice.tData.pos4y;
  
  for(var c=0;c<16;c++){
      nextSquares[c].style.backgroundColor = COLOUR['none'];
  } if(drawX[0]>3||drawX[1]>3||drawX[2]>3||drawX[3]>3){
    var smallest= COLS;
    var largest=0;
   for(var x = 0; x < 4; x++){
     if(drawX[x] < smallest){
       smallest = drawX[x];
     }
     if(drawX[x] > largest){
       largest = drawX[x];
     }
   }
   var p = 0;
   if(largest-smallest < 3){
     p= 1;
   }
   for(var x = 0; x<4;x++){
     drawX[x]-=(smallest-p);
   }
  }
  for(var d=0; d<4;d++){
    nextSquares[getIndexN(drawX[d],drawY[d])].style.backgroundColor = COLOUR[nextTetrice.tData.type];
  }
}

function clickedSpin(){
//  document.write("spin!:)");
    undraw(currentTetrice);
currentTetrice.tData.rotate();
    var ok = check(currentTetrice);
    var place = false;
    while(!ok){
     place = true;
     currentTetrice.tData.up();
     ok = check(currentTetrice);
     
    }
    nextTetrice.tData.rotate();
    handleNext();
    if(place){
      newTetrice();
    }else{
      draw(currentTetrice);
    }
   
}

function clickedDrop(){
 // document.write("drop! D:");
/* var sp= lowerTetrice();
  while(sp){
    sp = lowerTetrice();
  }*/
  clearInterval(intID);
  intID = setInterval(function(){lowerTetrice();},10);
}

function clickedLeft(){
  undraw(currentTetrice);
  currentTetrice.tData.left();
  draw(currentTetrice);
}

function clickedRight(){
  undraw(currentTetrice);
  currentTetrice.tData.right();
  draw(currentTetrice);
}

function dead(){
  clearInterval(intID);
document.body.onkeydown = function(e){;};
   document.getElementById("drop").onclick = function(e){;};
document.getElementById("spin").onclick = function(e){ ;};
document.getElementById("left").onclick = function(e){;};
document.getElementById("right").onclick =function(e){;};
  var x = squares.length-1;
  intID = setInterval(function(){
     squares[x].style.backgroundColor = '#000000';
    x--;
    if(x == -1){
      stop(score);
    }
  },5);
}

function stop(score){
  clearInterval(intID);
  
  document.write("TOTAL SCORE = "+score);
}
 
//check a tetrice if it is in a valid position (not out of bounds and not ontop of any other tetricies)

function check(tet){
     var ret = false;
     var i1 = getIndex(tet.tData.pos1x,tet.tData.pos1y);
     var i2 = getIndex(tet.tData.pos2x,tet.tData.pos2y);
     var i3 = getIndex(tet.tData.pos3x,tet.tData.pos3y);
     var i4 = getIndex(tet.tData.pos4x,tet.tData.pos4y);
  //  document.write(i1+'-'+i2+'-'+i3+'-'+i4);
      ret = ret ||  squares[i1].set;
    ret = ret ||  squares[i2].set;
    ret = ret ||  squares[i3].set;  
    ret = ret ||  squares[i4].set;
    return !ret;
 //if(squares[i1]==null){
   // t("null!!");

     
}

//draw a tetrice

function draw(tet){
 
    var colour = COLOUR[tet.tData.type];
squares[getIndex(tet.tData.pos1x,tet.tData.pos1y)].style.backgroundColor = colour;
squares[getIndex(tet.tData.pos2x,tet.tData.pos2y)].style.backgroundColor = colour;
squares[getIndex(tet.tData.pos3x,tet.tData.pos3y)].style.backgroundColor = colour;
squares[getIndex(tet.tData.pos4x,tet.tData.pos4y)].style.backgroundColor = colour;
}

//clear a tetrice 

function undraw(tet){
  var colour = COLOUR['none'];
  squares[getIndex(tet.tData.pos1x,tet.tData.pos1y)].style.backgroundColor = colour;
squares[getIndex(tet.tData.pos2x,tet.tData.pos2y)].style.backgroundColor = colour;
squares[getIndex(tet.tData.pos3x,tet.tData.pos3y)].style.backgroundColor = colour;
squares[getIndex(tet.tData.pos4x,tet.tData.pos4y)].style.backgroundColor = colour;
}

//create base for shapes 
function Tetrice(){

  this.pos1x = 0;
  this.pos1y = 0; 
  this.pos2x = 0;
  this.pos2y = 0;
  this.pos3x = 0;
  this.pos3y = 0;
  this.pos4x = 0;
  this.pos4y = 0;
  this.type = 'none'; 
  this.orientation = 0;
  this.decrease = function(){
    if(this.pos1y<ROWS &&
       this.pos2y<ROWS &&
       this.pos3y<ROWS &&
       this.pos4y<ROWS){
      this.pos1y+=1;
      this.pos2y+=1;
      this.pos3y+=1;
      this.pos4y+=1;
    }
 };
 this.left = function(){
    if(this.pos1x>0 &&
       this.pos2x>0 &&
       this.pos3x>0 &&
       this.pos4x>0){
if(squares[getIndex(this.pos1x-1,this.pos1y)].set ||squares[getIndex(this.pos2x-1,this.pos2y)].set || squares[getIndex(this.pos3x-1,this.pos3y)].set || squares[getIndex(this.pos4x-1,this.pos4y)].set ){ return;}
      this.pos1x-=1;
      this.pos2x-=1;
      this.pos3x-=1;
      this.pos4x-=1;
    }
 };
 this.right = function(){
    if(this.pos1x<(COLS-1)&&
       this.pos2x<(COLS-1)&&
       this.pos3x<(COLS-1)&&
       this.pos4x<(COLS-1)){
       
if(squares[getIndex(this.pos1x+1,this.pos1y)].set ||squares[getIndex(this.pos2x+1,this.pos2y)].set || squares[getIndex(this.pos3x+1,this.pos3y)].set || squares[getIndex(this.pos4x+1,this.pos4y)].set ){ return;}
      this.pos1x+=1;
      this.pos2x+=1;
      this.pos3x+=1;
      this.pos4x+=1;
    }
   };
   this.setPositions = function(px1,py1,px2,py2,px3,py3,px4,py4){
     this.pos1x = px1;
     this.pos2x = px2;
     this.pos3x = px3;
     this.pos4x = px4;
     this.pos1y = py1;
     this.pos2y = py2;
     this.pos3y = py3;
     this.pos4y = py4;
   };
   this.up = function(){
    if(this.pos1y>0 &&
       this.pos2y>0 &&
       this.pos3y>0 &&
       this.pos4y>0){
      this.pos1y-=1;
      this.pos2y-=1;
      this.pos3y-=1;
      this.pos4y-=1;
    }else{
      dead();
    }
 };
   
//places tetrice and colours background after tetrice has reached bottom

   this.setToBack = function(){
      var s1 = squares[getIndex(this.pos1x,this.pos1y)];
      var s2 = squares[getIndex(this.pos2x,this.pos2y)];
      var s3 = squares[getIndex(this.pos3x,this.pos3y)];
      var s4 = squares[getIndex(this.pos4x,this.pos4y)];
      
      s1.set = true;
      s2.set = true;
      s3.set = true;
      s4.set = true;
      s1.style.backgroundColor = COLOUR[this.type];
      s2.style.backgroundColor = COLOUR[this.type];
      s3.style.backgroundColor = COLOUR[this.type];
      s4.style.backgroundColor = COLOUR[this.type];
      s1.type = this.type;
      s2.type = this.type;
      s3.type = this.type;
      s4.type = this.type;
      checkY[0]=this.pos1y; 
      checkY[1]=this.pos2y;                checkY[2]=this.pos3y;    checkY[3]=this.pos4y; 
   };
   this.checkBelow = function(){
     if(this.pos1y<ROWS-1 &&
        this.pos2y<ROWS-1 &&
        this.pos3y<ROWS-1 &&
        this.pos4y<ROWS-1){
        if(
squares[getIndex(this.pos1x,this.pos1y+1)].set ||
squares[getIndex(this.pos2x,this.pos2y+1)].set ||
squares[getIndex(this.pos3x,this.pos3y+1)].set ||
squares[getIndex(this.pos4x,this.pos4y+1)].set){
             return false;
        }else{
           return true;
        }
     }
     return false;
   };
}


//create different types
//inheritance is a bitch in JS due to it being a "prototype based language" so use decorator pattern ("has-a" relationship)

function Square(){
   this.tData = new Tetrice();
   this.tData.rotate = function(){//do nothing
}; 
   this.tData.type = 'square';
   this.tData.setPositions(4,0,5,0,4,1,5,1);
   
}

function T(){
  this.tData = new Tetrice();
  var outer = this;
  this.tData.rotate = function(){
  //  document.write(";;4");
    outer.tData.pos2x = outer.tData.pos3x;
       outer.tData.pos2y = outer.tData.pos3y;
       outer.tData.pos3x = outer.tData.pos4x;
       outer.tData.pos3y = outer.tData.pos4y; switch(outer.tData.orientation){
      case 0:     
outer.tData.pos4x=outer.tData.pos1x-1;
outer.tData.pos4y=outer.tData.pos1y;
      break;
      case 1:
outer.tData.pos4x=outer.tData.pos1x;
outer.tData.pos4y=outer.tData.pos1y-1;
      break;
      case 2:
outer.tData.pos4x=outer.tData.pos1x+1;
outer.tData.pos4y=outer.tData.pos1y;
      break;
      case 3:
outer.tData.pos4x=outer.tData.pos1x;
outer.tData.pos4y=outer.tData.pos1y+1;
        break;
    }
    outer.tData.orientation++; 
    if(outer.tData.orientation > 3){
      outer.tData.orientation = 0;
    }
    if(outer.tData.pos1x<0||outer.tData.pos2x<0||outer.tData.pos3x<0||outer.tData.pos4x<0){
        outer.tData.right();
     }
if(outer.tData.pos1x>COLS-1||outer.tData.pos2x>COLS-1||outer.tData.pos3x>COLS-1||outer.tData.pos4x>COLS-1){
        outer.tData.left();
     }

  };
  this.tData.type = 't';
  this.tData.setPositions(4,1,4,0,5,1,4,2);
}

function ZLeft(){
  this.tData = new Tetrice();
  var outer = this;
  this.tData.rotate = function(){
    var z=outer.tData;
if(outer.tData.orientation==0){
      z.orientation=1;
      z.pos3y=z.pos1y-1;
      z.pos4x=z.pos1x;
    }else{
      z.orientation=0;
      z.pos3y=z.pos1y+1;
      z.pos4x=z.pos1x+2;

    }
    if(outer.tData.pos1x<0||outer.tData.pos2x<0||outer.tData.pos3x<0||outer.tData.pos4x<0){
        outer.tData.right();
     }
if(outer.tData.pos1x>COLS-1||outer.tData.pos2x>COLS-1||outer.tData.pos3x>COLS-1||outer.tData.pos4x>COLS-1){
        outer.tData.left();
     }
     if(outer.tData.pos3y < 0){
       outer.tData.decrease();
     }
  };
  this.tData.type='zleft';
this.tData.setPositions(4,0,5,0,5,1,6,1);
}

function ZRight(){
   this.tData = new Tetrice();
   var outer = this;
   this.tData.rotate = function(){
     var z = outer.tData;
     if(z.orientation==0){
       z.orientation=1;
       z.pos4y=z.pos1y-1;
       z.pos3x=z.pos1x+1;
     }else{
       z.orientation=0;
       z.pos3x=z.pos1x-1;
       z.pos4y=z.pos1y+1;
     }
if(outer.tData.pos1x<0||outer.tData.pos2x<0||outer.tData.pos3x<0||outer.tData.pos4x<0){
        outer.tData.right();
     }
if(outer.tData.pos1x>COLS-1||outer.tData.pos2x>COLS-1||outer.tData.pos3x>COLS-1||outer.tData.pos4x>COLS-1){
        outer.tData.left();
     }
     if(outer.tData.pos4y < 0){
       outer.tData.decrease();
     }
   };
   this.tData.type='zright';
   this.tData.setPositions(4,0,5,0,3,1,4,1);
}

function LLeft(){
  this.tData = new Tetrice();
  var outer = this;
  this.tData.rotate = function(){
    var l=outer.tData;
    switch(l.orientation){
     case 0:
        l.pos1x=l.pos2x+1;
        l.pos1y=l.pos2y;
        l.pos3x=l.pos2x-1;
        l.pos3y=l.pos2y;
        l.pos4x=l.pos2x-1;
        l.pos4y=l.pos2y+1;
        break;
    case 1:
        l.pos1x=l.pos2x;
        l.pos1y=l.pos2y+1;
        l.pos3x=l.pos2x;
        l.pos3y=l.pos2y-1;
        l.pos4y=l.pos2y-1;
        l.pos4x=l.pos2x-1;
        break;
     case 2:
        l.pos1x=l.pos2x-1;
        l.pos1y=l.pos2y;
        l.pos3x=l.pos2x+1;
        l.pos3y=l.pos2y;
        l.pos4x=l.pos2x+1;
        l.pos4y=l.pos2y-1;
        break;
      case 3:
        l.pos1x=l.pos2x;
        l.pos1y=l.pos2y-1;
        l.pos3x=l.pos2x;
        l.pos3y=l.pos2y+1;
        l.pos4x=l.pos2x+1;
        l.pos4y=l.pos2y+1;
        break;
        
    }
    l.orientation++;
    if(l.orientation>3){
      l.orientation=0;
    }
    if(outer.tData.pos1x<0||outer.tData.pos2x<0||outer.tData.pos3x<0||outer.tData.pos4x<0){
        outer.tData.right();
     }
if(outer.tData.pos1x>COLS-1||outer.tData.pos2x>COLS-1||outer.tData.pos3x>COLS-1||outer.tData.pos4x>COLS-1){
        outer.tData.left();
     }
  };
  this.tData.type='lleft';
  this.tData.setPositions(4,0,4,1,4,2,5,2);
}

function LRight(){
  this.tData = new Tetrice();
  var outer = this;
  this.tData.rotate = function(){
    var l=outer.tData;
    switch(l.orientation){
     case 0:
        l.pos1x=l.pos2x+1;
        l.pos1y=l.pos2y;
        l.pos3x=l.pos2x-1;
        l.pos3y=l.pos2y;
        l.pos4y=l.pos2y-1;
        l.pos4x=l.pos2x-1;
        break;
     case 1:
        l.pos1x=l.pos2x;
        l.pos1y=l.pos2y+1;
        l.pos3x=l.pos2x;
        l.pos3y=l.pos2y-1;
        l.pos4y=l.pos2y-1;
        l.pos4x=l.pos2x+1;
        break;
     case 2:
        l.pos1x=l.pos2x-1;
        l.pos1y=l.pos2y;
        l.pos3x=l.pos2x+1;
        l.pos3y=l.pos2y;
        l.pos4x=l.pos2x+1;
        l.pos4y=l.pos2y+1;
        break;
     case 3:
        l.pos1x=l.pos2x;
        l.pos1y=l.pos2y-1;
        l.pos3x=l.pos2x;
        l.pos3y=l.pos2y+1;
        l.pos4x=l.pos2x-1;
        l.pos4y=l.pos2y+1;
        break;
    }
    l.orientation++;
    if(l.orientation>3){
      l.orientation=0;
    }
    if(outer.tData.pos1x<0||outer.tData.pos2x<0||outer.tData.pos3x<0||outer.tData.pos4x<0){
        outer.tData.right();
     }
if(outer.tData.pos1x>COLS-1||outer.tData.pos2x>COLS-1||outer.tData.pos3x>COLS-1||outer.tData.pos4x>COLS-1){
        outer.tData.left();
     }
  };
  this.tData.type='lright';
  this.tData.setPositions(5,0,5,1,5,2,4,2);
}

function Line(){
  this.tData = new Tetrice();
  var outer = this;
  this.tData.rotate = function(){
    var l = outer.tData;
    if(l.orientation==0){
      if(l.pos1x==COLS-1){
        l.left();
      }
      l.orientation=1;
      l.pos1x=l.pos2x-1;
      l.pos1y=l.pos2y;
      l.pos3x=l.pos2x+1;
      l.pos3y=l.pos2y;
      l.pos4x=l.pos2x+2;
      l.pos4y=l.pos2y;
    }else{
      l.orientation=0;
      l.pos1x=l.pos2x;
      l.pos1y=l.pos2y-1;
      l.pos3x=l.pos2x;
      l.pos3y=l.pos2y+1;
      l.pos4x=l.pos2x;
      l.pos4y=l.pos2y+2;
    }   if(outer.tData.pos1x<0||outer.tData.pos2x<0||outer.tData.pos3x<0||outer.tData.pos4x<0){
        outer.tData.right();
     }
if(outer.tData.pos1x>COLS-1||outer.tData.pos2x>COLS-1||outer.tData.pos3x>COLS-1||outer.tData.pos4x>COLS-1){
        outer.tData.left();
     }
    
  };
  this.tData.type='line';
  this.tData.setPositions(4,0,4,1,4,2,4,3);
}

initGrid();
initGameBoard();
currentTetrice = randomTetrice();
intID = setInterval(function(){lowerTetrice();},LEVEL[li].int);
levelLabel.innerHTML='1';
linesLabel.innerHTML=LEVEL[0].lines;
nextTetrice = randomTetrice();
handleNext();
draw(currentTetrice);
