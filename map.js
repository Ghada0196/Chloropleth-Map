const req = new XMLHttpRequest();
req.open("GET",'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',true);
req.send();
req.onload = function(){
  
  const education = JSON.parse(req.responseText);

  var svg = d3.select("body")
            .append("svg")
            .attr("width", 1000)
            .attr("height", 800)


  var educationMap = d3.map();

  //rendering the map
  var path = d3.geoPath();

  d3.json("https://d3js.org/us-10m.v1.json", function ready(error, us) {

    if (error) throw error

    const colors = d3.schemeGreens[7]

    const ticks = [3, 12, 21, 30, 39, 48, 57, 66]

    //rendering counties
    svg.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "county")
      .attr("data-fips", d => find(education, d.id)["fips"])
      .attr("data-education", d => find(education, d.id)["bachelorsOrHigher"])

      //tooltip
      .on("mouseover", (d) => {
         d3.select("#tooltip")
            .style("opacity", "0.8")
            .text(tooltiptext(find(education, d.id)))
            .attr("data-education", find(education, d.id)["bachelorsOrHigher"])
            .style("left", d3.event.pageX+"px")
            .style("top", (d3.event.pageY - 50)+"px")
            
         })
      .on("mouseout", () => {
             d3.select("#tooltip")
               .style("opacity", "0")
         })
      
      //color the counties
      .attr("fill" , d => {
        let color 
        for (let i =0; i < ticks.length; i++){
          if (find(education, d.id)["bachelorsOrHigher"] >= ticks[i]) {
              color = colors[i]
              
          }
        }
        return color
      })
 
    
    //rendering states
    svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);

//legend

    const xScale = d3.scaleLinear()
                      .domain([3, 66])
                      .range([600, 880])

    const xAxis = d3.axisBottom(xScale)
                    .tickValues(ticks)
                    .tickSize(10)
                    .tickFormat(t => t+"%")

    svg.append("g")
        .attr("id", "legend")
         .call(xAxis)
         .selectAll("rect")
         .data(ticks.filter(t => t < ticks[ticks.length - 1]))
         .enter()
         .append("rect")
         .attr("height", 8)
         .attr("width", 40)
         .attr("x", d => xScale(d))
         .attr("fill", (d, i) => colors[i])
         
    })

//make a connection between the json object and the topojson object
  function find(education, id){
    for (let i = 0; i < education.length; i++) {
      if ( id == education[i]["fips"]) {
        return (education[i])
      }
    }
  }

  function tooltiptext( name) {
      return (name["area_name"] + " ," + name["state"] + ": " + name["bachelorsOrHigher"] + "%")
  }

}
 