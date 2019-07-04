var isElectron = false;
var cmd = require('node-cmd');
const remote = require('electron').remote;
var macroQueue;
var mainWindow = remote.getCurrentWindow();
var contents = mainWindow.webContents;
const { app, dialog } = require('electron').remote
var AutoLaunch = require('auto-launch');
let autoLaunch = null;
if (AutoLaunch) {
  autoLaunch = new AutoLaunch({
    name: 'Macro',
    path: app.getPath('exe'),
  });
}
function close() {
  mainWindow.close();
}

function hideWindow() {
  mainWindow.hide();
}

function disableAutoLaunch() {
  autoLaunch.isEnabled().then((isEnabled) => {
    if (isEnabled) autoLaunch.disable();
    setCookie("autolaunch", false, 365)
  });
}
function enableAutoLaunch() {
  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
    setCookie("autolaunch", true, 365)

  });
}

function setAutoLaunchByForm() {
  option = $("#autolaunch-field").val();
  if (option == "open") {
    enableAutoLaunch();
  } else {
    disableAutoLaunch();
  }
}

function electron(user) {
  if (window && window.process && window.process.type) {
    console.log("electron!!")
    console.log(contents)
    autoLaunch.isEnabled().then((isEnabled) => {
      if (!isEnabled)
        $("#autolaunch-field").val("close");
      else
        $("#autolaunch-field").val("open");
    });

    macroQueue = firebase.database().ref("macroqueue/" + cuser.uid);
    macroQueue.on("child_added", function (snapshot) {
      // console.log(snapshot.val());
      cmd.get(snapshot.val(), console.log)
      snapshot.ref.remove();
    });

    input = document.querySelector("#close-button");

    input.addEventListener("click", function (event) {
      hideWindow();
    });
    electronUI(true);
    isElectron = true;
  } else {
    electronUI(false);
    isElectron = false;
  }
}






