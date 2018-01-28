// WB api enpoint calls


/**
 * Filter tabyia (group) data
 *
 * data: {coord: [-180, -90, 180, 90], tabyia: 'some_name'},
 *
 * @param data
 * @param successCb
 */
function getTabyiaData({data, successCb}) {
    WB.utils.ax({
        method: 'GET',
        url: '/data/',
        data,
        successCb
    });
}
