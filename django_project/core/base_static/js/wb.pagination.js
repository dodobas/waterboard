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

function pagination (options) {

    const {itemsCnt, chartKey, parentId, itemsPerPage = 10, callback} = options;

    let _itemsCnt = itemsCnt;
    let _currentPage = 1;
    let _itemsPerPage = itemsPerPage;

    let _pageCnt = Math.ceil((_itemsCnt / _itemsPerPage));

    let _pageNmbrInfo;

    function _setOptions ({itemsCnt, itemsPerPage, currentPage}) {
        if (itemsCnt !== undefined) {
            _itemsCnt = itemsCnt;
            _itemsPerPage = itemsPerPage || _itemsPerPage || 10;
            _currentPage = currentPage || _currentPage || 1 ;

            _pageCnt = Math.ceil((_itemsCnt / _itemsPerPage));

            _pageNmbrInfo.innerHTML = _currentPage + '/' + _pageCnt;

            return _getPage();
        }
    }

    /**
     * Set current pagination page if page is between bounds (1 and pages count)
     * @param newPage
     * @returns {*}
     * @private
     */
    function _setPage (newPage) {
        if (1 <= newPage && newPage <= _pageCnt) {
            _currentPage = newPage;

            return _getPage();
        }
        return _samePage();
    }

    // ADD samePage: true to getPage result
    const _samePage = () => Object.assign({}, _getPage(), {samePage: true});

    // Check if next page exists
    const _nextPageExist = () => (_currentPage + 1 <= _pageCnt && _currentPage + 1 >= 1);

    // Check if previous page exists
    const _previousPageExist = () => (1 <= _currentPage - 1 && _currentPage - 1 <= _currentPage && _currentPage - 1 <= _pageCnt);

    // Go to next page
    const _nextPage = () => _nextPageExist() ? _setPage(_currentPage + 1) : _samePage();

    // Go to previous page
    const _previousPage = () => _previousPageExist() ? _setPage(_currentPage - 1) : _samePage();

    // Calculate first pagination data index
    const _firstIndex = () =>  _currentPage * _itemsPerPage - _itemsPerPage;

    // Calculate last pagination data index
    const _lastIndex = () =>  _currentPage * _itemsPerPage;


    function _getPage () {
        return {
            firstIndex: _firstIndex(),
            lastIndex: _lastIndex(),
            currentPage: _currentPage,
            itemsPerPage: _itemsPerPage,
            pageCnt: _pageCnt
        }

    }

    function renderDom () {
        let _paginationBlock = _paginationBlockRenderFn({
            pageNumberInfo: _currentPage + '/' + _pageCnt
        });

        document.getElementById(parentId).appendChild(_paginationBlock);

        _pageNmbrInfo = _paginationBlock.querySelector('.page-nmbr');

        const btns = _paginationBlock.querySelectorAll('[data-pagination-button]');

        if (!(callback instanceof Function) || (btns || []).length === -1) {
            return;
        }

        let i = 0, btnsCnt = btns.length;

        for (i; i < btnsCnt; i += 1) {
            btns[i].addEventListener('click', function () {
                var page = this.dataset.paginationButton === 'next' ? _nextPage() : _previousPage();

                if (page.samePage === true) {
                    return;
                }
                _updatePageNmbr();

                callback.apply(null, [chartKey, page]);

            });
        }

    }
    const _updatePageNmbr = () => _pageNmbrInfo.innerHTML = _currentPage + '/' + _pageCnt;

    return {
        nextPage: _nextPage,
        previousPage: _previousPage,
        getPage: _getPage,
        setOptions: _setOptions,
        renderDom: renderDom
    }
}
