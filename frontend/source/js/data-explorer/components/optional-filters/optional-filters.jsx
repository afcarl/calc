import React, { Fragment } from 'react';

import BusinessSize from '../business-size';
import ContractYear from '../contract-year';
import EducationLevel from '../education-level';
import Experience from '../experience';
import Schedule from '../schedule';
import Site from '../site';

const OptionalFilters = () => (
  <Fragment>
    <EducationLevel />
    <Experience />
    <Site />
    <BusinessSize />
    <Schedule />
    <ContractYear />
  </Fragment>
);

export default OptionalFilters;
