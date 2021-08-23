Date.prototype.format = function (fmt) {
    var o = {
        'M+': this.getMonth() + 1,//月份   
        'd+': this.getDate(),//日   
        'h+': this.getHours(),//小时  
        'H+': this.getHours(),
        'm+': this.getMinutes(),//分   
        's+': this.getSeconds(),//秒   
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度   
        'S': this.getMilliseconds()//毫秒   
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1)
                ? o[k]
                : ('00' + o[k]).substr(('' + o[k]).length));
        }
    }
    return fmt;
};

function log(obj) { console.log(obj); }

function initDropdown() {
    $('.dropdown .title').on('mouseenter', function () {
        $(this).find('.arrow').removeClass('fa-caret-down').addClass('fa-caret-up');
        $(this).next().show();
    });
    $('.dropdown').on('mouseleave', function () {
        var title = $(this).find('.title');
        title.find('.arrow').removeClass('fa-caret-up').addClass('fa-caret-down');
        title.next().hide();
    });
}

var Utils = {

    getUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var res = window.location.search.substr(1).match(reg);
        if (res == null)
            return null;

        return decodeURI(res[2]);
    },

    addCss: function (href, last) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        var item = $('link[href*="static/libs/"]');
        if (!item.length || last) {
            item = $('link[href*="static/"]');
        }
        item.last().after($(link));
    },

    addJs: function (src, last) {
        var script = document.createElement('script');
        script.src = src;
        var item = $('script[src*="static/libs/"]');
        if (!item.length || last) {
            item = $('script[src*="static/"]');
        }
        item.last().after($(script));
    },

    loadJs: function (src) {
        window.onload = function () {
            var script = document.createElement("script");
            script.src = src;
            document.body.appendChild(script);
        }
    },

    format: function (source, params) {
        if (arguments.length == 1) {
            return function () {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.format.apply(this, args);
            };
        }

        if (arguments.length > 2 && params.constructor != Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor != Array) {
            params = [params];
        }
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    },

    copy: function (text) {
        var el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        var selection = document.getSelection();
        var selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        if (selected) {
            selection.removeAllRanges();
            selection.addRange(selected);
        }
    },

    paste: function (enabled, callback) {
        if (enabled) {
            $(document).bind('paste', function () {
                if (event.clipboardData || event.originalEvent) {
                    var clipboardData = (event.clipboardData || window.clipboardData);
                    var text = clipboardData.getData('text');
                    callback && callback(text);
                    event.preventDefault();
                }
            });
        } else {
            $(document).unbind('paste');
        }
    },

    list2Tree: function (data, pid) {
        if (!data) return [];
        let list = data.slice();
        return list.filter(function (parent) {
            let branchArr = list.filter(function (child) {
                return parent.id === child.pid;
            });
            if (branchArr.length > 0) {
                parent.children = branchArr;
            }
            return parent.pid === pid;
        });
    },

    tree2List: function (data) {
        if (!data) return [];

        let list = [];
        let queue = data.slice();
        while (queue.length) {
            let node = queue.shift();
            list.push(node);
            let children = node.children;
            if (children && children.length) {
                for (let i = 0; i < children.length; i++)
                    queue.push(children[i]);
            }
        }
        return list;
        //var tree = data.slice();
        //return tree.reduce(function (con, item) {
        //    var callee = arguments.callee;
        //    con.push(item);
        //    if (item[key] && item[key].length > 0)
        //        item[key].reduce(callee, con);
        //    return con;
        //}, []).map(function (item) {
        //    item[key] = [];
        //    return item;
        //});
    },

    getExtIcon: function (ext) {
        switch (ext) {
            case '.pdf':
                return 'fa fa-file-pdf-o pdf';
            case '.doc':
            case '.docx':
                return 'fa fa-file-word-o doc';
            case '.xls':
            case '.xlsx':
                return 'fa fa-file-excel-o xls';
            case '.ppt':
            case '.pptx':
                return 'fa fa-file-powerpoint-o ppt';
            case '.jpg':
            case '.jpeg':
            case '.gif':
            case '.png':
            case '.tif':
                return 'fa fa-file-photo-o';
            case '.rar':
            case '.zip':
            case '.gz':
                return 'fa fa-file-zip-o';
            default:
                return 'fa fa-file-o';
        }
    },

    setUser: function (user) {
        if (!user) {
            sessionStorage.removeItem('Known_User');
        } else {
            sessionStorage.setItem('Known_User', JSON.stringify(user));
        }
    },

    getUser: function () {
        var value = sessionStorage.getItem('Known_User');
        if (!value || value === 'undefined')
            return null;

        return JSON.parse(value);
    },

    setCodes: function (data) {
        if (!data) {
            localStorage.removeItem('Known_Codes');
        } else {
            localStorage.setItem('Known_Codes', JSON.stringify(data));
        }
    },

    getCodes: function (data) {
        if (!data)
            return [];

        if ($.isArray(data))
            return data;

        if ($.isPlainObject(data)) {
            var datas = [];
            for (var p in data) {
                datas.push({ Code: p, Name: p, Data: data[p] });
            }
            return datas;
        }

        if (data === 'YesNo')
            return [{ Code: 1, Name: Language.Yes }, { Code: 0, Name: Language.No }];

        if (data === 'HasNot')
            return [{ Code: 1, Name: Language.Has }, { Code: 0, Name: Language.Not }];

        if (data === 'Enabled')
            return [{ Code: 1, Name: Language.Enable }, { Code: 0, Name: Language.Disable }];

        var value = localStorage.getItem('Known_Codes');
        if (!value)
            return [];

        var codes = JSON.parse(value);
        if (!codes)
            return [];

        return codes[data] || [];
    },

    getCodeName: function (data, value) {
        var codes = this.getCodes(data);
        if (codes && codes.length) {
            if (typeof value === 'string' && value.indexOf(',') > 0) {
                var values = value.split(',');
                var names = [];
                for (var i = 0; i < values.length; i++) {
                    var code = codes.filter(function (c) { return c.Code === values[i]; });
                    if (code.length) {
                        names.push(code[0].Name || value);
                    }
                }
                return names.join(',');
            } else {
                var code = codes.filter(function (c) { return c.Code === value; });
                if (code.length) {
                    return code[0].Name || value;
                }
            }
        }

        return value;
    },

    getCodeObject: function (category, nameArray) {
        var obj = {};
        var codes = this.getCodes(category);
        if (codes && codes.length) {
            for (var i = 0; i < codes.length; i++) {
                var item = codes[i];
                if (nameArray) {
                    nameArray.push(item.Name);
                }
                obj[item.Code] = item.Name;
            }
        }

        return obj;
    },

    genFile: function (text, saveName) {
        var blob = new Blob([s2ab(text)], { type: "application/octet-stream" });
        //if (typeof url == 'object' && url instanceof Blob) {
        //    url = URL.createObjectURL(blob);
        //}
        var url = URL.createObjectURL(blob);
        var aLink = document.createElement('a');
        aLink.href = url;
        aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
        var event;
        if (window.MouseEvent) {
            event = new MouseEvent('click');
        } else {
            event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        aLink.dispatchEvent(event);

        // String to ArrayBuffer
        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i)
                view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
    },

    checkMobile: function () {
        var agent = navigator.userAgent;
        var agents = new Array('Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod');
        var flag = false;
        for (var i = 0; i < agents.length; i++) {
            if (agent.indexOf(agents[i]) > 0) {
                flag = true;
                break;
            }
        }
        return flag;
    },

    printIframe: null,
    print: function (option) {
        var iframe = this.printIframe;
        if (!this.printIframe) {
            iframe = this.printIframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            iframe.style.display = 'none';
        }
        if (option.url) {
            iframe.src = option.url;
            if (!option.ajax) {
                iframe.onload = function () {
                    setTimeout(function () { iframe.contentWindow.print(); }, 1);
                };
            }
        } else if (option.html) {
            var doc = iframe.contentWindow.document;
            doc.open();
            doc.write('<title>' + option.title + '</title>');
            $(document).find('link').filter(function () {
                return $(this).attr('rel').toLowerCase() === 'stylesheet';
            }).each(function () {
                doc.write('<link rel="stylesheet" href="' + $(this).attr('href') + '">');
            });
            doc.write('<style>html,body{overflow:auto;height:auto;}.form-table{padding:0;}</style>');

            setTimeout(function () {
                if (typeof option.html === 'function') {
                    doc.write(option.html());
                } else {
                    doc.write(option.html);
                }
                setTimeout(function () { iframe.contentWindow.print(); }, 1);
            }, 100);
        }
    },

    initPCAField: function (e) {
        if (!window.PCARegion) {
            this.addJs(baseUrl + '/static/libs/region.js');
        }

        e.form.Province.setData(window.PCARegion, e.data.Province);

        e.form.Province.change(function (e) {
            e.form.City.setData(e.selected.Data);
            e.form.Area.setData([]);
        });

        e.form.City.change(function (e) {
            e.form.Area.setData(e.selected.Data);
        });

        if (e.data.Province) {
            var selProv = e.form.Province.getData() || {};
            e.form.City.setData(selProv.Data, e.data.City);
        }

        if (e.data.City) {
            var selCity = e.form.City.getData() || {};
            e.form.Area.setData(selCity.Data, e.data.Area);
        }
    },

    createButton: function (item, arg) {
        var button = $('<button>').data('item', item);

        if (item.icon) {
            button.append('<i class="' + item.icon + '">');
        }

        if (item.style) {
            button.addClass(item.style);
        }

        button.append('<span>' + (item.text || item.name) + '</span>')
            .on('click', function () {
                var itm = $(this).data('item');
                if (itm.handler) {
                    if (arg && $.isFunction(arg)) {
                        arg = arg();
                    }
                    var e = $.extend({ item: itm }, arg);
                    itm.handler.call(this, e);
                }
            });

        return button;
    }

};

