		// BEGIN LineFailure CHART
		function lineFailureCallback(chart) {
			lineFailureChart = chart;
			lineFailureChart.multibar.dispatch.on("elementClick", lineFailureCallbackClick);
			setTimeout(fillSelectedBar, 100);
		}


		function fillSelectedBar () {
			var svg=d3.select("#LineFailure svg");
			var bars = svg.selectAll("g.nv-group").selectAll("g");
			var color =  lineFailureColorsSelected[lineFailureType] ;

			bars.style("fill", function (d, i){
   				return ((d.code ==  selectedMachine) ? color : lineFailureColors[lineFailureType]);
			});

		}

		function lineFailureCallbackClick(e) {
			if (typeof(e.data.label) !== "undefined") {
				if(selectedMachine == e.data.code) {
					// deselect
					selectedMachine = "";
					selectedMachineDescription = "";
				} else {
					selectedMachine = e.data.code;
					selectedMachineDescription = e.data.label;
				}
				// e.color = e.color.replace(')', ', 0.75)').replace('rgb', 'rgba');
				// d3.select(this[0]).style("fill", "red");
			}
			fillSelectedBar();
			buildMachineFailureDistributionChart("#MachineFailureDistribution svg");
			buildMachineFailureTextChart("#MachineFailureText svg", MachineFailureTextXac);
			buildMachineFailureStatusChart("#MachineFailureStatus svg", MachineFailureStatusXac);
			buildMachineFailureReasonChart("#MachineFailureReason svg", MachineFailureReasonXac);
			refreshMachineFailureListTable();
			resetMachineTableSelection();
		}

		function buildLineFailureChartData(query) {

			var params = {
				"Param.1": pulsFilters.getSelectedLine().id,
				"Param.2": beginAvailabilityUtc,
				"Param.3": endAvailabilityUtc,
				"Param.4": userLanguage
			};
			var data = callDataQuery(query, params);

			var oData = [];

			var oInfo = {};

			oInfo.key = pulsFilters.getSelectedLine().text;
			// oInfo.color = lineFailureColors[lineFailureType];
			oInfo.maxY = ["", "", "", "", ""];

			oInfo.values = [];

			for (var i = 0; i < data.length; i++) {
				var entry = {};
				// bar
				entry = {
					"value": data[i].Occurrences,
					"label": data[i].Description,
					"totalDuration": data[i].TotalDuration,
					"max": data[i].Max,
					"min": data[i].Min,
					"mttr":data[i].MTTR,
					"mtbf": data[i].MTBF,
					"code": data[i].Machine,
					"color": lineFailureColors[lineFailureType]
					// "color": (data[i].Machine == selectedMachine) ? hex2rgb(oInfo.color, 0.7) : oInfo.color
				};

				if ((parseInt(oInfo.maxY[0]) < parseInt(data[i].TotalDuration)) || (oInfo.maxY[0] === "")) // 0 Total duration
					oInfo.maxY[0] = parseInt(data[i].TotalDuration);
				if ((parseInt(oInfo.maxY[1]) < parseInt(data[i].Occurrences)) || (oInfo.maxY[1] === "")) // 1 Occurences
					oInfo.maxY[1] = parseInt(data[i].Occurrences);
				if ((parseInt(oInfo.maxY[2]) < parseInt(data[i].Max)) || (oInfo.maxY[2] === "")) // 2 Max
					oInfo.maxY[2] = parseInt(data[i].Max);
				if ((parseInt(oInfo.maxY[3]) < parseInt(data[i].MTTR)) || (oInfo.maxY[3] === "")) // 3 MTTR
					oInfo.maxY[3] = parseInt(data[i].MTTR);
				if ((parseInt(oInfo.maxY[4]) < parseInt(data[i].MTBF)) || (oInfo.maxY[4] === "")) // 3 MTTR
					oInfo.maxY[4] = parseInt(data[i].MTBF);

				oInfo.values.push(entry);
			}

			oData.push(oInfo);
			return oData;
		}

		function lineFailureControlsHandler(d, i) {
			lineFailureType = i;
			var oChart = d3.select("#LineFailure svg").datum();
			var maxY = Math.ceil(oChart[0].maxY[lineFailureType] / 100) * 100;
			lineFailureChart.forceY([0, maxY]);
			setTimeout(fillSelectedBar, 100);
			if (machineFailureDistributionType == 1)
				buildMachineFailureDistributionChart("#MachineFailureDistribution svg");
		}


		function lineFailureChartUpdate () {
			var w = $("#LineFailure").width();
			var container = d3.select("#LineFailure svg");
		  var sanitWidth = nv.utils.sanitizeWidth("", container);
			container.selectAll("text.chartTitle").remove();

		            var wrap = container.selectAll('g.nv-wrap.nv-multiBarHorizontalChart');

		            var g = wrap.select('g');
			g.select('.nv-controlsWrap').selectAll('*').remove();


			// Append chart title
			container
					  .append("text")
					  .attr("x", w/2)
					  .attr("y", 50)
					  .attr("text-anchor", "middle")
					  .attr('class', 'chartTitle gr fs90')
					  .text(pulsFilters.getSelectedLine().text + " (" + 	beginAvailabilityLocal+ " -  "	+		endAvailabilityLocal +")");

			var controls = lineFailureChart.controls;
			var margin =  lineFailureChart.options().margin();

	   		controls.width(sanitWidth).color(['#444', '#444', '#444']);
	        		g.select('.nv-controlsWrap')
            			        .datum(lineFailureControlsData)
	            		        .attr('transform', 'translate(' + (-margin.left) + ',' + (-margin.top) +')')
            	      		         .call(controls);


			lineFailureChart.update();
			setTimeout(fillSelectedBar, 100);
		}

		function buildLineFailureChart(id, query) {
				var classPrefix = id.substr(1, (id.length - 5));
				var oChart = buildLineFailureChartData(query);
				var w = $("#" + classPrefix).width();


				var svg = d3.select(id);
				svg.selectAll("*").remove();

			//	if (oChart[0].values.length == 0 )
			//		return;


				nv.addGraph(function() {
					var chart = nv.models.multiBarHorizontalChart()
						.x(function(d) {
							return d.label;
						})
						.y(function(d) {

							switch (lineFailureType) {

								case 0:
								  return d.totalDuration;
								case 1:
		 							return d.value;
								case 2:
									return d.max;
								case 3:
									return d.mttr;
								case 4:
									return d.mtbf;
							}
						})
						.valueFormat(function (d) {
							if (lineFailureType !=1)
								return toHHMMSS(d);
							else
								return (d);
						})
						.margin({
							top: (oChart[0].values.length > 0 ) ? 60 : 0,
							right: 0,
							bottom: (oChart[0].values.length > 0 ) ? 10 : 0,
							left: (oChart[0].values.length > 0 ) ? 250 : 0
						})
						.noData (projectLabels.Web_NoDataLinePeriod)
						.showValues(true)
						.showControls(true)
						.showLegend(false)
						.stacked(false)
						.height(360)
						.standardControls(false)
						.horizontalBarControlsData(lineFailureControlsData)
						.horizontalBarControlsHandler(lineFailureControlsHandler);



					var maxY = Math.ceil(oChart[0].maxY[lineFailureType] / 100) * 100;
					chart.forceY([0, maxY]);

					chart.multibar.barColor(function (d,i) {
						return (lineFailureColors[lineFailureType]);
					});


					chart.yAxis
						.tickFormat(function(d) {
							if (lineFailureType !=1)
								return toHHMMSS(d);
							else
								return (d);
					});

					// Set chart to html hook
					d3.select(id)
						.datum(oChart)
						.call(chart);

					chart.tooltip.contentGenerator(function(d) {
						var html = '<table><tbody><tr><td class="legend-color-guide">';
						html += '<div style="background-color:' + d.color + ';"/>';
						html += '</td><td class="key">' + d.data.label + '</td></tr>';
						html += '<tr><td class="key">' + projectLabels.Web_TotalDuration + '</td><td class="gr"> (' + toHHMMSS(d.data.totalDuration) + ')</td></tr>';
						html += '<tr><td class="key">' + projectLabels.Web_Occurrences + '</td><td class="gr"> (' + d.data.value + ')</td></tr>';
						html += '<tr><td class="key">MTTR</td><td class="gr"> (' + toHHMMSS(d.data.mttr) + ')</td></tr>';
						html += '<tr><td class="key">MTBF</td><td class="gr"> (' + toHHMMSS(d.data.mtbf) + ')</td></tr>';
						html += '<tr><td class="key">' + projectLabels.Web_Max + '</td><td class="gr"> (' + toHHMMSS(d.data.max) + ')</td></tr>';
						html += '<tr><td class="key">' + projectLabels.Web_Min + '</td><td class="gr"> (' + toHHMMSS(d.data.min) + ')</td></tr>';
						html += '</tbody></table>';

						return html;
					});


					// Append chart title
					svg
					  .append("text")
					  .attr("x", w/2)
					  .attr("y", 50)
					  .attr("text-anchor", "middle")
					  .attr('class', 'chartTitle gr fs90')
					  .text(pulsFilters.getSelectedLine().text + " (" + 	beginAvailabilityLocal+ " -  "	+		endAvailabilityLocal +")");

					// Redraw chart on window resize
					nv.utils.windowResize(lineFailureChartUpdate);
					return chart;
				}, lineFailureCallback);
			}
		// END LineFailure CHART
