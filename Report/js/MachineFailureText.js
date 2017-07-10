		// BEGIN MachineFailureText CHART
		function machineFailureTextCallback(chart) {
			machineFailureTextChart = chart;
			machineFailureTextChart.multibar.dispatch.on("elementClick", machineFailureTextCallbackClick);
		}

		function machineFailureTextCallbackClick(e) {
			if (typeof(e.data.label) !== "undefined") {
				if (failureListText == e.data.label)
					failureListText = ""
				else
					failureListText = e.data.label;
				refreshMachineFailureListTable();
				setTimeout(fillTextSelectedBar, 200);
			}

		}


		function fillTextSelectedBar () {
			var svg=d3.select("#MachineFailureText svg");
			var bars = svg.selectAll("g.nv-group").selectAll("g");
			var color =  machineFailureTextColorsSelected[machineFailureTextType] ;


			bars.style("fill", function (d, i){
   				return ((d.label ==  failureListText) ? color : machineFailureTextColors[machineFailureTextType]);
			});

		}

		function buildMachineFailureTextChartData(query) {

			var params = {
				"Param.1": selectedMachine,
				"Param.2": beginAvailabilityUtc,
				"Param.3": endAvailabilityUtc,
				"Param.4":failureListStatus,
				"Param.5":failureListReason
			};
			var data = callDataQuery(query, params);

			var oData = [];

			var oInfo = {};

			oInfo.key = selectedMachine;
			oInfo.color = machineFailureTextColors[machineFailureTextType];
			oInfo.maxY = ["", ""];

			oInfo.values = [];

			for (var i = 0; i < data.length; i++) {
				var entry = {};

				var eqText = ((data[i].EquipmentText === "") || (data[i].EquipmentText === "_Empty_")) ? projectLabels.Web_NoText : ((data[i].EquipmentText === "_Micro_") ? projectLabels.Web_Microstop : data[i].EquipmentText);
				// bar
				entry = {
					"value": parseInt(data[i].Occurrences),
					"label": eqText,
					"totalDuration": data[i].TotalDuration,
					"machine": selectedMachine,
					"description" : selectedMachineDescription
				};

				if ((parseInt(oInfo.maxY[0]) < parseInt(data[i].TotalDuration)) || (oInfo.maxY[0] == ""))
					oInfo.maxY[0] = parseInt(data[i].TotalDuration);
				if ((parseInt(oInfo.maxY[1]) < parseInt(data[i].Occurrences)) || (oInfo.maxY[1] == ""))
					oInfo.maxY[1] = parseInt(data[i].Occurrences);



				oInfo.values.push(entry);
			}

			oData.push(oInfo);
			return oData;
		}

		function machineFailureTextControlsHandler(d, i) {
			machineFailureTextType = i;
			var oChart = d3.select("#MachineFailureText svg").datum();
			var maxY = Math.ceil(oChart[0].maxY[machineFailureTextType] / 100) * 100;
			machineFailureTextChart.forceY([0, maxY]);
			setTimeout(fillTextSelectedBar, 100);
		}


		function machineFailureTextChartUpdate () {
			var w = $("#MachineFailureText").width();
			var container = d3.select("#MachineFailureText svg");

			container.selectAll("text.chartTitle").remove();

			// Append chart title
		       	container
				  .append("text")
			              .attr("x", w/2)
				  .attr("y", 40)
				  .attr("text-anchor", "middle")
				  .attr('class', 'chartTitle gr fs80')
				  .text(pulsFilters.getSelectedLine().text +  " - "  + ( (selectedMachineDescription == "") ? projectLabels.Web_AllMachines :  selectedMachineDescription ));

		       	container
				  .append("text")
			              .attr("x", w/2)
				  .attr("y", 55)
				  .attr("text-anchor", "middle")
				  .attr('class', 'chartTitle gr fs80')
				  .text( 	beginAvailabilityLocal+ " -  "	+		endAvailabilityLocal);

			 machineFailureTextChart.update();
			 setTimeout(fillTextSelectedBar, 100);
		}

		function buildMachineFailureTextChart(id, query) {
			var classPrefix = id.substr(1, (id.length - 5));
			var oChart = buildMachineFailureTextChartData(query);
			var w = $("#" + classPrefix).width();


			var svg = d3.select(id);
			svg.selectAll("*").remove();

			if (oChart[0].values.length == 0 )
				return;

			var controlsData = [ {
					key:  projectLabels.Web_TotalDuration,
					disabled: (machineFailureTextType != 0),
					color:machineFailureTextColors[0]
				},{
						key:  projectLabels.Web_Occurrences,
						disabled: (machineFailureTextType != 1),
						color:machineFailureTextColors[1]
					}];

			nv.addGraph(function() {
				var chart = nv.models.multiBarHorizontalChart()
					.x(function(d) {
						return d.label;
					})
					.y(function(d) {
							switch (machineFailureTextType) {
								case 0:
								     return d.totalDuration;
								case 1:
											return d.value;

						}
					})
					.valueFormat(function (d) {
						if (machineFailureTextType !=1)
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
					.showValues(true)
					.showControls(true)
					.showLegend(false)
					.stacked(false)
					.height(320)
					.standardControls(false)
					.horizontalBarControlsData(controlsData)
					.horizontalBarControlsHandler(machineFailureTextControlsHandler);

					var maxY = Math.ceil(oChart[0].maxY[machineFailureTextType] / 100) * 100;
					chart.forceY([0, maxY]);
					chart.multibar.barColor(function (d,i) {
					return (machineFailureTextColors[machineFailureTextType]);
				});


				chart.yAxis
					.tickFormat(function(d) {
						if (machineFailureTextType !=1)
							return toHHMMSS(d);
						else
							return (d);
				})

				d3.select(id)
					.datum(oChart)
					.call(chart);

				var container = d3.select("#MachineFailureText svg");

				container.selectAll("text.chartTitle").remove();

				// Append chart title
		       		container
					  .append("text")
			  	              .attr("x", w/2)
					  .attr("y", 40)
					  .attr("text-anchor", "middle")
					  .attr('class', 'chartTitle gr fs80')
					  .text(pulsFilters.getSelectedLine().text +  " - "  + ( (selectedMachineDescription == "") ? projectLabels.Web_AllMachines :  selectedMachineDescription ));

		       		container
					  .append("text")
			     	               .attr("x", w/2)
					  .attr("y", 55)
					  .attr("text-anchor", "middle")
					  .attr('class', 'chartTitle gr fs80')
					  .text( 	beginAvailabilityLocal+ " -  "	+		endAvailabilityLocal);



				chart.tooltip.contentGenerator(function(d) {
					var html = '<table><tbody><tr><td class="legend-color-guide">';
					html += '<div style="background-color:' + d.color + ';"/>';
					html += '</td><td class="key">' + d.data.label + '</td></tr>';
					html += '<tr><td class="key">' + projectLabels.Web_Occurrences + '</td><td class="gr"> (' + d.data.value + ')</td></tr>';
					html += '<tr><td class="key">' + projectLabels.Web_TotalDuration + '</td><td class="gr"> (' + toHHMMSS(d.data.totalDuration) + ')</td></tr>';
					html += '</tbody></table>';
					return html;
				});


				// Redraw chart on window resize
				nv.utils.windowResize(machineFailureTextChartUpdate);
				return chart;
			}, machineFailureTextCallback);
		}
		// END MachineFailureText CHART
