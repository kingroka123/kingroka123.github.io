function moveUp(elem) {
    var parent = $(elem).parent();
    var index = elem.index();
    if (index > 0) {
        var above = parent.children().toArray()[index - 1];
        elem.detach();
        elem.insertBefore(above);
    }
}
function moveDown(elem) {
    var parent = $(elem).parent();
    var index = elem.index();
    var array = parent.children().toArray();
    if (index < array.length - 1) {
        var above = array[index + 1];
        elem.detach();
        elem.insertAfter(above);
    }
}


var actionTop =
    `
    <div>
        <button class="text-button material-icons white-border left-side"
        onclick="moveUp($(this).parent().parent().parent().parent())">arrow_drop_up</button>
        <button class="text-button material-icons white-border left-side"
        onclick="moveDown($(this).parent().parent().parent().parent())">arrow_drop_down</button>

        <button class="right-side text-button material-icons red-border"
        onclick="$(this).parent().parent().parent().parent().remove()">close</button>
        <br>
        <br>
    </div>
`;

class ActionTop extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = actionTop + "";
    }
}
window.customElements.define('action-top', ActionTop);


var customAction =
    `
    <div class=" list-group-item macro-list-item purple-border">
    <h5>Custom Action</h5>
    <br>
    <action-top></action-top>
    <br>
    <textarea autocomplete="new-password" autocapitalize="none" type="text"
        class="text-field"></textarea>
</div>`;

class CustomAction extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['cmd'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.setCommand();
    }

    setCommand() {

        var temp = this.getAttribute('cmd');
        $(this).find("textarea").val(this.getAttribute('cmd'));

        this.setAttribute("command", "echo custom & " + temp)
    }
    connectedCallback() {
        this.innerHTML = customAction + "";

        linkAttr($(this).find("textarea"), this, "cmd")
        this.setCommand();
    }
}
window.customElements.define('action-custom', CustomAction);


var appAction =
    `
<div class="macro-list-item blue-border">
    <h5>Application Action</h5>
    <br>
    <action-top></action-top>

    <br>
    <input autocomplete="new-password" autocapitalize="none" type="text"
        class="text-field text-field-sm" placeholder="Application Path" value="" data-path></input>
    <br>
    <br>
    <button class="text-button no-outline small-text"
        onclick="$(this).parent().find('.advanced-section').toggle();">Advanced</button>
    <div class="advanced-section">
        <input autocomplete="new-password" autocapitalize="none" type="text"
            class="text-field text-field-sm " placeholder="Application arguments" value="" data-args></input>
        <br>
    </div>
</div>
`
class AppAction extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['path', 'args'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.setCommand();
    }

    setCommand() {
        $(this).find("input[data-path]").val(this.getAttribute('path'));
        $(this).find("input[data-args]").val(this.getAttribute('args'));

        this.setAttribute("command", `echo app & "${this.getAttribute('path')}" ${this.getAttribute('args')}`)
    }
    connectedCallback() {
        this.innerHTML = appAction + "";

        linkAttr($(this).find("input[data-path]"), this, "path")
        linkAttr($(this).find("input[data-args]"), this, "args")

        this.setCommand();
    }
}
window.customElements.define('action-app', AppAction);

var webAction =
    `
<div class="macro-list-item green-border">
    <h5>Web Action</h5>
    <br>
    <action-top></action-top>
    <br>
    <input autocomplete="new-password" autocapitalize="none" "type="text"
    class="text-field text-field-sm" placeholder="URL" ></input>
    <br>
</div>
`
class WebAction extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['url'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.setCommand();
    }

    setCommand() {

        var temp = this.getAttribute('url');
        $(this).find("input").val(temp);

        if (!temp.startsWith("https://") && !temp.startsWith("http://")) {
            temp = "https://" + temp; // always assume https if not specified
        }

        this.setAttribute("command", `echo web & explorer ${temp}`)
    }
    connectedCallback() {
        this.innerHTML = webAction + "";

        linkAttr($(this).find("input"), this, "url")
        this.setCommand();
    }
}
window.customElements.define('action-web', WebAction);


var fileAction =
    `
<div class="macro-list-item yellow-border">
    <h5>File Action</h5>
    <br>
    <action-top></action-top>
   <br>
    <input autocomplete="new-password" autocapitalize="none" "type="text"
        class="text-field text-field-sm" placeholder="File Absolute Path" ></input>
    <br>
</div>
`
class FileAction extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['path'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.setCommand();
    }

    setCommand() {
        $(this).find("input").val(this.getAttribute('path'));
        this.setAttribute("command", `echo file & explorer "${this.getAttribute('path')}"`)
    }
    connectedCallback() {
        this.innerHTML = fileAction + "";

        linkAttr($(this).find("input"), this, "path")
        this.setCommand();
    }
}
window.customElements.define('action-file', FileAction);


