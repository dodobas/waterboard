import PaginationState from './PaginationState';
import {getPaginationBlockTemplate} from "../templates/wb.templates";
import {createDomObjectFromTemplate} from "../../templates.utils";
import createNumberPerPageDropdown from "../ui/NumberPerPageDropdown";

//
// export function calculatePaginationNumbersForDom(page, maxPageCnt) {
//
//     let _page = parseInt(page);
//
//     let offset = 6;
//
//     let perSide = offset / 2;
//
//
//     let _first, _last;
//
//
//     if (maxPageCnt <= offset) {
//         _first = 1;
//         _last = maxPageCnt;
//     } else {
//
//
//         let firstIx = _page - perSide;
//         let lastIx = _page + perSide;
//
//         //_first = firstIx <= 0 ? 1 : firstIx;
//         if (firstIx <= 0) {
//             _first = 1;
//             _last = offset;
//
//
//         } else {
//             _first = firstIx;
//             _last = firstIx + offset;
//         }
//
//         if (lastIx > maxPageCnt) {
//             _last = maxPageCnt;
//         }
//     }
//
//     let _arr = [];
//     for (_first; _first <= _last; _first += 1) {
//         _arr[_arr.length] = _first
//     }
//
//     return _arr;
//     // return {
//     //     pageNumbers: _arr,
//     //     current: _page
//     // }
// }


/**
 * Data Pagination Handler
 * Handles indexes, counts and pagination block render
 * @param itemsCnt
 * @param chartKey
 * @param parentId
 * @param itemsPerPage
 * @param pageOnChange
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
export default function pagination(props) {

    const {
        itemsCnt = 0,
        chartKey,
        parent,
        itemsPerPage = 10,
        pageOnChange,
        renderOnInit = true,
        showItemsPerPage = false,
        itemsPerPageParent,
        itemsPerPageKey = 'limit',
        itemsPerPageOnChange
    } = props;
    // parent dom object, pagination dom block will be appended to parent
    let _parent;
    let _paginationBlock;
    let _pageNumbersWrap;

    // init state handler
    let state = PaginationState({itemsCnt, itemsPerPage});

    // Set current page, returns current page if new page outside bounds
    const _setPage = (newPage) => state.setPage(newPage) ? state.getPage() : _samePage();

    // Add samePage: true to getPage result
    const _samePage = () => Object.assign({}, state.getPage(), {samePage: true});

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

    const _getPage = () => state.getPage();

    // DOM

    // update current page number in pagination buttons block
    const _updatePageNumber = () => {
        _parent.querySelector('.page-nmbr').innerHTML = `${state.currentPage}/${state.pageCnt}`;

        if (state.pages.length > 0) {
            _pageNumbersWrap.innerHTML = state.pages.map( nmbr => `<li>${nmbr}</li>`).join('');
        }

    };

    // const _updatePageNumbers = () => {
    //     _paginationBlock.querySelector('.page-number');
    // }


    const _setOptions = (options) => {
        state.setOptions(options);

        _updatePageNumber();

        return state.getPage();
    };

    function renderDom() {

        // create pagination buttons block

        _paginationBlock = createDomObjectFromTemplate(
            getPaginationBlockTemplate()
        );

        _pageNumbersWrap = _paginationBlock.querySelector('[data-pagination-pages="page-numbers-wrap"]');

        // let _paginationPageBlock = _paginationBlock.querySelector('.page-number');

        console.log('_paginationBlock', _paginationBlock);
        console.log('_parent', _parent);
        // Add pagination buttons to dom
        if (parent instanceof HTMLElement) {
            _parent = parent;
        } else {
            _parent = document.getElementById(`${parent}`);
        }

        _parent.appendChild(_paginationBlock);

        // Add items per page dropdown to pagination dom
        if (showItemsPerPage) {

            let _itemsOnChange;

            if (itemsPerPageOnChange instanceof Function) {
                _itemsOnChange = function (name, val) {

                    _setOptions({
                        itemsPerPage: val
                    });

                    return itemsPerPageOnChange(name, val);
                }
            } else {
                _itemsOnChange = function (name, val) {

                    _setOptions({
                        itemsPerPage: val
                    });

                    return _getPage();
                }
            }


            let _itemsPerPageBlock = createNumberPerPageDropdown({
                name: `${itemsPerPageKey}`,
                onChange: _itemsOnChange
            });

            //wb-table-events-toolbar
            if (itemsPerPageParent instanceof HTMLElement) {
                itemsPerPageParent.appendChild(_itemsPerPageBlock);
            }

        }

        _updatePageNumber();
        // Add button click events

        const buttons = _paginationBlock.querySelectorAll('[data-pagination-button]');
        const buttonsCnt = (buttons || []).length;

        if (!(pageOnChange instanceof Function) || buttonsCnt < 1) {
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

                pageOnChange.apply(null, [chartKey, page]);

            });
        }

    } // render end

    if (renderOnInit === true) {
        renderDom();
    }
    return {
        nextPage: _nextPage,
        previousPage: _previousPage,
        getPage: function () {
            return state.getPage()
        },
        setOptions: _setOptions,
        renderDom: renderDom
    }
}
