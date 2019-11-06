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

function clearActionList() {
    $("#action-list").empty();
    $("#wizard-action-name").val("")
    document.querySelectorAll("check-box div").forEach((e) => {
        e.setAttribute("data-checked", "false")

    })
    setNewMacroID()
}
var views = ["edit", "list", "settings", "edit-micro", "dashboard", "device-manager"];
var viewHistory = [];
var lastView = "",
    currentView;

function swapDrawerContent(newView, history = true) {
    if (history && currentView && currentView != viewHistory[viewHistory.length - 1]) {
        viewHistory.push(currentView);
    }

    currentView = newView;

    views.forEach(function(view) {
        $("#" + view).hide();
    });
    $("#" + newView).show();
}

function goBack() {
    if (viewHistory.length > 0) {
        swapDrawerContent(viewHistory.pop(), false);
    }
}

function openDrawer(callback) {
    $("#drawer").show();
    if (callback) {
        callback();
    }
}


function switchView(view) {
    swapDrawerContent(view);
}

switchView("list");
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    //  closeToolbar();
}
$(window).resize(function() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

    } else {
        //  $("#drawer").css({ right: window.innerWidth });
    }
})

function isDrawerOpen() {
    return !$("#drawer").is(":hidden");
}

$("#macro-preset-search").on('input', function() {
    updateSearch()
});

function updateSearch() {
    var val = $("#macro-preset-search").val().toLowerCase();
    if (val.startsWith("tag:")) {
        val = val.substring(4);
    }
    $(`.micro-button-container`).filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(val) > -1 || $(this).data("tag").toLowerCase().indexOf(val) > -1)
    });

}

$("#macro-list-search").on('input', function() {
    updateMacroSearch();
});

function updateMacroSearch() {
    var val = $("#macro-list-search").val().toLowerCase();

    $(`.macro-list-entry`).filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(val) > -1)
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



function showFileDialog(elem) {
    if (dialog) {
        var file = dialog.showOpenDialog({ properties: ['openFile'] })
        console.log(file)
        $(elem).parent().find("input").val(file[0])

    } else {
        alert("Browse only available on desktop version of Macro.")
    }
}

function showDirectoryDialog(elem) {
    if (dialog) {
        var file = dialog.showOpenDialog({ properties: ['openDirectory'] })
        console.log(file)
        $(elem).parent().find("input").val(file[0])

    } else {
        alert("Browse only available on desktop version of Macro.")
    }
}


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

function Macro(id, name, color, micros, devices, categories) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.micros = micros;
    this.devices = devices;
    this.categories = categories;
}


var keyboardMicroTemplate = new MicroTemplate("keymicro",
    "Keyboard",
    `powershell "$wsh = New-Object -ComObject WScript.Shell; $wsh.SendKeys('#keys');" & timeout #timeout`,
    "red", "common", [
        new MicroTemplateInput("input", "keys", "enter name"),
        new MicroTemplateInput("input", "timeout", "timeout"),

    ]);
var fileMicroTemplate = new MicroTemplate("filemicro",
    "File",
    "explorer #file",
    "yellow", "common", [
        new MicroTemplateInput("input", "file", "file path"),
    ]);
var webMicroTemplate = new MicroTemplate("websitemicro",
    "Website",
    "explorer #website",
    "green", "common", [
        new MicroTemplateInput("input", "website", "website url (with https://)"),
    ]);

var appMicroTemplate = new MicroTemplate("appmicro",
    "App",
    "start #app #arguments",
    "blue", "common", [
        new MicroTemplateInput("input", "app", "path to application"),
        new MicroTemplateInput("input", "arguments", "arguments")
    ]);
var yeetMicroTemplate = new MicroTemplate("yeetmicro",
    "YEET",
    "start #app #arguments",
    "blue", "common", [
        new MicroTemplateInput("input", "app", "path to application"),
        new MicroTemplateInput("input", "arguments", "arguments")
    ]);

