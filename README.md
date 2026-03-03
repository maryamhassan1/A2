# CSC316 Assignment 2: Critical Data Zine

## Project Overview

This project uses the IMF Climate Change Indicators dataset to present two opposing views of the statement:

**"Carbon emissions are going down."**

The two visualizations are designed to support different sides of that statement:

- The **global** chart argues against the statement by showing that total global CO2 emissions continue to rise over time.
- The **by-country** chart argues in favor of the statement by focusing on a selected group of major economies whose emissions trends look flatter or lower relative to a 2005 baseline.

Together, the two charts show how framing, filtering, scaling, and annotation can lead a viewer toward different conclusions from the same dataset.

## Visualization 1: Global

### What the graph shows

The global visualization sums CO2 emissions across all countries and industries in the dataset for each year. It presents the full aggregate trend, which rises over time and supports the argument that carbon emissions are not going down overall.

### Design decisions

1. **Use total global emissions rather than selected subsets**
   This chart aggregates all available country and industry values into a single yearly total. That choice supports the "emissions are rising" message because it foregrounds the broad global pattern rather than smaller exceptions or regional declines.

2. **Use a simple single black line with minimal distractions**
   The chart uses one bold line, standard axes, and very little color. This makes the rising trend feel direct and authoritative, and reduces the chance that viewers focus on side details instead of the overall upward movement.

3. **Annotate the final year to emphasize the latest high point**
   The endpoint marker and the `2018` label help anchor the viewer on the most recent value. This strengthens the sense that the trend has culminated in a high current level rather than inviting closer attention to smaller fluctuations earlier in the series.

## Visualization 2: By Country

### What the graph shows

The by-country visualization filters to six major economies: `USA`, `GBR`, `DEU`, `FRA`, `ITA`, and `JPN`. It indexes each country to `2005 = 100`, which makes it easier to compare relative change rather than absolute emissions. This framing supports the argument that carbon emissions are going down, at least in these selected countries.

### Design decisions

1. **Filter to selected countries with more favorable trends**
   Instead of showing all countries, the chart only includes a set of major economies where indexed emissions tend to level off or decline after 2005. This makes the proposition appear more plausible because the chosen cases visually reinforce it.

2. **Index every line to `2005 = 100`**
   Converting each country to a common baseline removes differences in absolute scale and shifts attention to direction of change. That makes cross-country declines easier to see and supports the argument that emissions are going down, even though this hides how large each country’s emissions are in absolute terms.

3. **Use color and endpoint labels to reinforce improvement**
   The subtle `100` baseline, green segments above the line, red segments below it, and end labels with percent change all guide interpretation. These choices make it easy to read who ended above or below the baseline and encourage viewers to focus on the amount of decrease or increase at the end of the series.

## Files

- [index.html](/Users/milabhaloo/Desktop/year4/Semester%202/CSC316/A2/index.html): main page showing both visualizations
- [js/global.js](/Users/milabhaloo/Desktop/year4/Semester%202/CSC316/A2/js/global.js): global aggregate chart
- [js/by-country.js](/Users/milabhaloo/Desktop/year4/Semester%202/CSC316/A2/js/by-country.js): indexed selected-country chart
- `data.csv`: source dataset used by both charts

## Run

Open the project with a local web server so the CSV can load correctly. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
