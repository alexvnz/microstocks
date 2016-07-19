Template.scatterPlot.rendered = function(){
	//Width and height
	var w = 600;
	var h = 250;
	
	var xScale = d3.scale.ordinal()
					.rangeRoundBands([0, w], 0.05);

	var yScale = d3.scale.linear()
					.range([0, h]);
	
	//Define key function, to be used when binding data
	var key = function(d) {
		return d._id;
	};
	
	//Create SVG element
	var svg = d3.select("#scatterPlot")
				.attr("width", w)
				.attr("height", h);

	Deps.autorun(function(){
		var modifier = {fields:{value:1}};
		var sortModifier = Session.get('barChartSortModifier');
		if(sortModifier && sortModifier.sort)
			modifier.sort = sortModifier.sort;
		
		var dataset = Images.find({"total":{$gt:0}}).fetch();

		//Update scale domains
		xScale.domain(d3.range(dataset.length));
		yScale.domain([0, d3.max(dataset, function(d) { return d.total; })]);

	var div = d3.select("body").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);
    
		//Select…
		var bars = svg.selectAll("rect")
			.data(dataset, key);
		
		//Enter…
		bars.enter()
			.append("rect")
			.attr("x", w)
			.attr("y", function(d) {
				return h - yScale(d.total);
			})
			.attr("width", xScale.rangeBand())
			.attr("height", function(d) {
				return yScale(d.total);
			})
			.attr("fill", function(d) {
				return "rgb(0, 0, " + (d.total * 10) + ")";
			})
			.attr("data-id", function(d){
				return d._id;
			})
        .on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", 1);      
            div .html("<img width='90px' height='90px' src='" + d.img_src + "'/>" )  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 50) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });
		//Update…
		bars.transition()
			// .delay(function(d, i) {
			// 	return i / dataset.length * 1000;
			// }) // this delay will make transistions sequential instead of paralle
			.duration(500)
			.attr("x", function(d, i) {
				return xScale(i);
			})
			.attr("y", function(d) {
				return h - yScale(d.total);
			})
			.attr("width", xScale.rangeBand())
			.attr("height", function(d) {
				return yScale(d.total);
			}).attr("fill", function(d) {
				return "rgb(0, 0, " + (d.total * 10) + ")";
			});

		//Exit…
		bars.exit()
			.transition()
			.duration(500)
			.attr("x", -xScale.rangeBand())
			.remove();

		//Update all labels

		//Select…
		var labels = svg.selectAll("text")
			.data(dataset, key);
		
		var labels2 = svg.selectAll("text")
			.data(dataset, key);
		
		//Enter…
		labels.enter()
			.append("text")
			.text(function(d) {
				return d.img_alt;
			})
			.attr("text-anchor", "middle")
			.attr("x", w)
			.attr("y", function(d) {
				return h - yScale(d.total) + 14;
			})						
		   .attr("font-family", "sans-serif")
		   .attr("font-size", "11px")
		   .attr("fill", "white");

		labels2.enter()
			.append("text")
			.text(function(d) {
				return d.total;
			})
			.attr("text-anchor", "middle")
			.attr("x", w)
			.attr("y", function(d) {
				return h - yScale(d.total)/2;
			})						
		   .attr("font-family", "sans-serif")
		   .attr("font-size", "14px")
		   .attr("font-weight", "bold")
		   .attr("fill", "white");

		//Update…
		labels.transition()
			// .delay(function(d, i) {
			// 	return i / dataset.length * 1000;
			// }) // this delay will make transistions sequential instead of paralle
			.duration(500)
			.attr("x", function(d, i) {
				return xScale(i) + xScale.rangeBand() / 2;
			}).attr("y", function(d) {
				return h - yScale(d.total) + 14;
			}).text(function(d) {
				return d.img_alt;
			});

		labels2.transition()
			.duration(500)
			.attr("x", function(d, i) {
				return xScale(i) + xScale.rangeBand() / 2;
			}).attr("y", function(d) {
				return h - yScale(d.total)/2;
			}).text(function(d) {
				return d.total;
			});

		//Exit…
		labels.exit()
			.transition()
			.duration(500)
			.attr("x", -xScale.rangeBand())
			.remove();
	});
};