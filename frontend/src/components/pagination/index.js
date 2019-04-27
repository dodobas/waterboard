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
export default function pagination(props) {

    const {
        itemsCnt = 0,
        chartKey,
        parent,
        itemsPerPage = 10,
        callback,
        renderOnInit = true,
        showNumberPerPage = false,
        numberPerPageParent,
        numberPerPageName = 'limit',
        numberPerPageOnChange
    } = props;
 console.log('pagination OPTIONS', props);
    // parent dom object, pagination dom block will be appended to parent
    let _parent;

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

    // DOM

    // update current page number in pagination buttons block
    const _updatePageNumber = () => _parent.querySelector('.page-nmbr').innerHTML =
        `${state.currentPage}/${state.pageCnt}`;

    const _setOptions = (options) => {
        state.setOptions(options);

        _updatePageNumber();

        return state.getPage();
    };

    function renderDom() {

        // create pagination buttons block

        let _paginationBlock = createDomObjectFromTemplate(
            getPaginationBlockTemplate()
        );

        console.log('_paginationBlock', _paginationBlock);
        console.log('_parent', _parent);
        // Add pagination buttons to dom
        if (parent instanceof HTMLElement) {
            _parent = parent;
        } else {
            _parent = document.getElementById(`${parent}`);
        }

        _parent.appendChild(_paginationBlock);


        // Add number per page dropdown to pagination dom
        let _numberPerPageBlock;
        if (showNumberPerPage) {

            _numberPerPageBlock = createNumberPerPageDropdown({
                name: `${numberPerPageName}`,
                onChange: function (name, val) {

                    _setOptions({
                        numberPerPage: val
                    });
                    numberPerPageOnChange(name, val);
                }
            });

            console.log('==========', _numberPerPageBlock);
            //wb-table-events-toolbar
            if (numberPerPageParent  instanceof HTMLElement) {
                numberPerPageParent.appendChild(_numberPerPageBlock);
            }

        }


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
