/**
 * Volume satu chart dengan price tidak bagus, nanti bisa dibagi ke subcart dibawah
 */
import {
  scaleTime,
  scaleLinear,
  select
} from 'd3';
import {
  randomFinancial,
  extentTime,
  extentLinear,
  annotationSvgGridline,
  seriesSvgCandlestick,
  seriesSvgBar,
  seriesSvgMulti,
  chartCartesian
} from 'd3fc';
import dayjs from 'dayjs';

const bars = 100;
const dateGap = 10;

function addFutureGapDate(data, day) {
  let lastDate = data[bars - 1].date;

  for (let i = 1; i <= day; i++) {
    data.push({
      date: dayjs(lastDate).add(i, 'day').$d,
      open: null,
      high: null,
      low: null,
      close: null,
      volume: null
    });
  }

  return data;
}

const stream = randomFinancial().stream();
let data = addFutureGapDate(stream.take(bars), dateGap);

const xExtent = extentTime().accessors([d => d.date]);
const yExtent = extentLinear().accessors([d => d.high, d => d.low]);
// const volumeExtent = extentLinear().include([0])
//   .pad([0, 2])
//   .accessors([d => d.volume]);

// const volumeToPriceScale = scaleLinear()
//   .domain(volumeExtent(data))
//   .range(yExtent(data));

const gridlines = annotationSvgGridline();
const candlestick = seriesSvgCandlestick();
// const volume = seriesSvgBar()
//   .bandwidth(2)
//   .crossValue(d => d.date)
//   .mainValue(d => volumeToPriceScale(d.volume))
//   .decorate(sel =>
//     sel
//       .enter()
//       .classed("volume", true)
//       .attr("fill", d => (d.open > d.close ? "red" : "green"))
//   )
// const multi = seriesSvgMulti().series([gridlines, candlestick, volume]);
const multi = seriesSvgMulti().series([gridlines, candlestick]);

const chart = chartCartesian(scaleTime(), scaleLinear())
  .svgPlotArea(multi)
  .xDomain(xExtent(data))
  .yDomain(yExtent(data));

function renderChart() {
  let lastDate = data[bars + dateGap - 1].date;

  data[bars - 1] = stream.next();
  data.push({
    date: dayjs(lastDate).add(1, 'day').$d,
    open: null,
    high: null,
    low: null,
    close: null,
    volume: null
  });
  data.shift();

  chart.yDomain(yExtent(data)).xDomain(xExtent(data));

  select('#chart')
    .datum(data)
    .call(chart);
}

renderChart();
setInterval(renderChart, 1000);