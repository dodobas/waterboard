

// CHART TOOLTIP RENDER FUNCTIONS

const tooltips = {
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
export default {tooltips};
