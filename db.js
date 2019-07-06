
cuser = null;
macroListRef = null;
macroQueueRef = null;
macroDashboardsRef = null;
microTemplatesRef = firebase.database().ref("micros/global");
var deviceRef;

personalMicroTemplatesRef = null;
var dontMacro = false;
var dashboardPage = 0;
var macroEntry = `
<div  class="macro-entry" data-target="{{id}}" data-command="{{command}}" data-name="{{name}}">
    <input type="text" onload="addEnterBind(this);" data-enterbind=".save-macro-button[data-target='{{id}}']" autocapitalize="none" 
    class="macro-name text-field text-field-sm text-field-short" data-target="{{id}}" placeholder="Name" value="{{name}}"
        disabled>
   
    <button class="text-button blue-border" onclick="setMacro(this)" data-target="{{id}}">set</button>
    <button class="text-button yellow-border" onclick="editMacro(this)" data-target="{{id}}">edit</button>
    <button class="text-button red-border" onclick="deleteMacro(this)" data-target="{{id}}">delete</button>
    <button style="display: none" class="text-button save-macro-button green-border" onclick="saveMacro(this)" data-target="{{id}}">save</button>
</div>
`;

var globalMicroButton = `
<span data-templateID="{{templateID}}" data-tag="{{templateTags}}" class="micro-button-container">
    <button class="text-button macro-preset {{templateBorder}}-border" data-templateID="{{templateID}}" onclick="addGlobalMicro('{{templateID}}')"
    data-tag="{{templateTags}}">{{templateName}}</button>
</span>
`;
var editMicroButton =
    `<div data-templateID="{{templateID}}" 
       class=" inline text-button little-icon-button" 
       onclick="editPersonalMicroTemplate('{{templateID}}')"> 
        <i class="material-icons"> edit </i> 
  </div>`;
var personalMicroButton = `
<span data-templateID="{{templateID}}" data-tag="{{templateTags}}" class="micro-button-container">
    <button style="margin-right: -35px;" class="text-button macro-preset {{templateBorder}}-border" data-templateID="{{templateID}}" onclick="addPersonalMicro('{{templateID}}')"
    data-tag="{{templateTags}}">{{templateName}} 
    </button>
    ${editMicroButton}
</span>
    `;

var deviceTemplate = `
    <div class="device-entry">
        <check-box data-target="{{deviceID}}"></check-box> <span>{{deviceName}}</span>
    </div>  
`;

function nextPage() {
    //check perm
    setPage(getPage() + 1)

}

function previousPage() {
    setPage(getPage() - 1)

}

function setPage(page) {
    if (page >= 0 && page < 10) {
        dashboardPage = page;
        updateDashboardPage()
    }
}

function getPage() {
    return dashboardPage;
}

function getPageOffset() {
    return getPage() * buttonsInRow * buttonsInCol;
}

function updateDashboardPage() {
    setPageNumberField()
    macroListRef.once("value", (snapshot) => {
        var macros = snapshot.val()
        for (var macro in macros) {
            setMacroButtonsTargets(macros[macro]);
        }

    });
}


function setMacroButtonsTargets(macro) {
    if (macro.set) {
        document.querySelectorAll(`.macro-button[data-target="${macro.id}"`).forEach((button) => {
            if (!macro.set.includes(parseInt(button.dataset.number - getPageOffset()))) {
                button.dataset.target = "";
                button.innerHTML = " ";
                $(button).addClass("macro-button-empty");
            }
        });
        macro.set.forEach((number) => {
            number -= getPageOffset();
            macrobutton = document.querySelector(`.macro-button[data-number="${number}"]`);
            if (macrobutton) {
                macrobutton.dataset.target = macro.id;
                name = macro.name;
                macrobutton.innerHTML = name;
                changeMacroButtonColor(macrobutton, macro.color);
                $(macrobutton).removeClass("macro-button-empty");
            }
        });
    }
}

