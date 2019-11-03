function createPage (item) {
    if (!item.page)
        return new Page(item);

    switch (item.page.type) {
        case 'Grid':
            return new GridPage(item);
        default:
            return new Page(item);
    }
}

function Page (item) {
    this.item = item;
    this.page = item.page;

    this.render = function (body) {
        var html = this.getHtml();
        body.html(html);
        mini.parse();
        this.init();
    }

    this.init = function () {
        
    }

    this.getHtml = function () {
        return this.item.text + ' - 页面建设中......';
    }

    this.getToolbar = function () {
        if (!this.page.buttons)
            return '';
        
        var html = '<div class="mini-toolbar">';
        html += '</div>';
        return html;
    }

    this.getStyle = function (url) {
        if (!url) return '';
        return '<style href="' + url + '">';
    }

    this.getScript = function (url) {
        if (!url) return '';
        return '<script src="' + url + '"></script>';
    }
}

function GridPage (item) {
    Page.call(this, item);

    this.gridId = 'grid' + item.id;

    this.getHtml = function () {
        var html = this.getStyle(this.page.style);
        html += this.getToolbar();
        html += '<div class="mini-fit">';
        html += '    <div id="' + this.gridId + '" class="mini-datagrid" style="width:100%;height:100%">';
        html += '    </div>';
        html += '</div>';
        html += this.getScript(this.page.script);
        return html;
    }

    this.init = function () {
        if (!this.page.columns)
            return;

        var grid = mini.get(this.gridId);
        grid.setColumns(this.page.columns);
    }
}