import PaginationState from './PaginationState';
import {getPaginationBlockTemplate} from "../templates/wb.templates";
import {createDomObjectFromTemplate} from "../../templates.utils";
import createNumberPerPageDropdown from "../ui/NumberPerPageDropdown";

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
 * } TODO refactor - chaotic ...
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
        itemsPerPageOnChange,
        pagesToShow = 6,
        pageNumberDisplay = 'short'
    } = props;
    // parent dom object, pagination dom block will be appended to parent
    let _parent;
    let _paginationBlock;
    let _pageNumbersWrap;

    // init state handler
    let state = PaginationState({itemsCnt, itemsPerPage, pagesToShow, pageNumberDisplay});

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
        const fromCnt = ((state.currentPage - 1) * state.itemsPerPage) + 1;
        const toCntPage = state.currentPage * state.itemsPerPage;
        const toCnt = toCntPage > state.itemsCnt ? state.itemsCnt : toCntPage;

        const display = state.pageNumberDisplay === 'short' ?
            `${state.currentPage}/${state.pageCnt}`
            : `Page ${state.currentPage}/${state.pageCnt} - Showing ${fromCnt.toLocaleString()} to ${toCnt.toLocaleString()} of ${state.itemsCnt.toLocaleString()}`;

        _parent.querySelector('.page-nmbr').innerHTML = display;

        if (state.pages.length > 0) {

            _pageNumbersWrap.innerHTML = state.pages.map(nmbr => {
                let className = state.currentPage === nmbr ? 'current-active' : '';
                return `<li class="${className}"><a data-page-nmbr="${nmbr}" class="page-link" href="#">${nmbr}</a></li>`;
            }).join('');
        }

    };


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

        // Add pagination buttons to dom
        if (parent instanceof HTMLElement) {
            _parent = parent;
        } else {
            _parent = document.getElementById(`${parent}`);
        }

        _parent.appendChild(_paginationBlock);


        _pageNumbersWrap = _paginationBlock.querySelector('[data-pagination-pages="page-numbers-wrap"]');

        _pageNumbersWrap.addEventListener('click', function (e) {
            _setPage(e.target.dataset.pageNmbr);

            _updatePageNumber();

            pageOnChange.apply(null, [chartKey, _getPage()]);
        });

        // data-page-nmbr
        // Add items per page dropdown to pagination dom
        if (showItemsPerPage) {

            let _itemsOnChange = function (name, val) {

                _setOptions({
                    itemsPerPage: val
                });

                if (itemsPerPageOnChange instanceof Function) {
                    return itemsPerPageOnChange(name, val);
                }
                return _getPage();
            };


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

        // TODo update -delegate events
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
