function SysFile() {
    //fields
    var moduleUrl = baseUrl + '/System/';
    var url = {
        QueryModels: moduleUrl + 'QueryFiles',
        DeleteModels: moduleUrl + 'DeleteFiles',
        SaveModel: moduleUrl + 'SaveFile',
        GetFileCategories: moduleUrl + 'GetFileCategories',
        UploadFiles: moduleUrl + 'UploadFiles',
        DownloadFile: moduleUrl + 'DownloadFile',
        DownloadSysFile: moduleUrl + 'DownloadSysFile'
    };

    var tree = new Tree('treeFile', {
        url: url.GetFileCategories, autoLoad: false,
        onClick: function (node) {
            view.loadGrid({ Category1: node.Category1, Category2: node.Category2 });
        }
    });

    var view = new View('SysFile', {
        url: url,
        left: tree,
        columns: [
            { field: 'Id', type: 'hidden' },
            { title: Language.Category1, field: 'Category1', width: '100px', type: 'text', required: true, onlyForm: true },
            { title: Language.Category2, field: 'Category2', width: '100px', type: 'text', onlyForm: true },
            {
                title: Language.FileName, field: 'Name', width: '100px', query: true, format: function (d) {
                    var icon = Utils.getExtIcon(d.ExtName);
                    var html = $('<span>').append('<i class="' + icon + '"></i> ');
                    $('<span class="link">')
                        .html(d.Name)
                        .data('id', d)
                        .appendTo(html)
                        .on('click', function () {
                            var data = $(this).data('id');
                            if (data.Id === '') {
                                Ajax.download(url.DownloadSysFile, { bizId: data.BizId });
                            } else {
                                Ajax.download(url.DownloadFile, { id: data.Id });
                            }
                        });
                    return html;
                }, type: 'text', required: true, inputBlock: true
            },
            { title: Language.FileType, field: 'Type', width: '100px', type: 'text' },
            { title: Language.FileSize, field: 'Size', width: '100px', align: 'right', type: 'text', readonly: true },
            { title: Language.FileSourceName, field: 'SourceName', width: '100px', type: 'text', readonly: true, inputBlock: true },
            { title: Language.ExtName, field: 'ExtName', width: '100px', query: true, type: 'text', readonly: true },
            { title: Language.Note, field: 'Note', type: 'textarea', lineBlock: true },
            { title: Language.UploadBy, field: 'CreateBy', width: '100px' },
            { title: Language.UploadTime, field: 'CreateTime', width: '140px', placeholder: 'yyyy-MM-dd HH:mm:ss', align: 'center' }
        ],
        gridOption: {
            toolbar: {
                add: function (e) {
                    _addFile();
                },
                edit: function (e) {
                    e.editRow(function (d) {
                        if (d.row.Id === '') {
                            Layer.tips(Language.SysFileNotEdit);
                            return false;
                        }

                        return true;
                    });
                },
                remove: function (e) {
                    var exist = false;
                    e.selectRows(function (e) {
                        for (var i = 0; i < e.rows.length; i++) {
                            if (e.rows[i].Id === '') {
                                exist = true;
                                break;
                            }
                        }
                    });

                    if (exist) {
                        Layer.tips(Language.SysFileNotDelete);
                        return false;
                    }

                    e.deleteRows(url.DeleteModels, function (e) {
                        e.grid.reload();
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
    function _addFile() {
        var formAdd;
        Layer.open({
            title: Language.AddDocument,
            width: 500, height: 300,
            content: '<div id="formAddFile" class="form form-block">',
            success: function () {
                formAdd = new Form('AddFile', {
                    fields: [
                        { title: Language.Category1, field: 'Category1', type: 'text', required: true },
                        { title: Language.Category2, field: 'Category2', type: 'text' },
                        { title: Language.Attachment, field: 'Files', type: 'file', multiple: true }
                    ]
                });
            },
            buttons: [{
                text: Language.OK, handler: function (e) {
                    if (!formAdd.validate())
                        return;

                    var data = formAdd.getData();
                    Ajax.upload('Files', url.UploadFiles, data, function () {
                        e.close();
                        view.load();
                    });
                }
            }]
        });
    }
}

$.extend(Page, {
    SysFile: { component: new SysFile() }
});