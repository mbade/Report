		// BEGIN LineAvailabilitySummary CHART

		function buildPieOrderPerformanceData(data) {



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

				var entry = {};


				var value = Math.round((parseFloat(data.availabilityPerc)) *100) / 100;
				var label = "Available"  + " (" + value + "%)";
				entry = {
					"label": label,
					"value": value,
					"color": greenColor
				};

				chartLegendLabels.push(entry.label);
				chartLegendRange.push(entry.color);
				//	dTotal += parseFloat(entry.value);
				oData.push(entry);

				value = Math.round(((parseFloat(100) - parseFloat(data.availabilityPerc)) * 100)) / 100;
				label = "Failure"  + " (" + value + "%)";
				entry = {
					"label": label,
					"value": value,
					"color": redColor
				};

				chartLegendLabels.push(entry.label);
				chartLegendRange.push(entry.color);
				//	dTotal += parseFloat(entry.value);
				oData.push(entry);



			oInfo.data = oData;
			oInfo.legendLabels = chartLegendLabels;
			oInfo.legendRange = chartLegendRange;
			return oInfo;
		}

		function pieAvailabilityCallbackClick(e) {
			if (typeof(e.data.label) !== "undefined") {
				beginAvailabilityUtc = beginExtendedAvailabilityUtc;
				endAvailabilityUtc = endExtendedAvailabilityUtc;
				beginAvailabilityLocal = beginExtendedAvailabilityLocal;
				endAvailabilityLocal = endExtendedAvailabilityLocal;
				failureListReason = "";
				failureListStatus = "";
				failureListText = "Empty";
				selectedAvalailabilityBar = "";
				fillSelectedBars();
				// lineFailureType = 0;
				buildLineFailureChart("#LineFailure svg", LineFailureXac);
				refreshMachineCharts ();
				refreshTables();
			}
		}

		function pieAvailabilityCallback(chart) {
			pieChart = chart;
			pieChart.pie.dispatch.on("elementClick", pieAvailabilityCallbackClick);
		}


		function buildPieOrderPerformance(id, data) {


				var classPrefix = id.substr(1, (id.length - 5));
				var oChart = buildPieOrderPerformanceData(data);

				var svg = d3.select(id);
				svg.selectAll("*").remove();

			//	if (oChart.data.length == 0)
			//		return;
				//Regular pie chart example
				nv.addGraph(function() {
					var chartPie = nv.models.pieChart()
						.x(function(d) {
							return d.label
						})
						.y(function(d) {
							return d.value
						})
						.noData (projectLabels.Web_NoDataLinePeriod)
						.showLegend(true)
						.showLabels(true)
						.labelType("percent2digits");

					chartPie.legend.updateState(false);
					d3.select(id)
						.datum(oChart.data)
						//   .transition().duration(350)
						.call(chartPie);

					nv.utils.windowResize(chartPie.update);

					return chartPie;
				}, pieAvailabilityCallback);

		}
		// END LineAvailabilitySummary CHART
