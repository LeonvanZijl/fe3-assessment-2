# **Assessment 2**

![][cover]

## **Github Page**
[Github Page](https://leonvanzijl.github.io/fe3-assessment-1/)

## **Short description**
Creating an interactive datavisualisation from either clean or dirty data.

## **Background**
In this assignment I’ve created an interactive datavisualisation from a dataset. In my case I used a clean dataset because I couldn't find one right away and didn't want to waste a lot of time. Instead I focused more on creating a pleasant user experience.

**Steps**
1. Downloading a dataset
2. Getting the data to show in the graph
```
d3.tsv("data.tsv",
    function(d, i, columns) {
        for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
        return d;
    },
```

3. Making sure just one year is shown in the graph. And saving all the data in another var so it can be used later one.
```
var dataTotal = data; //Saving all the data in another var for later use
data = data.slice(0, 1); //Getting just one array at a time
```
4. Setting up a simple trigger function to animate to the next year in the array
```
d3.selectAll(".divTrigger").on('click', showYear)
```

5. Here is where I walked into a lot of problems. I wanted to change the height and Y values of the bars when the event is triggered
```
data = dataTotal; //Putting all the array back into data variable so another year can be selected
data = data.slice(1, 2); //Getting data from a different year
svg.selectAll(".bar:nth-child(1")") //Select one bar after the other
	.attr("y", function(d) {
		return y(d.value);
	})
	.attr("height", function(d) {
		return height - y(d.value);
	})
```

6. But `d.value` gave an error which I couldn't fix. So I had to get the value on another way. Bellow I'm saving the first array of the data array into a variable
```
var dataVar = data[0]; //Put the selected array into a variable so we can select keys / properties of the variable by number
```

7. I had to save this into a variable because I need to loop through all the keys / properties. I can do this with:
```
dataVar[Object.keys(dataVar)[i]
```

8. This part has placed `d.value` now. Further I made a for loop so all the bars would be changed with the use of all the values of all the keys / properties from the `dataVar` variable
```
for (i = 1; i <= dataVarLength; i++) { //Loop through each bar and each key / propertie in dataVar to set the new values

	svg.selectAll(".bar:nth-child(" + i + ")") //Select one bar after the other
		.transition()
		.duration(300)
		.attr("height", height - y(dataVar[Object.keys(dataVar)[i]])) //This selects the :nth key / property of dataVar depending on the index value
		.attr("y", y(dataVar[Object.keys(dataVar)[i]])); //Same goes for this
}
```

9. The repetitions of the loop is calculated by the numbers of keys / properties in `dataVar`
```
var dataVarLength = Object.keys(dataVar).length; //Get the total count of keys / properties in dataVar
```

10. So now I can trigger an event and animate the bars to another year. But I want a horizontal mouseover bar at the bottom of the screen when hovered will show a different year based on the x position. For this I used multiple divs with a mouseover event:
```
var divTriggerWidth = 100 / dataTotal.length; //Calculating the width in % so all the divs together would make 100%
for (i = 0; i < dataTotal.length; i++) {
	var div = document.createElement("div");
	div.style.width = divTriggerWidth + "%";
	div.style.height = "100%";
	div.style.float = "left";
	div.classList.add('div' + i, "divTrigger");
	document.querySelector(".slider").appendChild(div);
}
```

11. Each div has it's own class name with index number. In the function which is triggered by the mouseover event this index number is used to indicate which year to show. Below this index is extracted:
```
var divIndex = this.className.match(/\d+/)[0]; //Extract the index out of the classname (I know, this could've been done so much easier 🙃)
```

12. Then I changed the slice function
```
data = data.slice(divIndex, divIndex + 1); //Use the divIndex to determine which year should be selected, the higher the divIndex the farther away the slice will be
```

13. At this point I noticed I need to change the y axis value to the highest possible number
```
//A loop to put all the 'totaal' values from the data into one array so I can sort them to find the highest value
for (i = 0; i < data.length; i++) {

	//Push the values into one array
	maxTotalValue.push(data[i].totaal);

	//Sorting the values by descending them so the highest number is always the first one
	maxTotalValue.sort(function(x, y) {
		return d3.descending(x, y);
	});
}
```

14. The `maxTotalValue` is then used in the `y.domain` function
```
y.domain([0, maxTotalValue[0]]); //Using the first (so the highest) value from 'totaal' to set the y axis
```

15. In the end I tried using a dirty data source and I got to the point in which I had an array with all the values in them. But I didn't understand the `nest()` function enough and didn't had enough time. So I hope the interactio can compensate for it.
```
d3
    .text('data.txt') //Load the dirty data
    .mimeType('text/plain;charset=iso88591') //Change to the correct format
    .get(onload); //Wait till everything is loaded before showing
function onload(err, doc) {
    if (err) throw err;
    //My dirty data has multiple rows of semicolons so this way everything above the data will be removed through a loop
    for (i = 0; i < 3; i++) {
        var header = doc.indexOf(';;;;;;;;'); //Gets the starting point of the string
        var row = doc.indexOf('\n', header); //Select from rowbreak till indexOf so the whole row will be removed
        doc = doc.slice(row).trim(); //Slice the row and remove the white space wth trim()
    }
	//Loop through the whole data to replace every semicolon with a comma
    function clean() {
        if (doc.indexOf(';') >= 0) {
            doc = doc.replace(';', ',');
            console.log(doc);
            clean();
        }
    }
    clean(); //Trigger the function
    var end = doc.indexOf(',,,,,,,,'); //Get the indexOf value of the row after the data
    doc = doc.slice(0, end); //Extract everything before the row, which is just the data
    console.log(doc);
    var data = d3.csvParseRows(doc, map);
    console.log(data);
    function map(d) {
        return {
            "jaar": d[0],
            "0-19": Number(d[1]),
			"20-34": Number(d[2]),
			"35-49": Number(d[3]),
			"50-64": Number(d[4]),
			"65+": Number(d[5]),
			"mannen": Number(d[6]),
			"vrouwen": Number(d[7]),
			"totaal": Number(d[8])
        };
    }
```

## **Data**
The dataset is about the population in Amsterdam between different years.

jaar | 0-19 | 20-34 | 35-49 | 50-64 | 65+ | mannen | vrouwen | totaal
--- | --- | --- | --- | --- | --- | --- | --- | ---
1900 | 221554 | 123546 | 86125 | 52991 | 26637 | 241357 | 269496 | 510853
1921 | 253496 | 182869 | 129132 | 79615 | 38054 | 329955 | 353211 | 683166
1940 | 245414 | 201904 | 179391 | 117563 | 56322 | 389394 | 411200 | 800594

## **Features**
1. `d3-Domain` - Setting the data
2. [`d3-Scale`](https://github.com/d3/d3-scale) - Position encodings
3. [`d3-Transition`](https://github.com/d3/d3-transition) - Animating elements
4. [`d3-Axis`](https://github.com/d3/d3-axis) - Axes
5. [`Array-Slice`](https://www.w3schools.com/jsref/jsref_slice_array.asp) - Using parts of the array
6. [`Match()`](https://www.w3schools.com/jsref/jsref_match.asp) - Check if a string matches something
7. [`d3-Sort`](https://stackoverflow.com/questions/25168086/sorting-objects-based-on-property-value-in-d3) - Sorting the string


## **License**
MIT © Leon van Zijl

## **Sources**
1. [Grouped Bar Chart - Mike Bostock](https://bl.ocks.org/mbostock/3887051)
2. [Inspiration](https://bost.ocks.org/mike/nations/)
3. [Dataset](http://www.ois.amsterdam.nl/feiten-en-cijfers/amsterdam/bevolking/)
4. [cover]: preview.png
