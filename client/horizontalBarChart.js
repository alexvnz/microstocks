Template.horizontalBarChart.rendered = function(){
	//Width and height
	var w = 300;
	var h = 400;
	var datas = this.data;
	
	var yScale = d3.scale.ordinal()
					.rangeRoundBands([0, h], 0.05);

	var xScale = d3.scale.linear()
					.range([0, w]);
	
	//Define key function, to be used when binding data
	var key = function(d) {
		return d._id;
	};
	
	var color = d3.scale.category20b();

	//Create SVG element
	var svg = d3.select("#horizontalBarChart")
				.attr("width", w + 60)
				.attr("height", h);

	Deps.autorun(function(){

		var dataset = jQuery.grep(datas.data, function( a ) {
		  return parseInt(a.downloads) > 0;
		});

		//Update scale domains
		yScale.domain(d3.range(dataset.length));
		xScale.domain([0, d3.max(dataset, function(d) { return parseInt(d.downloads); })]);

	var div = d3.select("body").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);
    
		//Select…
		var bars = svg.selectAll("rect")
			.data(dataset);
		
		//Enter…
		bars.enter()
			.append("rect")
			.attr("y", function(d, i) {
				return yScale(i);
			})
			.attr("x", function(d) {
				return -xScale(parseInt(d.downloads));
			})
			.attr("height", function(){
			    var val  = (yScale.rangeBand()>30)?30:yScale.rangeBand();
			    return val;
			})
			.attr("width", function(d) {
				return xScale(parseInt(d.downloads));
			})
			.attr("fill", function(d, i) {
				return color(i);
			})
			.attr("data-id", function(d){
				return d._id;
			})
        .on("mouseover", function(d) {
            div.transition()        
                .duration(200)      
                .style("opacity", 1);      
            div .html('<img width="90px" height="90px" src="' + d.img_src + '">' )  
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
			.attr("y", function(d, i) {
				return yScale(i);
			})
			.attr("x", 0)
			.attr("height", function(){
			    var val  = (yScale.rangeBand()>30)?30:yScale.rangeBand();
			    return val;
			})
			.attr("width", function(d) {
				return xScale(parseInt(d.downloads));
			})
			.attr("fill", function(d, i) {
				return color(i);
			});

		//Exit…
		bars.exit()
			.transition()
			.duration(500)
			.attr("y", -yScale.rangeBand())
			.remove();

		//Update all labels

		//Select…
		var labels = svg.selectAll("text")
			.data(dataset);
		
		var labels2 = svg.selectAll("text")
			.data(dataset);
		
		//Enter…
		labels.enter()
			.append("text")
			.text(function(d) {
				return d.img_alt;
			})
//			.attr("text-anchor", "middle")
			.attr("x", function(d){
			    return - xScale(parseInt(d.downloads)) + 6;
			})
			.attr("y", function(d, i) {
			    var val = (yScale.rangeBand()>30)?30:yScale.rangeBand();
    			return yScale(i) + val / 2;
			})						
		   .attr("font-family", "sans-serif")
		   .attr("font-size", "11px")
		   .attr("font-weight", "bold")
		   .attr("fill", "black");

		labels2.enter()
			.append("text")
			.text(function(d) {
				return d.downloads;
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d){
			    return - xScale(parseInt(d.downloads))/2;
			})
			.attr("y", function(d, i) {
			    var val = (yScale.rangeBand()>30)?30:yScale.rangeBand();
    			return yScale(i) + val / 2;
			})						
		   .attr("font-family", "sans-serif")
		   .attr("font-size", "11px")
		   .attr("font-weight", "bold")
		   .attr("fill", "white");

		//Update…
		labels.transition()
			// .delay(function(d, i) {
			// 	return i / dataset.length * 1000;
			// }) // this delay will make transistions sequential instead of paralle
			.duration(500)
			.attr("y", function(d, i) {
			    var val = (yScale.rangeBand()>30)?30:yScale.rangeBand();
    			return yScale(i) + val / 2;
			}).attr("x", function(d) {
				return xScale(parseInt(d.downloads)) + 6;
			}).text(function(d) {
				return d.img_alt;
			});

		labels2.transition()
			// .delay(function(d, i) {
			// 	return i / dataset.length * 1000;
			// }) // this delay will make transistions sequential instead of paralle
			.duration(500)
			.attr("y", function(d, i) {
			    var val = (yScale.rangeBand()>30)?30:yScale.rangeBand();
    			return yScale(i) + val / 2;
			}).attr("x", function(d) {
				return xScale(parseInt(d.downloads))/2;
			}).text(function(d) {
				return d.downloads;
			});
		//Exit…
		labels.exit()
			.transition()
			.duration(500)
			.attr("y", -yScale.rangeBand())
			.remove();
	});
};