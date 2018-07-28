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
 *    getPage: (function(): (*|{firstIndex, lastIndex, currentPage, itemsPerPage, pageCnt})),
 *    setOptions: (function(*=): (*|{firstIndex, lastIndex, currentPage, itemsPerPage, pageCnt})),
 *    renderDom: renderDom}
 * }
 */
export default function pagination ({itemsCnt, chartKey, parentId, itemsPerPage = 10, callback}) {

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
    const _previousPageExist = () => (1 <= state.previous() && state.previous() <= state.currentPage && state.previous() <= state.pageCnt);

    // Go to next page
    const _nextPage = () => _nextPageExist() ? _setPage(state.next()) : _samePage();

    // Go to previous page
    const _previousPage = () => _previousPageExist() ? _setPage(state.previous()) : _samePage();

    // DOM

    const _updatePageNumber = () => _parent.querySelector('.page-nmbr').innerHTML = state.currentPage + '/' + state.pageCnt;

    function renderDom () {
        let _paginationBlock = _paginationBlockRenderFn({
            pageNumberInfo: state.currentPage + '/' + state.pageCnt
        });

        _parent = document.getElementById(parentId);
        _parent.appendChild(_paginationBlock);


        const btns = _paginationBlock.querySelectorAll('[data-pagination-button]');

        if (!(callback instanceof Function) || (btns || []).length === -1) {
            return;
        }

        let i = 0, btnsCnt = btns.length;

        // Add next / previous pagination button events

        for (i; i < btnsCnt; i += 1) {
            btns[i].addEventListener('click', function () {
                var page = this.dataset.paginationButton === 'next' ? _nextPage() : _previousPage();

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
