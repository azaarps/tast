// Progress view model
var progressVM = new function () {
    var self = this;

    // Properties
    self.text = ko.observable('Please wait...');
};

// Message view model
var messageVM = new function () {
    var self = this;

    // Properties
    self.title = ko.observable('');
    self.bodyHtml = ko.observable('');
    self.success = ko.observable(true);
};

// Progress modal methods
function showProgressModal(text) {
    progressVM.text(text);
    $('#ProgressModal').modal({ keyboard: false, show: true, backdrop: 'static' });
}

function hideProgressModal() {
    $('#ProgressModal').modal('hide');
}

// Panel progress methods
function showPanelProgress(contentId, header) {
    if (header) {
        $('#' + contentId).find(".glyphicon-list")
            .addClass('glyphicon-refresh glyphicon-refresh-animate')
            .removeClass('glyphicon-list');
    }
    else {
        var progressHtml = '<div class="panel-body" id="' + contentId + 'Progress">' +
        '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading...' +
        '</div>';

        $('#' + contentId).hide();
        $(progressHtml).insertAfter($('#' + contentId));
    }
}

function hidePanelProgress(contentId, header) {
    if (header) {
        $('#' + contentId).find(".glyphicon-refresh")
            .addClass('glyphicon-list')
            .removeClass('glyphicon-refresh glyphicon-refresh-animate');
    }
    else {
        $('#' + contentId + 'Progress').remove();
        $('#' + contentId).show();
    }
}

function showConfirmPopover(element, container, title, content, confirmText, cancelText, onConfirm, placement) {
    if (typeof placement === 'undefined') { placement = 'bottom'; }

    $(element).confirmation(
        {
            title: title,
            container: container,
            placement: placement,
            trigger: 'manual',
            btnOkIcon: '',
            btnOkClass: 'btn-primary',
            btnOkLabel: confirmText,
            btnCancelIcon: '',
            btnCancelClass: 'btn-default',
            btnCancelLabel: cancelText,
            template: '<div class="popover confirmation" style="min-width:300px;max-width:400px"><div class="arrow"></div>'
                + '<h4 class="popover-title"></h4>'
                + '<div class="popover-content">'
                + '<div>' + content + '</div>'
                + '<br />'
                + '<div class="text-center">'
                + '<div class="btn-group"><a class="btn" style="margin-right:10px" data-apply="confirmation"></a><a class="btn" data-dismiss="confirmation"></a>'
                + '</div></div></div></div>',
            onConfirm: function () { onConfirm(); $(element).confirmation('destroy'); },
            onCancel: function () { $(element).confirmation('destroy'); }
        });

    $(element).confirmation('show');
}

// Message modal methods
function showMessageModal(title, bodyHtml, success) {
    messageVM.title(title);
    messageVM.bodyHtml(bodyHtml);
    messageVM.success(success);
    $('#MessageModal').modal('show');
}

function signOut() {
    callAPI('security', 'SignOut', null, 'Sign out', 'Signing out',
        function (response) {
            if (response.result) {
                window.location.href = "";
            }
            else {
                showMessageModal('Sign out', response.resultHtml, response.result);
            }
        }, null, null);
}

function callAPI(service, method, request, actionText, progressText, success, error, complete) {
    if (progressText) showProgressModal(progressText + ', please wait...');

    $.ajax({
        type: 'POST', contentType: 'application/json; charset=utf-8', dataType: 'json',
        url: 'api/' + service + '/service.svc/' + method,
        headers: { 'CSRFToken': $('#CSRFToken').val() },
        data: ko.toJSON({ request: request }),
        success: function (r) {
            hideProgressModal();
            success(r.d);
        },
        error: function (e) {
            hideProgressModal();
            showMessageModal(actionText, 'Unexpected system error - please retry, or contact us at <a href="mailto:enquiries@bonusbitcoin.co">enquiries@bonusbitcoin.co</a> if this problem persists.');

            if (error) error(e);
        },
        complete: function () {
            if (complete) complete();
        }
    });
}

(function ($) {
    $.querystring = (function (a) {
        var i,
            p,
            b = {};
        if (a === "") { return {}; }
        for (i = 0; i < a.length; i += 1) {
            p = a[i].split('=');
            if (p.length === 2) {
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
        }
        return b;
    }(window.location.search.substr(1).split('&')));
}(jQuery));


function toTimeAgo(dt) {
    var secs = (((new Date()).getTime() - dt.getTime()) / 1000),
        days = Math.floor(secs / 86400);

    return days === 0 && (
        secs < 60 && "just now" ||
            secs < 120 && "a minute ago" ||
            secs < 3600 && Math.floor(secs / 60) + " minutes ago" ||
            secs < 7200 && "an hour ago" ||
            secs < 86400 && Math.floor(secs / 3600) + " hours ago") ||
        days === 1 && "yesterday" ||
        days < 31 && days + " days ago" ||
        days < 60 && "one month ago" ||
        days < 365 && Math.ceil(days / 30) + " months ago" ||
        days < 730 && "one year ago" ||
        Math.ceil(days / 365) + " years ago";
};

ko.bindingHandlers.timeAgo = {
    update: function (element, valueAccessor) {
        var val = unwrap(valueAccessor()),
            date = new Date(val), // WARNING: this is not compatibile with IE8
            timeAgo = toTimeAgo(date);
        return ko.bindingHandlers.html.update(element, function () {
            return '<time datetime="' + encodeURIComponent(val) + '">' + timeAgo + '</time>';
        });
    }
};

ko.bindingHandlers.executeOnEnter = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var callback = valueAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                callback.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

(function (ko) {
    // Wrap ko.observable and ko.observableArray
    var methods = ['observable', 'observableArray'];

    ko.utils.arrayForEach(methods, function (method) {
        var saved = ko[method];

        ko[method] = function (initialValue, options) {
            options = options || {};

            var key = options.persistKey;
            var savedInitialValue = initialValue;

            // Load existing value if set
            if (key && localStorage.hasOwnProperty(key)) {
                try {
                    var get = options.persistGet;
                    if (get)
                        initialValue = get(localStorage.getItem(key));
                    else
                        initialValue = JSON.parse(localStorage.getItem(key));
                } catch (e) { };
            }

            // Create observable from saved method
            var observable = saved(initialValue);

            // Add reset method
            observable.reset = function () { observable(savedInitialValue); };

            // Subscribe to changes, and save to localStorage
            if (key) {
                var set = options.persistSet;
                if (set)
                    observable.subscribe(function (newValue) { localStorage.setItem(key, set(newValue)); });
                else
                    observable.subscribe(function (newValue) { localStorage.setItem(key, ko.toJSON(newValue)); });
            };

            return observable;
        }
    })
})(ko);

$(document).ready(function () {
    // Apply bindings
    ko.applyBindings(progressVM, $('#ProgressModal')[0]);
    ko.applyBindings(messageVM, $('#MessageModal')[0]);

    // Apply tooltips
    $('[data-toggle="tooltip"]').tooltip();

    //Twitter
    !function (d, s, id) { var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https'; if (!d.getElementById(id)) { js = d.createElement(s); js.id = id; js.src = p + '://platform.twitter.com/widgets.js'; fjs.parentNode.insertBefore(js, fjs); } }(document, 'script', 'twitter-wjs');
    !function (d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (!d.getElementById(id)) { js = d.createElement(s); js.id = id; js.src = "https://platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs); } }(document, "script", "twitter-wjs");

    //Facebook
    window.fbAsyncInit = function () {
        FB.init({
            appId: '1715727061980032',
            xfbml: true,
            version: 'v2.3'
        });
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
});
