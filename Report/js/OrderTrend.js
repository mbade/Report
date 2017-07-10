		//BEGIN OrderAvailabilityTrend CHART

		function fillSelectedBars () {
		  var svg2=d3.select("#OrderAvailabilityTrend svg");
		  groups2 = svg2.selectAll("g.nv-groups").selectAll("rect");
		  groups2.style("fill", function (d, i){
		        return ((d.label ==  selectedAvalailabilityBar) ? availabilitySelectedColors[d.series] : availabilityColors[d.series]);
		  });
		}

		function orderAvailabilityTrendCallbackClick(e) {
			// reset begin / end timestamps and refresh charts


			if (typeof(e.data.label) !== "undefined") {
				// buildPieOrderPerformance("#OrderPerformanceSummary svg", e.data);




				fillSelectedBars();
				buildOrderMachineFailureChart("#OrderMachineFailure svg", GetMachineFailureXac,e.data.label);
				/* refreshMachineCharts ();
				refreshTables(); */
			}
		}


		function buildOrderAvailabilityTrendChartData(query) {
			var line = "",
				toDate = "",
				intervalType = "",
				numInterval = "";



			numInterval = document.getElementById("NumberTextbox").value;

		//	toDate = toCal.getCalendarDate();
			toDate = toCal.getSqlDate({miiFormat:true});

			intervalType = $("#intervalBrowser").select2('data').id;
			/* if (toDate != '') {
				if (!CheckStrDate(toDate)) {
					alert("Please check toDate format");
					return;
				} else {
					toDate = convertDate(toDate, "-", "T", ":", ".", false);
				}
			} */

			var params = {
				"Param.1": toDate,
				"Param.2": numInterval,
				"Param.3": numInterval
			};
			var data = callDataQuery(query, params);

			var oData = [];
			var series_data_1 = {
				"key": "Availability",
				"color": availabilityColors[0],
				"maxY": [100, ""],
				"values": []
			};

			var series_data_2 = {
				"key": "Failure",
				"color": availabilityColors[1],
				"maxY": [100, ""],
				"values": []
			};

			// reset
			beginAvailabilityUtc = "";
			endAvailabilityUtc = "";
			beginAvailabilityLocal = "";
			endAvailabilityLocal = "";
/*
			"TimestampStart":"2017-07-04 00:00:00"
"Order":"12345678"
"OrderEstimatedDuration":"1970-01-01T08:00:00"
"OrderDuration":"1970-01-01T22:00:00"
"OrderFailure":"1970-01-01T00:20:00"
"OrderDurationSec":"79200"
"OrderFailureSec":"1200"
"OrderEstimatedDurationSec":"28800"
"OrderAvailabilitySec":"78000"
"FailurePerc":"0.02"
"AvailabilityPerc":"0.98"
"OrderAvailability":"1970-01-01T21:40:00" */

			for (var i = 0; i < data.length; i++) {

				var entry_Data1 = {
					"label": data[i].Order,
					"value": parseFloat(data[i].OrderAvailabilityPerc) * 100,
					"duration":parseInt(data[i].OrderAvailability),
					"production": parseInt(data[i].OrderDuration),
					"failure": parseInt(data[i].OrderFailure),
					"availability": parseInt(data[i].OrderAvailability),
					"failurePerc": parseFloat(data[i].OrderFailurePerc) * 100,
					"availabilityPerc": parseFloat(data[i].OrderAvailabilityPerc) * 100,
					"x": data[i].Order,
					"y": parseFloat(data[i].AvailabilityPerc) * 100,
					"begin": data[i].TimestampStart,
					"end": data[i].TimestampEnd
						//					"color": (parseFloat(data[i].DataPercentage) < 70) ? greenColor : ( (parseFloat(data[i].DataPercentage) < 90)  ? yellowColor : redColor)
				};



				var entry_Data2 = {
					"label": data[i].Order,
					"value": parseFloat(data[i].OrderFailurePerc) * 100,
					"duration":parseInt(data[i].OrderFailure),
					"production": parseInt(data[i].OrderDuration),
					"failure": parseInt(data[i].OrderFailure),
					"availability": parseInt(data[i].OrderAvailability),
					"failurePerc": parseFloat(data[i].OrderFailurePerc) * 100,
					"availabilityPerc": parseFloat(data[i].OrderAvailabilityPerc),
					"x": data[i].Order,
					"y":  parseFloat(data[i].FailurePerc) * 100,
					"begin": data[i].TimestampStart,
					"end": data[i].TimestampEnd
				};

				series_data_1.values.push(entry_Data1);
				series_data_2.values.push(entry_Data2);

			}

			oData.push(series_data_1);
			oData.push(series_data_2);


			return oData;
		}


		function orderAvailabilityTrendCallback(chart) {
			percentageChart = chart;
			percentageChart.multibar.dispatch.on("elementClick", orderAvailabilityTrendCallbackClick);
		}


		function orderAvailabilityTrendChartUpdate () {
			var w = $("#OrderAvailabilityTrend").width();
			var container = d3.select("#OrderAvailabilityTrend svg");
		           var sanitWidth = nv.utils.sanitizeWidth("", container);
			container.selectAll("text.chartTitle").remove();

			// Append chart title
			container
					  .append("text")
					  .attr("x", w - 10)
					  .attr("y", 20)
					  .attr("text-anchor", "end")
					  .attr('class', 'chartTitle gr fs90')
					  .text("Orders");

			percentageChart.update();
			fillSelectedBars();
		}

		function orderAvailabilityTrendControlsHandler(d, i) {
			orderAvailabilityTrendType = i;
			var oChart = d3.select("#OrderAvailabilityTrend svg").datum();
			percentageChart.forceY([0, oChart[0].maxY[orderAvailabilityTrendType]]);
		//	setTimeout(fillSelectedBar, 100);
		}

		function buildOrderAvailabilityTrendChart(id, query) {

				var classPrefix = id.substr(1, (id.length - 5));
				var w = $("#" + classPrefix).width();

				var oChart = buildOrderAvailabilityTrendChartData(query);

				// if (oChart[0].values.length == 0)
				//	return;


				var svg = d3.select(id);
				svg.selectAll("*").remove();

				nv.addGraph(function() {
					var chart = nv.models.multiBarChart()
						.duration(300)
						.margin({
							bottom: 85,
							left: 50
						})
						.y(function(d) {
							switch (orderAvailabilityTrendType) {
								case 0:
									return d.value;
								case 1:
								  return d.duration;
							}
						})
						.rotateLabels(-60)
						.showControls(true)
						.showLegend(false)
						.stacked(true)
						.noData ("No data available")
						.groupSpacing(0.1)
						.standardControls(false)
						.multiBarControlsData(orderAvailabilityTrendControlsData)
						.multiBarControlsHandler(orderAvailabilityTrendControlsHandler);

					chart.reduceXTicks(false).staggerLabels(true);
					chart.xAxis
						.axisLabelDistance(35)
						.showMaxMin(false);

					chart.yAxis
						.axisLabelDistance(-5)
						.tickFormat(function(d) {
							if (orderAvailabilityTrendType !== 0)
								return toHHMMSS(d, true);
							else
								return (d3.format("0f")(d));
					});

					// chart.forceY([0, 100]);
					d3.select(id)
						.datum(oChart)
						.call(chart);


					chart.tooltip.contentGenerator(function(d) {
						var html = '<table><tbody><tr><td class="legend-color-guide">';
						html += '<div style="background-color:' + d.color + ';"/>';
						html += '</td><td class="key">' + d.data.label + '</td></tr>';
						if (d.data.key == "Availability") {
							html += '<tr><td class="key">Availability</td><td class="gr"> (' + (Math.round((parseFloat(d.data.value) * 100)) / 100) + '%)</td></tr>';
							html += '<tr><td class="key">Failure</td><td class="gr"> (' + toHHMMSS(d.data.failure) + ')</td></tr>';
						}
						else {
							html += '<tr><td class="key">Failure</td><td class="gr"> (' + (Math.round((parseFloat(d.data.value) * 100)) / 100) + '%)</td></tr>';
							html += '<tr><td class="key">Availability</td><td class="gr"> (' +  toHHMMSS(d.data.availability) + ')</td></tr>';
						}
						html += '<tr><td class="key">Production</td><td class="gr"> (' + toHHMMSS(d.data.production) + ')</td></tr>';
						html += '</tbody></table>';

						return html;
					});

					var svg = d3.select(id);
					// Append chart title
					svg
					  .append("text")
					  .attr("x", w - 10)
					  .attr("y", 20)
					  .attr("text-anchor", "end")
					  .attr('class', 'chartTitle gr fs90')
					  .text("Order");

					nv.utils.windowResize(orderAvailabilityTrendChartUpdate);

					return chart;
				}, orderAvailabilityTrendCallback);

		}
		//END OrderAvailabilityTrend CHART
