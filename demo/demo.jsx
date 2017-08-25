import React from 'react';
import ReactDOM from 'react-dom';
import range from 'lodash.range';
import CalendarHeatmap from '../src';

import { data } from '../data.js';

const today = new Date();

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getData() {

  return data;
}

function githubClassForValue(value) {
  if (!value) {
    return 'color-empty';
  }
  let color = null;

  if (value.value < 60) {
    color = '0';
  } else if (value.value < 120) {
    color = '1';
  } else if (value.value < 180) {
    color = '2';
  } else if (value.value < 240) {
    color = '3';
  } else {
    color = '4';
  }
  return `color-github-${color}`;
}

function gitlabClassForValue(value) {
  if (!value) {
    return 'color-empty';
  }
  return `color-gitlab-${value.value}`;
}

function customTitleForValue(value, chapter) {
  return value ? `${chapter} - "${value.title}" (${value.type}); ${value.value} sec` : null;
}

function customOnClick(value) {
  if (value) {
    alert(`Clicked on ${value.title}`);
  }
}

const customTooltipDataAttrs = { 'data-toggle': 'tooltip' };
const randomValues = getData();

const githubURL = "https://github.com/patientslikeme/react-calendar-heatmap";

const DemoItem = (props) => (
  <div className="row m-b-3">
    <div className="col-xs-12 col-md-6 offset-md-3">
      <p><code>{props.name}</code><small className="text-muted m-l-1">{props.example ? `e.g. ${props.example}` : null}</small></p>
      <p>{props.description}</p>
      <div className="row">
        <div className="col-xs-6 offset-xs-3">
          {props.children}
        </div>
      </div>
    </div>
  </div>
);

class Demo extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="row m-y-3">
          <div className="col-xs-12">
            <div className="text-xs-center">
              <h1 className="m-b-2">{COMPONENT_NAME}</h1>
              <p>{COMPONENT_DESCRIPTION}</p>
            </div>
          </div>
        </div>

        <div className="row m-b-3">
          <div className="col-xs-12 col-md-6">
            <CalendarHeatmap
              values={randomValues}
              classForValue={githubClassForValue}
              titleForValue={customTitleForValue}
              tooltipDataAttrs={customTooltipDataAttrs}
              onClick={customOnClick}
            />
          </div>
        </div>

        <div className="text-xs-center m-y-3">
          <p>Install with npm:</p>
          <p className="m-b-3"><code>npm install {COMPONENT_NAME}</code></p>
          <a className="btn btn-info btn-lg" href={githubURL}>View project on Github</a>
        </div>

        <hr />
        <h2 className="text-xs-center m-y-3">Props</h2>

        <DemoItem
          name="values"
          example="[{ date: '2016-01-01', count: 6 }]"
          description="Required array of objects which each have a date property, which can be a Date object, parseable string, or millisecond timestamp."
        >
        </DemoItem>

        <DemoItem
          name="numDays"
          example="200"
          description="Time span in days."
        >
        </DemoItem>

        <DemoItem
          name="endDate"
          example="new Date()"
          description="End of date range - a Date object, parseable string, or millisecond timestamp."
        >
        </DemoItem>

        <DemoItem
          name="onClick"
          example="(value) => { alert(value) }"
          description="Callback to invoke when a square is clicked."
        >
        </DemoItem>

        <DemoItem
          name="titleForValue"
          example="(value) => `Date is ${value.date}`"
          description="Function to determine each square's title attribute, for generating 3rd party hover tooltips (may also need to configure tooltipDataAttrs)."
        >
        </DemoItem>

        <DemoItem
          name="tooltipDataAttrs"
          example="{ 'data-toggle': 'tooltip' } or (value) => ({ 'data-tooltip': `Tooltip: ${value}` })"
          description="Sets data attributes for all squares, for generating 3rd party hover tooltips (this demo uses bootstrap tooltips)."
        >
        </DemoItem>

        <DemoItem
          name="classForValue"
          example="(value) => (value.count > 0 ? 'blue' : 'white')"
          description="Callback for determining CSS class to apply to each value."
        >
        </DemoItem>

        <hr />
        <div className="text-xs-center m-y-3">
          <a className="btn btn-info btn-lg" href={githubURL}>View project on Github</a>
        </div>
      </div>
    );
  }
}

ReactDOM.render(React.createElement(Demo), document.getElementById('demo'));
