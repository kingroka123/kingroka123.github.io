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




function clearActionList() {
    $("#action-list").empty();
    $("#wizard-action-name").val("")
}
var views = ["edit", "dashboard", "list", "micromanage"];

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
    }
}
switchView("edit")
$("#macro-preset-search").on('input', function () {
    updateSearch()
});

function updateSearch() {
    var val = $("#macro-preset-search").val().toLowerCase();
    if (val.startsWith("tag:")) {
        val = val.substring(4);
    }
    $(`.micro-button-container`).filter(function () {
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
var inputTemplate = `
<div class="form-area" style="margin-top: 15px;">
    <div class="text-label">{{purpose}}</div>
    <input autocomplete="new-password" autocapitalize="none" type="text"
    class="text-field text-field-sm micro-input" data-tag="{{tag}}"
    placeholder="" data-purpose="{{purpose}}" value="{{value}}" data-type="input"></input>
</div>`

var textareaTemplate = `
<div class="form-area" style="margin-top: 15px;">
    <div class="text-label">{{purpose}}</div>
    <textarea autocomplete="new-password" autocapitalize="none" type="text"
    class="text-field commit-message micro-input" data-tag="{{tag}}" data-type="textarea" 
    placeholder="" data-purpose="{{purpose}}">{{value}}</textarea>
</div>`

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
    `powershell "$wsh = New-Object -ComObject WScript.Shell; $wsh.SendKeys('#keys');" & timeout #timeout`,
    "red", "common",
    [
        new MicroTemplateInput("input", "keys", "enter name"),
        new MicroTemplateInput("input", "timeout", "timeout"),

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
var yeetMicroTemplate = new MicroTemplate("yeetmicro",
    "YEET",
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

function addGlobalMicro(templateID) {
    generateGlobalMicroHTML(templateID)
}

function addPersonalMicro(templateID) {
    generatePersonalMicroHTML(templateID)
}


function generateGlobalMicroHTML(templateID, micro = null) {
    microTemplatesRef.child(templateID).once("value", function (snapshot) {
        var template = snapshot.val();
        if (template) {
            $("#action-list").append(microTemplateToHtml(template, micro));
        } else {
            generatePersonalMicroHTML(templateID, micro);
        }
    });
}

function generatePersonalMicroHTML(templateID, micro = null) {
    personalMicroTemplatesRef.child(templateID).once("value", function (snapshot) {
        var template = snapshot.val();
        if (template) {
            $("#action-list").append(microTemplateToHtml(template, micro));
        } else {
            console.log("template " + templateID + " does not exist!")
        }
    });
}
function microTemplateToHtml(template, micro = null) {
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

    return (element);
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
        } else {
            personalMicroTemplatesRef.child(templateID).once("value", function (snapshot) {
                var template = snapshot.val();
                if (template) {
                    var command = template.command + "";
                    micro.values.forEach(function (v) {
                        command = command.replaceAll("#" + v.tag, v.value);
                    });

                    callback(command);
                } else {
                    console.log("command not found")
                }
            });
        }
    });
}

function saveMicroTemplateGlobal(template) {
    // only works if an ADMIN 
    if (template.tags.indexOf("common") == -1)
        template.tags += " common";
    if (!template.id)
        template.id = ID();
    microTemplatesRef.child(template.id).update(template);
}

function saveMicroTemplatePersonal(template) {
    if (template.tags.indexOf("personal") == -1)
        template.tags += " personal";
    if (!template.id)
        template.id = ID();
    personalMicroTemplatesRef.child(template.id).update(template);
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

function generateMacroHTML(macro) {
    macro.micros.forEach(function (micro) {
        generateGlobalMicroHTML(micro.templateID, micro)
    });
    setColor(macro.color);
}


var templateInputFormTemplate = `
    <div class="edit-micro-input">
        <span class="material-icons handle"
            style="vertical-align: middle; margin-right: 5px; cursor: pointer;">reorder</span>
        <div class="form-area inline" style="margin-top: 15px;">
            <div class="text-label">Type</div>
            <select  autocomplete="new-password" autocapitalize="none"
                type="text" class="text-button edit-template-input-type">
                <option value="input">Single Line</option>
                <option value="textarea">Text Area</option>

            </select>
        </div>
        <div class="form-area inline" style="margin-top: 15px; width:20%">
            <div class="text-label">Variable</div>
            <input  autocomplete="new-password" autocapitalize="none"
                type="text" class=" edit-template-input-tag text-field text-field-sm">
        </div>
        <div class="form-area inline" style="margin-top: 15px; width: 30%">
            <div class="text-label">Purpose</div>
            <input  autocomplete="new-password" autocapitalize="none"
                type="text" class="text-field text-field-sm edit-template-input-purpose">
        </div>
        <span class="material-icons" style="vertical-align: middle; cursor: pointer;"
            onclick="$(this).parent().remove()">close</span>
    </div>
`;

function addInputToForm(type = "input", tag = "", purpose = "") {
    var input = $($.parseHTML(templateInputFormTemplate));
    input.find(".edit-template-input-type").val(type);
    input.find(".edit-template-input-tag").val(tag);
    input.find(".edit-template-input-purpose").val(purpose);
    $("#edit-micro-inputs").append(input);
}

function getInputsFromForm() {
    var inputs = [];
    $("#edit-micro-inputs").find(".edit-micro-input").each(function (input) {
        var i = new MicroTemplateInput(
            $(this).find(".edit-template-input-type").val(),
            $(this).find(".edit-template-input-tag").val(),
            $(this).find(".edit-template-input-purpose").val());
        inputs.push(i);
    });

    return inputs;
}

function editMicroTemplate(template) {
    hideMicroManager(function () {
        $("#edit-micro-inputs").empty();
        $("#edit-template-name").val(template.title);
        $("#edit-template-tags").val(template.tags);
        $("#edit-template-id").val(template.id);
        $("#edit-template-command").val(template.command);
        if (template.inputs) {
            template.inputs.forEach(function (input) {
                addInputToForm(input.type, input.tag, input.purpose);
            });
        }
        setTemplateColor(template.border)
        showMicroManager();
    })

}

function clearMicroTemplateForm() {
    $("#edit-micro-inputs").empty();
    $("#edit-template-name").val("");
    $("#edit-template-tags").val("");
    $("#edit-template-id").val("");
    $("#edit-template-command").val("");

    setTemplateColor("red")
}
function editPersonalMicroTemplate(templateID) {
    personalMicroTemplatesRef.child(templateID).once("value", function (snapshot) {
        var template = snapshot.val();
        if (template) {
            editMicroTemplate(template);
        } else {
            console.log("template " + templateID + " does not exist!")
        }
    });
}

function savePersonalTemplate() {
    template = getTemplateFromEditForm();
    saveMicroTemplatePersonal(template);
    console.log(template)
}

function showMicroManager(callback) {
    $('#edit-micro').slideDown('slow');
}
function hideMicroManager(callback) {
    $('#edit-micro').slideUp('slow', function () {
        clearMicroTemplateForm();
        if (callback) {
            callback();
        }
    });
}
function editGlobalMicroTemplate(templateID) {
    microTemplatesRef.child(templateID).once("value", function (snapshot) {
        var template = snapshot.val();
        if (template) {
            editMicroTemplate(template);

        } else {
            console.log("template " + templateID + " does not exist!")
        }
    });
}

function saveGlobalTemplate() {
    template = getTemplateFromEditForm();
    saveMicroTemplateGlobal(template);
    console.log(template)
}

function deleteSelectedTemplate() {
    template = getTemplateFromEditForm()
    if (template.id) {
        if (confirm("Warning! Deleting a Micro Template will break every Macro that uses it. Still continue with deletion?")) {
            console.log("deleteing...")
            personalMicroTemplatesRef.child(template.id).remove(function (snapshot) {
                clearMicroTemplateForm();
            });
        }
    }
}


function getTemplateFromEditForm() {
    var template = new MicroTemplate(
        $("#edit-template-id").val(),
        $("#edit-template-name").val(),
        $("#edit-template-command").val(),
        getTemplateColor(),
        $("#edit-template-tags").val(), getInputsFromForm())
    return template;
}


function selectTemplateColor(element) {
    $("#template-color [data-color-selected='true']").get(0).dataset.colorSelected = false;
    var color = $(element).get(0).classList[1];
    $("#template-color ." + color).get(0).dataset.colorSelected = true;
}

function getTemplateColor() {
    return $("#template-color [data-color-selected='true']").get(0).classList[1];
}

function setTemplateColor(color) {
    selectTemplateColor($("#template-color .color-button." + color));
}

var el = document.getElementById('edit-micro-inputs');
var sortable = Sortable.create(el, {
    easing: "cubic-bezier(0.47, 0, 0.745, 0.715)", // Easing for animation. Defaults to null. See for examples.
    handle: ".handle",
    ghostClass: "blur",
    animation: 150,
});