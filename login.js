
function show(elem) {
    elem.style.display = "block";
}

function hide(elem) {
    elem.style.display = "none";
}


function switchToLoginForm() {
    loginForm = $("#login-form");
    signupForm = $("#sign-up-form");
    signupForm.fadeOut(function(){
        loginForm.fadeIn();
    }) ;


}

function switchToSignUpForm() {
    loginForm = $("#login-form");
    signupForm = $("#sign-up-form");
    loginForm.fadeOut(function(){
        signupForm.fadeIn();
    }) ;
}


function signup() {
    emailField = document.querySelector("#new-email");
    passwordField = document.querySelector("#new-password");
    confirmPasswordField = document.querySelector("#confirm-password");
    if (passwordField.value === confirmPasswordField.value) {
        firebase.auth().createUserWithEmailAndPassword(emailField.value, passwordField.value).catch(function (error) {

            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
        });
    }
}

function login() {
    emailField = document.querySelector("#email");
    passwordField = document.querySelector("#password");
    firebase.auth().signInWithEmailAndPassword(emailField.value, passwordField.value).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
        // ...
    });
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

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var email = user.email;
        var emailVerified = user.emailVerified;
        redirect("./app.html");

    } else {
        switchToLoginForm();

    }
});


function close() {
    mainWindow.close();
}

function hideWindow() {
    mainWindow.hide();
}
var mainWindow;
window.onload = function () {
    var input = document.querySelector("#password");
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            login();
        }
    });

    input = document.querySelector("#email")
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            login();
        }
    });

    input = document.querySelector("#new-email")
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            signup();
        }
    });

    input = document.querySelector("#new-password")
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            signup();
        }
    });

    input = document.querySelector("#confirm-password")
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            signup();
        }
    });
    if (window && window.process && window.process.type) {
        input = document.querySelector("#close-button");
        input.style.display="inline-block";
        var remote = require('electron').remote;

        mainWindow = remote.getCurrentWindow();

        console.log("login electron!!")
        input = document.querySelector("#close-button")
        input.addEventListener("click", function (event) {
            hideWindow();
        });
        electronUI(true);
    }else{
        electronUI(false)
    }


}