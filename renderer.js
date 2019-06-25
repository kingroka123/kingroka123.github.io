var cmd = require('node-cmd');
const remote = require('electron').remote;
var macroQueue;
var mainWindow = remote.getCurrentWindow();

function close() {
  mainWindow.close();
}

function hideWindow() {
  mainWindow.hide();
}

function electron(user) {
  if (window && window.process && window.process.type) {
    console.log("electron!!")

    macroQueue = firebase.database().ref("macroqueue/" + cuser.uid);
    macroQueue.on("child_added", function (snapshot) {
      // console.log(snapshot.val());
      cmd.run(snapshot.val())
      snapshot.ref.remove();
    });
    
    input = document.querySelector("#close-button");
   
    input.addEventListener("click", function (event) {
      hideWindow();
    });
    electronUI(true);
  }else{
    electronUI(false);
  }
}






