		// BEGIN MachineFailureDistribution CHART

		function buildMachineFailureDistributionChartData(query, type) {
			var params = {};
			if (type == 0)
				params = {
					"Param.1": selectedMachine,
					"Param.2": beginAvailabilityUtc,
					"Param.3": endAvailabilityUtc,
					"Param.4": $("#intervalBrowser").select2('data').id,
					"Param.5": type
				};
			else
				params = {
					"Param.1": pulsFilters.getSelectedLine().id,
					"Param.2": beginAvailabilityUtc,
					"Param.3": endAvailabilityUtc,
					"Param.4": selectedMachine,
					"Param.5": $("#intervalBrowser").select2('data').id
				};
			var data = callDataQuery(query, params);


			var oInfo = {};
			oInfo.data = [];
			oInfo.tickLabels = [];
			oInfo.ticks = [];
			oInfo.max = 0;


			if (type == '1') {
				var entry = {};
				var entryValues = [];
				var field = lineFailureControlsData[lineFailureType].dbField;
				entry = {
					"key": ( (selectedMachineDescription == "") ? projectLabels.Web_AllMachines :  selectedMachineDescription ),
					"color": lineFailureColors[lineFailureType],
					"label": lineFailureControlsData[lineFailureType].key
				};

				for (var i = 0; i < data.length; i++) {
								var allValues = data[i].Occurrences + "_" + data[i].TotalDuration + "_" + data[i].Max + "_" + data[i].MTTR + "_" + data[i].MTBF;
								oInfo.tickLabels.push(data[i].Step);
								oInfo.ticks.push(i);

								entryValues.push([i, parseInt(data[i][field]), allValues]);
				}
				entry.values = entryValues;
				oInfo.data.push(entry);

			} else if (type == '0') {
				for (var i = 0; i < data.length; i++) {
					if (data[i].Range != "Step") {
						oInfo.tickLabels.push(data[i].Range);
						oInfo.ticks.push(oInfo.ticks.length);
					}
				}


				var colPos = 0;
				for (j = 0; j < 12; j++) {
					var entry = {
						"key": "",
						"color": colors[colPos++],
						"values": []
					};

					var entryValues = [];
					for (var i = 0; i < data.length; i++) {
						if (data[i].Range != "Step") {
							if (data[i]["C" + j] != "---") {
								entry.values.push([entry.values.length, parseInt(data[i]["C" + j])]);
								if (parseInt(oInfo.max) <  parseInt(data[i]["C" + j]))
									oInfo.max =  parseInt(data[i]["C" + j]);
							}
						} else {
							entry.key = data[i]["C" + j];
						}
					}
					oInfo.data.push(entry);
				}
			}

			return oInfo;
		}


		function machineFailureDistributionControlsHandler(d, i) {
			machineFailureDistributionType = i;
			var oChart = buildMachineFailureDistributionChart("#MachineFailureDistribution svg", machineFailureQueries[machineFailureDistributionType]);
		}

		function machineFailureDistributionCallback(chart) {
			machineFailureDistributionChart = chart;
			//setTimeout(machineFailureDistributionChart.update, 100);
		}

		function machineFailureDistributionChartUpdate () {
			var w = $("#MachineFailureDistribution").width();
			var container = d3.select("#MachineFailureDistribution svg");

			container.selectAll("text.chartTitle").remove();

			// Append chart title
		       	container
				  .append("text")
			              .attr("x", w - 10)
				  .attr("y", 20)
				  .attr("text-anchor", "end")
				  .attr('class', 'chartTitle gr fs80')
				  .text(pulsFilters.getSelectedLine().text +  " - "  + ( (selectedMachineDescription == "") ? projectLabels.Web_AllMachines :  selectedMachineDescription ));

		       	container
				  .append("text")
			              .attr("x", w - 10)
				  .attr("y", 35)
				  .attr("text-anchor", "end")
				  .attr('class', 'chartTitle gr fs80')
				  .text( 	beginAvailabilityLocal+ " -  "	+		endAvailabilityLocal);

			 machineFailureDistributionChart.update();
		}
		function buildMachineFailureDistributionChart(id) {
			var classPrefix = id.substr(1, (id.length - 5));
			var oChart = buildMachineFailureDistributionChartData(machineFailureQueries[machineFailureDistributionType], machineFailureDistributionType);
			var w = $("#" + classPrefix).width();


			var svg = d3.select(id);
			svg.selectAll("*").remove();


			var controlsData = [{
				key:  projectLabels.Web_Distribution,
				disabled: (machineFailureDistributionType == 1)
			}, {
				key:  projectLabels.Web_Trend,
				disabled: (machineFailureDistributionType == 0)
			}];

			nv.addGraph(function() {
				var chart = nv.models.cumulativeLineChart()
					.x(function(d) {
						if (typeof(d) !== "undefined")
							return d[0];
						else
							return 0;
					})
					.y(function(d) {
							return d[1];
					})
					.margin({
						bottom: (oChart.data[0].values.length > 0) ? 100 : 0,
						left: (oChart.data[0].values.length > 0) ? 65 : 0,
						right:(oChart.data[0].values.length > 0) ? 5 : 0,
						top:(oChart.data[0].values.length > 0) ? 50 : 0
					})
					//   .color(d3.scale.category10().range())
					.noData (projectLabels.Web_NoDataLinePeriod)
					.useInteractiveGuideline(true)
					.showControls(true)
					.showLegend(false)
					.showIndexLine(false)
					.cumulativeControlsData(controlsData)
					.cumulativeControlsHandler(machineFailureDistributionControlsHandler)
				;


				chart.xAxis
					.tickValues(oChart.ticks)
					.tickFormat(function(d) {
						if (d < 0)
						return oChart.tickLabels[0];
						if( d >= oChart.ticks.length)
							return oChart.tickLabels[oChart.ticks.length-1];
						return (oChart.tickLabels[d]);

					})
					.rotateLabels(-80);

				chart.yAxis.tickFormat(function (d) {
					if ((lineFailureType == 1 && machineFailureDistributionType == 1) ||
							(machineFailureDistributionType == 0))
						return d;
					else
						return(toHHMMSS(d));
				});

				chart.forceY([0, oChart.max]);


				d3.select(id)
					.datum(oChart.data)
					.call(chart);

				var container = d3.select(id);


				// Append chart title
			  container
				  .append("text")
			              .attr("x", w -10)
				  .attr("y", 20)
				  .attr("text-anchor", "end")
				  .attr('class', 'chartTitle gr fs80')
				  .text(pulsFilters.getSelectedLine().text +  " - "  + ( (selectedMachineDescription == "") ? projectLabels.Web_AllMachines :  selectedMachineDescription ));

			       	container
				  .append("text")
			              .attr("x", w - 10)
				  .attr("y", 35)
				  .attr("text-anchor", "end")
				  .attr('class', 'chartTitle gr fs80')
				  .text( 	beginAvailabilityLocal+ " -  "	+		endAvailabilityLocal);


					chart.interactiveLayer.tooltip.contentGenerator(function(d) {
						var html = "";
						if (machineFailureDistributionType == 1) {
							html = '<table><tbody><tr><td class="legend-color-guide">';
							html += '<div style="background-color:' + d.series[0].color + ';"/>';
							html += '</td><td class="key">' + d.series[0].key + '</td></tr>';
							try {
								var stringValues = d3.select("#MachineFailureDistribution svg").datum()[0].values[d.series[0].index][2];
								var arrayValues = stringValues.split("_");
								// selected first
								html += '<tr class="highlight"><td class="key">' + tooltipLabels[lineFailureType] + '</td><td class="gr"> (' + ((lineFailureType == 0) ? arrayValues[lineFailureType] : toHHMMSS(arrayValues[lineFailureType])) + ')</td></tr>';
								for (var i = 0; i <arrayValues.length; i++) {
										if (i != lineFailureType)
											html += '<tr><td class="key">' + tooltipLabels[i] + '</td><td class="gr"> (' + ((i == 0) ? arrayValues[i] : toHHMMSS(arrayValues[i])) + ')</td></tr>';
								}
							} catch (e) {}
					/*		if (lineFailureType == 0)
								html += '<tr><td class="key">' + projectLabels.Web_Occurrences + '</td><td class="gr"> (' + d.series[0].value + ')</td></tr>';
							if (lineFailureType == 1)
								html += '<tr><td class="key">' + projectLabels.Web_TotalDuration + '</td><td class="gr"> (' + toHHMMSS(d.series[0].value) + ')</td></tr>';
							if (lineFailureType == 2)
								html += '<tr><td class="key">' + projectLabels.Web_Max + '</td><td class="gr"> (' + toHHMMSS(d.series[0].value) + ')</td></tr>';
							if (lineFailureType == 3)
								html += '<tr><td class="key">MTTR</td><td class="gr"> (' + toHHMMSS(d.series[0].value) + ')</td></tr>';
							if (lineFailureType == 4)
								html += '<tr><td class="key">MTBF</td><td class="gr"> (' + toHHMMSS(d.series[0].value) + ')</td></tr>'; */
							html += '</tbody></table>';
					} else {
								html = '<table><thead><tr><td colspan="3"><strong class="x-value">' + d.value + '</strong></td></tr></thead>';
								html += '<tbody>';
								for (i=0; i<d.series.length; i++) {
									html += '<tr><td class="legend-color-guide"><div style="background-color:' + d.series[i].color +';"></div></td>';
									html += '<td class="key">' + d.series[i].key + '</td>';
									html += '<td class="value">'+ d.series[i].value +  '</td></tr>'
								}
								html += '</tbody></table>';
					}
					return html;
				});


				nv.utils.windowResize(machineFailureDistributionChartUpdate);
				return chart;
			}, machineFailureDistributionCallback);

		}

		// END MachineFailureDistribution CHART
