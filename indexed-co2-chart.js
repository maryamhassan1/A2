(async function () {
  const width = 900;
  const height = 520;
  const margin = { top: 20, right: 140, bottom: 45, left: 70 };
  const selectedISO3 = new Set(["USA", "GBR", "DEU", "FRA", "ITA", "JPN"]);

  const raw = await d3.csv("data.csv");
  const yearCols = raw.columns.filter((column) => /^\d{4}$/.test(column)).map(Number);
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

  const series = [];

  for (const [iso3, yearMap] of byKey) {
    const points = [];
    for (let year = 2005; year <= 2018; year += 1) {
      const value = yearMap.get(year);
      if (value == null) {
        continue;
      }

      points.push({ iso3, year, value });
    }

    const base = points.find((point) => point.year === 2005)?.value;
    if (!base) {
      continue;
    }

    series.push({
      iso3,
      values: points.map((point) => ({
        year: point.year,
        index: (point.value / base) * 100,
      })),
    });
  }

  const allPoints = series.flatMap((entry) => entry.values);

  const x = d3.scaleLinear().domain([2005, 2018]).range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(allPoints, (point) => point.index))
    .nice()
    .range([height - margin.bottom, margin.top]);

  const svg = d3.select("#indexed-chart");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d")));

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
    .text("Index (2005 = 100)");

  const line = d3
    .line()
    .x((point) => x(point.year))
    .y((point) => y(point.index));

  svg
    .append("g")
    .selectAll("path")
    .data(series)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.6)
    .attr("opacity", 0.9)
    .attr("d", (entry) => line(entry.values));

  svg
    .append("g")
    .selectAll("text")
    .data(series)
    .join("text")
    .attr("x", x(2018) + 6)
    .attr("y", (entry) => {
      const last = entry.values[entry.values.length - 1];
      return y(last.index);
    })
    .attr("dominant-baseline", "middle")
    .attr("font-size", 12)
    .text((entry) => entry.iso3);
})();
