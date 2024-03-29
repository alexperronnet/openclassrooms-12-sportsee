import { useDimensions, useD3 } from '@/hooks'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import css from '@/components/dashboard/sessions/sessions.module.scss'

/**
 * Component that renders a line chart for the average duration of sessions.
 * @function Sessions
 * @param {Array} sessions - The array of sessions data.
 * @returns {JSX.Element} Returns a React element that displays the chart for the average duration of sessions.
 */
export const Sessions = ({ sessions }) => {
  const [parentReference, parentDimensions] = useDimensions()

  const { chartReference } = useD3(
    svg => {
      const { width, height } = parentDimensions
      const sizeRatio = percent => Math.round((percent / 100) * Math.min(width, height))

      const xScale = d3
        .scaleBand()
        .domain(sessions.map(({ day }) => day))
        .range([0, width])

      const yScale = d3
        .scaleLinear()
        .domain([
          d3.min(sessions, ({ sessionLength }) => sessionLength),
          d3.max(sessions, ({ sessionLength }) => sessionLength)
        ])
        .range([height / 3, 0])

      const line = d3
        .line()
        .x(({ day }) => xScale(day) + xScale.bandwidth() / 2)
        .y(({ sessionLength }) => yScale(sessionLength))
        .curve(d3.curveNatural)

      const xAxis = d3
        .axisBottom(xScale)
        .tickSize(0)
        .tickPadding(sizeRatio(5))
        .tickFormat(day => day.slice(0, 1).toUpperCase())

      // Set up the chart elements
      const chart = svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`)
      const cursorsGroup = chart.append('g')
      const chartGroup = chart.append('g').attr('transform', `translate(0, ${height / 3})`)
      const lineGroup = chartGroup.append('g')
      const pointsGroup = chartGroup.append('g')
      const tooltipsGroup = chartGroup.append('g')
      const chartAxis = chartGroup.append('g').attr('transform', `translate(0, ${height / 2})`)
      const gradient = chart.append('defs').append('linearGradient').attr('id', 'opacityGradient')

      // Create gradient
      gradient.append('stop').attr('offset', '10%').attr('stop-color', 'var(--line)').attr('stop-opacity', 0.1)
      gradient.append('stop').attr('offset', '100%').attr('stop-color', 'var(--line)').attr('stop-opacity', 1)

      // Create the line
      lineGroup
        .append('path')
        .datum(sessions)
        .attr('d', d => line(d))
        .attr('fill', 'none')
        .attr('stroke', 'url(#opacityGradient)')
        .attr('stroke-width', sizeRatio(1.25))
        .attr('stroke-linecap', 'round')
        .attr('stroke-dasharray', () => {
          const length = chartGroup.select('path').node().getTotalLength()
          return `${length} ${length}`
        })
        .attr('stroke-dashoffset', () => chartGroup.select('path').node().getTotalLength())
        .transition()
        .duration(750)
        .attr('stroke-dashoffset', 0)

      const points = pointsGroup
        .selectAll('circle')
        .data(sessions)
        .enter()
        .append('circle')
        .attr('cx', ({ day }) => xScale(day) + xScale.bandwidth() / 2)
        .attr('cy', ({ sessionLength }) => yScale(sessionLength))
        .attr('r', sizeRatio(1.5))
        .attr('fill', 'var(--line)')
        .attr('stroke', 'var(--line)')
        .attr('stroke-opacity', 0.2)
        .attr('stroke-width', sizeRatio(2.5))
        .attr('opacity', 0)

      const tooltip = tooltipsGroup
        .selectAll('foreignObject')
        .data(sessions)
        .enter()
        .append('foreignObject')
        .attr('class', css.tooltip)
        .attr('x', d => {
          const w = sizeRatio(20)
          const x = xScale(d.day) + xScale.bandwidth() / 1.5
          return x + w > width ? width - w : x
        })
        .attr('y', d => yScale(d.sessionLength) - sizeRatio(12))
        .append('xhtml:span')
        .style('font-size', `${sizeRatio(4)}px`)
        .text(d => `${d.sessionLength} min`)
        .style('opacity', 0)

      // Create the axis
      chartAxis
        .call(xAxis)
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick text').attr('fill', 'var(--legend)').style('font-size', sizeRatio(5)))

      const cursorRects = cursorsGroup
        .selectAll('rect')
        .data(sessions)
        .enter()
        .append('rect')
        .attr('height', height)
        .attr('width', xScale.bandwidth())
        .attr('x', d => xScale(d.day))
        .attr('fill', 'var(--cursor)')
        .attr('opacity', 0)

      chart.on('mousemove', event => {
        const [x] = d3.pointer(event)
        const index = Math.floor(x / xScale.bandwidth())

        cursorRects.attr('opacity', (_, index_) => (index_ >= index ? 1 : 0))
        points.attr('opacity', (_, index_) => (index_ === index ? 1 : 0))
        tooltip.style('opacity', (_, index_) => (index_ === index ? 1 : 0))
      })

      chart.on('mouseout', () => {
        cursorRects.attr('opacity', 0)
        points.attr('opacity', 0)
        tooltip.style('opacity', 0)
      })
    },
    [parentDimensions, sessions]
  )

  return (
    <article className={css.sessions}>
      <h2 className={css.title}>Durée moyenne des sessions</h2>
      <div className={css.chartContainer} ref={parentReference}>
        <svg className={css.chart} ref={chartReference} />
      </div>
    </article>
  )
}

Sessions.propTypes = {
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      sessionLength: PropTypes.number.isRequired
    })
  ).isRequired
}