function getMicroFromHTML(element) {
    element = $(element);

    var template = element.data("template");
    inputs = []
    element.find(".micro-input").each(function() {
        var input = { tag: $(this).data("tag"), value: $(this).val().replaceAll("&quot;", `"`) }
        inputs.push(input);
    });

    newMicro = new Micro(template, inputs)
    return newMicro;
}

function addGlobalMicro(templateID) {
    generateGlobalMicroHTML(templateID);
    hideDialog('micro');
}

function addPersonalMicro(templateID) {
    generatePersonalMicroHTML(templateID);
    hideDialog('micro');
}


function generateGlobalMicroHTML(templateID, micro = null) {
    microTemplatesRef.child(templateID).once("value", function(snapshot) {
        var template = snapshot.val();
        if (template) {
            $("#action-list").append(microTemplateToHtml(template, micro));
        } else {
            generatePersonalMicroHTML(templateID, micro);
        }
    });
}

function generatePersonalMicroHTML(templateID, micro = null) {
    personalMicroTemplatesRef.child(templateID).once("value", function(snapshot) {
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

    template.inputs.forEach(function(input) {
        var temp = "";
        if (input.type == "input") {
            temp = inputTemplate + "";
        } else if (input.type == "textarea") {
            temp = textareaTemplate;
        } else if (input.type == "file") {
            temp = fileInputTemplate;
        } else if (input.type == "dir") {
            temp = directoryInputTemplate;
        }
        var val = "";
        if (micro) {
            micro.values.forEach(function(v) {
                if (v.tag == input.tag) {
                    val = v.value;
                    if (typeof(val) == "string") {
                        val = val.replaceAll(`"`, "&quot;")
                    }
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

function getCommand(micro, callback = function(command) { console.log(command) }) {
    var templateID = micro.templateID;
    microTemplatesRef.child(templateID).once("value", function(snapshot) {
        var template = snapshot.val();
        if (template) {
            var command = template.command + "";
            micro.values.forEach(function(v) {
                command = command.replaceAll("#" + v.tag, v.value);
            });

            callback(command);
        } else {
            personalMicroTemplatesRef.child(templateID).once("value", function(snapshot) {
                var template = snapshot.val();
                if (template) {
                    var command = template.command + "";
                    micro.values.forEach(function(v) {
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
    microList.children().each(function() {
        micro = getMicroFromHTML(this);
        console.log(micro)
        micro.values.forEach(function(value, i) {
            micro.values[i] = value;
        })
        micros.push(micro);

    });
    return new Macro($("#wizard-area").get(0).dataset.target, $("#wizard-action-name").val(), getColor(), micros, getSelectedDevices());
}

function generateMacroHTML(macro) {
    if (macro.micros) {
        if (macro.devices) {
            for (var device in macro.devices) {
                console.log(device);
                var tar = $(`check-box[data-target="${device}"] div`);
                if (tar.length) {
                    tar.get(0).setAttribute("data-checked", macro.devices[device].checked);
                }
            }
        }
        macro.micros.forEach(function(micro) {
            generateGlobalMicroHTML(micro.templateID, micro)
        });
    }
    setColor(macro.color);

}




function addInputToForm(type = "input", tag = "", purpose = "") {
    var input = $($.parseHTML(templateInputFormTemplate));
    input.find(".edit-template-input-type").val(type);
    input.find(".edit-template-input-tag").val(tag);
    input.find(".edit-template-input-purpose").val(purpose);
    $("#edit-micro-inputs").append(input);
}

function getInputsFromForm() {
    var inputs = [];
    $("#edit-micro-inputs").find(".edit-micro-input").each(function(input) {
        var i = new MicroTemplateInput(
            $(this).find(".edit-template-input-type").val(),
            $(this).find(".edit-template-input-tag").val(),
            $(this).find(".edit-template-input-purpose").val());
        inputs.push(i);
    });

    return inputs;
}

function editMicroTemplate(template) {
    hideMicroManager(function() {
        $("#edit-micro-inputs").empty();
        $("#edit-template-name").val(template.title);
        $("#edit-template-tags").val(template.tags);
        $("#edit-template-id").val(template.id);
        $("#edit-template-command").val(template.command);
        if (template.inputs) {
            template.inputs.forEach(function(input) {
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
    personalMicroTemplatesRef.child(templateID).once("value", function(snapshot) {
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
    switchView("edit-micro")
    if (callback) { callback(); }
}

function hideMicroManager(callback) {
    switchView("edit");
    if (callback) { callback(); }

}

function editGlobalMicroTemplate(templateID) {
    microTemplatesRef.child(templateID).once("value", function(snapshot) {
        var template = snapshot.val();
        if (template) {
            editMicroTemplate(template);

        } else {
            console.log("template " + templateID + " does not exist!")
        }
    });
}

function saveGlobalTemplate(id) {
    template = getTemplateFromEditForm();
    template.id = id;
    saveMicroTemplateGlobal(template);
    console.log(template)
}

function deleteSelectedTemplate() {
    template = getTemplateFromEditForm()
    if (template.id) {
        if (confirm("Warning! Deleting a Micro Template will break every Macro that uses it. Still continue with deletion?")) {
            //console.log("deleteing...")
            personalMicroTemplatesRef.child(template.id).remove(function(snapshot) {
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

el = document.getElementById('action-list');
Sortable.create(el, {
    easing: "cubic-bezier(0.47, 0, 0.745, 0.715)", // Easing for animation. Defaults to null. See for examples.
    handle: ".handle",
    ghostClass: "blur",
    animation: 150,
});

function toolTips() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {}
    $(".tool-tip").each(function() {
        var tip = $(this);
        var target = $(tip.data("target"));
        var y = target.position().top - 2;
        tip.css({ top: y + "px" })
        target.hover(function() { tip.css({ visibility: "visible" }) }, function() { tip.css({ visibility: "hidden" }) })
    });
    $(".macro-button[data-number=2]").addClass("expose")
    $('.expose').click(function(e) {
        $(this).css('z-index', '99999');
        $('#overlay').fadeIn(300);
    });

    $('#overlay').click(function(e) {
        $('#overlay').fadeOut(300, function() {
            $('.expose').removeClass("expose")
        });
    });
}


$(window).ready(toolTips);


clearActionList();

function getSelectedDevices() {
    var devices = {};
    document.querySelectorAll("check-box").forEach((e) => {
        devices[$(e).data("target")] = { id: $(e).data("target"), checked: $(e).find("div").get(0).dataset.checked };

    })
    console.log(devices)
    return devices;
}

function hideSnackBars() {
    anime({
        targets: '.snack-bar',
        translateY: '3rem',
        duration: 100,
        easing: "linear",
        complete: () => { $(".snack-bar").remove() }
    });
}

function showSnackBars() {
    anime({
        targets: '.snack-bar',
        translateY: '-3rem',
        duration: 100,
        easing: "linear"
    });
}



function snackbar(message = "command executed", action = "dismiss", func = "hideSnackBars()") {
    var bar = snackbarTemplate
        .replaceAll("{{message}}", message)
        .replaceAll("{{actionfunc}}", func)
        .replaceAll("{{action}}", action);
    $("body").append(bar);
    showSnackBars()
}

function expose(selector) {
    $(selector).addClass("exposed")
    $("#overlay").fadeIn();
}

$(window).ready(() => {

});

function ripple(element) {

    var rect = element.getBoundingClientRect();
    // console.log(rect)
    const xPos = rect.left + rect.width / 2,
        yPos = rect.top + rect.height / 2,
        elWavesRipple = document.createElement('div');
    // console.log(xPos)
    elWavesRipple.className = 'waves-ripple';
    elWavesRipple.style.left = xPos + 'px';
    elWavesRipple.style.top = yPos + 'px';

    const rippleElm = document.querySelector("body").appendChild(elWavesRipple);

    anime({
        targets: '.waves-ripple',
        scale: {
            value: 40,
            duration: 750,
        },
        opacity: {
            value: 0,
            duration: 750
        },
        easing: 'easeOutSine',
        complete: function () {
            const newElm = document.getElementsByClassName('waves-ripple')[0]
            newElm.remove();
        }
    });

}