function realClear(button) {
    button.dataset.target = "";
    button.innerHTML = " ";
    $(button).addClass("macro-button-empty");
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var email = user.email;
        var emailVerified = user.emailVerified
        cuser = user;
        macroListRef = firebase.database().ref("macrolist/" + user.uid);
        macroQueueRef = firebase.database().ref("macroqueue/" + user.uid);
        macroDashboardsRef = firebase.database().ref("dashboards/" + user.uid);

        personalMicroTemplatesRef = firebase.database().ref("micros/" + user.uid);;
        deviceRef = firebase.database().ref("devices/" + user.uid)
        document.querySelector("#name-display").innerHTML = email;

        /* Dashboards */
        deviceRef.on("child_added", (snapshot) => {
            var device = snapshot.val();
            var elem = deviceTemplate.replaceAll("{{deviceID}}", device.id).replaceAll("{{deviceName}}", device.name);
            $("#devices").append(elem);
        })

        macroDashboardsRef.on("child_added", (snapshot) => {
            var dashboard = snapshot.val();
            dashboard.buttons.forEach((button, index) => {
                // console.log(button)
                // macroButton = document.querySelector(`.macro-button[data-number="${button.index}"`);
                // macroButton.dataset.target = button.id;

                // if (macroButton) {
                //     macroButton.dataset.target = dashboard.id;
                //     macroButton.innerHTML = val.name;
                //     $(macroButton).removeClass("macro-button-empty");
                //     changeMacroButtonColor(macroButton, val.color)
                // }
            });
        });


        /* global templates */
        microTemplatesRef.on("child_changed", function (snapshot) {
            var template = snapshot.val();
            var elem = globalMicroButton
                .replaceAll("{{templateID}}", template.id)
                .replaceAll("{{templateName}}", template.title)
                .replaceAll("{{templateBorder}}", template.border)
                .replaceAll("{{templateTags}}", template.tags);

            $(`.micro-button-container[data-templateID='${template.id}']`).replaceWith(elem);
        });

        microTemplatesRef.on("child_removed", function (snapshot) {
            var template = snapshot.val();

            $(`.micro-button-container[data-templateID='${template.id}']`).remove();
        });

        microTemplatesRef.on("child_added", function (snapshot) {
            var template = snapshot.val();
            var elem = globalMicroButton
                .replaceAll("{{templateID}}", template.id)
                .replaceAll("{{templateName}}", template.title)
                .replaceAll("{{templateBorder}}", template.border)
                .replaceAll("{{templateTags}}", template.tags);
            $("#micro-presets").append(elem);
        });

        /* personal templates */

        personalMicroTemplatesRef.on("child_changed", function (snapshot) {
            var template = snapshot.val();
            var elem = personalMicroButton
                .replaceAll("{{templateID}}", template.id)
                .replaceAll("{{templateName}}", template.title)
                .replaceAll("{{templateBorder}}", template.border)
                .replaceAll("{{templateTags}}", template.tags);
            $(`.micro-button-container[data-templateID='${template.id}']`).replaceWith(elem);


        });

        personalMicroTemplatesRef.on("child_removed", function (snapshot) {
            var template = snapshot.val();

            $(`.micro-button-container[data-templateID='${template.id}']`).remove();

        });

        personalMicroTemplatesRef.on("child_added", function (snapshot) {
            var template = snapshot.val();
            var elem = personalMicroButton
                .replaceAll("{{templateID}}", template.id)
                .replaceAll("{{templateName}}", template.title)
                .replaceAll("{{templateBorder}}", template.border)
                .replaceAll("{{templateTags}}", template.tags);
            $("#micro-presets").append(elem);
        });


        macroListRef.on("child_added", function (snapshot) {
            var copy = macroEntry + " ";
            var val = snapshot.val();

            function dothings() {
                copy = copy.replaceAll("{{id}}", val.id);
                copy = copy.replaceAll("{{name}}", val.name);
                copy = copy.replaceAll("{{command}}", val.command);

                $("#macro-list").append(copy);
                $(`.macro-name[data-target="${val.id}"`).trigger('onload');
                $(`.macro-command[data-target="${val.id}"`).trigger('onload');

                setMacroButtonsTargets(val)

            }
            dothings();

            // if (val.encrypted) {
            //     decryptMacro(snapshot.ref.getKey()).then((decrypted) => {
            //         val = decrypted;
            //     })
            // } else {
            //     dothings();
            // }
        });
        macroListRef.on("child_removed", function (snapshot) {
            id = snapshot.ref.getKey();
            document.querySelector(`.macro-entry[data-target="${id}"]`).remove();
            document.querySelectorAll(`.macro-button[data-target="${id}"]`).forEach(realClear)

        });

        macroListRef.on("child_changed", function (snapshot) {
            val = snapshot.val();
            function dothings() {
                number = val.set;
                old = document.querySelector(`.macro-button[data-target="${val.id}"]`);
                // oldColor = 
                // remove from old macro button

                if (old) {
                    old.dataset.target = "";
                    old.innerHTML = " ";
                    $(old).addClass("macro-button-empty");
                }
                setMacroButtonsTargets(val)

                //change entry element
                macroEntryElemName = document.querySelector(`.macro-name[data-target="${val.id}"]`);
                macroEntryElemName.value = val.name;
            }
            // if (val.encrypted) {
            //     decryptMacro(snapshot.ref.getKey()).then((decrypted) => {
            //         val = decrypted;
            //         dothings();
            //     })
            // } else {
            //     dothings();
            // }
            dothings();

        });

        setTimeout(function () { $("#preloader").fadeOut() }, 750);
        if (electron) {
            electron(user);
        }

    } else {

        redirect("./login.html");

    }
});

