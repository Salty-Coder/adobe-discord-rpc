var csInterface = new CSInterface();
var path = require('path');
const Shell = require('node-powershell');

var restart_event = new CSEvent("com.discordrpc.restart", "APPLICATION");

function restart(){
    csInterface.dispatchEvent(restart_event);
    window.location.reload();
    console.log("works");
}

function install(x){

    var adobe_path = (path.join(__dirname, "../"));
    var buttons = document.getElementsByClassName("disable_button")
    for (var i = 0; i < buttons.length; i++) {
        buttons.item(i).disabled = true;
    }

    switch(process.platform){
            
        case 'win32':
            const ps = new Shell({
              executionPolicy: 'Bypass',
              noProfile: true
            });
        
            var type = "";
        
            switch(x){
                //latest
                case 0:
                    type = "latest";
                    break;
                //release
                case 1:
                    type = "release";
                    break;
                default:
                    return;
            }
            ps.addCommand(`Start-Process Powershell -Verb runAs -WorkingDirectory '${adobe_path}' -Argument "Write-Host '${adobe_path}';cd '${adobe_path}';Invoke-WebRequest https://raw.githubusercontent.com/lolitee/adobe-discord-rpc/install-scripts/scripts/${type}.ps1 -OutFile ${type}.ps1; .\\${type}.ps1;"`)
            ps.invoke()
            .then(output => {
                console.log(output);
        
            })
            .catch(err => {
              alert(err);
              for (var i = 0; i < buttons.length; i++) {
                buttons.item(i).disabled = false;
             }
            });
    
            break;
        case 'darwin':
            alert("currently unsupported")
            break;
        default:
            alert("unsupported");
    }
}