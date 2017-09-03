var ghData ={
	phoneMocks:['#gh10','#gh11','#gh12','#gh13','#gh14'],
	webMocks:['#gh20','#gh21','#gh22','#gh23','#gh24'],
	coverter:{
		'finalPrototype':['#gh10','#gh10'],
		'visualPolish':['#gh11','#gh11'],
		'websiteV1':['#gh12','#gh12'],
		'lpExplore':['#gh13','#gh13'],
		'ideExplore':['#gh14','#gh14']
	},
	imgData:{
		'#gh10':{dot: 'finalPrototype',position:'1'},
		'#gh20':{dot: 'finalPrototype',position:'1'},
		'#gh11':{dot: 'visualPolish',position:'2'},
		'#gh21':{dot: 'visualPolish',position:'2'},
		'#gh12':{dot: 'websiteV1',position:'3'},
		'#gh22':{dot: 'websiteV1',position:'3'},
		'#gh13':{dot: 'lpExplore',position:'4'},
		'#gh23':{dot: 'lpExplore',position:'4'},
		'#gh14':{dot: 'ideExplore',position:'5'},
		'#gh24':{dot: 'ideExplore',position:'5'}
	},
	dotData:{
		'finalPrototype':{img: '#gh10',position:'1'},
		'finalPrototype':{img: '#gh20',position:'1'},
		'visualPolish':{img: '#gh11',position:'2'},
		'visualPolish':{img: '#gh21',position:'2'},
		'websiteV1':{img: '#gh12',position:'3'},
		'websiteV1':{img: '#gh22',position:'3'},
		'lpExplore':{img: '#gh13',position:'4'},
		'lpExplore':{img: '#gh23',position:'4'},
		'ideExplore':{img: '#gh14',position:'5'},
		'ideExplore':{img: '#gh24',position:'5'}
	},
	layout:{
		phone:{
			defaultNone:{width:'25%',left:'8%',top:'25%',opacity:'0'},
			default:{width:'25%',left:'8%',top:'25%',opacity:'1'},//default non-hover position
			1:{width:'17%',left:'14%',top:'18%',opacity:'1'},
			2:{width:'15.7%',left:'15.5%',top:'16.5%',opacity:'0.8'},
			3:{width:'14%',left:'17%',top:'15%',opacity:'0.8'},
			4:{width:'12.5%',left:'18.5%',top:'13.5%',opacity:'0.8'},
			5:{width:'11%',left:'20%',top:'12.5%',opacity:'0.8'}
		},
		web:{
			defaultNone:{width:'80%',left:'26%',bottom:'-30%',opacity:'0'},
			default:{width:'80%',left:'26%',bottom:'-30%',opacity:'1'},//default non-hover position
			1:{width:'54%',left:'34%',bottom:'6%',opacity:'1'},
			2:{width:'48%',left:'35%',bottom:'17%',opacity:'0.8'},
			3:{width:'43%',left:'36%',bottom:'26%',opacity:'0.8'},
			4:{width:'39%',left:'37%',bottom:'33.5%',opacity:'0.8'},
			5:{width:'35%',left:'38%',bottom:'40.8%',opacity:'0.8'}
		}
	}
}

// Hover interactions
function	hoverInTimeline(){
	for(phoneMock of ghData.phoneMocks){
		posTemp = ghData.imgData[phoneMock].position;
		phonePosArrayTemp = ghData.layout.phone;
		$(phoneMock).css({
			'width':phonePosArrayTemp[posTemp]['width'],
			'left':phonePosArrayTemp[posTemp]['left'],
			'top':phonePosArrayTemp[posTemp]['top'],
			'opacity':phonePosArrayTemp[posTemp]['opacity']
		})
	}
	for(webMock of ghData.webMocks){
		posTemp = ghData.imgData[webMock].position;
		webPosArrayTemp = ghData.layout.web;
		$(webMock).css({
			'width':webPosArrayTemp[posTemp]['width'],
			'left':webPosArrayTemp[posTemp]['left'],
			'bottom':webPosArrayTemp[posTemp]['bottom'],
			'opacity':webPosArrayTemp[posTemp]['opacity']
		})
	}
	$('#grasshopper .axis').css('background-color','#243740');
	$('#grasshopper .time h3').css('color','#8B9AA0');
}

function	hoverOutTimeline(){
	for(phoneMock of ghData.phoneMocks){
		phonePosArrayTemp = ghData.layout.phone;
		$(phoneMock).css({
			'width':phonePosArrayTemp['default']['width'],
			'left':phonePosArrayTemp['default']['left'],
			'top':phonePosArrayTemp['default']['top'],
			'opacity':phonePosArrayTemp['default']['opacity']
		})
	}
	for(webMock of ghData.webMocks){
		webPosArrayTemp = ghData.layout.web;
		$(webMock).css({
			'width':webPosArrayTemp['default']['width'],
			'left':webPosArrayTemp['default']['left'],
			'bottom':webPosArrayTemp['default']['bottom'],
			'opacity':webPosArrayTemp['default']['opacity']
		})
	}
	$('#grasshopper .axis').css('background-color','#8B9AA0');
	$('#grasshopper .time h3').css('color','#243740');
}

function	hoverInDot(){
	console.log(this.className)
	// this == position 1
	// everything ahead of it == position 0
	// everything behind it increase position by the number of positions this moved

}

function	hoverOutDot(){
	console.log(this)
}

$( '.timeline' ).mouseenter( hoverInTimeline ).mouseleave( hoverOutTimeline );
$( '.dots li' ).mouseenter( hoverInDot ).mouseleave( hoverOutDot );
