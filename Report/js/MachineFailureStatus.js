		// BEGIN MachineFailureStatus CHART

		function buildMachineFailureStatusChartData(query) {

			var params = {
				"Param.1": selectedMachine,
				"Param.2": beginAvailabilityUtc,
				"Param.3": endAvailabilityUtc,
				"Param.4": userLanguage
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
					"status": data[i].Status,
					"totalDuration": data[i].TotalDuration,
					"color": machineFailureStatusColors[data[i].Status]
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

		function machineFailureStatusCallbackClick(e) {
				if (typeof(e.data.label) !== "undefined") {
					if (failureListStatus == e.data.status)
						failureListStatus = ""
					else
						failureListStatus = e.data.status;

					buildMachineFailureReasonChart("#MachineFailureReason svg", MachineFailureReasonXac);
					buildMachineFailureTextChart("#MachineFailureText svg", MachineFailureTextXac);
					refreshMachineFailureListTable();
				}
				setTimeout (emptySelectedStatus, 100);
		}

		function machineFailureStatusCallback(chart) {
			machineFailureStatusChart = chart;
			machineFailureStatusChart.pie.dispatch.on("elementClick", machineFailureStatusCallbackClick);
		}
		function machineFailureStatusControlsHandler(d, i) {
			if (typeof(d.status)!=="undefined") {
				if (failureListStatus == d.status)
					failureListStatus = ""
				else
					failureListStatus = d.status;

				buildMachineFailureReasonChart("#MachineFailureReason svg", MachineFailureReasonXac);
				buildMachineFailureTextChart("#MachineFailureText svg", MachineFailureTextXac);
				refreshMachineFailureListTable();
			} else
				machineFailureStatusType = i;

			setTimeout (emptySelectedStatus, 100);
		}

		function emptySelectedStatus () {
			var svg=d3.select("#MachineFailureStatus svg");
			var legendWrap = svg.selectAll("g.nv-legendWrap");
			var legend = legendWrap.selectAll("g.nv-series").selectAll("circle");
		//	var color =  lineFailureColorsSelected[lineFailureType] ;

			legend.style("fill-opacity", function (d, i){
						return ((d.status ==  failureListStatus) ? 1 : 0);
			});

		}

		function emptyLegendStatus () {
			var svg=d3.select("#MachineFailureStatus svg");
			var legendWrap = svg.select("g.nv-legendWrap");
			var legend = legendWrap.selectAll("g.nv-series").selectAll("circle");
		//	var color =  lineFailureColorsSelected[lineFailureType] ;

			legend.style("fill-opacity", function (d, i){
						return (0);
			});

		}

		function buildMachineFailureStatusChart(id, query) {

				var w = $(id).width();

				var svg = d3.select(id);
				svg.selectAll("*").remove();

				var oChart = buildMachineFailureStatusChartData(query);

				if (oChart.data.length == 0)
					return;

				for (i=0; i < machineFailureStatusControlsData.length; i++) {
					machineFailureStatusControlsData[i].disabled = (machineFailureStatusType != i);
				}
				//Regular pie chart example
				nv.addGraph(function() {
					var chart = nv.models.pieChart()
						.x(function(d) {
							return d.label
						})
						.y(function(d) {
							switch (machineFailureStatusType) {

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
						.pieControlsData(machineFailureStatusControlsData)
						.pieControlsHandler(machineFailureStatusControlsHandler);

					chart.legend.updateState(false).fillLegendSymbol(false);

					chart.tooltip.valueFormatter(function (d) {
							if (machineFailureStatusType !=1)
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
						html += '<tr><td class="key">' + d.data.label + ' (' + projectLabels.Web_Occurrences + ') ' + '</td><td class="gr"> ' + d.data.value + '</td></tr>';
						html += '<tr><td class="key">' + d.data.label + ' (' +  projectLabels.Web_TotalDuration + ') ' + '</td><td class="gr"> ' + toHHMMSS(d.data.totalDuration) + '</td></tr>';
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
						  .text(projectLabels.Web_Statuses);
					emptyLegendStatus();
					nv.utils.windowResize(chart.update);

					return chart;
				}, machineFailureStatusCallback);

		}
		// END MachineFailureStatus CHART
