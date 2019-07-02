$.fx.speeds._default = 300;

var ID = function () {
    return '@' + Math.random().toString(36).substr(2, 9);
};

function redirect(ext) {
    window.location.replace(ext);
}
function setCookie(cname, cvalue, exdays = 1, path = window.location.pathname) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=" + path;
}
function deleteCookie(cookie) {
    document.cookie = cookie + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=" + window.location.pathname;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};
Number.prototype.roundTo = function (num) {
    return num * (Math.round(this / num));
}
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
function vibrate(pattern) {
    window.navigator.vibrate(pattern);
}

function addEnterBind(element) {
    if (element.dataset && element.dataset.enterbind) {
        var input = document.querySelector(element.dataset.enterbind)
        element.addEventListener("keyup", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                $(input).click();

            }
        });
    }
}
String.prototype.nthIndexOf = function (pattern, n) {
    var i = -1;

    while (n-- && i++ < this.length) {
        i = this.indexOf(pattern, i);
        if (i < 0) break;
    }

    return i;
}


document.querySelectorAll("[data-enterbind]").forEach(
    function (element) {
        addEnterBind(element);
    }
);

function electronUI(e) {
    if (e) {
        $(".electron-visible").show();
        $(".electron-hidden").hide();
    } else {
        $(".electron-visible").hide();
        $(".electron-hidden").show();
        $(".electron-shift").removeClass("electron-shift");
        $(".electron-height").removeClass("electron-height");

    }
}

async function encryt(obj) {
    $.get("http://localhost:5000/mobile-dock/us-central1/encrypt")
}


function encryptObj(object, passphrase) {
    var temp = {};
    if (object) {
        for (var property in object) {
        //    console.log(property + ", " + object[property])
            temp[property] = CryptoJS.AES.encrypt(object[property], passphrase).toString();
        }
    }
   // console.log(temp)
    return object;
}

async function decryptObj(object, passphrase) {
    var decryptObj = firebase.functions().httpsCallable('decryptObj');
    var v;
    await decryptObj({ object: object }).then(function (result) {
        // Read result of the Cloud Function.
        v = result.data;
    });
   

    return v;
}


async function decryptMacro(encryptedMacroID){
    var decryptMacro = firebase.functions().httpsCallable('decryptMacro');
    var v;
    await decryptMacro({ id: encryptedMacroID }).then(function (result) {
        v = result.data;
        console.log(v)
    });
   
    return v;
}