var Ajax = {

    get: function (url, data, callback) {
        var dlg = Layer.loading(Language.Loading + '......');
        $.get(url, data, function (result) {
            dlg.close();
            if (result.message) {
                Layer.tips(result.message);
            }
            if (result.ok) {
                callback && callback(result.data);
            } else {
                callback && callback(result);
            }
        });
    },

    post: function (url, data, callback) {
        var dlg = Layer.loading(Language.Submitting + '......');
        $.post(url, data, function (result) {
            dlg.close();
            if (result.ok) {
                Layer.tips(result.message);
                callback && callback(result.data);
            } else if (result.message) {
                Layer.alert(result.message);
            } else {
                callback && callback(result);
            }
        });
    },

    upload: function (fileId, url, data, callback) {
        var dlg = Layer.loading(Language.Uploading + '......');
        var fd = new FormData(), xhr = new XMLHttpRequest();
        var files = document.getElementById(fileId).files;
        for (var i = 0; i < files.length; i++) {
            fd.append('file' + i, files[i], files[i].name);
        }
        if (data) {
            fd.append('data', JSON.stringify(data));
        }
        xhr.onload = function () {
            dlg.close();
            var result = JSON.parse(xhr.responseText);
            if (result.ok) {
                Layer.tips(result.message);
                callback && callback(result.data);
            } else if (result.message) {
                Layer.alert(result.message);
            } else {
                callback && callback(result);
            }
        };
        xhr.upload.onprogress = function (evt) {
            var loaded = evt.loaded;
            var total = evt.total;
            //per = Math.floor(100 * loaded / total);
            //var progressBar = document.getElementById('progressBar');
            //var percentageDiv = document.getElementById('percentage');
            //if (evt.lengthComputable) {
                //progressBar.max = total;
                //progressBar.value = loaded;
                //percentageDiv.innerHTML = Math.round(loaded / total * 100) + '%';
            //}
        };
        xhr.open('post', url, true);
        xhr.send(fd);
    },

    download: function (url, data, callback) {
        var tokenKey = 'downloadToken';
        var tokenValue = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        function getCookie(name) {
            var reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
            var arr = document.cookie.match(reg);
            if (arr && arr.length > 3)
                return unescape(arr[2]);
            return null;
        }
        function loading() {
            var dlg = Layer.loading(Language.Downloading + '......');
            var downloadTimer = window.setInterval(function () {
                var token = getCookie(tokenKey);
                if (token === tokenValue) {
                    window.clearInterval(downloadTimer);
                    dlg.close();
                    callback && callback();
                }
            }, 1000);
        }

        var form = $('<form method="post" action="' + url + '" target="" style="display:none">').appendTo('body');
        $('<input type="hidden">').attr('name', tokenKey).attr('value', tokenValue).appendTo(form);
        if (data && data !== null) {
            for (var p in data) {
                $('<input type="hidden">').attr('name', p).attr('value', data[p]).appendTo(form);
            }
        }
        form.submit();
        loading();
    }

};

