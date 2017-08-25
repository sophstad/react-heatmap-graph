import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import PropTypes from 'prop-types';
import React from 'react';
import range from 'lodash.range';
import reduce from 'lodash.reduce';

const SQUARE_SIZE = 10;
const SECTION_LABEL_GUTTER_SIZE = 4;

class HeatmapGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      valueCache: this.getValueCache(props.values),
      horizontal: this.props.horizontal
    };
  }

  componentWillMount() {
    if (this.getSectionCount() > this.getMaxSectionLen()) {
      this.setState({
        horizontal: true
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      valueCache: this.getValueCache(nextProps.values),
    });
  }

  getSquareSizeWithGutter() {
    return SQUARE_SIZE + this.props.gutterSize;
  }

  getSectionLabelSize() {
    if (!this.props.showSectionLabels) {
      return 0;
    } else if (this.state.horizontal) {
      return SQUARE_SIZE + SECTION_LABEL_GUTTER_SIZE;
    }
    return 3 * (SQUARE_SIZE + SECTION_LABEL_GUTTER_SIZE);
  }

  getMaxSectionLen() {
    if (this.state.valueCache.length == 0) {
      return 0;
    }

    const longest = this.state.valueCache.reduce(function (a, b) { return a.length > b.length ? a : b; });
    return longest.length;
  }

  getTotalWidth() {
    return this.getGridWidth() + this.getSectionLabelSize();
  }

  getGridWidth() {
    return (this.getMaxSectionLen() * this.getSquareSizeWithGutter()) - this.props.gutterSize;
  }

  getHeight() {
    return this.getSectionCount() * this.getSquareSizeWithGutter();
  }

  getSectionCount() {
    return this.props.values.length;
  }

  getSectionWidth(index) {
    return this.props.values[index].tabs.length;
  }

  getValueCache(values) {
    let data = [];

    if (!values || values.length == 0) {
      return data;
    }

    values.forEach(section => {
      let sec = [];
      section.tabs.forEach(tab => {
        const obj = {
          section: section.section,
          title: this.props.titleForValue ? this.props.titleForValue(tab, section.section) : null,
          value: tab.value,
          url: tab.url ? tab.url : null,
          className: this.props.classForValue(tab, this.props.colorDistribution),
          tooltipDataAttrs: this.getTooltipDataAttrsForValue(tab)
        };
        sec.push(obj);
      });
      data.push(sec);
    });

    return data;
  }

  getValueForIndex(sectionIndex, pageIndex) {
    if (this.state.valueCache[sectionIndex][pageIndex]) {
      return this.state.valueCache[sectionIndex][pageIndex];
    }
    return null;
  }

  getClassNameForIndex(sectionIndex, pageIndex) {
    if (this.state.valueCache[sectionIndex][pageIndex]) {
      return this.state.valueCache[sectionIndex][pageIndex].className;
    }
    return this.props.classForValue(null, this.props.colorDistribution);
  }

  getTitleForIndex(sectionIndex, pageIndex) {
    if (this.state.valueCache[sectionIndex][pageIndex]) {
      return this.state.valueCache[sectionIndex][pageIndex].title;
    }
    return this.props.titleForValue ? this.props.titleForValue(null) : null;
  }

  getTooltipDataAttrsForIndex(sectionIndex, pageIndex) {
    if (this.state.valueCache[sectionIndex][pageIndex]) {
      return this.state.valueCache[sectionIndex][pageIndex].tooltipDataAttrs;
    }
    return this.getTooltipDataAttrsForValue({
      section: null,
      title: null,
      value: null
    });
  }

  getTooltipDataAttrsForValue(value) {
    const { tooltipDataAttrs } = this.props;

    if (typeof tooltipDataAttrs === 'function') {
      return tooltipDataAttrs(value);
    }
    return `${value.title}: ${value.value}`;
  }

  getTransformForSection(sectionIndex) {
    if (this.state.horizontal) {
      return `translate(${sectionIndex * this.getSquareSizeWithGutter()}, 0)`;
    }
    return `translate(0, ${sectionIndex * this.getSquareSizeWithGutter()})`;
  }

  getTransformForSectionLabels() {
    if (this.state.horizontal) {
      return null;
    }
    return `translate(${this.getGridWidth() + SECTION_LABEL_GUTTER_SIZE}, 0)`;
  }

  getTransformForAllSections() {
    if (this.state.horizontal) {
      return `translate(0, ${this.getSectionLabelSize()})`;
    }
    return null;
  }

  getViewBox() {
    // this is probably hairy
    if (this.state.horizontal) {
      return `0 0 ${this.getHeight()} ${this.getTotalWidth()}`;
    }
    return `0 0 ${this.getTotalWidth()} ${this.getHeight()}`;
  }

  getSquareCoordinates(dayIndex) {
    if (this.state.horizontal) {
      return [0, dayIndex * this.getSquareSizeWithGutter()];
    }
    return [dayIndex * this.getSquareSizeWithGutter(), 0];
  }

  getSectionLabelCoordinates(sectionIndex) {
    if (this.state.horizontal) {
      return [
        sectionIndex * this.getSquareSizeWithGutter(),
        this.getSectionLabelSize() - SECTION_LABEL_GUTTER_SIZE,
      ];
    }
    const verticalOffset = -2;
    return [
      0,
      ((sectionIndex + 1) * this.getSquareSizeWithGutter()) + verticalOffset,
    ];
  }

  handleClick(value, sectionIndex, pageIndex) {
    const obj = {
      value: value,
      sectionIndex: sectionIndex,
      pageIndex: pageIndex
    }
    if (this.props.onClick) {
      this.props.onClick(obj);
    }
  }

  renderSquare(sectionIndex, pageIndex) {
    const [x, y] = this.getSquareCoordinates(pageIndex);
    const key = `${sectionIndex}-${pageIndex}`;
    const tooltip = <Tooltip id="tooltip">{this.getTooltipDataAttrsForIndex(sectionIndex, pageIndex)}</Tooltip>;
    return (
      <OverlayTrigger
        overlay={tooltip} placement="top"
        delayShow={300} delayHide={150}
        key={key}
      >
        <rect
          className={this.getClassNameForIndex(sectionIndex, pageIndex)}
          height={SQUARE_SIZE}
          onClick={this.handleClick.bind(this, this.getValueForIndex(sectionIndex, pageIndex), sectionIndex, pageIndex)}
          title={this.getTitleForIndex(sectionIndex, pageIndex)}
          width={SQUARE_SIZE}
          x={x}
          y={y}
        />
      </OverlayTrigger>
    );
  }

  renderSection(sectionIndex) {      
    return (      
      <g
        transform={this.getTransformForSection(sectionIndex)}
        key={sectionIndex}
      >
        {range(this.getSectionWidth(sectionIndex)).map(pageIndex => this.renderSquare(sectionIndex, pageIndex))}
      </g>
    );
  }

  renderAllSections() {
    return range(this.getSectionCount()).map(sectionIndex => this.renderSection(sectionIndex));
  }

  renderSectionLabels() {
    if (!this.props.showSectionLabels) {
      return null;
    }
    const sectionRange = range(this.getSectionCount());
    return this.props.values.map((section, sectionIndex) => {
      const [x, y] = this.getSectionLabelCoordinates(sectionIndex);
      let label = section.section;
      if (label.length > 5) {
        label = label.substring(0, 5);
      }
      return(
        <text
          key={sectionIndex}
          x={x}
          y={y}
        >
          {label}
        </text>
      );
    });
  }

  render() {
    return (
      <svg
        className="heatmap"
        viewBox={this.getViewBox()}
      >
        <g transform={this.getTransformForSectionLabels()}>
          {this.renderSectionLabels()}
        </g>
        <g transform={this.getTransformForAllSections()}>
          {this.renderAllSections()}
        </g>
      </svg>
    );
  }
}

HeatmapGraph.propTypes = {
  values: PropTypes.arrayOf(
    PropTypes.shape({
      section: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      tabs: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          value: PropTypes.number.isRequired
        })
      ).isRequired
    }).isRequired
  ).isRequired,
  gutterSize: PropTypes.number,          // size of space between squares
  horizontal: PropTypes.bool,            // whether to orient horizontally or vertically
  showSectionLabels: PropTypes.bool,     // whether to show section labels
  tooltipDataAttrs: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),    // data attributes to add to square for setting 3rd party tooltips, e.g. { 'data-toggle': 'tooltip' } for bootstrap tooltips
  titleForValue: PropTypes.func,         // function which returns title text for value
  classForValue: PropTypes.func,         // function which returns html class for value
  colorDistribution: PropTypes.arrayOf(PropTypes.number),
  onClick: PropTypes.func                // callback function when a square is clicked
};

HeatmapGraph.defaultProps = {
  gutterSize: 1,
  horizontal: false,
  showSectionLabels: true,
  classForValue: value => (value ? 'color-filled' : 'color-empty')
};

export default HeatmapGraph;
