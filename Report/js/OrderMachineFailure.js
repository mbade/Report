		// BEGIN OrderMachineFailure CHART
		function orderMachineFailureCallback(chart) {
			orderMachineFailureChart = chart;
			orderMachineFailureChart.multibar.dispatch.on("elementClick", orderMachineFailureCallbackClick);
			setTimeout(fillSelectedBar, 100);
		}


		function fillSelectedBar () {
			var svg=d3.select("#OrderMachineFailure svg");
			var bars = svg.selectAll("g.nv-group").selectAll("g");
			var color =  orderMachineFailureColorsSelected[orderMachineFailureType] ;

			bars.style("fill", function (d, i){
   				return ((d.code ==  selectedMachine) ? color : orderMachineFailureColors[orderMachineFailureType]);
			});

		}

		function orderMachineFailureCallbackClick(e) {
			if (typeof(e.data.label) !== "undefined") {
				if(selectedMachine == e.data.label) {
					// deselect
					selectedMachine = "";
					selectedMachineDescription = "";
				} else {
					selectedMachine = e.data.label;
					selectedMachineDescription = e.data.label;
				}
				// e.color = e.color.replace(')', ', 0.75)').replace('rgb', 'rgba');
				// d3.select(this[0]).style("fill", "red");
			}
			fillSelectedBar();
			/*buildMachineFailureDistributionChart("#MachineFailureDistribution svg");
			buildMachineFailureTextChart("#MachineFailureText svg", MachineFailureTextXac);
			buildMachineFailureStatusChart("#MachineFailureStatus svg", MachineFailureStatusXac); */
			buildMachineFailureReasonChart("#MachineFailureReason svg", GetMachineReasonXac, e.data);
			/* refreshMachineFailureListTable();
			resetMachineTableSelection(); */
		}

		function buildOrderMachineFailureChartData(query, order) {

			var params = {
				"Param.1": order
			};
			var data = callDataQuery(query, params);

			var oData = [];

			var oInfo = {};


			// oInfo.color = orderMachineFailureColors[orderMachineFailureType];
			oInfo.maxY = ["", "", "", "", ""];

			oInfo.values = [];

			for (var i = 0; i < data.length; i++) {
				var entry = {};
				// bar
				entry = {
					"value": data[i].Occurrences,
					"label": data[i].Machine,
					"totalDuration": data[i].OperationFailure,
					"max": data[i].DurationMax,
					"min": data[i].DurationMin,
					"mttr":data[i].MTTR,
					"mtbf": data[i].MTBF,
					"order": data[i].Order
					// "color": (data[i].Machine == selectedMachine) ? hex2rgb(oInfo.color, 0.7) : oInfo.color
				};

				if ((parseInt(oInfo.maxY[0]) < parseInt(data[i].OperationFailure)) || (oInfo.maxY[0] === "")) // 0 Total duration
					oInfo.maxY[0] = parseInt(data[i].OperationFailure);
			  if ((parseInt(oInfo.maxY[1]) < parseInt(data[i].Occurrences)) || (oInfo.maxY[1] === "")) // 1 Occurences
					oInfo.maxY[1] = parseInt(data[i].Occurrences);
				if ((parseInt(oInfo.maxY[2]) < parseInt(data[i].DurationMax)) || (oInfo.maxY[2] === "")) // 2 Max
					oInfo.maxY[2] = parseInt(data[i].DurationMax);
				if ((parseInt(oInfo.maxY[3]) < parseInt(data[i].MTTR)) || (oInfo.maxY[3] === "")) // 3 MTTR
					oInfo.maxY[3] = parseInt(data[i].MTTR);
				if ((parseInt(oInfo.maxY[4]) < parseInt(data[i].MTBF)) || (oInfo.maxY[4] === "")) // 3 MTTR
					oInfo.maxY[4] = parseInt(data[i].MTBF);

				oInfo.values.push(entry);
			}

			oData.push(oInfo);
			return oData;
		}

		function orderMachineFailureControlsHandler(d, i) {
			orderMachineFailureType = i;
			var oChart = d3.select("#OrderMachineFailure svg").datum();
			var maxY = Math.ceil(oChart[0].maxY[orderMachineFailureType] / 100) * 100;
			orderMachineFailureChart.forceY([0, maxY]);
			setTimeout(fillSelectedBar, 100);
			if (machineFailureDistributionType == 1)
				buildMachineFailureDistributionChart("#MachineFailureDistribution svg");
		}


		function orderMachineFailureChartUpdate () {
			var w = $("#OrderMachineFailure").width();
			var container = d3.select("#OrderMachineFailure svg");
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
					  .text("text");

			var controls = orderMachineFailureChart.controls;
			var margin =  orderMachineFailureChart.options().margin();

	   		controls.width(sanitWidth).color(['#444', '#444', '#444']);
	        		g.select('.nv-controlsWrap')
            			        .datum(orderMachineFailureControlsData)
	            		        .attr('transform', 'translate(' + (-margin.left) + ',' + (-margin.top) +')')
            	      		         .call(controls);


			orderMachineFailureChart.update();
			setTimeout(fillSelectedBar, 100);
		}

		function buildOrderMachineFailureChart(id, query, order) {
				var classPrefix = id.substr(1, (id.length - 5));
				var oChart = buildOrderMachineFailureChartData(query, order);
				var w = $("#" + classPrefix).width();

				clearChart("#MachineFailureReason svg");
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

							switch (orderMachineFailureType) {

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
							if (orderMachineFailureType !=1)
								return toHHMMSS(d);
							else
								return (d);
						})
						.margin({
							top: (oChart[0].values.length > 0 ) ? 60 : 0,
							right: 0,
							bottom: (oChart[0].values.length > 0 ) ? 10 : 0,
							left: (oChart[0].values.length > 0 ) ? 100 : 0
						})
						.noData ("No data")
						.showValues(true)
						.showControls(true)
						.showLegend(false)
						.stacked(false)
						.height(360)
						.standardControls(false)
						.horizontalBarControlsData(orderMachineFailureControlsData)
						.horizontalBarControlsHandler(orderMachineFailureControlsHandler);



					var maxY = Math.ceil(oChart[0].maxY[orderMachineFailureType] / 100) * 100;
					chart.forceY([0, maxY]);

					chart.multibar.barColor(function (d,i) {
						return (orderMachineFailureColors[orderMachineFailureType]);
					});


					chart.yAxis
						.tickFormat(function(d) {
							if (orderMachineFailureType !=1)
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
						html += '<tr><td class="key">Durata totale</td><td class="gr"> (' + toHHMMSS(d.data.totalDuration) + ')</td></tr>';
						html += '<tr><td class="key">Occorrenze</td><td class="gr"> (' + d.data.value + ')</td></tr>';
						html += '<tr><td class="key">MTTR</td><td class="gr"> (' + toHHMMSS(d.data.mttr) + ')</td></tr>';
						html += '<tr><td class="key">MTBF</td><td class="gr"> (' + toHHMMSS(d.data.mtbf) + ')</td></tr>';
						html += '<tr><td class="key">Max</td><td class="gr"> (' + toHHMMSS(d.data.max) + ')</td></tr>';
						/* html += '<tr><td class="key">' + projectLabels.Web_Min + '</td><td class="gr"> (' + toHHMMSS(d.data.min) + ')</td></tr>'; */
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
					  .text("Machine failure for order " + order);

					// Redraw chart on window resize
					nv.utils.windowResize(orderMachineFailureChartUpdate);
					return chart;
				}, orderMachineFailureCallback);
			}
		// END OrderMachineFailure CHART
