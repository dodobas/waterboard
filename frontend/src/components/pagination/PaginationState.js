export function calculatePaginationNumbersForDom(page, maxPageCnt, pagesToShow) {

    let _page = parseInt(page);
    let _maxPageCnt = parseInt(maxPageCnt);

    let offset = pagesToShow || 6;

    let perSide = offset / 2;

    let _first, _last;

    if (_maxPageCnt <= offset) {
        _first = 1;
        _last = _maxPageCnt;
    } else {


        let firstIx = _page - perSide;
        let lastIx = _page + perSide;

        if (firstIx <= 0) {
            _first = 1;
            _last = offset + 1;


        } else {
            _first = firstIx;
            _last = firstIx + offset;
        }

        if (lastIx > _maxPageCnt) {
            _last = _maxPageCnt;
        }
    }

    let _arr = [];
    for (_first; _first <= _last; _first += 1) {
        _arr[_arr.length] = _first
    }

    return _arr;
}

export default function PaginationState({itemsCnt, itemsPerPage = 10, pagesToShow = 6}) {

    const _pageCnt = (!itemsCnt || !itemsPerPage) ? 1 : Math.ceil((itemsCnt / itemsPerPage));

    let _pages = calculatePaginationNumbersForDom(1, _pageCnt, pagesToShow);
    return {
        // current page
        currentPage: 1,

        // items per page
        itemsPerPage,

        // pagination items count - data length
        itemsCnt,

        // pagination pages count
        pageCnt: _pageCnt,
        pages: _pages,

        recalcPages: function () {
            this.pages = calculatePaginationNumbersForDom(this.currentPage + '', this.pageCnt + '', pagesToShow);
        },
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
            return this.currentPage * this.itemsPerPage - this.itemsPerPage;
        },

        // Calculate last pagination data index
        lastIndex: function () {
            return this.currentPage * this.itemsPerPage;
        },

        // get current state for current page
        getPage: function () {
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
                this.currentPage = parseInt(newPage);

                this.recalcPages();
                return true;
            }
            return false;
        },

        // calculate page count based on items per page and data length
        calcPageCount: function () {
            this.pageCnt = Math.ceil(this.itemsCnt / this.itemsPerPage);
        },

        // set pagination options - data length, current pagen
        setOptions: function ({itemsCnt, currentPage, itemsPerPage}) {
            if (itemsPerPage && itemsPerPage > 0) {
                this.itemsPerPage = itemsPerPage;
            }

            if (itemsCnt !== undefined) {
                this.itemsCnt = itemsCnt;
            }

            this.calcPageCount();
            this.recalcPages();

            if (currentPage && currentPage > 0) {
                this.setPage(currentPage);
            }

            return false;
        }
    };
}
