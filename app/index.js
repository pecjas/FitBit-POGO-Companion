import document from "document";
import * as messaging from "messaging";
import { handleSettingEvent } from "./receiveSetting";
import { initFT } from "./transferFile";
import { existsSync } from "fs";

// Initialize file transfer listeners
initFT();

// Check if we already have task data to load
if ( existsSync(`/private/data/TSRTaskData.txt`) )
{
  console.log( "[app/index.js] Task data identified on load. Triggering mock event." );
  let mockEvt =
  {
    data:
    {
      key: "TSRTask_NewFile",
      newValue: "true"
    }
  };
  
  handleSettingEvent(mockEvt);
}

// Message is received
messaging.peerSocket.onmessage = evt => 
{
  handleSettingEvent(evt);
};

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};
