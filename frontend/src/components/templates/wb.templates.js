// TODO review tempalte handling / locations. are there any reusable templates?
export const getFormTemplate = (data, title = '') => `<div class="panel panel-primary">
      <div class="panel-heading panel-heading-without-padding">
        <h4> ${title}
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
      </h4>
    </div>
    <div class="panel-body" >
      ${data}
    </div>
  </div>
`;

export  const getOverlayTemplate = () => `<div id="wb-overlay" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="wb-overlay-spinner">
        <i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
        <span class="sr-only">Loading...</span>
    </div>
</div>`;


/**
 * Pagination html render function
 * Renders previous and next buttons, adds page info
 * @returns {string}
 */
export const getPaginationBlockTemplate = () => `<div class="wb-pagination-block">
    <button data-pagination-button="previous" class="btn btn-chart-pag btn-xs">
        <i class="fa fa-chevron-left" aria-hidden="true"></i>
    </button>
    <button data-pagination-button="next" class="btn btn-chart-pag btn-xs">
        <i class="fa fa-chevron-right" aria-hidden="true"></i>
    </button>
    <div class="page-nmbr"></div>
</div>`;

/**
 * Template string used to generate pie and bar chart html blocks
 * @param parentId chart identifier
 * @returns {string}
 */
export const getChartBlockTemplate = ({parentId}) => `<div class="wb-chart-block-wrap">
        <div class="wb-chart-block">
          <div id="${parentId}" class="wb-chart-wrap"></div>
        </div>
      </div>`;

// CHART TOOLTIP RENDER FUNCTIONS

export const tooltips = {
    tabiya: (d) => `<div class="tooltip-content">
            <span>Count: ${d.cnt}</span>
            <span>Beneficiaries:  ${d.beneficiaries}</span>
        </div>`,
    fencing: (d) => `<div class="tooltip-content">
            <span>Count: ${d.cnt}</span>
        </div>`,
    fundedBy: (d) => `<div class="tooltip-content">
            <span>Count: ${d.cnt}</span>
        </div>`,
    waterCommitee: (d) => `<div class="tooltip-content">
            <span>Count: ${d.cnt}</span>
        </div>`,
    rangeChart: (d) => `<div class="tooltip-content">
            <span>Count: ${d.cnt} </span>
            <span>Min: ${d.min} </span>
            <span>Max: ${d.max} </span>
        </div>`
};

export default {
    tooltips,
    getFormTemplate,
    getOverlayTemplate,
    getPaginationBlockTemplate
};
