// import base from './base.js';
// import {barChartHorizontal} from './chart.horizontalbar.js';
import DashboardFilter from './dashboard.filter.js';
import templates from './wb.templates';

import utils from './utils';
// {wbMap, createDashBoardMarker, createFeatureByUUidMarker}
import * as WbMap from './components/map';
import BeneficiariesChart from './components/Charts/beneficiaries';
import api from './api';

import Pagination from './components/pagination';
import selectizeUtils from './components/selectize';

import form from './components/form';
// import {
//     createDashBoardMarker,
//     createFeatureByUUidMarker
// } from "./components/map/mapUtils";
// import wbMap from "./components/map/WbMap";
// export {base, barChartHorizontal, DashBoardFilter};
export {form, DashboardFilter, templates, utils, api, WbMap, BeneficiariesChart, Pagination, selectizeUtils};