var keyAction =
    `
<div class="macro-list-item red-border">
    <h5>Keyboard Action</h5>
    <br>
    <action-top></action-top>
    <br>    
    <input autocomplete="new-password" autocapitalize="none" "type="text"
        class="text-field text-field-sm" placeholder="Keys" ></input>
    <br>
</div>
`
class KeyAction extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['keys'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.setCommand();
    }

    getBoundingClientRect
    setCommand() {
        $(this).find("input").val(this.getAttribute('keys'));
        this.setAttribute("command", "echo key & powershell \"$wsh = New-Object -ComObject WScript.Shell; $wsh.SendKeys(\'" + encode(this.getAttribute('keys')) + "\');\"")
    }
    connectedCallback() {
        this.innerHTML = keyAction + "";

        linkAttr($(this).find("input"), this, "keys")
        this.setCommand();
    }
}
window.customElements.define('action-key', KeyAction);

function encode(raw) {
    var open = false;
    var full = "";
    for (var i = 0; i < raw.length; i++) {
        var c = raw.charAt(i);
        if (c == "{") {
            if (!open) {
                open = true;
            }
        }
        if (!open) {
            if (c == "}") {
                full += c;
            } else {
                full += "{" + c + "}";

            }
        } else {
            full += c;
        }
        if (c == "}") {
            if (open) {
                open = false;
            }
        }
    }
    return full;
}

function decode(encoded) {
    var open = false;
    var full = "";
    var temp = "";
    for (var i = 0; i < encoded.length; i++) {
        var c = encoded.charAt(i);
        if (c == "{" && !open) {
            open = true;
        } else if (c == "}" && open) {
            open = false;
            if (temp.length > 1) {
                full += "{" + temp + "}"
            } else {
                full += temp
            }
            temp = "";
            open = false;
        } else {
            if (open) {
                temp += c;

            } else {
                full += c;
            }
        }
    }

    return full;
}


function newAction(type, vals) {
    element = document.createElement("action-" + type);

    values = Object.values(vals);
    Object.keys(vals).forEach(function (key, index) {
        element.setAttribute(key, values[index])

    });
    $("#action-list").append(element);
}

function commandFromElements() {
    var root = $("#action-list");
    var fullCommand = "";
    root.children().each(function () {
        fullCommand += $(this).attr("command") + " & ";
    });
    //  runCommand(fullCommand);
    return fullCommand;
}
function clearActionList() {
    $("#action-list").empty();
    $("#wizard-action-name").val("")
}

function elementsFromCommand(command) {
    var res = command.split(" & ");
    var type;
    res.forEach(function (part) {
        part = part.trim();
        if (type == null) {
            if (part.startsWith("echo")) {
                type = part.split(" ")[1];
            }
        } else {
            var fragments = part.match(/(?:[^\s"]+|"[^"]*")+/g);

            if (type == "key") {
                var firstQuote = part.nthIndexOf("'", 1);
                var secondQuote = part.nthIndexOf("'", 2);
                var okeys = part.substring(firstQuote + 1, secondQuote)
                newAction("key", { keys: decode(okeys) });
                // console.log("key action: " + okeys);
            } else if (type == "file") {
                var opath = fragments[1].replaceAll('"', "");
                newAction("file", { path: opath });
                // console.log("path action: " + opath);
            } else if (type == "web") {
                var ourl = fragments[1].replaceAll('"', "");
                newAction("web", { url: ourl });
                // console.log("web action: " + ourl);
            } else if (type == "app") {
                var opath = fragments[0].replaceAll('"', "");
                var oargs = fragments[1];
                if (oargs == undefined) {
                    oargs = "";
                }
                newAction("app", { path: opath, args: oargs });
                // console.log("app action: " + opath + " args: " + oargs);
            } else if (type == "custom") {
                var ocmd = part;
                newAction("custom", { cmd: ocmd });
                // console.log("custom action: " + ocmd);
            }
            type = null;
        }
    });
}

var views = ["edit", "dashboard", "list"];
var viewHistory = ["dashboard"];
function switchView(newView, pushHistory = true) {
    views.forEach(function (view) {
        if (view != newView && $("#" + view).is(":visible")) {
            if (viewHistory[viewHistory.length - 1] != view && pushHistory) {
                viewHistory.push(view);
            }
            $("#" + view).fadeOut(function () {
                $("#" + newView).fadeIn();
            });
            $("#" + view +"-controls").fadeOut(function () {
                $("#" + newView +"-controls").fadeIn();
            });
        }
    });
}

function backView() {
    if (viewHistory.length > 0) {
        switchView(viewHistory.pop(), false);
        console.log(viewHistory)
    }
}