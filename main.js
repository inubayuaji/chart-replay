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

const bars = 150;
const dateGap = 3;

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
const volumeExtent = extentLinear()
  .include([0])
  .pad([0, 2])
  .accessors([d => d.volume]);

const gridlines = annotationSvgGridline();
const candlestick = seriesSvgCandlestick();
const volume = seriesSvgBar()
  .bandwidth(2)
  .crossValue(d => d.date)
  .mainValue(d => d.volume)
  .decorate(sel =>
    sel
      .enter()
      .classed("volume", true)
      .attr("fill", d => (d.open > d.close ? "red" : "green")) // warnanya salah tidak mau bergeser
  )

const multiMainChart = seriesSvgMulti().series([gridlines, candlestick]);
const multiVolumeChart = seriesSvgMulti().series([volume]);

const mainChart = chartCartesian(scaleTime(), scaleLinear())
  .svgPlotArea(multiMainChart)
  .xDomain(xExtent(data))
  .yDomain(yExtent(data));
const volumeChart = chartCartesian(scaleTime(), scaleLinear())
  .svgPlotArea(multiVolumeChart)
  .xDomain(xExtent(data))
  .yDomain(volumeExtent(data));

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

  mainChart.xDomain(xExtent(data)).yDomain(yExtent(data));
  volumeChart.xDomain(xExtent(data)).yDomain(volumeExtent(data));

  select('#main')
    .datum(data)
    .call(mainChart);

  select('#volume')
    .datum(data)
    .call(volumeChart);
}

renderChart();
setInterval(renderChart, 1000);