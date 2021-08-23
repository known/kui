function SysError() {
    var moduleUrl = baseUrl + '/System/';
    var url = {
        QueryModels: moduleUrl + 'QueryErrors',
        DeleteError: moduleUrl + 'DeleteError'
    };
    var view = new View('SysError', {
        url: url,
        columns: [
            {
                title: Language.Operate, field: 'Id', width: '100px', format: function (d) {
                    var html = $('<span>');
                    $('<span class="link" style="margin-right:5px;">')
                        .data('data', d)
                        .html(Language.Detail)
                        .appendTo(html)
                        .on('click', function () {
                            _showInfo($(this).data('data'));
                        });
                    $('<span class="link">')
                        .data('id', d.Id)
                        .html(Language.Remove)
                        .appendTo(html)
                        .on('click', function () {
                            _delInfo($(this).data('id'));
                        });
                    return html;
                }
            },
            { title: Language.System, field: 'System', width: '80px', query: true },
            { title: Language.OperateBy, field: 'User', width: '80px', query: true },
            { title: Language.OperateTime, field: 'CreateTime', width: '140px', placeholder: 'yyyy-MM-dd HH:mm:ss' },
            { title: Language.ErrorMessage, field: 'Message', width: '150px' },
            {
                title: 'IP', field: 'IP', width: '150px', format: function (d) {
                    return d.IP + ' - ' + d.IPName;
                }
            },
            { title: 'Url', field: 'Url' }
        ],
        gridOption: {
            page: false
        }
    });

    //methods
    this.render = function (dom) {
        view.render().appendTo(dom);
    }

    this.mounted = function () {
        view.load();
    }

    //private
    function _showInfo(data) {
        Layer.open({
            title: Language.Error + Language.Detail, width: 1000, height: 400,
            content: '<pre>' + data.StackTrace + '</pre>'
        });
    }

    function _delInfo(id) {
        Layer.confirm(Language.ConfirmDelete, function () {
            Ajax.post(url.DeleteError, { id: id }, function () {
                view.load();
            });
        });
    }
}

$.extend(Page, {
    SysError: { component: new SysError() }
});