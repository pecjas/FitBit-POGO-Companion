import { inbox } from "file-transfer";
import { existsSync } from "fs";
import { handleSettingEvent } from "./receiveSetting";

export function initFT()
{
  console.log("Initializing file transfer.");
  inbox.addEventListener("newfile", processAllFiles);
  processAllFiles();
}

function processAllFiles()
{
  let fileName;
  while (fileName = inbox.nextFile())
  {
    console.log(`/private/data/${fileName} is now available`);
  }
}

export function addListenerForFile(fileName, functionToExecute, paramToInclude)
{
  console.log("Initializing final file listener.");
  
  // If we already have the file, just trigger function
  if ( existsSync(`/private/data/${fileName}`) )
  {
    console.log("Final file already present. Execiting listener.");
    functionToExecute( paramToInclude );
    return;
  }

  var fileListenerRemoveSelf = () =>
  {
    inbox.removeEventListener("newfile", fileListener)
  };

  var fileListener = (event) => 
  {
    console.log(`Listener identified file - comparing to desired file '${fileName}'`);
    // If file exists, we've reached our final file
    if ( existsSync(`/private/data/${fileName}`) )
    {
      functionToExecute(paramToInclude);
      
      // Remove listener moving forward
      fileListenerRemoveSelf();
    }
  };

  // Add listener
  inbox.addEventListener("newfile", fileListener);
}