function newDashboard(name = "new dashboard", cols = 5, rows = 4) {
    macroDashboardsRef.child(ID()).set({
        name: name,
        cols: cols,
        rows: rows,
        buttons: [{ index: 0, id: "sasdasd" }]
    })
}


function changeMacroButtonColor(element, color) {
    if (color) {
        var oldColor;
        $(element).get(0).classList.forEach(function (e) {
            if (e.endsWith("border")) {
                oldColor = e;
            }
        });
        $(element).removeClass(oldColor);
        $(element).addClass(color + "-border");

    }
}

function logout() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        console.log("signed out");
        redirect("./login.html");
        deleteCookie('passphrase')
    }, function (error) {
        // An error happened.
    });
}

function edit() {
    switchView("edit")
}

function closeEdit() {
    switchView('list')

}
let set = false;
var longMove = false;
let target = "";
var macroDevices = null

function ripple(element) {
  
    var rect = element.getBoundingClientRect();
    console.log(rect)
    const xPos = rect.left + rect.width/2,
        yPos = rect.top + rect.height/2,
        elWavesRipple = document.createElement('div');
    console.log(xPos)
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

function macro(element) {

    if (!set) {
        if (!dontMacro && !isDrawerOpen()) {
            t = element.dataset.target;
            if (cuser && macroQueueRef && t && t.length > 0) {
                macroListRef.child(t).once("value", function (snapshot) {
                    var macro = snapshot.val();
                    function dostuff() {
                        ripple(element)
                        snackbar(`Running <span class="${macro.color}-font">` + macro.name + `</span>`)

                        if (macro.micros) {
                            cmdTarget = macro.micros.length;
                            macroDevices = macro.devices;
                            macro.micros.forEach(function (micro) {

                                getCommand(micro, condense);

                            })
                        }
                        macroDevices = null;
                    }
                    if (typeof (macro.micros) == "string") {
                        decryptMacro(t).then((decrypted) => {
                            macro = decrypted;
                            dostuff();
                        });
                    } else {
                        dostuff();


                    }
                    vibrate(100);
                });
            }
        }
    } else {

        var number = parseInt(element.dataset.number) + getPageOffset();
        var setRef = macroListRef.child(target).child("set");
        setRef.once("value", (snapshot) => {
            list = snapshot.val();
            if (list) {
                if (!list.includes(number)) {
                    list.push(number);
                    setRef.set(list);
                }
            } else {
                setRef.set([number]);
            }
        })
        cancelSet();

    }
    dontMacro = false;

}
var cmdTemp = "";
var cmds = 0;
var cmdTarget = 0;
function condense(c) {
    cmdTemp += c + " & ";
    cmds++;
    if (cmds >= cmdTarget) {
        runCommand(cmdTemp);
        cmdTemp = "";
        cmds = 0;
        cmdTarget = 0;
    }
}

function runCommand(command) {
    if (command && macroDevices) {
        for (var device in macroDevices) {
            deviceRef.child(device).once("value", (snapshot) => {
                if (snapshot.val() && snapshot.val().online) {
                    if (macroDevices[device].checked == "true") {
                        macroQueueRef.set({ [device]: command });

                    }
                }
            })
        }

        console.log(command)
        macroDevices = null;
    }
}

function editMacro(element) {
    var id = element.dataset.target;
    macroListRef.child(`/${id}`).once("value", (snapshot) => {
        clearActionList();
        document.querySelector('#wizard-area').dataset.target = id;

        switchView("edit")
        var val = snapshot.val();
        console.log(id)
        if (typeof (val.micros) == "string") {
            decryptMacro(id).then((decrypted) => {
                generateMacroHTML(decrypted);
                $("#wizard-action-name").val(decrypted.name)
            });
        } else {
            generateMacroHTML(val);
            $("#wizard-action-name").val(val.name)

        }


    });

}

function saveMacro() {
    var macro = getMacroFromHTML();
    macro.encrypted = false;
    macroListRef.child(macro.id).update(macro);
    switchView('list')
}

function updateMacro(macro) {
    macroListRef.child(macro.id).update(macro);
}

function deleteMacro(element) {
    if (confirm("Are you sure you want to delete?")) {
        id = element.dataset.target;
        macroListRef.child(id).remove();
    }
}

function newMacro() {
    closeDrawer(function () {
        clearActionList();
        switchView("edit");
    });
}

function setNewMacroID() {
    var newID = ID();
    $('#wizard-area').get(0).dataset.target = newID;
}
function setMacro(element) {

    id = element.dataset.target;
    set = true;
    target = id;
    closeDrawer();
    document.querySelector("#cancel-button").style.display = "inline-block";

}

function cancelSet() {
    target = "";
    set = false;
    document.querySelector("#cancel-button").style.display = "none";
}

function clearMacro(element) {
    var target = $(element).get(0).dataset.target;
    if (target) {
        var number = parseInt(element.dataset.number) + getPageOffset();
        var setRef = macroListRef.child(target).child("set");
        setRef.once("value", (snapshot) => {
            list = snapshot.val();
            index = list.indexOf(number);
            if (number > -1) {
                list.splice(index, 1)
                setRef.set(list);
            }
        })
        vibrate(200);
    }
}

var pressTimer;
$('.macro-button')
    .on({
        'touchend': function (e) {
            clearTimeout(pressTimer);

        }
    })
    .on({
        'touchstart': function (e) {
            var macroButton = this;
            pressTimer = window.setTimeout(function () {
                //clearMacro(macroButton);
                longPress(macroButton, e);
            }, 500);

        }
    });
$(window).contextmenu(function (e) {
    e.preventDefault();
    if ($(e.target).hasClass('macro-button')) {
        longPress(e.target, e)
    }
});

$(document).mousedown(function (e) {

    var container = $("#long-menu");
    var drawer = $("#drawer");
    var toolbar = $(".tool-bar");
    var snackbar = $(".snack-bar")
    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        hideLongMenu();
    }
    if (!drawer.is(e.target) && drawer.has(e.target).length === 0 && !toolbar.is(e.target) && toolbar.has(e.target).length === 0) {
        closeDrawer();
    }
    if (!snackbar.is(e.target) && snackbar.has(e.target).length === 0) {
        hideSnackBars();
    }
});


