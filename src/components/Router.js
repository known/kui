function Router(elem, option) {
    //fields
    var _option = option || {},
        _elem = elem,
        _current = {},
        _this = this;

    //methods
    this.route = function (item) {
        if (!_option.before(item))
            return;

        var currComp = _current.component;
        currComp && currComp.destroy && currComp.destroy();

        if (!item.previous) {
            item.previous = _current;
        }
        _current = item;

        var component = item.component;
        if (component) {
            if (typeof component === 'string') {
                _elem.html(component);
            } else {
                _elem.html('');
                component.render(_elem);
            }
            setTimeout(function () {
                _option.after && _option.after(item);
                component.mounted && component.mounted();
            }, 10);
        }
    }

    this.back = function () {
        _this.route(_current.previous);
    }
}