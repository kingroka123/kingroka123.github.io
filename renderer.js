var isElectron  = false;
var cmd = require('node-cmd');
const remote = require('electron').remote;
var macroQueue;
var mainWindow = remote.getCurrentWindow();
var contents = mainWindow.webContents;
const { dialog } = require('electron').remote
function close() {
  mainWindow.close();
}

function hideWindow() {
  mainWindow.hide();
}

function electron(user) {
  if (window && window.process && window.process.type) {
    console.log("electron!!")
    console.log(contents)
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
  }else{
    electronUI(false);
    isElectron = false;
  }
}






