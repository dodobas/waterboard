// returns array indexes for slicing
// data array starts from 0, pages from 1
function pagination (options) {

    var _itemsCnt = options.itemsCnt;
    var _currentPage = 1;
    var _itemsPerPage = options.itemsPerPage || 10;

    var _pageCnt = Math.ceil(_itemsCnt / _itemsPerPage);

    var _paginationBlock;
    var _pageNmbrInfo;

    var chartKey = options.chartKey;

    function renderDom () {
        _paginationBlock = document.createElement('div');
        _paginationBlock.setAttribute('class', 'wb-pagination-block');

        _paginationBlock.innerHTML = '<div>' +
            '<button data-pagination-button="previous" class="btn btn-chart-pag btn-xs">' +
                '<i class="fa fa-chevron-left" aria-hidden="true"></i>' +
            '</button>' +
            '<button data-pagination-button="next" class="btn btn-chart-pag btn-xs">' +
                '<i class="fa fa-chevron-right" aria-hidden="true"></i>' +
            '</button>' +
            '<div class="page-nmbr"></div>' +
        '</div>';

        document.getElementById(options.parentId).appendChild(_paginationBlock);

        _pageNmbrInfo = _paginationBlock.querySelector('.page-nmbr');

        var btns = _paginationBlock.querySelectorAll('[data-pagination-button]');

        var i = 0;

        for (i; i < btns.length; i += 1) {
            WB.utils.addEvent(btns[i], 'click', function () {
                var page = this.dataset.paginationButton === 'next' ? _nextPage() : _previousPage();
                if (page.samePage === true) {
                    return;
                }
                _pageNmbrInfo.innerHTML = page.currentPage + '/' + page.pageCnt;

                if (options.callback instanceof Function) {
                    options.callback(chartKey, page);
                }

            });
        }

        var page = _getPage();

        _pageNmbrInfo.innerHTML = page.currentPage + '/' + page.pageCnt;

    }

    function _setOptions (itemsCnt, itemsPerPage, currentPage) {
        if (itemsCnt !== undefined) {
            _itemsCnt = itemsCnt;
            _itemsPerPage = itemsPerPage || _itemsPerPage || 10;
            _currentPage = currentPage || _currentPage || 1 ;

            _pageCnt = Math.ceil(_itemsCnt / _itemsPerPage);

            _pageNmbrInfo.innerHTML = _currentPage + '/' + _pageCnt;

            return _getPage();
        }
    }

    function _setPage (newPage) {
        if (1 <= newPage && newPage <= _pageCnt) {
            _currentPage = newPage;

            return _getPage();
        }

        return _samePage();
    }

    function _getPage () {
        return {
            firstIndex: _currentPage * _itemsPerPage - _itemsPerPage,
            lastIndex: _currentPage * _itemsPerPage,
            currentPage: _currentPage,
            itemsPerPage: _itemsPerPage,
            pageCnt: _pageCnt
        }

    }

    function _samePage () {
        var samePage = _getPage();

        samePage.samePage = true;

        return samePage;
    }

    function _nextPage () {
        var next = _currentPage + 1;

        if (next <= _pageCnt && next >= 1) {
            return _setPage(next);
        }
        return _samePage();
    }

    function _previousPage () {
        var prev = _currentPage - 1;
        if (1 <= prev && prev <= _currentPage && prev <= _pageCnt) {
            return _setPage(prev);
        }
        return _samePage();
    }


    return {
        nextPage: _nextPage,
        previousPage: _previousPage,
        getPage: _getPage,
        setOptions: _setOptions,
        renderDom: renderDom
    }
}
