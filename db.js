cuser = null;
macroListRef = null;
macroQueueRef = null;
var macroEntry =
    `
<div  class="macro-entry" data-target="{{id}}" data-command="{{command}}" data-name="{{name}}">
    <input type="text" onload="addEnterBind(this);" data-enterbind=".save-macro-button[data-target='{{id}}']" autocapitalize="none" class="macro-name text-field text-field-sm text-field-medium" data-target="{{id}}" placeholder="Name" value="{{name}}"
        disabled>
   
    <button class="text-button blue-border" onclick="setMacro(this)" data-target="{{id}}">set</button>
    <button class="text-button yellow-border" onclick="editMacro(this)" data-target="{{id}}">edit</button>
    <button class="text-button red-border" onclick="deleteMacro(this)" data-target="{{id}}">delete</button>
    <button style="display: none" class="text-button save-macro-button green-border" onclick="saveMacro(this)" data-target="{{id}}">save</button>
</div>
`;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var email = user.email;
        var emailVerified = user.emailVerified;
        cuser = user;
        macroListRef = firebase.database().ref("macrolist/" + user.uid);
        macroQueueRef = firebase.database().ref("macroqueue/" + user.uid);
        document.querySelector("#name-display").innerHTML = email;

        macroListRef.on("child_added", function (snapshot) {
            copy = macroEntry + " ";
            val = snapshot.val();
            copy = copy.replaceAll("{{id}}", val.id);
            copy = copy.replaceAll("{{name}}", val.name);
            copy = copy.replaceAll("{{command}}", val.command);

            $("#macro-list").append(copy);
            $(`.macro-name[data-target="${val.id}"`).trigger('onload');
            $(`.macro-command[data-target="${val.id}"`).trigger('onload');

            macroButton = document.querySelector(`[data-number="${val.set}"`);

            if (macroButton) {
                macroButton.dataset.target = val.id;
                macroButton.innerHTML = val.name;
                $(macroButton).removeClass("macro-button-empty");
                changeMacroButtonColor(macroButton, val.color)
            }
        });
        macroListRef.on("child_removed", function (snapshot) {
            id = snapshot.val().id;
            document.querySelector(`.macro-entry[data-target="${id}"]`).remove();
            old = document.querySelector(`button[data-target="${id}"]`);
            if (old) {
                old.dataset.target = "";
                old.innerHTML = " ";
                $(old).addClass("macro-button-empty");

            }
        });

        macroListRef.on("child_changed", function (snapshot) {
            val = snapshot.val();
            number = val.set;
            old = document.querySelector(`button[data-target="${val.id}"]`);
            // oldColor = 
            // remove from old macro button

            if (old) {
                old.dataset.target = "";
                old.innerHTML = " ";
                $(old).addClass("macro-button-empty");
            }
            if (number > -1) {
                // change set macro
                macrob = document.querySelector(`[data-number="${number}"]`);
                macrob.dataset.target = val.id;
                name = val.name;
                macrob.innerHTML = name;
                changeMacroButtonColor(macrob, val.color);
                $(macrob).removeClass("macro-button-empty");
            }

            //change entry element
            macroEntryElemName = document.querySelector(`.macro-name[data-target="${val.id}"]`);
            macroEntryElemName.value = val.name;

        });

        setTimeout(function () { $("#preloader").fadeOut() }, 750);
        if (electron) {
            electron(user);
        }

    } else {

        redirect("./login.html");

    }
});


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
    }, function (error) {
        // An error happened.
    });
}

function edit() {
    $("#edit-form").fadeIn();
}

function closeEdit() {
    $("#edit-form").fadeOut();
}
let set = false;
var longMove = false;
let target = "";
function macro(element) {
    if (!set) {
        if (!$("#long-menu").is(":visible")) {
            t = element.dataset.target;

            if (cuser && macroQueueRef && t && t.length > 0) {
                macroListRef.child(t).once("value", function (snapshot) {
                    if (snapshot.val().command && snapshot.val().command.trim().length > 0) {
                        runCommand(snapshot.val().command);
                        vibrate(100);

                    }
                });
            }
            document.activeElement.blur();
        } else {
            showLongMenuFor(element)
        }
    } else {
        // element.dataset.target = target;
        macroListRef.child(target).update({ set: element.dataset.number });
        cancelSet();
        if (longMove) {
            showLongMenuFor(element)
            longMove = false;
        }
    }
}

function runCommand(command) {
    if (command) {
        macroQueueRef.update({ [ID()]: command });
    }
}

