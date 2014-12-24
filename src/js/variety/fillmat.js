//
// パズル固有スクリプト部 フィルマット・ウソタタミ版 fillmat.js v3.4.1
//
pzpr.classmgr.makeCustom(['fillmat','usotatami'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
"Cell@fillmat":{
	maxnum : 4
},

Board:{
	hasborder : 1
},
"Board@usotatami":{
	qcols : 8,
	qrows : 8
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	bordercolor_func : "qans",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawNumbers();
		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber10();
	},
	encodePzpr : function(type){
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
"AnsCheck@fillmat":{
	checkAns : function(){

		if( !this.checkBorderCross() ){ return 'bdCross';}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkSideAreaRoomSize(rinfo) ){ return 'sbSizeEq';}
		if( !this.checkTatamiMaxSize(rinfo) ){ return 'bkLenGt4';}
		if( !this.checkDoubleNumber(rinfo) ){ return 'bkNumGe2';}
		if( !this.checkNumberAndSize(rinfo) ){ return 'bkSizeNe';}

		if( !this.checkBorderDeadend() ){ return 'bdDeadEnd';}

		return null;
	},

	checkTatamiMaxSize : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (w===1||h===1)&&a<=4;});
	},
	checkSideAreaRoomSize : function(rinfo){
		return this.checkSideAreaSize(rinfo, function(area){ return area.clist.length;});
	}
},
"AnsCheck@usotatami":{
	checkAns : function(){

		if( !this.checkBorderCross() ){ return 'bdCross';}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){ return 'bkNoNum';}
		if( !this.checkDoubleNumber(rinfo) ){ return 'bkNumGe2';}
		if( !this.checkTatamiDiffSize(rinfo) ){ return 'bkSizeEq';}

		if( !this.checkBorderDeadend() ){ return 'bdDeadEnd';}

		if( !this.checkTatamiBreadth(rinfo) ){ return 'bkWidthGt1';}

		return null;
	},

	checkTatamiDiffSize : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (n<0||n!==a);});
	},
	checkTatamiBreadth : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (w===1||h===1);});
	}
},

FailCode:{
	bkNoNum  : ["数字の入っていないタタミがあります。","A tatami has no numbers."],
	bkNumGe2 : ["1つのタタミに2つ以上の数字が入っています。","A tatami has plural numbers."],
	bkSizeNe : ["数字とタタミの大きさが違います。","The size of tatami and the number written in Tatami is different."],
	bkSizeEq : ["数字とタタミの大きさが同じです。","The size of tatami and the number is the same."],
	bkLenGt4 : ["「幅１マス、長さ１～４マス」ではないタタミがあります。","The width of Tatami is over 1 or the length is over 4."],
	sbSizeEq : ["隣り合うタタミの大きさが同じです。","the same size Tatami are adjacent."]
}
});
