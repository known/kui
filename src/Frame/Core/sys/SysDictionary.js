﻿function SysDictionary() {
    //fields
    var moduleUrl = baseUrl + '/System/';
    var url = {
        QueryModels: moduleUrl + 'QueryDictionarys',
        DeleteModels: moduleUrl + 'DeleteDictionarys',
        SaveModel: moduleUrl + 'SaveDictionary',
        GetDicCategories: moduleUrl + 'GetDicCategories'
    };
    var cate;

    var list = new ListBox('listCategory', {
        url: url.GetDicCategories, autoLoad: false,
        onClick: function (item) {
            cate = item;
            view.loadGrid({ Category: item.Code });
        }
    });

    var columns = [
        { field: 'Id', type: 'hidden' },
        { field: 'Category', type: 'hidden' },
        { field: 'CategoryName', type: 'hidden' },
        { title: Language.Code, field: 'Code', width: '150px', query: true, type: 'text', required: true },
        { title: Language.Name, field: 'Name', width: '150px', query: true, type: 'text' },
        { title: Language.Status, field: 'Enabled', width: '80px', align: 'center', type: 'checkbox', code: 'Enabled', required: true },
        { title: Language.Sort, field: 'Sort', width: '50px', align: 'center', type: 'text', required: true },
        { title: Language.Note, field: 'Note', type: 'textarea' }
    ];
    if (curUser.AppId === 'DEV') {
        columns.splice(3, 0, { title: Language.System, field: 'AppId', width: '80px', query: true, type: 'select', code: 'ProductData', required: true, sort: true });
    }

    var view = new View('SysDictionary', {
        url: url,
        left: list,
        columns: columns,
        formOption: {
            style: 'form-block',
            titleInfo: function (d) {
                return '- ' + d.Category + '|' + d.CategoryName;
            }
        },
        gridOption: {
            autoQuery: false, showModifyBy: true, showCreateBy: true,
            sortField: 'Sort', sortOrder: 'asc',
            where: { Category: '' },
            toolbar: {
                add: function (e) {
                    if (!cate) {
                        Layer.tips(Language.PleaseDicCategory);
                        return;
                    }
                    e.addRow({ Id: '', Enabled: 1, Category: cate.Code, CategoryName: cate.Name });
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
    SysDictionary: { component: new SysDictionary() }
});