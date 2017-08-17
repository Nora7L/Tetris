
var tbl;//游戏主面板
var status=0;////游戏状态 0: 未开始;1 运行; 2 中止; 
var timer;//定时器
var score = 0; //分数
//board是一个18*10的数组
var board= new Array(18);
for (var i = 0; i <18; i++) {
	board[i]=new Array(10);
}
 // console.log(board);
 //用来标注那些方格已经被占据. 初始时都为0, 如果被占据则为1
 for (var i = 0; i <18; i++) {
 	for (var j = 0; j < 10; j++) {
 		board[i][j]=0;
 	}
 }
 // console.log(board);

 //定义一个当前活动的方块
 var activeBlock;
 //定义方块的基本形状--7个
 function genBlock(){
 	activeBlock = new Array(4);
	//产生随机整数0-6
	var t= (Math.floor(Math.random()*20)+1)%7;
	switch(t){ 
		case 0:{ 
			activeBlock[0] = {x:0, y:4}; 
			activeBlock[1] = {x:1, y:4}; 
			activeBlock[2] = {x:0, y:5}; 
			activeBlock[3] = {x:1, y:5}; 
			break; 
		} 
		case 1:{ 
			activeBlock[0] = {x:0, y:3}; 
			activeBlock[1] = {x:0, y:4}; 
			activeBlock[2] = {x:0, y:5}; 
			activeBlock[3] = {x:0, y:6}; 
			break; 
		} 
		case 2:{ 
			activeBlock[0] = {x:0, y:5}; 
			activeBlock[1] = {x:1, y:4}; 
			activeBlock[2] = {x:1, y:5}; 
			activeBlock[3] = {x:2, y:4}; 
			break; 
		} 
		case 3:{ 
			activeBlock[0] = {x:0, y:4}; 
			activeBlock[1] = {x:1, y:4}; 
			activeBlock[2] = {x:1, y:5}; 
			activeBlock[3] = {x:2, y:5}; 
			break; 
		} 
		case 4:{ 
			activeBlock[0] = {x:0, y:4}; 
			activeBlock[1] = {x:1, y:4}; 
			activeBlock[2] = {x:1, y:5}; 
			activeBlock[3] = {x:1, y:6}; 
			break; 
		} 
		case 5:{ 
			activeBlock[0] = {x:0, y:4}; 
			activeBlock[1] = {x:1, y:4}; 
			activeBlock[2] = {x:2, y:4}; 
			activeBlock[3] = {x:2, y:5}; 
			break; 
		} 
		case 6:{ 
			activeBlock[0] = {x:0, y:5}; 
			activeBlock[1] = {x:1, y:4}; 
			activeBlock[2] = {x:1, y:5}; 
			activeBlock[3] = {x:1, y:6}; 
			break; 
		} 
	} 
  //检查小方块的位置是否可以放在初始位置
  for (var i = 0; i <4; i++) {
  	if (!isCellValid(activeBlock[i].x,activeBlock[i].y)) {
  		return false;
  	}else{
  		return true;
  	}
  }
}
//向下移动
function moveDown(){
//首先检查底边界 看有没有触底
if (checkBottomBorder()) {
 	//没有
 	erase();
 	for (var i = 0; i <4; i++) {
 		activeBlock[i].x=activeBlock[i].x+1;
 	}
 	paint();
 }else{
 	//触底
 	//停止自动向下移动
 	clearInterval(timer);
 	//更新数组
 	updateBoard();
 	//消行
 	var lines=deleteLine();
 	//有消行就刷新分数
 	if (lines!=0) {
 		score=score+lines*10;
 		updateScore();
 		//擦除面板
 		eraseBoard();
 		//重绘面板
 		paintBoard();
 	}
   //产生新图行。并判断是否可以放在最初位置
   if (!genBlock()) {
   	alert("Game over!")
   	status=2;
   	return;
   }
   paint();
   //定时器
   timer=setInterval(moveDown,1000);
}
}
//左移动
function moveLeft(){
	if (checkLeftBorder()) {
		erase();
		for (var i = 0; i <4; i++) {
			activeBlock[i].y=activeBlock[i].y-1;
		}
		paint();
	}
}
//右移动
function moveRight(){
	if (checkRightBorder()) {
		erase();
		for (var i = 0; i <4; i++) {
			activeBlock[i].y=activeBlock[i].y+1;
		}
		paint();
	}
}
//旋转
//因为旋转之后可能会有方格覆盖已有的方格. 
//先用一个tmpBlock,把activeBlock的内容都拷贝到tmpBlock, 
//对tmpBlock尝试旋转,如果旋转后检测发现没有方格产生冲突
//再把旋转后的tmpBlock的值给activeBlock. 
function rotate(){
	var tmpBlock=new Array(4);
	for (var i = 0; i <4; i++) {
		tmpBlock[i]={x:0,y:0};
	}
	for (var i = 0; i <4; i++) {
		tmpBlock[i].x=activeBlock[i].x;
		tmpBlock[i].y=activeBlock[i].y;
	}
//先算四个点的中心点，则这四个点围绕中心旋转90度。 
var cx = Math.round((tmpBlock[0].x + tmpBlock[1].x + tmpBlock[2].x + tmpBlock[3].x)/4); 
var cy = Math.round((tmpBlock[0].y + tmpBlock[1].y + tmpBlock[2].y + tmpBlock[3].y)/4); 
//先假设围绕源点旋转。然后再加上中心点的坐标。 
for (var i = 0; i <4; i++) {
	tmpBlock[i].x=cx+cy-activeBlock[i].y; 
	tmpBlock[i].y=cy-cx+activeBlock[i].x; 
}
//检查旋转后方格是否不重叠
for (var i = 0; i < 4; i++) {
	if (!isCellValid(tmpBlock[i].x,tmpBlock[i].y)) {
		return;
	}
}		
erase();


for (var i = 0; i < 4; i++) {
	activeBlock[i].x=tmpBlock[i].x;
	activeBlock[i].y=tmpBlock[i].y;
}
paint();
}
//检查方块(x，y)是否已经存在在border中
function isCellValid(x,y){
	if (x>17||x<0||y>9||y<0) {
		return false;
	}else if (board[x][y]==1) {
		return false;
	}else{
		return true;
	}
}
//检查底边界
function checkBottomBorder(){ 
	for(var i=0; i<activeBlock.length; i++){ 
		if(activeBlock[i].x==17){ 
			return false; 
		} 
		if(!isCellValid(activeBlock[i].x+1, activeBlock[i].y)){ 
			return false; 
		} 
	} 
	return true; 
}
//检查左边界
function checkLeftBorder(){
	for (var i = 0; i < activeBlock.length; i++) {
		if (activeBlock[i].y==0) {
			return false;
		}
		if (!isCellValid(activeBlock[i].x,activeBlock[i].y-1)) {
			return false;
		}
		
	}
	return true;
}
//检查右边界
function checkRightBorder(){ 
	for(var i=0; i<activeBlock.length; i++){ 
		if(activeBlock[i].y==9){ 
			return false; 
		} 
		if(!isCellValid(activeBlock[i].x, activeBlock[i].y+1)){ 
			return false; 
		} 
	} 
	return true; 
} 
//擦除
function erase(){
	for (var i = 0; i <4; i++) {
		tbl.rows[activeBlock[i].x].cells[activeBlock[i].y].style.backgroundColor="black";
	}
}
//擦除整个面板
function eraseBoard(){
	for (var i = 0; i <18; i++) {
		for (var j = 0; j < 10; j++) {
			tbl.rows[i].cells[j].style.backgroundColor = "black"; 
		}
	}
}

