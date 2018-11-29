// rem
(function (doc, win) {
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
		recalc = function () {
			var clientWidth = docEl.clientWidth;
			if (!clientWidth) return;
			if (clientWidth >= 1920) {
				docEl.style.fontSize = '100px'; //1rem  = 100px
			} else {
				docEl.style.fontSize = 100 * (clientWidth / 1920) + 'px';
			}
		};
	if (!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);

// var studentUrl　=　baseUrl　+　"HomeInfoV1/getStudnetHealthChart";　//　学生健康状况报表
// var alarmChart　=　baseUrl　+　"HomeInfoV1/getStudentAlarmChart";　//　警报数据
// var attendanceChart　=　baseUrl　+　"HomeInfoV1/getAttendanceChart";　//　出勤报表
// var mapUrl = baseUrl + "HomeInfoV1/getBuildingsInfo"; // 地图


var mapChart = echarts.init(document.getElementById('mapContainer'));// 地图统计图
var mapSeries;
var map; // 地图对象
var healthChart; // 学生健康状态统计图
var alarmChart; // 学生异常报警系统统计图
var attendanceChart; // 出勤率统计图
var buildingLayer; // 建筑图层
var gBuildings = []; // 存储建筑信息
var gAreas = []; // 统计图区域颜色集合


init();

// 窗口自适应
window.addEventListener('resize',function(){
	mapChart.resize();
	healthChart.resize();
	alarmChart.resize();
	attendanceChart.resize();
});

/**
 * @description 页面初始化
 */
function init(){
	//加载再显示视图
	$("body").css('visibility', 'visible');
	
	// 当前时间
	initShowTime();
	
	// 地图
	initMap('json/map.json');
	//nitMap(mapUrl);
	
	// 校园动态
	initDynamic('json/news.json');
	
	// 学生健康统计图
	loadChartData('json/health.json', function(data){
		var xData = [];
		var yData = [];
		for(var key in data){
			xData.push(key);
			yData.push(data[key]);
		}
		healthChart = echarts.init(document.getElementById('healthChart'));
		var healthOption = {
		    tooltip: {
				trigger: 'axis',
				axisPointer: { // 坐标轴指示器，坐标轴触发有效
				    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
				}
			},
		    legend: {
		    	show: false
		    },
		    textStyle: {
		        color: '#a0ecff'
		    },
		    
		    xAxis: {
		       	data: xData,
		        axisLabel: {
		        	show: true,
		        	interval: 0
		        },
		        axisLine: {
		        	show: true,
		        	lineStyle:{ 
		        		color:'#6498bc'
		        	}
		        },
		        axisTick: {
		        	show: false
		        }
		    },
		    yAxis: {
		    	axisLine: {
		        	show: false
		    	},
			    splitLine: {
			        lineStyle:{
			        	color: '#6498bc'
			        }
			    }
		    },
		    series: [{
		        type: 'bar',
		        barWidth: '50%',
	            itemStyle: {
	                normal: {
	                    barBorderRadius: [10, 10, 0, 0],
	                    color: function(item){
	                    	// 数量超过6人就显示红色
	                    	if(item.value >6){
	                    		return new echarts.graphic.LinearGradient(
			                        0, 0, 0, 1, [{
			                                offset: 0,
			                                color: '#ff9165'
			                            },{
			                                offset: 1,
			                                color: 'rgba(255,255,255,0.1)'
			                            }
			                        ]
			                    )
	                    	}else{
	                    		return new echarts.graphic.LinearGradient(
			                        0, 0, 0, 1, [{
			                                offset: 0,
			                                color: '#67c9f9'
			                            },{
			                                offset: 1,
			                                color: 'rgba(255,255,255,0.1)'
			                            }
			                        ]
			                    )
	                    	}
	                    }
	                }
	            },
		        data: yData
		    }]
		};
		healthChart.setOption(healthOption);
	});
	
	// 学生异常报警统计图
	loadChartData('json/alarm.json', function(data){
		var xData = [];
		var yData = [];
		var xMaxData = [];
		for(var key in data){
			xData.push(data[key]);
			yData.push(key);
		}
		var xMax = Math.max.apply(Math,xData);
		var xMaxData = xData.map(function(){
			return xMax;
		})
		alarmChart = echarts.init(document.getElementById('alarmChart'));
		var alarmOption = {
		    tooltip: {
		        formatter: "{b} <br> {c}件"
		    },
		    textStyle: {
		        color: '#a0ecff'
		    },
		    grid:{
		    	left: 110
		    },
		    xAxis:  {
		        type: 'value',
		        axisLine: {
		        	show: false
		        },
			    splitLine: {
			        show: false
			    },
		        axisTick: {
		        	show: false
		        },
		        max:　xMax
		    },
		    yAxis: [{
		        type: 'category',
		        axisLine: {
		        	show: false
		        },
		        axisTick: {
		        	show: false
		        },
		        axisLabel: {
		        	interval: 0,
		        	padding: [0, 4, 0, 0]
		        },
		        data: yData
		    }],
		    series: [
		    	{
			        type: 'bar',
			        barWidth: '30%',
			        silent: true,
			        itemStyle: {
			            normal: {
			                color: '#335165',
			                barBorderRadius: [10, 10, 10, 10],
			
			            }
			
			        },
			        barGap: '-100%',
			        barCategoryGap: '50%',
			        data: xMaxData,
		    	},{
		            type: 'bar',
		            barWidth: '30%',
			        itemStyle: {
		                normal: {
		                    barBorderRadius: [10, 10, 10, 10],
		                    color: function(item){
		                    	// 数量超过6人就显示红色
		                    	if(item.value > 30){
		                    		return new echarts.graphic.LinearGradient(
				                        1, 0, 0, 0, [{
				                                offset: 0,
				                                color: '#ff9165'
				                            },{
				                                offset: 1,
				                                color: 'rgba(255,255,255,0.1)'
				                            }
				                        ]
				                    )
		                    	}else if(item.value >= 20){
		                    		return new echarts.graphic.LinearGradient(
				                        1, 0, 0, 0, [{
				                                offset: 0,
				                                color: '#ffff7e'
				                            },{
				                                offset: 1,
				                                color: 'rgba(255,255,255,0.1)'
				                            }
				                        ]
				                    )
		                    	}else{
		                    		return new echarts.graphic.LinearGradient(
				                        1, 0, 0, 0, [{
				                                offset: 0,
				                                color: '#67c9f9'
				                            },{
				                                offset: 1,
				                                color: 'rgba(255,255,255,0.1)'
				                            }
				                        ]
				                    )
		                    	}
		                    }
		                }
			        },
		            data: xData
		        }
		    ]
		};
		alarmChart.setOption(alarmOption);
	});
	
	// 出勤率统计图
	loadChartData('json/attendance.json', function(data){
		var attData = [];
		var totalCount = 0;	//总人数
		var detailHtml = '';
		var colorObj = {
			'正常出勤人数': '#b7effe',
			'生病人数': '#67c9f9',
			'请假人数': '#3695ce',
			'迟到人数': '#146291'
		};
		for(key in data){
			attData.push({
				name: key,
				value: data[key]
			});
			totalCount = totalCount + data[key];
			detailHtml += '<div class="attendance-items">' +
							'<span class="attendance-items-color" style="background-color:'+ colorObj[key] +';"></span>'+ key +
							'<div class="attendance-items-count">' + data[key] + '</div>' +
						'</div>';
		}
		attendanceChart = echarts.init(document.getElementById('attendanceChart'));
		var attendanceOption = {
			color:['#b7effe', '#67c9f9', '#3695ce', '#146291'],
		    tooltip : {
		        trigger: 'item',
		        formatter: "{b}占比 :<br/>{d}%"
		    },
		    series : [
		        {
		            type: 'pie',
		            radius: ['60%', '70%'],
		            center: ['50%', '50%'],
		            startAngle: 0,
		            label:{
		            	show: false
		            },
		            labelLine: {
		                normal: {
		                    show: false
		                }
		            },
		            data: attData
		        }
		    ]
		};
		attendanceChart.setOption(attendanceOption);
		$('.attendance-detail').html(detailHtml);
		$('.chart-center-count').html(totalCount);
	});

	// 报警信息
	// 模拟数据
	var building = {
		name: '教学A栋',
		lnglat: [113.538853,22.786744],
		type: '突发事件',
		content: '教学楼A栋六楼三班6名学生发生肢体冲突'
	};
	drawAlarm(building);
}


/**
 * @description 初始化地图
 * @param {String} url 请求地址
 */
function initMap(url){
	
	$.ajax({
		url: url,
        type: "GET",
        async: false,
        dataType: "JSON",
        success: function (data) {
        	console.log(data);
//			if(1==data.tag){
//	        	gBuildings = data.result.buildings; // 提供给报警使用
//	        	
//	        	// 初始化地图统计图
//	            initMapChart(data.result.center);
//				
//				// 初始化建筑层
//				initBuildings(data.result.buildings);
//				
//				// 绘制人员流动曲线
//				drawRoutes(data.result.routes);
//			}
			Buildings = data.buildings; // 提供给报警使用
	        	
        	// 初始化地图统计图
            initMapChart(data.center);
			
			// 初始化建筑层
			initBuildings(data.buildings);
			
			// 绘制人员流动曲线
			drawRoutes(data.routes);
        }
	})
}

/**
 * @description 初始化地图统计图
 * @param {Array} mapCenter
 */
function initMapChart(mapCenter){
	
	// 不同分辨率，地图zoom值不同
	var mapZoom = 17;
	var bodyWidth = document.body.clientWidth;
	if(bodyWidth >= 1920){
		mapZoom = 18;
	}else{
		mapZoom = 17 + (bodyWidth - 1000)/720;
	}
	
	// 指定图表的配置项和数据
	var option = {
	    tooltip : {
	        trigger: 'item',
	        formatter:function(params){
	        	// 如果是方向动画线才显示，位置不显示
	        	if(params.seriesType === 'lines'){
		            var data = params.data;
		            return '方向：' + data.fromname + ' -> ' + data.toname + '<br>人数：' + data.value +' 人';
	        	}else{
	        		return params.name;
	        	}
	        }
	    },
		series: [{
	        "name": "出发地 ",
	        "type": "effectScatter",
	        "coordinateSystem": "amap",
	        "zlevel": 2,
	        "rippleEffect": {
	        	"period": 4, //圆圈动画周期
	        	"scale": 6,		//圆圈大小
	            "brushType": "fill"	//圆圈类型fill,stroke
	        },
	        "label": {
	            "normal": {
	                "show": true,
	                "position": "bottom",
	                "formatter": "{b}"
	            }
	        },
	        "itemStyle": {
	            "normal": {
	                "color": "#f8fda4"
	            }
	        }
	    },{
	    	//动画线
	        "name": "路线1",
	        "coordinateSystem": "amap",
	        "type": "lines",
	        "zlevel": 1,
	        "effect": {
	            "show": true,
	    		"period": 6,
	            "trailLength": 0.7,
	            "color": "#fff",
	            "symbolSize": 3
	        },
	        "lineStyle": {
	            "normal": {
	                "color": "#a6c84c",
	                "width": 0,
	                "curveness": 0.2
	            }
	        }
	    },{
	        "name": "路线2",
	        "coordinateSystem": "amap",
	        "type": "lines",
	        "zlevel": 2,
	        "symbol": [
	            "none",
	            "arrow"
	        ],
	        "symbolSize": 10,
	        "lineStyle": {
	            "normal": {
	                "color": "#f8fda4",
	                "width": 1,
	                "opacity": 0.6,
	                "curveness": 0.2
	            }
	        }
	    },{
	        "name": "目的地",
	        "type": "effectScatter",
	        "coordinateSystem": "amap",
	        "zlevel": 2,
	        "rippleEffect": {
	        	"period": 4, //圆圈动画周期
	        	"scale": 6,		//圆圈大小
	            "brushType": "fill"	//圆圈类型fill,stroke
	        },
	        "label": {
	            "normal": {
	                "show": true,
	                "position": "bottom",
	                "formatter": "{b}"
	            }
	        },
	        "itemStyle": {
	            "normal": {
	                "color": "#f8fda4"
	            }
	        }
	    }],
	    amap: {
	    	mapStyle: 'amap://styles/blue', //设置地图的显示样式
	        zoom: mapZoom,//级别 ，pc端最高18
	        center: mapCenter,//中心点坐标
	        pitch: 45, // 地图俯仰角度，有效范围 0 度- 83 度
			rotation: 210,
	        viewMode: '3D'//使用3D视图
	    },
	    animation: false
	};
	
	// 使用刚指定的配置项和数据显示图表。
	mapChart.setOption(option);
}

/**
 * @description 绘制学生流动曲线
 * @param {Array} routes
 */
function drawRoutes(routes){
	var fromData = [],
		lineData = [],
		toData = [];
	$.each(routes, function(key, value) {
		fromData.push({
			"name": value.fromname,
			"value": value.coords[0]
		});
		lineData.push(value);
		toData.push({
			"name": value.toname,
			"value": value.coords[1]
		});
	});
	
	mapSeries = [{
	    "name": "出发地 ",
	    "data": fromData
	},{
		//动画线
	    "name": "路线1",
	    "data": lineData
	},
	{
	    "name": "路线2",
	    "data": lineData
	},
	{
	    "name": "目的地",
	    "data": toData
	}];
	
	mapChart.setOption({
		series: mapSeries
	});
}

/**
 * @description 初始化建筑层
 */
function initBuildings(buildings){
	// 建筑颜色
	var normalColors = ['ffbdf6f95e','ff84a5a75e']; // 普通建筑颜色
	var lighthighColor = ['ffa8d4f1','ff6898bc']; // 高亮建筑颜色
	var alarmColor = ['ffe55f5e','ff7b383f']; // 报警建筑颜色
	
	buildingLayer = new AMap.Buildings({zIndex:130,merge:false,sort:false,zooms:[17,20]});
	for(var i = 0, len = buildings.length; i < len; i++){
		gAreas.push({
			color1: normalColors[0],
			color2: normalColors[1],
			path: buildings[i].paths
		});
	}
	buildingLayer.setStyle({
		areas: gAreas
	});
	
	map = mapChart.getModel().getComponent('amap').getAMap();
	var layer = mapChart.getModel().getComponent('amap').getLayer();
	
	layer = [new AMap.TileLayer({}), buildingLayer];
	map.add(layer);
	
	map.on('complete',function(){
		//加载再显示视图
		$("#mapContainer").css('visibility', 'visible');
	});
	
	
	
	
	//重新获取layer
	layer = mapChart.getModel().getComponent('amap').getLayer();
	
	//下面是确保高德地图渲染的时候，echarts同时也需要再次渲染一次，保持位置的同步
	layer.render = function() {
	     mapChart.setOption({
	         series: mapSeries
	     });
	}
	
	
	// 建筑点击事件
	for(var i = 0, len = buildings.length; i < len; i++){
		(function(i){
			var building = buildings[i];
			var polygon = new AMap.Polygon({
			    bubble:true,
			    fillOpacity:0,
			    strokeWeight:1,
			    path:building.paths,
			    map:map
			});
			var infoWindow;
			polygon.on('mouseover',function(e){
				
				infoWindow = new AMap.InfoWindow({
			        isCustom: true,  //使用自定义窗体
			        content: '<div class="tips-title">'+ building.name + '</div>' + 
			        		'<ul class="tips-list">' + 
			        			'<li>室内温度：<span>'+ building.temperature +'</span></li>' + 
			        			'<li>PM2.5浓度：<span>'+ building.pm +'</span></li>' + 
			        			'<li>空气湿度：<span>'+ building.humidity +'</span></li>' + 
			        			'<li>二氧化碳：<span>'+ building.co2 +'</span></li>' + 
			        		'</ul>',
			        offset: new AMap.Pixel(-50, 0)
			    });
			    
				infoWindow.open(map, building.lnglat);
				// 建筑高亮
				if(building.isAlarm){
					gAreas[i].color1 = alarmColor[0];
					gAreas[i].color2 = alarmColor[1];
				}else{
					gAreas[i].color1 = lighthighColor[0];
					gAreas[i].color2 = lighthighColor[1];
				}
				buildingLayer.setStyle({
					areas: gAreas
				});
			});
			polygon.on('mouseout',function(e){
				
				infoWindow.close();
				// 建筑高亮
				if(building.isAlarm){
					gAreas[i].color1 = alarmColor[0];
					gAreas[i].color2 = alarmColor[1];
				}else{
					gAreas[i].color1 = normalColors[0];
					gAreas[i].color2 = normalColors[1];
				}
				buildingLayer.setStyle({
					areas: gAreas
				});
			});
		})(i);
	}
}

/**
 * 渲染报警建筑信息
 * @param {Object} building 报警建筑对象
 */
function drawAlarm(building){
	var buildingName = building.name;
	var buildingLnglat = building.lnglat;
	var alarmType = building.type;
	var alarmContent = building.content;
	// 报警标识颜色
	var normalColors = ['ffbdf6f95e','ff84a5a75e']; // 普通建筑颜色
	var alarmColor = ['ffe55f5e','ff7b383f']; // 报警建筑颜色
	for(var i = 0, len = gBuildings.length; i < len; i++){
		if(gBuildings[i].name === buildingName){
			gBuildings[i].isAlarm = true;
			gAreas[i].color1 = alarmColor[0];
			gAreas[i].color2 = alarmColor[1];
		}else{
			gBuildings[i].isAlarm = false;
		}
	}
	console.log(gAreas);
	buildingLayer.setStyle({
		areas: gAreas
	});
	
	// 显示报 警信息
	var text = new AMap.Text({
	    text:'<div class="tips-title">' + alarmType + '</div><div class="tips-txt">' + alarmContent + '</div>',
	    textAlign:'center', // 'left' 'right', 'center',
	    verticalAlign:'middle', //middle 、bottom
	    draggable:true,
	    cursor:'pointer',
	    position: [113.539922,22.78613],
	    offset: new AMap.Pixel(0, -200)
	});
	text.setMap(map);
	
//	var text = new AMap.Text({
//	    text:'<div class="tips-title">突发事件</div><div class="tips-txt">教学楼A栋六楼三班6名学生发生肢体冲突</div>',
//	    textAlign:'center', // 'left' 'right', 'center',
//	    verticalAlign:'middle', //middle 、bottom
//	    draggable:true,
//	    cursor:'pointer',
//	    position: [113.539922,22.78613],
//	    offset: new AMap.Pixel(0, -200)
//	});
//	text.setMap(map);
//	
//	text.on('click',function(){
//		this.hide();
//		buildingLayer.setStyle({
//			areas:[{
//	            color1: 'ffbdf6f95e',//楼顶颜色
//	            color2: 'ff84a5a75e',//楼面颜色
//	            path: [[113.538731315769,22.7877193694935],
//				    [113.538516739048,22.786473046199],
//				    [113.539616444744,22.7856471034555],
//				    [113.540753701366,22.7856124829917],
//				    [113.541156032719,22.78575591057],
//				    [113.541982153095,22.7863790769174],
//				    [113.5424595863,22.7863246736195],
//				    [113.542615154423,22.7855333504702],
//				    [113.543087223209,22.7850536085756],
//				    [113.543403723873,22.7850288795662],
//				    [113.544042089619,22.787422626885],
//				    [113.538731315769,22.7877193694935]]
//			},{
//	            color1: 'ffa8d4f1',//楼顶颜色
//	            color2: 'ff6898bc',//楼面颜色
//	            path: [[113.541886104522,22.7865820708448],
//				    [113.542481554923,22.7864386441353],
//				    [113.542540563521,22.7868540866037],
//				    [113.541961206374,22.7869826756827],
//				    [113.541886104522,22.7865820708448]]
//			}
//			]
//		});
//	});
}



/**
 * @description 显示当前时间
 */
function initShowTime(){
	
	setInterval(function(){
		var dateStr = '';
		var d = new Date();
		var year = d.getFullYear();
        var month = formatterNumber(d.getMonth()+1);
        var date = formatterNumber(d.getDate());
        var days = d.getDay();
        var hours = formatterNumber(d.getHours());
        var minutes = formatterNumber(d.getMinutes());
        var seconds = formatterNumber(d.getSeconds());
        switch(days){
            case 1:
                days='周一';
                break;
            case 2:
                days='周二';
                break;
            case 3:
                days='周三';
                break;
            case 4:
                days='周四';
                break;
            case 5:
                days='周五';
                break;
            case 6:
                days='周六';
                break;
            case 0:
                days='周日';
                break;
        }
		dateStr = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + days;
		$('.date-box').html(dateStr);
	}, 1000);
}

/**
 * @description 格式化数字，小于10前面加0
 * @param {Number} number 数字
 */
function formatterNumber(number){
	return number < 10 ? '0' + number : number;
}

/**
 * @description 加载校园动态
 * @param {String} url 请求地址
 */
function initDynamic(url){
	$.ajax({
		url: url,
        type: "GET",
        async: false,
        dataType: "JSON",
        success: function (data) {
        	var html = '';
        	$.each(data.lists,function(key, value){
        		html += '<li><a href="' + value.url + '">' + value.title + '</a></li>';
        	});
        	$('#newList').html('<ul>' + html + '</ul>');
        }
	});
}

/**
 * @description 获取数据源
 * @param {String} url	请求数据URL
 * @param {Function} callback 请求成功后回调函数
 */
function loadChartData(url, callback){
	//layui.use('layer', function(){
		$.ajax({
	        type: "get",
	        url: url,
	        data:{
	        	// 需要请求数据时，再增加参数
	        },
	        async: true,
	        dataType: "json",
	        success: function (data) {
	        	if(1==data.tag){
	        		// 回调刷新渲染统计图
	        		callback(data.result);
	        	}else{
	        		// layer.msg(data.reason, {
			        //     icon: 5
					// });
					alert(data.reason);
	        	}
	        },
	        error: function(e) {
	        	// layer.msg('请求统计数据失败', {
		        //     icon: 5
				// });
				alert('请求统计数据失败');
	        }
		});
	//});
}