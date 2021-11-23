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

        _destroyComponent();
        _setCurrent(item);
        
        var component = item.component;
        if (component) {
            _renderComponent(component);
            _mountComponent(item, component);
        }
    }

    this.back = function () {
        _this.route(_current.previous);
    }

    //private
    function _destroyComponent() {
        var currComp = _current.component;
        currComp && currComp.destroy && currComp.destroy();
    }

    function _setCurrent(item) {
        if (!item.previous) {
            item.previous = _current;
        }
        _current = item;
    }

    function _renderComponent(component) {
        if (typeof component === 'string') {
            _elem.html(component);
        } else {
            _elem.html('');
            component.render(_elem);
        }
    }

    function _mountComponent(item, component) {
        setTimeout(function () {
            _option.after && _option.after(item);
            component.mounted && component.mounted();
        }, 10);
    }
}