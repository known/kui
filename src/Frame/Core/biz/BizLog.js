var Log = {

    url: {
        GetLogs: baseUrl + '/System/GetLogs'
    },

    open: function (option) {
        var _this = this, elem = $('<div>');
        Layer.open({
            title: option.title || Language.OperateLog,
            width: option.width,
            height: option.height,
            content: elem,
            success: function () {
                _this.load(elem, option.bizId);
            }
        });
    },

    load: function (elem, bizId) {
        var el = typeof elem === 'string' ? $('#' + elem) : elem;
        el.addClass('log').html('').append('<h2>' + Language.OperateLog + '</h2>');
        var url = this.url.GetLogs + '?bizId=' + bizId;
        var columns = [
            { title: Language.OperateType, field: 'Type', width: '100px' },
            { title: Language.OperateBy, field: 'CreateBy', width: '100px' },
            { title: Language.OperateTime, field: 'CreateTime', width: '140px', placeholder: 'yyyy-MM-dd HH:mm:ss' },
            { title: Language.OperateContent, field: 'Content' }
        ];
        el.append('<table id="gridSysLog"></table>');
        new Grid('SysLog', {
            page: false, fixed: false, showCheckBox: false,
            url: url, columns: columns
        });
    }

}