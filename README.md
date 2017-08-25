# React Calendar Heatmap

A heatmap graph component built on SVG, based on [`react-calendar-heatmap`](http://patientslikeme.github.io/react-calendar-heatmap/). It doesn't use a calendar, but instead an array of nested objects.

Expected structure:

```
[
  {
    section: "Section 1",
    tabs: [
      {
        title: "First tab title",
        value: 21
      },
      // More tabs...
    ]
  },
  // More sections...
]
```