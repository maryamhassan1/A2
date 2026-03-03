(async function () {
  const width = 900;
  const height = 520;
  const margin = { top: 20, right: 170, bottom: 45, left: 70 };
  const selectedISO3 = new Set(["USA", "GBR", "DEU", "FRA", "ITA", "JPN"]);
  const baseline = 100;
  const aboveColor = "#2e8b57";
  const belowColor = "#c43d3d";
  const neutralColor = "#b8b8b8";
  const endYear = 2018;

  const svg = d3.select("#interactive-country-chart");
  const select = d3.select("#start-year-select");

  const raw = await d3.csv("data.csv");
  const yearCols = raw.columns.filter((column) => /^\d{4}$/.test(column)).map(Number);
  const availableStartYears = yearCols.filter((year) => year < endYear);
  const co2 = raw.filter(
    (row) => row.Indicator === "CO2 emissions" && selectedISO3.has(row.ISO3)
  );

  const totals = [];

  for (const row of co2) {
    for (const year of yearCols) {
      const parsedValue = +row[year];
      if (!Number.isFinite(parsedValue)) {
        continue;
      }

      totals.push({
        iso3: row.ISO3,
        country: row.Country,
        year,
        value: parsedValue,
      });
    }
  }

  const byKey = d3.rollup(
    totals,
    (values) => d3.sum(values, (entry) => entry.value),
    (entry) => entry.iso3,
    (entry) => entry.year
  );

  select
    .selectAll("option")
    .data(availableStartYears)
    .join("option")
    .attr("value", (year) => year)
    .property("selected", (year) => year === 2005)
    .text((year) => year);

  function getSegmentColor(value) {
    if (value > baseline) {
      return aboveColor;
    }
    if (value < baseline) {
      return belowColor;
    }
    return neutralColor;
  }

  function buildSegments(values) {
    const segments = [];

    for (let index = 0; index < values.length - 1; index += 1) {
      const start = values[index];
      const end = values[index + 1];
      const startDelta = start.index - baseline;
      const endDelta = end.index - baseline;

      if (startDelta === 0 || endDelta === 0 || startDelta * endDelta > 0) {
        segments.push({
          points: [start, end],
          color: getSegmentColor((start.index + end.index) / 2),
        });
        continue;
      }

      const t = (baseline - start.index) / (end.index - start.index);
      const crossing = {
        year: start.year + (end.year - start.year) * t,
        index: baseline,
      };

      segments.push({
        points: [start, crossing],
        color: getSegmentColor(start.index),
      });
      segments.push({
        points: [crossing, end],
        color: getSegmentColor(end.index),
      });
    }

    return segments;
  }

  function buildSeries(startYear) {
    const series = [];

    for (const [iso3, yearMap] of byKey) {
      const points = [];
      for (let year = startYear; year <= endYear; year += 1) {
        const value = yearMap.get(year);
        if (value == null) {
          continue;
        }

        points.push({ iso3, year, value });
      }

      const base = points.find((point) => point.year === startYear)?.value;
      if (!base || points.length < 2) {
        continue;
      }

      const indexedValues = points.map((point) => ({
        year: point.year,
        index: (point.value / base) * 100,
      }));

      series.push({
        iso3,
        values: indexedValues,
        lastIndex: indexedValues[indexedValues.length - 1].index,
      });
    }

    return series;
  }

  function render(startYear) {
    const series = buildSeries(startYear);
    const allPoints = series.flatMap((entry) => entry.values);

    svg.selectAll("*").remove();

    const x = d3
      .scaleLinear()
      .domain([startYear, endYear])
      .range([margin.left, width - margin.right]);

    const minIndex = d3.min(allPoints, (point) => point.index);
    const maxIndex = d3.max(allPoints, (point) => point.index);

    const y = d3
      .scaleLinear()
      .domain([Math.min(minIndex, baseline), Math.max(maxIndex, baseline)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(Math.min(7, endYear - startYear + 1)).tickFormat(d3.format("d")));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(8));

    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", 14)
      .attr("fill", "#111")
      .attr("font-weight", 600)
      .text(`Index (${startYear} = 100)`);

    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", y(baseline))
      .attr("y2", y(baseline))
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4")
      .attr("opacity", 0.55);

    svg
      .append("text")
      .attr("x", width - margin.right - 8)
      .attr("y", y(baseline) - 6)
      .attr("text-anchor", "end")
      .attr("fill", "#666")
      .attr("font-size", 11)
      .text(`${startYear} baseline`);

    const line = d3
      .line()
      .x((point) => x(point.year))
      .y((point) => y(point.index));

    const lineSegments = series.flatMap((entry) =>
      buildSegments(entry.values).map((segment) => ({
        iso3: entry.iso3,
        color: segment.color,
        points: segment.points,
      }))
    );

    svg
      .append("g")
      .selectAll("path")
      .data(lineSegments)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", (entry) => entry.color)
      .attr("stroke-width", 2.4)
      .attr("stroke-linecap", "round")
      .attr("opacity", 0.95)
      .attr("d", (entry) => line(entry.points));

    svg
      .append("g")
      .selectAll("text")
      .data(series)
      .join("text")
      .attr("x", x(endYear) + 6)
      .attr("y", (entry) => y(entry.values[entry.values.length - 1].index))
      .attr("dominant-baseline", "middle")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .attr("fill", (entry) => getSegmentColor(entry.lastIndex))
      .text((entry) => {
        const delta = entry.lastIndex - baseline;
        return `${entry.iso3} ${delta >= 0 ? "+" : ""}${d3.format(".1f")(delta)}%`;
      });
  }

  select.on("change", function () {
    render(+this.value);
  });

  render(2005);
})();