//产生一个空白行
function generateBlankLine(){
	var line=new Array(10);
	for (var i = 0; i <10; i++) {
		line[i]=0;
	}
	return line;
}
//消除行,改变数组border
function updateBoard(){ 
	for(var i=0; i<4; i++){ 
		board[activeBlock[i].x][activeBlock[i].y]=1; 
	} 
} 
//消除行
function deleteLine (){
	var lines=0;
	for (var i = 0; i <18; i++) {
		var j = 0
		for (; j <10; j++) {
			if (board[i][j]==0) {
				break;
			}
		}
		if (j==10) {
			lines++
			if(i!=0) {
				for (var k =i-1; k>=0; k--) {
					board[k+1]=board[k];
				}
			}
			board[0]=generateBlankLine();

		}
	}
	return lines;
}
//更新分数
function updateScore(){
	document.getElementById('score').innerText=""+score;
}
//重绘整个面板
var arrColor=['pink','pink','pink','pink'];
var num=0;
function paintBoard(){
	for (var i = 0; i <18; i++) {
		for (var j = 0; j <10; j++) {
			num++;
			num%=arrColor.length;
			if (board[i][j]==1) {
				tbl.rows[i].cells[j].style.backgroundColor =arrColor[num];
				
			}
		}
	}
}

//键盘事件
function keyControl(){
	if (status!=1) {
		return;
	}
	var code=event.keyCode;
	switch(code){
		case 37:{
			moveLeft();
			break;
		}
		case 38:{ 
			rotate(); 
			break; 
		} 
		case 39:{ 
			moveRight(); 
			break; 
		} 
		case 40:{ 
			moveDown(); 
			break; 
		} 
	}
}
//活动方块
function paint(){
	for(var i=0; i<4; i++){ 
		num++;
		num%=arrColor.length;
		tbl.rows[activeBlock[i].x].cells[activeBlock[i].y].style.backgroundColor=arrColor[num]; 
		

	} 
} 
//开始
function begin(e){
	e.disabled=true;
	status=1;
	tbl=document.getElementById('board');
	if(!genBlock()){ 
		alert("Game over!"); 
		status = 2; 
		return; 
	} 
	paint();
	timer=setInterval(moveDown,1000);
}
document.onkeydown=keyControl;
