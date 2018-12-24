import DashboardFilter from './components/filter/dashboard.filter.js';
import templates from './components/templates/wb.templates';

import utils from './utils';

import * as WbMap from './components/map';
import BeneficiariesChart from './components/charts/beneficiaries';
import SchemeTypeChart from './components/charts/schemeType';
import api from './api/api';

import Pagination from './components/pagination';
import selectizeUtils from './components/selectize';

import form from './components/form';
import WbDataTable from './components/datatable';
import Modals from './components/modal';
import SimpleNotification from './components/notifications'

import WbInit from './components/pages';

export {
    WbInit,
    SimpleNotification,
    Modals,
    WbDataTable,
    form,
    DashboardFilter,
    templates,
    utils,
    api,
    WbMap,
    BeneficiariesChart,
    SchemeTypeChart,
    Pagination,
    selectizeUtils
};