function longPress(macroButton, e) {
    showLongMenuFor(macroButton, e)
}

function selectColor(element) {
    $("#action-colors [data-color-selected='true']").get(0).dataset.colorSelected = false;
    $("#long-menu [data-color-selected='true']").get(0).dataset.colorSelected = false;
    var color = $(element).get(0).classList[1];
    $("#action-colors ." + color).get(0).dataset.colorSelected = true;
    $("#long-menu ." + color).get(0).dataset.colorSelected = true;
}

function getColor() {
    return $("#action-colors [data-color-selected='true']").get(0).classList[1];
}

function setColor(color) {
    selectColor($(".color-button." + color));
}

var selectedMacroButton;
function showLongMenuFor(macroButton, e) {
    var id = $(macroButton).get(0).dataset.target;

    if (!id) return;

    macroListRef.child(`/${id}`).once("value", function (snapshot) {
        var color = snapshot.val().color;
        if (!color) color = "blue";
        clearActionList();
        setColor(color);
    });

    selectedMacroButton = macroButton;


    if (e) {
        var width = $("#long-menu").get(0).getBoundingClientRect().width;
        var height = $("#long-menu").get(0).getBoundingClientRect().height;
        console.log("w: " + width)
        var x = 0;
        var y = 0;

        var xx = (e.clientX > window.innerWidth / 2);
        var yy = (e.clientY > window.innerHeight / 2);
        if (xx) {
            x = e.clientX - width;
        } else {
            x = e.clientX;
        }
        if (yy) {
            y = e.clientY - height;
        } else {
            y = e.clientY;
        }

        document.querySelector("#long-menu").style.left = x + "px";
        document.querySelector("#long-menu").style.top = y + "px";
    }
    $("#long-menu").finish();
    $("#long-menu").css('visibility', 'visible')

    vibrate(200);
    document.activeElement.blur();

}

function clearSelectedMacroButton() {
    clearMacro(selectedMacroButton);
    hideLongMenu()
}

function hideLongMenu() {
    if ($("#long-menu").css('visibility') == "visible")
        dontMacro = true;
    $("#long-menu").css('visibility', 'hidden')


}

function setSelectedMacroButton() {
    target = $(selectedMacroButton).get(0).dataset.target;
    if (target) {
        // $("#controls").fadeOut();
        $("#edit").fadeOut();
        document.querySelector("#cancel-button").style.display = "inline-block";
        set = true;
        longMove = true;
        hideLongMenu()
    }
}

function setSelectedColor() {
    var id = $(selectedMacroButton).get(0).dataset.target;
    var c = getColor();
    macroListRef.child(`/${id}`).update({ color: c });
}

function editSelectedMacroButton() {
    editMacro($(selectedMacroButton).get(0))
    hideLongMenu()
}

$(document.body).on("mousedown touchstart", function () {
});