function editMacro(element) {
    var id =  element.dataset.target;
    console.log(id)
    
    macroListRef.child(`/${id}`).once("value", function (snapshot) {
        var command = snapshot.val().command;
        var name = snapshot.val().name;
        var color = snapshot.val().color;
        if (!color) color = "blue";
        clearActionList();
        document.querySelector('#wizard-area').dataset.target = id;
        $("#wizard-action-name").val(name)
        $('#macro-list-area').fadeOut(function () { $('#wizard-area').fadeIn(function(){$("#edit-form").fadeIn();}); });
        elementsFromCommand(command);
        setColor(color);
        
    });

}

function saveMacro() {
    var id = document.querySelector("#wizard-area").dataset.target;
    var name = $("#wizard-action-name").val();
    var c = commandFromElements();
    // console.log(`${id} . ${name} . ${c}`)
    updateMacro(id, name, c, getColor())
    $('#wizard-area').fadeOut(function () { $('#macro-list-area').fadeIn(); });
}

function updateMacro(idd, n, c, ncolor) {

    macroListRef.child(idd).update(
        {
            name: n,
            command: c,
            id: idd,
            color: ncolor
        }
    );
}

function deleteMacro(element) {
    if (confirm("Are you sure you want to delete?")) {
        id = element.dataset.target;
        macroListRef.child(id).remove();
    }
}

function newMacro() {
    clearActionList();
    var newID = ID();
    $('#wizard-area').get(0).dataset.target = newID;
    console.log(newID)
    $('#macro-list-area').fadeOut(function () { $('#wizard-area').fadeIn(); });
}


function setMacro(element) {

    id = element.dataset.target;
    set = true;
    target = id;
    // $("#controls").fadeOut();
    $("#edit-form").fadeOut();
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
        macroListRef.child(target).update({ set: -1 });
        vibrate(200);
    }
}

$(".macro-button").mouseup(function () {
    clearTimeout(pressTimer);

}).mousedown(function () {
    var macroButton = this;
    pressTimer = window.setTimeout(function () {
        //clearMacro(macroButton);
        longPress(macroButton);

    }, 500);
});
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
                longPress(macroButton);
            }, 500);

        }
    })
    .contextmenu(function(e){
        e.preventDefault();
        longPress(this)
    });
function longPress(macroButton) {
    showLongMenuFor(macroButton)
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
function showLongMenuFor(macroButton) {

    var id = $(macroButton).get(0).dataset.target;
    if (!id) return;
    if (!$("#long-menu").is(":visible")) {
        vibrate(200);
    }
    macroListRef.child(`/${id}`).once("value", function (snapshot) {
        var color = snapshot.val().color;
        if (!color) color = "blue";
        clearActionList();
        setColor(color);
    });

    selectedMacroButton = macroButton;
    $("#long-menu").fadeIn();
    $(macroButton).blur();
    var left = $(macroButton).get(0).getBoundingClientRect().left;
    var top = $(macroButton).get(0).getBoundingClientRect().top;
    var width = $("#long-menu").get(0).getBoundingClientRect().width;
    var height = $(macroButton).get(0).getBoundingClientRect().height;
    var x = (left - width / 4);
    x = x.clamp(5, window.innerWidth - width - 5);
    var y = 0;
    if (top < window.innerHeight / 2) {
        y = (top + height) + 20;
        $("#button-pointer-up").show();
        $("#button-pointer-down").hide();
    } else {
        y = (top - $("#long-menu").get(0).getBoundingClientRect().height) - 20;
        $("#button-pointer-up").hide();
        $("#button-pointer-down").show();
    }
    $("#long-menu").get(0).style.left = x + "px";
    $("#long-menu").get(0).style.top = y + "px";

    width = $(macroButton).get(0).getBoundingClientRect().width;
    $("#button-pointer-up").get(0).style.left = (left + width / 2 - 5) + "px";
    $("#button-pointer-up").get(0).style.top = (y - 20) + "px";

    $("#button-pointer-down").get(0).style.left = (left + width / 2 - 5) + "px";
    $("#button-pointer-down").get(0).style.top = (y + $("#long-menu").get(0).getBoundingClientRect().height) + "px";
}

function clearSelectedMacroButton() {
    clearMacro(selectedMacroButton);
    //   $('#long-menu').fadeOut()
}

function setSelectedMacroButton() {

    target = $(selectedMacroButton).get(0).dataset.target;
    if (target) {
        // $("#controls").fadeOut();
        $("#edit-form").fadeOut();
        document.querySelector("#cancel-button").style.display = "inline-block";
        set = true;
        longMove = true;
        $('#long-menu').fadeOut()
    }
}

function setSelectedColor() {
    var id = $(selectedMacroButton).get(0).dataset.target;
    var c = getColor();
    macroListRef.child(`/${id}`).update({ color: c });
}

function editSelectedMacroButton(){
     editMacro( $(selectedMacroButton).get(0))
     $('#long-menu').fadeOut()

}

$(document.body).on("mousedown touchstart", function () {
});