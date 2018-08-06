import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
  formatPrice,
} from '../util';

export function Highlights({
  stdDeviation,
  avgPrice,
  proposedPrice,
}) {
  const stdDevMinus = avgPrice - stdDeviation;
  const stdDevPlus = avgPrice + stdDeviation;
  const proposedPriceStyle = proposedPrice ? { display: 'block' } : null;

  // TODO: The original implementation faded the proposed price in and
  // out as it was set/unset. We might want to do the same thing here.

  return (
    <div className="highlights-container row">
      <div className="price-block">
        <div className="row">
          <div className="standard-deviation-block">
            <h5 className="standard-deviation-title">
Std deviation -1
            </h5>
            <h5 className="sd-highlight">
              $
              {formatPrice(stdDevMinus)}
            </h5>
          </div>
          <div className="avg-price-block">
            <h5 className="avg-price-title">
Average
            </h5>
            <h5 className="avg-price-highlight">
              $
              {formatPrice(avgPrice)}
            </h5>
          </div>
          <div className="standard-deviation-block">
            <h5 className="standard-deviation-title">
Std deviation +1
            </h5>
            <h5 className="sd-highlight">
              $
              {formatPrice(stdDevPlus)}
            </h5>
          </div>
        </div>
      </div>
      <div className="proposed-price-block" style={proposedPriceStyle}>
        <h5 className="proposed-price-title">
Proposed price
        </h5>
        <h5 className="proposed-price-highlight">
          $
          {formatPrice(proposedPrice)}
        </h5>
      </div>
    </div>
  );
}

Highlights.propTypes = {
  stdDeviation: PropTypes.number.isRequired,
  avgPrice: PropTypes.number.isRequired,
  proposedPrice: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    stdDeviation: state.rates.data.first_standard_deviation,
    avgPrice: state.rates.data.average,
    proposedPrice: state['proposed-price'],
  };
}

export default connect(mapStateToProps)(Highlights);
