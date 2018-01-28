function getTabyiaData({data, successCb}) {
            WB.utils.ax({
                method: 'GET',
                url: '/data/',
                data,
                successCb
            });
        }