var WsUtil = {

    ws: null,
    isClosed: false,

    connect: function (url, data, callback) {
        var _this = this;
        _this.log(Language.Connecting + '......');
        _this.ws = new WebSocket(url);
        _this.ws.onopen = function () {
            _this.log(Language.ClientConnected);
            if (data) {
                _this.send(JSON.stringify(data));
            }
        }
        _this.ws.onmessage = function (evt) {
            if (evt.data) {
                callback && callback(evt.data);
            }
        }
        _this.ws.onclose = function () {
            if (!_this.isClosed) {
                _this.log(Language.ClientDisconnected);
                _this.connect(url, data, callback);
            }
        }
        _this.ws.onerror = function (evt) {
            _this.log(evt);
            _this.close();
        }
        window.onbeforeunload = function () {
            _this.close();
        }
        return _this.ws;
    },

    send: function (message) {
        if (this.ws) {
            this.ws.send(message);
        }
    },

    close: function () {
        this.isClosed = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.log(Language.ClientClosed);
        }
    },

    log: function (message, color) {
        console.log(message);
    }

};

var Page = {
    complete: function () {
        initDropdown();

        // tab item change
        $('.tabs-header li').click(function () {
            var tab = $(this).parent().parent();
            var index = $(this).index();
            tab.find('.tabs-header li').removeClass('active');
            tab.find('.tabs-item').removeClass('active');
            $(this).addClass('active');
            tab.find('.tabs-item:eq(' + index + ')').addClass('active');
        });

        // bind date picker
        $('[placeholder="yyyy-MM-dd"]:not([readonly])').each(function () {
            $(this).fdatepicker({ format: 'yyyy-mm-dd' });
        });

        $('[placeholder="yyyy-MM-dd HH:mm"]:not([readonly])').each(function () {
            $(this).fdatepicker({ format: 'yyyy-mm-dd hh:ii', pickTime: true });
        });

        // bind input enter
        $('input[onenter]').keydown(function (event) {
            if ((event.keyCode || event.which) === 13) {
                event.preventDefault();
                var method = $(this).attr("onenter");
                eval(method);
            }
        });
    }
};

var curUser = Utils.getUser();

$(document).ajaxSend(function (evt, xhr, settings) {
    xhr.setRequestHeader("token", curUser ? curUser.Token : '');
});
$(document).ajaxComplete(function (evt, xhr, settings) {
    if (xhr.responseText && xhr.responseText.match("^\{(.+:.+,*){1,}\}$")) {
        var result = JSON.parse(xhr.responseText);
        if (result) {
            if (result.timeout)
                top.location = baseUrl + '/login';
            else if (result.error)
                top.location = baseUrl + '/error?t=' + result.type;
        }
    }
});

$(function () {
    initDropdown();
});
