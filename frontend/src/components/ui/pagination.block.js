/**
 * Pagination html render function
 * Renders previous and next buttons, adds page info
 * @returns {HTMLDivElement}
 * @private
 */
export const _paginationBlockRenderFn = () => {
    const _paginationBlock = document.createElement('div');

    _paginationBlock.setAttribute('class', 'wb-pagination-block');

    _paginationBlock.innerHTML = `
        <button data-pagination-button="previous" class="btn btn-chart-pag btn-xs">
            <i class="fa fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button data-pagination-button="next" class="btn btn-chart-pag btn-xs">
            <i class="fa fa-chevron-right" aria-hidden="true"></i>
        </button>
        <div class="page-nmbr"></div>`;

    return _paginationBlock;
};
