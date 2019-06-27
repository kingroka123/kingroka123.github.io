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



function newAction(templateID) {
    generateMicroHTML(templateID)
}

function clearActionList() {
    $("#action-list").empty();
    $("#wizard-action-name").val("")
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
            $("#" + view + "-controls").fadeOut(function () {
                $("#" + newView + "-controls").fadeIn();
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

$("#macro-preset-search").on('input', function () {

    updateSearch()
});

function updateSearch() {
    var val = $("#macro-preset-search").val().toLowerCase();
    if (val.startsWith("tag:")) {
        val = val.substring(4);
    }
    $(".macro-preset").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(val) > -1 || $(this).data("tag").toLowerCase().indexOf(val) > -1)
    });

}
function setSearch(e) {
    var search = $(e).text();
    $("#macro-preset-search").val(search);
    updateSearch()

}

function clearSearch() {
    $("#macro-preset-search").val("");
    updateSearch()
}
var inputTemplate = `<input autocomplete="new-password" autocapitalize="none" type="text"
class="text-field text-field-sm micro-input" data-tag="{{tag}}"
placeholder="{{purpose}}" data-purpose="{{purpose}}" value="{{value}}" data-type="input"></input>`

var textareaTemplate = `<textarea autocomplete="new-password" autocapitalize="none" type="text"
class="text-field commit-message micro-input" data-tag="{{tag}}" data-type="textarea" 
placeholder="{{purpose}}" data-purpose="{{purpose}}">{{value}}</textarea>`

var microTemplate =
    `<div data-template={{id}} data-border="{{border}}" class="macro-list-item {{border}}-border" id="micro-test">
        <div>
            <span style="display: none" class="command">{{command}}</span>
            <h5 class="title">{{title}}</h5>
            <br>
            <action-top></action-top>
        </div>
    </div>`

function MicroTemplate(id, title, command, border, tags, inputs) {
    this.title = title;
    this.command = command;
    this.border = border;
    this.tags = tags;
    this.inputs = inputs;
    this.id = id;
    this.commandMAC = "";
}

function Micro(templateID, values) {
    this.templateID = templateID;
    this.values = values;
}

function MicroValue(tag, value) {
    this.tag = tag;
    this.value = value;
}

function MicroTemplateInput(type, tag, purpose) {
    this.type = type;
    this.tag = tag;
    this.purpose = purpose;
}

function Macro(id, name, color, micros) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.micros = micros;
}


var keyboardMicroTemplate = new MicroTemplate("keymicro",
    "Keyboard",
    `powershell "$wsh = New-Object -ComObject WScript.Shell; $wsh.SendKeys('#keys');"`,
    "red", "common",
    [
        new MicroTemplateInput("input", "keys", "enter name"),
    ]);
var fileMicroTemplate = new MicroTemplate("filemicro",
    "File",
    "explorer #file",
    "yellow", "common",
    [
        new MicroTemplateInput("input", "file", "file path"),
    ]);
var webMicroTemplate = new MicroTemplate("websitemicro",
    "Website",
    "explorer #website",
    "green", "common",
    [
        new MicroTemplateInput("input", "website", "website url (with https://)"),
    ]);

var appMicroTemplate = new MicroTemplate("appmicro",
    "App",
    "start #app #arguments",
    "blue", "common",
    [
        new MicroTemplateInput("input", "app", "path to application"),
        new MicroTemplateInput("input", "arguments", "arguments")
    ]);

function getMicroFromHTML(element) {
    element = $(element);

    var template = element.data("template");
    inputs = []
    element.find(".micro-input").each(function () {
        var input = { tag: $(this).data("tag"), value: $(this).val() }
        inputs.push(input);

    });

    newMicro = new Micro(template, inputs)
    return newMicro;
}

function generateMicroHTML(templateID, micro=null) {
    microTemplatesRef.child(templateID).once("value", function (snapshot) {
        var template = snapshot.val();
        if (template) {
            var iTemp = microTemplate.replaceAll("{{title}}", template.title)
                .replaceAll("{{command}}", template.command)
                .replaceAll("{{border}}", template.border).replace("{{id}}", template.id);
            var element = $($.parseHTML(iTemp));

            template.inputs.forEach(function (input) {
                var temp = "";
                if (input.type == "input") {
                    temp = inputTemplate + "";
                } else if (input.type == "textarea") {
                    temp = textareaTemplate;
                }
                var val = "";
                if (micro) {
                    micro.values.forEach(function (v) {
                        if (v.tag == input.tag) {
                            val = v.value;
                        }
                    });
                }
                temp = temp.replaceAll("{{tag}}", input.tag)
                    .replaceAll("{{purpose}}", input.purpose)
                    .replaceAll("{{value}}", val);
                element.append(temp)
            });

            $("#action-list").append(element);
        } else {
            console.log("template " + templateID + " does not exist!")
        }
    });
}

function getCommand(micro, callback = function (command) { console.log(command) }) {
    var templateID = micro.templateID;

    microTemplatesRef.child(templateID).once("value", function (snapshot) {
        var template = snapshot.val();
        if (template) {
            var command = template.command + "";
            micro.values.forEach(function (v) {
                command = command.replaceAll("#" + v.tag, v.value);
            });

            callback(command);
        }
    });
}

function saveMicroTemplate(template) {
    microTemplatesRef.child(template.id).update(template);
}



function getMacroFromHTML() {
    microList = $("#action-list");
    micros = [];
    microList.children().each(function () {
        micro = getMicroFromHTML(this);
        micros.push(micro);
    });
    return new Macro($("#wizard-area").get(0).dataset.target, $("#wizard-action-name").val(), getColor(), micros);
}

function generateMacroHTML(macro){
    macro.micros.forEach(function(micro){
        generateMicroHTML(micro.templateID, micro)
    });
    setColor(macro.color);
}

function executeMacro(macro) {

}

