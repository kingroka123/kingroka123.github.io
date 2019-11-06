


function showDialog(dialogID){
    var fullString = dialogID;
    if(!fullString.includes("-dialog")){
        fullString += "-dialog";
    }
    $("#" + fullString).fadeIn();

}

function hideDialog(dialogID){
    var fullString = dialogID;
    if(!fullString.includes("-dialog")){
        fullString += "-dialog";
    }
    $("#" + fullString).fadeOut();

}