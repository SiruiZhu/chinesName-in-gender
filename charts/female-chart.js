/* global d3 */
(function () {
  var margin = { top: 0, left: 0, right: 0, bottom: 10 }

  var height = 300 - margin.top - margin.bottom

  var width = 180 - margin.left - margin.right

  var container = d3.select('#female-chart')

  const xPositionScale = d3.scaleLinear().domain([0, 7]).range([0, width])

  const yPositionScale = d3.scaleLinear().domain([0, 150]).range([height, 0])

  function gridData() {
    var data = new Array()
    var xpos = 1 //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1
    var width = 22
    var height = 22

    // iterate for rows
    for (var row = 0; row < 12; row++) {
      data.push(new Array())

      // iterate for cells/columns inside rows
      for (var column = 0; column < 8; column++) {
        data[row].push({
          x: xpos,
          y: ypos,
          width: width,
          height: height,
        })
        // increment the x position. I.e. move it over by 20 (width variable)
        xpos += width
      }
      // reset the x position after a row is complete
      xpos = 1
      // increment the y position for the next row. Move it down 50 (height variable)
      ypos += height
    }
    return data
  }

  var gridData = gridData()
  // console.log(gridData)

  const colorScale = d3
    .scaleLinear()
    .domain([0, 180])
    .range(['#701400', '#FFF9F9'])

  var div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  d3.csv('data/top20_f_cleaned.csv')
    .then(ready)
    .catch(function (err) {
      console.log('Failed with', err)
    })

  function ready(datapoints) {
    // console.log('This is chart', datapoints)

    // group global data by decade
    var nested_decade = d3
      .nest()
      .key(function (d) {
        return d.decade
      })
      .entries(datapoints)
    // console.log('nested global data look like', nested_decade)

    const decades = datapoints.map(function (d) {
      return d.decade
    })

    // xPositionScale.domain(decades)

    container
      .selectAll('.circle-graph')
      .data(nested_decade)
      .enter()
      .append('svg')
      .attr('class', 'circle-graph')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .each(function (d) {
        let svg = d3.select(this)
        let datapoints = d.values

        var grid = svg
          .append('g')
          .attr('width', '180px')
          .attr('height', '300px')

        var row = grid
          .selectAll('.row')
          .data(gridData)
          .enter()
          .append('g')
          .attr('class', 'row')

        var column = row
          .selectAll('.square')
          .data(function (d) {
            return d
          })
          .enter()
          .append('rect')
          .attr('class', 'square')
          .attr('x', function (d) {
            return d.x
          })
          .attr('y', function (d) {
            return d.y
          })
          .attr('width', function (d) {
            return d.width
          })
          .attr('height', function (d) {
            return d.height
          })
          .attr('fill', (d) => colorScale(d.y))
          .style('stroke', '#ED6B47')
          .style('stroke-width', 0.5)

        svg
          .selectAll('.characters')
          .data(datapoints)
          .enter()
          .append('circle')
          .attr('class', (d) => d.character + d.gender)
          .classed('characters', true)
          .attr('r', '10')
          .attr('cx', function (d) {
            return xPositionScale(d.x_order)
          })
          .attr('cy', (d) => yPositionScale(d.ratio))
          .attr('fill', '#FCE6C6')
          .attr('stroke', '#ED6B47')


      svg.selectAll('circle')
          .on('mouseover', function(d, i) {
            var className = d.character + d.gender
            div
              .transition()
              .duration(200)
              .style('opacity', 0.9)
            
            div
              .html(
                '<strong>Character: </strong>' + d.character + 
                '<br>' +
                '<strong>Pinyin: </strong>' +
                  d.pinyin +
                  '<br>' +
                  '<strong>Appeared in: </strong>' + 
                  d.decades + 
                  '<br>' +
                  '<strong>Popularity in this decade: </strong>' + 
                  '<br>' +
                  d.ratio + 
                  ' out of 1,000 people' 
              )
              .style('left', d3.event.pageX - 75 + 'px')
              .style('top', d3.event.pageY + 28 + 'px')
              .style('display', 'block')   
            
            d3.selectAll('circle.' + className)
              // .raise()
              .transition()
              .attr('r', 13)
              .attr('fill', '#FBFAF4')
              .attr('stroke-width', 2)
          }) 
          .on('mouseout', function(d, i) {
            var className = d.character + d.gender
            div
              .transition()
              .duration(200)
              .style('opacity', 0)
            d3.selectAll('circle.' + className)
              // .raise()
              .transition()
              .attr('r', 10)
              .attr('fill', '#FCE6C6')
              .attr('stroke-width', 0.5)
          })     


        textLabel = svg.append('g').attr('class', 'charslabel')

        textLabel
          .selectAll('.character-label')
          .data(datapoints)
          .enter()
          .append('text')
          .attr('class', (d) => d.character)
          .classed('character-label', true)
          .text((d) => d.character)
          .attr('x', (d) => xPositionScale(d.x_order))
          .attr('y', (d) => yPositionScale(d.ratio))
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('fill', '#6B174F')
          // .raise()


        // Add axes for every svg
        // var xAxis = d3.axisBottom(xPositionScale).ticks(6)
        // .tickValues([1, 2, 3, 4, 5, 6])
        // .tickSize(-height)

        // svg
        //   .append('g')
        //   .attr('class', 'axis x-axis')
        //   .attr('transform', 'translate(0,' + height + ')')
        //   // .tickSize(-height)
        //   .call(xAxis)

        // var yAxis = d3.axisLeft(yPositionScale).ticks(6).tickSize(-width)

        // svg.append('g').attr('class', 'axis y-axis').call(yAxis).lower()
        // svg.selectAll('.domain').remove()

        // Add decade label for every svg
        svg
          .append('text')
          .text(d=> d.key)
          // .text(function(d) {
          //   if (d.key === '1950') {
          //     return '1930–1959'
          //   } else {
          //     return d.key + 's'
          //   
          // })
          .attr('class', 'annotations')
          .attr('x', width/2)
          .attr('y', yPositionScale(3))
          .attr('font-size', 13)
          .attr('font-weight', 'bold')
          .attr('fill', '#ED6B47')
          .attr('text-anchor', 'middle')
      })

  }
})()

