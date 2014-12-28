//
// パズル固有スクリプト部 なげなわ・リングリング版 nagenawa.js v3.4.1
//
pzpr.classmgr.makeCustom(['nagenawa','ringring'], {
//---------------------------------------------------------
// マウス入力系
"MouseEvent@nagenawa":{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ if(this.btn.Left){ this.inputLine();}}
			else if(this.mouseend && this.notInputted()){ this.inputMB();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},
	inputRed : function(){ this.dispRedLine();}
},
"MouseEvent@ringring":{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputblock();}
		}
	},

	inputblock : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		cell.setQues(cell.ques===0?1:0);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
"KeyEvent@nagenawa":{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		return Math.min(255, this.owner.board.rooms.getCntOfRoomByCell(this));
	},
	minnum : 0
},
"Border@ringring":{
	enableLineNG : true
},
Board:{
	qcols : 8,
	qrows : 8,

	hasborder : 1
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

"AreaRoomManager@nagenawa":{
	enabled : true,
	hastop : true
},

Flags:{
	redline : true,
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "SLIGHT",

	paint : function(){
		this.drawBGCells();

		this.drawDashedGrid();

		if(this.owner.pid==='nagenawa'){
			this.drawNumbers();
			this.drawMBs();
			this.drawBorders();
		}
		else if(this.owner.pid==='ringring'){
			this.drawShadedCells();
		}

		this.drawLines();
		if(this.owner.pid==='ringring'){ this.drawPekes();}

		this.drawChassis();

		this.drawTarget();
	},

	//オーバーライド
	drawNumber1 : function(cell){
		var g = this.context;
		g.vid = "cell_text_"+cell.id;
		if(cell.qnum!==-1){
			var option = {ratio:[0.45], position:this.TOPLEFT};
			g.fillStyle = this.fontcolor;
			this.disptext((cell.qnum>=0 ? ""+cell.qnum : "?"), cell.bx*this.bw, cell.by*this.bh, option);
		}
		else{ g.vhide();}
	}
},
"Graphic@ringring":{
	cellcolor_func : "ques",

	drawTarget : function(){}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@nagenawa":{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	}
},
"Encode@ringring":{
	decodePzpr : function(type){
		this.decodeBlockCell();
	},
	encodePzpr : function(type){
		this.encodeBlockCell();
	},

	// 元ネタはencode/decodeCrossMark
	decodeBlockCell : function(){
		var cc=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z")){
				cc += parseInt(ca,36);
				bd.cell[cc].ques = 1;
			}
			else if(ca === '.'){ cc+=35;}

			cc++;
			if(cc>=bd.cellmax){ i++; break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeBlockCell : function(){
		var cm="", count=0, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="";
			if(bd.cell[c].ques===1){ pstr = ".";}
			else{ count++;}

			if(pstr){ cm += count.toString(36); count=0;}
			else if(count===36){ cm += "."; count=0;}
		}
		//if(count>0){ cm += count.toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
"FileIO@nagenawa":{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeBorderLine();
		this.decodeCellQsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeBorderLine();
		this.encodeCellQsub();
	}
},
"FileIO@ringring":{
	decodeData : function(){
		this.decodeCellBlock();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellBlock();
		this.encodeBorderLine();
	},

	decodeCellBlock : function(){
		this.decodeCell( function(cell,ca){
			if(ca==="1"){ cell.ques = 1;}
		});
	},
	encodeCellBlock : function(){
		this.encodeCell( function(cell){
			return (cell.ques===1?"1 ":"0 ");
		});
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var pid=this.owner.pid;

		if( !this.checkNoLine() ){ return 'brNoLine';}

		if( (pid==='ringring') && !this.checkLineOnShadeCell() ){ return 'lnOnShade';}

		if( (pid==='nagenawa') && !this.checkOverLineCount() ){ return 'bkLineGt';}

		if( !this.checkBranchLine() ){ return 'lnBranch';}
		if( !this.checkDeadendLine() ){ return 'lnDeadEnd';}

		if( (pid==='nagenawa') && !this.checkLessLineCount() ){ return 'bkLineLt';}

		if( !this.checkAllLoopRect() ){ return 'lnNotRect';}

		if( (pid==='ringring') && !this.checkUnreachedUnshadeCell() ){ return 'ceEmpty';}

		return null;
	},

	checkNoLine : function(){
		var bd = this.owner.board;
		for(var i=0;i<bd.bdmax;i++){ if(bd.border[i].isLine()){ return true;} }
		return false;
	},
	checkLineOnShadeCell : function(){
		return this.checkAllCell(function(cell){ return (cell.ques===1 && cell.lcnt>0);});
	},
	checkOverLineCount : function(){
		return this.checkLinesInArea(this.getRoomInfo(), function(w,h,a,n){ return (n<=0 || n>=a);});
	},
	checkLessLineCount : function(){
		return this.checkLinesInArea(this.getRoomInfo(), function(w,h,a,n){ return (n<=0 || n<=a);});
	},
	checkUnreachedUnshadeCell : function(){
		return this.checkAllCell(function(cell){ return (cell.ques===0 && cell.lcnt===0);});
	},

	checkAllLoopRect : function(){
		var result = true, bd = this.owner.board;
		var xinfo = this.getLineInfo();
		for(var r=1;r<=xinfo.max;r++){
			var blist = xinfo.path[r].blist;
			if(this.isLoopRect(blist)){ continue;}

			if(this.checkOnly){ return false;}
			if(result){ bd.border.seterr(-1);}
			blist.seterr(1);
			result = false;
		}
		return result;
	},
	isLoopRect : function(blist){
		var bd = this.owner.board;
		var x1=bd.maxbx, x2=bd.minbx, y1=bd.maxby, y2=bd.minby;
		for(var i=0;i<blist.length;i++){
			if(x1>blist[i].bx){ x1=blist[i].bx;}
			if(x2<blist[i].bx){ x2=blist[i].bx;}
			if(y1>blist[i].by){ y1=blist[i].by;}
			if(y2<blist[i].by){ y2=blist[i].by;}
		}
		for(var i=0;i<blist.length;i++){
			var border = blist[i];
			if(border.bx!==x1 && border.bx!==x2 && border.by!==y1 && border.by!==y2){ return false;}
		}
		return true;
	}
},

FailCode:{
	lnNotRect : ["長方形か正方形でない輪っかがあります。","there is a non-rectangle loop."],
	bkLineGt : ["数字のある部屋と線が通過するマスの数が違います。","the number of the cells that is passed any line in the room and the number written in the room is diffrerent."],
	bkLineLt : ["数字のある部屋と線が通過するマスの数が違います。","the number of the cells that is passed any line in the room and the number written in the room is diffrerent."],
	ceEmpty : ["白マスの上に線が引かれていません。","there is no line on the unshaded cell."]
}
});
