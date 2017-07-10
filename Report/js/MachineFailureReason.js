		// BEGIN MachineFailureReason CHART

		function buildMachineFailureReasonChartData(query, data) {

			var params = {
				"Param.1": data.order,
				"Param.2": data.label
			};
			var data = callDataQuery(query, params);

			var chartLegendLabels = [];
			var chartLegendRange = [];

			var oData = [];
			var oInfo = {
				"title": "",
				"data": [],
				"legendLabels": [],
				"legendRange": []
			};
			//	var dTotal = 0.0;
			for (var i = 0; i < data.length; i++) {
				var entry = {};


				var value = parseInt(data[i].Occurrences);
				var label = data[i].Description;
				entry = {
					"label": label,
					"value": value,
					"reason":data[i].Reason,
					"totalDuration": data[i].Duration,
					"color": machineFailureReasonColors[data[i].Reason]
				};

				chartLegendLabels.push(entry.label);
				chartLegendRange.push(entry.color);
				//	dTotal += parseFloat(entry.value);
				oData.push(entry);
			}


			oInfo.data = oData;
			oInfo.legendLabels = chartLegendLabels;
			oInfo.legendRange = chartLegendRange;
			return oInfo;
		}


		function machineFailureReasonCallbackClick(e) {
			if (typeof(e.data.label) !== "undefined") {
				if (failureListReason == e.data.reason)
					failureListReason = ""
				else
					failureListReason = e.data.reason;
				buildMachineFailureTextChart("#MachineFailureText svg", MachineFailureTextXac);
				refreshMachineFailureListTable();
			}
      setTimeout (emptySelectedReason, 200);
		}

		function machineFailureReasonCallback(chart) {
			machineFailureReasonChart = chart;
			machineFailureReasonChart.pie.dispatch.on("elementClick", machineFailureReasonCallbackClick);
		}

		function emptySelectedReason () {
			var svg=d3.select("#MachineFailureReason svg");
			var legendWrap = svg.selectAll("g.nv-legendWrap");
			var legend = legendWrap.selectAll("g.nv-series").selectAll("circle");
		//	var color =  lineFailureColorsSelected[lineFailureType] ;

			legend.style("fill-opacity", function (d, i){
						return ((d.reason ==  failureListReason) ? 1 : 0);
			});

		}

		function emptyLegendReason () {
			var svg=d3.select("#MachineFailureReason svg");
			var legendWrap = svg.select("g.nv-legendWrap");
			var legend = legendWrap.selectAll("g.nv-series").selectAll("circle");
		//	var color =  lineFailureColorsSelected[lineFailureType] ;

			legend.style("fill-opacity", function (d, i){
						return (0);
			});

		}


		function machineFailureReasonControlsHandler(d, i) {
			if (typeof(d.reason)!=="undefined") {
				if (failureListReason == d.reason)
					failureListReason = ""
				else
					failureListReason = d.reason;
				buildMachineFailureTextChart("#MachineFailureText svg", MachineFailureTextXac);
				refreshMachineFailureListTable();
			} else
				machineFailureReasonType = i;

      setTimeout (emptySelectedReason, 200);
		}

		function buildMachineFailureReasonChart(id, query, data) {

				var svg = d3.select(id);
				svg.selectAll("*").remove();


				var oChart = buildMachineFailureReasonChartData(query, data);
				var w = $(id).width();

				if (oChart.data.length == 0)
					return;

				for (i=0; i < machineFailureStatusControlsData.length; i++) {
					machineFailureReasonControlsData[i].disabled = (machineFailureReasonType != i);
				}
				//Regular pie chart example
				nv.addGraph(function() {
					var chart = nv.models.pieChart()
						.x(function(d) {
							return d.label
						})
						.y(function(d) {
							switch (machineFailureReasonType) {
								case 0:
								     	return d.totalDuration;
								case 1:
									return d.value;
							}
						})
						.showLegend(true)
						.legendPosition("bottom")
						.showLabels(true)
						.showControls(true)
						.pieControlsData(machineFailureReasonControlsData)
						.pieControlsHandler(machineFailureReasonControlsHandler);

					chart.legend.updateState(false).maxKeyLength(10).fillLegendSymbol(false);

					chart.tooltip.valueFormatter(function (d) {
							if (machineFailureReasonType !=0)
								return toHHMMSS(d);
							else
								return (d);
					});

					chart.valueFormat(d3.format('.0f'));
					d3.select(id)
						.datum(oChart.data)
						//   .transition().duration(350)
						.call(chart);


					chart.tooltip.contentGenerator(function(d) {
						var html = '<table><tbody><tr><td class="legend-color-guide">';
						html += '<div style="background-color:' + d.color + ';"/>';
						html += '</td><td class="key">' + d.data.label + '</td></tr>';
						html += '<tr><td class="key">' + d.data.label + ' (Occorrenze) ' + '</td><td class="gr"> ' + d.data.value + '</td></tr>';
						html += '<tr><td class="key">' + d.data.label + ' (Durata) ' + '</td><td class="gr"> ' + toHHMMSS(d.data.totalDuration) + '</td></tr>';
						html += '</tbody></table>';

						return html;
					});

					var container = d3.select(id);

					// Append chart title
				       	container
					  .append("text")
					              .attr("x", w - 10)
						  .attr("y", 20)
						  .attr("text-anchor", "end")
						  .attr('class', 'chartTitle gr fs80')
						  .text(projectLabels.Web_Reasons);

					emptyLegendReason();

					nv.utils.windowResize(chart.update);

					return chart;
				}, machineFailureReasonCallback);

		}
		// END MachineFailureReason CHART
