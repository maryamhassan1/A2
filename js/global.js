(async function () {
  const width = 900;
  const height = 480;
  const margin = { top: 20, right: 20, bottom: 45, left: 70 };

  const raw = await d3.csv("data.csv");
  const yearCols = raw.columns.filter((column) => /^\d{4}$/.test(column));
  const co2 = raw.filter((row) => row.Indicator === "CO2 emissions");

  const globalByYear = yearCols.map((year) => ({
    year: +year,
    value: d3.sum(co2, (row) => {
      const parsedValue = +row[year];
      return Number.isFinite(parsedValue) ? parsedValue : 0;
    }),
  }));

  const x = d3
    .scaleLinear()
    .domain(d3.extent(globalByYear, (point) => point.year))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(globalByYear, (point) => point.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const svg = d3.select("#global-chart");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("x", margin.left)
    .attr("y", 14)
    .attr("fill", "#111")
    .attr("font-weight", 600)
    .text("Millions of metric tons CO₂");

  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", height - 10)
    .attr("text-anchor", "end")
    .attr("fill", "#111")
    .text("Year");

  const line = d3
    .line()
    .x((point) => x(point.year))
    .y((point) => y(point.value));

  svg
    .append("path")
    .datum(globalByYear)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2.2)
    .attr("d", line);

  const last = globalByYear[globalByYear.length - 1];

  svg
    .append("circle")
    .attr("cx", x(last.year))
    .attr("cy", y(last.value))
    .attr("r", 4);

  svg
    .append("text")
    .attr("x", x(last.year) - 8)
    .attr("y", y(last.value) - 10)
    .attr("text-anchor", "end")
    .attr("fill", "#111")
    .attr("font-size", 12)
    .text(`2018: ${d3.format(",.0f")(last.value)}`);
})();
