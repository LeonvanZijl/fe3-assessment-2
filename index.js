var svg = d3.select("svg"),
    margin = {
        top: 0,
        right: 0,
        bottom: 40,
        left: 60
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

var x1 = d3.scaleBand()
    .padding(0.05);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#ECDB60", "#A1CC73", "#409A82", "#427676", "#3C5A6A", "#ABBBCB", "#6A7484", "#444D5E"]);

/* ==================== LOADING DATA ==================== */

d3.tsv("data.tsv",
    function(d, i, columns) {
        for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
        return d;
    },
    function(error, data) {
        if (error) throw error;

		console.log(data);

        /* ==================== VARS ==================== */

        var dataTotal = data; //Saving all the data in another var for later use
        var maxTotalValue = []; //Creating a var for all the 'totaal' value to calculate the highest y axis value
        var keys = data.columns.slice(1); //Removing the headings from the data

        //A loop to put all the 'totaal' values from the data into one array so I can sort them to find the highest value
        for (i = 0; i < data.length; i++) {

            //Push the values into one array
            maxTotalValue.push(data[i].totaal);

            //Sorting the values by descending them so the highest number is always the first one
            maxTotalValue.sort(function(x, y) {
                return d3.descending(x, y);
            });

        }

        data = data.slice(0, 1); //Getting just one array at a time

        /* ==================== SETTING UP THE GRAPH FROM THE DATA ==================== */

        x0.domain(data.map(function(d) {
            return d.jaar;
        }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, maxTotalValue[0]]); //Using the first (so the highest) value from 'totaal' to set the y axis

        g.append("g") //Creating the bars with the surrounding g elements
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("class", "barContainer")
            .attr("transform", function(d) {
                return "translate(" + x0(d.jaar) + ",0)";
            })
            .selectAll("rect")
            .data(function(d) {
                return keys.map(function(key) {
                    return {
                        key: key,
                        value: d[key]
                    };
                });
            })
            .enter().append("rect")
            .attr("x", function(d) {
                return x1(d.key);
            })
            .attr("y", function(d) {
                return y(d.value);
            })
            .attr("width", x1.bandwidth())
            .attr("height", function(d) {
                return height - y(d.value);
            })
            .attr("fill", function(d) {
                return z(d.key);
            })
            .attr("class", "bar");

        // g.append("g") //Creating the x axis
        //     .attr("class", "axis axisX")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom(x0));

        g.append("g") //Creating the y axis
            .attr("class", "axis axisY")
			.attr("transform", function(d) {
                return "translate(20,0)";
            })
            .call(d3.axisLeft(y).ticks());

        /* ==================== LEGEND ==================== */

        var legend = g.append("g")
            .attr("text-anchor", "middle")
			.attr("class", "barLegend")
            .selectAll("g")
            .data(keys.slice())
            .enter().append("g")
            .attr("transform", function(d, i) {
                return "translate(" + i * 127 + ",0)";
            });

        legend.append("text")
            .attr("x", 126)
            .attr("y", height + 30)
            .attr("dy", "0.32em")
            .text(function(d) {
                return d;
            });

        /* ==================== CREATING THE DIVS FOR TRIGGERS ==================== */

        var divTriggerWidth = 100 / dataTotal.length; //Calculating the width in % so all the divs together would make 100%

        for (i = 0; i < dataTotal.length; i++) {

            var div = document.createElement("div");
            div.style.width = divTriggerWidth + "%";
            div.style.height = "100%";
            div.style.float = "left";
            div.classList.add('div' + i, "divTrigger");

            document.querySelector(".slider").appendChild(div);

        }

        /* ==================== TRIGGER ==================== */

        d3.selectAll(".divTrigger").on('mouseover', showYear); //Add an event trigger mouseover to all the created divs
		d3.selectAll(".divTrigger").on('mouseout', descriptionReset); //Add an event trigger mouseout to all the created divs

        function showYear() {

            console.log("Mouseover event triggered"); //Check if the event is triggered

            var divIndex = this.className.match(/\d+/)[0]; //Extract the index out of the classname (I know, this could've been done so much easier 🙃)

			console.log(divIndex);

            data = dataTotal; //Putting all the array back into data variable so another year can be selected
            data = data.slice(divIndex, divIndex + 1); //Use the divIndex to determine which year should be selected, the higher the divIndex the farther away the slice will be

            var dataVar = data[0]; //Put the selected array into a variable so we can select keys / properties of the variable by number

			document.querySelector(".year").innerHTML = dataVar.jaar; //Change the year value in the span
			document.querySelector(".sliderDescription").innerHTML = "Lekker bezig pik 👍🏻"; //Change the description value in the span

			console.log(dataVar); //Check if the correct year is selected

			var dataVarLength = Object.keys(dataVar).length; //Get the total count of keys / properties in dataVar

			for (i = 1; i <= dataVarLength; i++) { //Loop through each bar and each key / propertie in dataVar to set the new values

                svg.selectAll(".bar:nth-child(" + i + ")") //Select one bar after the other
                    .transition()
                    .duration(300)
                    .attr("height", height - y(dataVar[Object.keys(dataVar)[i]])) //This selects the :nth key / property of dataVar depending on the index value
                    .attr("y", y(dataVar[Object.keys(dataVar)[i]])); //Same goes for this

            }

			/* ==================== REFRESHING THE Y AXIS WITH THE ANIMATIONS ==================== */

			//Didn't use this since the total value bar wouldn't move. So it's hard to see the differences between the years. Instead I calculated the highest total value which is used for y axis (see above)

            // y.domain([0, dataVar[Object.keys(dataVar)[8]]]); //Used the latest key (totaal) from the data
			//
            // svg.selectAll(".axisY")
            //     .transition()
            //     .duration(1000)
            //     .call(d3.axisLeft(y).ticks());

			/* ==================== END REFRESH ==================== */

        }

		function descriptionReset() {

			document.querySelector(".sliderDescription").innerHTML = "&#60; Beweeg je cursor heen en weer over dit gebied &#62;"; //Change the description back

		}

    }); /* ==================== END LOADING DATA ==================== */
