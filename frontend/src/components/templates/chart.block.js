export const generateChartBlock = (chartConf) => {
    let {parentId, chartKey, hasPagination} = chartConf;

    let dummy = document.createElement('div');

    dummy.innerHTML = `<div class="wb-chart-block-wrap">
        <div class="wb-chart-block">
          <div id="${parentId}" class="wb-chart-wrap"></div>
        </div>
      </div>`;

    return dummy.firstChild;
};
