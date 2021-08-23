Picker.action.organization = {
    title: Language.SelectOrganization, type: 'tree', width: 350, height: 350,
    url: baseUrl + '/System/GetOrganizations'
}

function SysOrganization() {
    var moduleUrl = baseUrl + '/System/';
    var url = {
        DeleteModels: moduleUrl + 'DeleteOrganizations',
        SaveModel: moduleUrl + 'SaveOrganization',
        GetOrganizations: moduleUrl + 'GetOrganizations'
    };

    var tree = new Tree('treeOrganization', {
        url: url.GetOrganizations,
        onClick: function (node) {
            if (node.children) {
                var datas = node.children.map(function (d) { return d.data; });
                view.setGridData(datas);
            }
        }
    });

    var view = new View('SysOrganization', {
        url: url,
        left: tree,
        columns: [
            { field: 'Id', type: 'hidden' },
            { field: 'ParentId', type: 'hidden' },
            { title: Language.Code, field: 'Code', width: '100px', type: 'text', required: true },
            { title: Language.Name, field: 'Name', width: '250px', type: 'text', required: true },
            { title: Language.Note, field: 'Note', type: 'textarea' }
        ],
        refresh: function () {
            tree.reload();
            view.setGridData([]);
        },
        formOption: {
            style: 'form-block',
            titleInfo: function (d) {
                var item = tree.getNodeData(function (l) { return l.id === d.ParentId; });
                return item ? '- ' + item.Code + '|' + item.Name : '';
            },
            setData: function (e) {
                e.form.Code.setReadonly(e.data.Id !== '');
            }
        },
        gridOption: {
            page: false, showModifyBy: true, showCreateBy: true,
            toolbar: {
                add: function (e) {
                    var node = tree.selectedNode;
                    if (!node) {
                        Layer.tips(Language.PleaseSelectParentOrg);
                        return;
                    }
                    e.addRow({ Id: '', ParentId: node.id });
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
}

$.extend(Page, {
    SysOrganization: { component: new SysOrganization() }
});