﻿//---------------------------message------------------------------------------//
var Message = {

    mask: function (message, el) {
        mini.mask({
            el: el || document.body,
            cls: 'mini-mask-loading',
            html: message
        });
    },

    unmask: function (el) {
        mini.unmask(el || document.body);
    },

    alert: function (message, callback) {
        message = message.htmlEncode();
        mini.alert(message, '提示', function (action) {
            if (action === 'ok') {
                callback && callback();
            }
        });
    },

    error: function (message, callback) {
        mini.showMessageBox({
            title: '错误',
            message: '<span style="padding-left:10px;">' + message + '</span>',
            buttons: ['ok'],
            iconCls: 'mini-messagebox-error',
            callback: function (action) {
                if (action === 'ok') {
                    callback && callback();
                }
            }
        });
    },

    confirm: function (message, callback) {
        message = message.htmlEncode();
        mini.confirm(message, '确认提示', function (action) {
            if (action === 'ok') {
                callback && callback();
            }
        });
    },

    prompt: function (label, title, callback) {
        mini.prompt(label, title, function (action, value) {
            if (action === 'ok') {
                callback && callback(value);
            }
        });
    },

    promptMulti: function (label, title, callback) {
        mini.prompt(label, title, function (action, value) {
            if (action === 'ok') {
                callback && callback(value);
            }
        }, true);
    },

    tips: function (option) {
        if (typeof option === 'string')
            option = { content: option };

        mini.showTips({
            content: option.content,
            state: option.state || 'info',
            x: option.x || 'center',
            y: option.y || 'top',
            timeout: option.timeout || 3000
        });
    },

    notify: function (option) {
        mini.showMessageBox({
            showModal: false,
            width: option.width || 250,
            title: option.title || '提示',
            iconCls: option.iconCls || 'mini-messagebox-warning',
            message: option.message,
            timeout: option.timeout || 3000,
            x: option.x || 'right',
            y: option.y || 'bottom'
        });
    },

    result: function (res, callback) {
        this.unmask();

        if (!res.ok) {
            this.alert(res.message);
            return;
        }

        if (res.message) {
            this.tips(res.message);
        }

        callback && callback(res.data);
    }

};