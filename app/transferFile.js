import { inbox } from "file-transfer";
import { handleSettingEvent } from "./receiveSetting"; // TODO - Is there a way to pass this function in without requiring this import?
import { existsSync, listDirSync, unlinkSync } from "fs";

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

export function deleteUnusedFiles(usedFiles)
{
  // TODO - Review why some files are deleted multiple times?
  console.log("[deleteUnusedFiles] Initiated.");
  if ( usedFiles && Array.isArray(usedFiles) )
  {
    var appFileDirectory = listDirSync("/private/data");
    var dirIterator, fileName;
    while ( (dirIterator = appFileDirectory.next()) && !dirIterator.done )
    {
      fileName = dirIterator.value;
      if ( usedFiles.indexOf(fileName) > -1 ) continue;
      // Not indicated as used file - delete it
      console.log(`[deleteUnusedFiles] Removing file: ${fileName}`);
      unlinkSync( fileName );
    }
  }
}