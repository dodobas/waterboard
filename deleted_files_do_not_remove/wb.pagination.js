// returns array indexes for slicing
// data array starts from 0, pages from 1
/**
 * Pagination html render function
 * Renders previous and next buttons, adds page info
 * @param pageNumberInfo
 * @returns {HTMLDivElement}
 * @private
 */
const _paginationBlockRenderFn = ({pageNumberInfo = ''}) => {
    const _paginationBlock = document.createElement('div');

    _paginationBlock.setAttribute('class', 'wb-pagination-block');

    _paginationBlock.innerHTML = `<div>
        <button data-pagination-button="previous" class="btn btn-chart-pag btn-xs">
            <i class="fa fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button data-pagination-button="next" class="btn btn-chart-pag btn-xs">
            <i class="fa fa-chevron-right" aria-hidden="true"></i>
        </button>
        <div class="page-nmbr">
          ${pageNumberInfo}
        </div>
    </div>`;

    return _paginationBlock;
};

function PaginationState ({itemsCnt, chartKey, parentId, itemsPerPage = 10}) {

    return {
        // current page
        currentPage: 1,
        // items per page
        itemsPerPage,
        // pagination items count - data length
        itemsCnt,
        // pagination pages count
        pageCnt: Math.ceil((itemsCnt / itemsPerPage)),
        // Get next page number, can be null or negative
        next: function () {
            return this.currentPage + 1;
        },
        // Get previous page number, can be null or negative
        previous: function () {
            return this.currentPage - 1;
        },
        // Calculate first pagination data index
        firstIndex: function () {
            return this.currentPage * this.itemsPerPage - this.itemsPerPage
        },
        // Calculate last pagination data index
        lastIndex: function () {
            return this.currentPage * this.itemsPerPage;
        },
        // get current state for current page
        getPage: function () {
            console.log(this);
            return {
                firstIndex: this.firstIndex(),
                lastIndex: this.lastIndex(),
                currentPage: this.currentPage,
                itemsPerPage: this.itemsPerPage,
                pageCnt: this.pageCnt
            }
        },
        setPage: function (newPage) {
            if (1 <= newPage && newPage <= this.pageCnt) {
                this.currentPage = newPage;
                return true;
            }
            return false;
        },
        // calculate page count based on items per page and data length
        calcPageCount: function () {
            this.pageCnt = Math.ceil(this.itemsCnt / this.itemsPerPage);
        },
        // set pagination options - data length, current page
        setOptions: function (options) {
            const {itemsCnt, currentPage} = options;

            if (itemsCnt !== undefined) {

                this.itemsCnt = itemsCnt;
                this.currentPage = currentPage;

                this.calcPageCount();
            }
        }
    };
}
/**
 * Data Pagination Handler
 * Handles indexes, counts and pagination block render
 *
 * @param itemsCnt
 * @param chartKey
 * @param parentId
 * @param itemsPerPage
 * @param callback
 * @returns {{
 *  nextPage: (function(): *),
 *  previousPage: (function(): *),
 *  getPage: (function(): {firstIndex: *, lastIndex: *, currentPage: number, itemsPerPage: number, pageCnt: number}),
 *  setOptions: _setOptions, renderDom: renderDom}}
 */
function pagination ({itemsCnt, chartKey, parentId, itemsPerPage = 10, callback}) {

    let _parent;

    let state = PaginationState({itemsCnt, chartKey, parentId, itemsPerPage});

    const _updatePageNumber = () => _parent.querySelector('.page-nmbr').innerHTML = state.currentPage + '/' + state.pageCnt;

    function _setOptions (options) {
        state.setOptions(options);

        _updatePageNumber();

        return  state.getPage();

    }

    /**
     * Set current pagination page if page is between bounds (1 and pages count)
     * @param newPage
     * @returns {*}
     * @private
     */
    const _setPage = (newPage) => state.setPage(newPage) ? state.getPage() :  _samePage();

    // ADD samePage: true to getPage result
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
