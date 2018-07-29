import PaginationState from './PaginationState';
import {_paginationBlockRenderFn} from './utils';

/**
 * Data Pagination Handler
 * Handles indexes, counts and pagination block render
 * @param itemsCnt
 * @param chartKey
 * @param parentId
 * @param itemsPerPage
 * @param callback
 * @returns {{
 *    nextPage: (function(): *),
 *    previousPage: (function(): *),
 *    getPage: (
 *        function(): (*|{firstIndex, lastIndex, currentPage, itemsPerPage, pageCnt})
 *    ),
 *    setOptions: (
 *        function(*=): (*|{firstIndex, lastIndex, currentPage, itemsPerPage, pageCnt})
 *    ),
 *    renderDom: renderDom}
 * }
 */
export default function pagination ({
    itemsCnt, chartKey, parentId, itemsPerPage = 10, callback
}) {

    // parent dom object, pagination dom block will be appended to parent
    let _parent;

    // init state handler
    let state = PaginationState({itemsCnt, chartKey, parentId, itemsPerPage});

    // Set current page, returns current page if new page outside bounds
    const _setPage = (newPage) => state.setPage(newPage) ? state.getPage() :  _samePage();

    // Add samePage: true to getPage result
    const _samePage = () => Object.assign({},  state.getPage(), {samePage: true});

    // Check if next page exists
    const _nextPageExist = () => (state.next() <= state.pageCnt && state.next() >= 1);

    // Check if previous page exists
    const _previousPageExist = () => (1 <= state.previous()
        && state.previous() <= state.currentPage
        && state.previous() <= state.pageCnt
    );

    // Go to next page
    const _nextPage = () => _nextPageExist() ? _setPage(state.next()) : _samePage();

    // Go to previous page
    const _previousPage = () =>
        _previousPageExist() ? _setPage(state.previous()) : _samePage();

    // DOM

    // update current page number in pagination buttons block
    const _updatePageNumber = () => _parent.querySelector('.page-nmbr').innerHTML =
        `${state.currentPage}/${state.pageCnt}`;

    function renderDom () {

        // create pagination buttons block

        let _paginationBlock = _paginationBlockRenderFn();



        // Add pagination buttons to dom

        _parent = document.getElementById(parentId);
        _parent.appendChild(_paginationBlock);
_updatePageNumber();
        // Add button click events

        const buttons = _paginationBlock.querySelectorAll('[data-pagination-button]');
        const buttonsCnt = (buttons || []).length;

        if (!(callback instanceof Function) || buttonsCnt < 1) {
            return;
        }

        let page, i = 0;

        // Add next / previous pagination button events

        for (i; i < buttonsCnt; i += 1) {
            buttons[i].addEventListener('click', function () {
                page = this.dataset.paginationButton === 'next' ?
                    _nextPage() : _previousPage();

                if (page.samePage === true) {
                    return;
                }
                _updatePageNumber();

                callback.apply(null, [chartKey, page]);

            });
        }

    }

    return {
        nextPage: _nextPage,
        previousPage: _previousPage,
        getPage:  function () {return state.getPage()},
        setOptions: function (options) {
            state.setOptions(options);

            _updatePageNumber();

            return  state.getPage();
        },
        renderDom: renderDom
    }
}
