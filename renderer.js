var isElectron = false;
var cmd = require('node-cmd');
const remote = require('electron').remote;
var macroQueue;
var mainWindow = remote.getCurrentWindow();
var contents = mainWindow.webContents;
const { app, dialog } = require('electron').remote
var AutoLaunch = require('auto-launch');
let autoLaunch = null;
var client = new ClientJS()
const DeviceID = client.getFingerprint();
var os = require('os')
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
    autoLaunch.isEnabled().then((isEnabled) => {
      if (!isEnabled)
        $("#autolaunch-field").val("close");
      else
        $("#autolaunch-field").val("open");
    });
    console.log(deviceRef)
    deviceRef.child(DeviceID).once('value', (snapshot) => {
      console.log(snapshot.val());
      if (!snapshot.val()) {
        deviceRef.child(DeviceID).set({ id: DeviceID, name: os.hostname() })

      }
    })

    deviceRef.child(DeviceID).on("value", (snapshot) => {
      $("#computer-name-field").val(snapshot.val().name)
    })

    $("#computer-name-field").on("change keyup", () => {
      deviceRef.child(DeviceID).update({ name: $("#computer-name-field").val() });
    });

    macroQueue = firebase.database().ref("macroqueue/" + cuser.uid + "/" + DeviceID);
    macroQueue.on("value", function (snapshot) {
      if (snapshot.val()) {
        cmd.get(snapshot.val(), console.log)
        snapshot.ref.remove();
      }
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

// if (window.requestIdleCallback) {
//   requestIdleCallback(function () {
//       Fingerprint2.get(function (components) {
//         console.log(components) // an array of components: {key: ..., value: ...}
//       })
//   })
// } else {
//   setTimeout(function () {
//       Fingerprint2.get(function (components) {
//         console.log(components) // an array of components: {key: ..., value: ...}
//       })  
//   }, 500)
// }






