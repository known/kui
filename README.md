# kui
KUI是一个基于jquery开发的前端快速开发框架。

## 组件
01. **Layer**：弹出层，支持Modal对话框、alert、confirm、tips、loading等。
02. **Router**：路由，支持多级路由，回退等。
03. **ListBox**：列表框，支持data和url绑定和单击回调等。
04. **Tree**：树，依赖ztree，支持data和url绑定，支持简单list数据等。
05. **Tabs**：标签页。
06. **Query**：查询组件，支持查询条件字段绑定和查询按钮等。
07. **Form**：表单组件，支持普通表单和多Tab页表单、栏位字段绑定、非空栏位验证和操作按钮等。
08. **Input**：输入组件，支持hidden、text、textarea、select、date、radio、checkbox、editor、picker等，其中date依赖datepicker，editor依赖wangEditor。
09. **Picker**：弹出选择组件，支持查询和选择回调等。
10. **Grid**：网格组件，支持toolbar、query、import、export等，支持编辑。
11. **Chart**：图表组件，依赖echarts。
12. **View**：视图组件，支持左右布局，栏位一次定义，多处使用（Query、Grid、Form）。
## 增删改查代码示例
![](https://img2020.cnblogs.com/blog/21278/202111/21278-20211103144128125-825084795.png)
``` javascript
function DevSampleGrid() {
    var view = new View('View', {
        url: { },
        columns: [
            { field: 'Id', type: 'hidden' },
            { title: '只读文本', field: 'Readonly', type: 'text', readonly: true, export: true },
            { title: '文本', field: 'Text', type: 'text', required: true, format: 'detail', query: true, import: true, export: true },
            { title: '日期', field: 'Date', type: 'date', placeholder: DateFormat, import: true, export: true },
            { title: '下拉框', field: 'Select', type: 'select', code: [{ Code: '1', Name:'选项一'}, '选项二'], query: true, import: true, export: true },
            { title: '复选框', field: 'Check', type: 'checkbox', code: SampleCodes, import: true, export: true },
            { title: '单选框', field: 'Radio', type: 'radio', code: SampleCodes, import: true, export: true },
            {
                title: '选择框', field: 'Picker', type: 'picker', pick: {
                    action: 'user', callback: function (e) { log(e); }
                }
            },
            { title: '文本', field: 'Text2', type: 'text', unit: '元', import: true },
            { title: '文本域', field: 'TextArea', type: 'textarea', itemStyle: 'block' }
        ],
        gridOption: {
            autoQuery: false,
            formUrl: baseUrl + '/test', toolButtons: ['add', 'edit', 'remove', 'import']
        }
    });

    //methods
    this.render = function () {
        return view.render();
    }

    this.mounted = function () {
        view.setGridData([
            {
                Id: '1', Readonly: 'T0001', Text: 'test', Date: '2021-01-01',
                Select: '选项一', Check: '选项二', Radio: '选项一',
                Picker: 'System', PickerName: '超级管理员', Text1: 'testtt', Text2: 3000,
                TextArea: 'tetstest', Editor: '测试刚刚'
            }
        ]);
    }
}
```