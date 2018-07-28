export default function PaginationState ({itemsCnt, chartKey, parentId, itemsPerPage = 10}) {

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
