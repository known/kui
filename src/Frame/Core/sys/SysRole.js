function SysRole() {
    var moduleUrl = baseUrl + '/System/';
    var url = {
        QueryModels: moduleUrl + 'QueryRoles',
        DeleteModels: moduleUrl + 'DeleteRoles',
        SaveModel: moduleUrl + 'SaveRole',
        GetRoleModules: moduleUrl + 'GetRoleModules',
        SaveRoleModules: moduleUrl + 'SaveRoleModules'
    };

    var view = new View('SysRole', {
        url: url,
        columns: [
            { field: 'Id', type: 'hidden' },
            { title: Language.Name, field: 'Name', width: '150px', query: true, type: 'text', required: true },
            { title: Language.Status, field: 'Enabled', width: '100px', type: 'checkbox', code: 'Enabled', required: true },
            { title: Language.Note, field: 'Note', type: 'textarea' }
        ],
        formOption: {
            style: 'form-block', width: 600, height: 300,
            data: { Id: '', Enabled: 1 }
        },
        gridOption: {
            showModifyBy: true, showCreateBy: true,
            toolbar: {
                right: function (e) {
                    e.selectRow(function (e) {
                        _selectRight(e.row, function (data) {
                            var ids = data.map(function (d) { return d.id; });
                            Ajax.post(url.SaveRoleModules, {
                                roleId: e.row.Id,
                                data: JSON.stringify(ids)
                            });
                        });
                    });
                }
            }
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
    function _selectRight(data, callback) {
        var treeObj;
        Layer.open({
            title: Language.PermissionSetting + ' - ' + data.Name,
            width: 850, height: 450,
            content: '<ul id="treeRoleRight"></ul>',
            success: function () {
                treeObj = new Tree('treeRoleRight', {
                    url: url.GetRoleModules + '?roleId=' + data.Id,
                    check: true, expandAll: true,
                    onLoad: function (data) {
                        var ul = $('.tree-button').parent().parent().addClass('tree-button-ul');
                        ul.parent().addClass('tree-page-li');
                    }
                });
            },
            buttons: [{
                text: Language.OK, handler: function (e) {
                    e.close();
                    var data = treeObj.getCheckedNodes();
                    callback && callback(data);
                }
            }]
        });
    }
}

$.extend(Page, {
    SysRole: { component: new SysRole() }
});