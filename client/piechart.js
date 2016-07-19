Session.setDefault('pieChartSort','none');
Session.setDefault('pieChartSortModifier',undefined);

Template.pieChart.rendered = function(){
	//Width and height
	var w = 300;
	var h = 300;

	var outerRadius = 150;
	var innerRadius = 0;
	var arc = d3.svg.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius);

	var key = function(d){
		return d.id;
	};

	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return d.value;
		});
	
	//Easy colors accessible via a 10-step ordinal scale
	var color = d3.scale.category20();

	//Create SVG element
	var svg = d3.select("#pieChart")
				.attr("width", w)
				.attr("height", h);
	
	Deps.autorun(function(){

		var dataset = Images.find({"total":{$gt:0}}).fetch();
	    var res = [];
	    if (dataset.length>0){
		    var stcks = dataset[0].stocks;
	        for (var j=0; j<stcks.length; j++){
	            var obj = {};
	            obj["_id"] = String(j);
	            obj["name"] = stcks[j].name;
	            obj["value"] = parseInt(stcks[j].downloads);
	            res[j] = obj;
	        }
			
			for (var i=1; i<dataset.length; i++){
			    var stcks = dataset[i].stocks;
	            for (var j=0; j<stcks.length; j++){
	                var obj = res[j];
	                if (stcks[j].downloads){
	        		    if (obj["value"]>-1){
	        		        obj["value"] += parseInt(stcks[j].downloads);
	        		    }else{
	        		        obj["value"] = parseInt(stcks[j].downloads);
	        		    }
	                }
			    }
			}
	    }
		res = jQuery.grep(res, function( a ) {
		  return a.value > 0;
		});

    var arcs = svg.selectAll("g.arc")
					  .data(pie(res));

		var newGroups = 
			arcs
				.enter()
				.append("g")
				.attr("class", "arc")
				.attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");
		
		//Draw arc paths
		newGroups
			.append("path")
			.attr("fill", function(d, i) {
				return color(i);
			})
			.attr("d", arc);
		
		//Labels
		newGroups
			.append("text")
		    .attr("transform", function(d) { //set the label's origin to the center of the arc
			    var c = arc.centroid(d),
		        x = c[0],
		        y = c[1],
		        labelr = 50,
		        // pythagorean theorem for hypotenuse
		        h2 = Math.sqrt(x*x + y*y);
				return "translate(" + (x/h2 * labelr) +  ',' + (y/h2 * labelr) +  ")"; 
		    })
		    .style("fill", "black")
		    .style("font", "bold 12px Arial")
		    .attr("text-anchor", "middle") //center the text on it's origin
			.text(function(d) {
				return d.value;
			});

	    newGroups.append("text")
	      .attr("transform", function(d) { //set the label's origin to the center of the arc
		    var c = arc.centroid(d),
	        x = c[0],
	        y = c[1],
	        labelr = 120,
	        // pythagorean theorem for hypotenuse
	        h2 = Math.sqrt(x*x + y*y);
			return "translate(" + (x/h2 * labelr) +  ',' + (y/h2 * labelr) +  ")"; 
	      })
	      .attr("text-anchor", "middle") //center the text on it's origin
	      .style("fill", "Purple")
	      .style("font", "bold 12px Arial")
	      .text(function(d) { return d.data.name; }); //get the label from our original data array

		arcs
			.exit()
	 		.remove();
	});
};