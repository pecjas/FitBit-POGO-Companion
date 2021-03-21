import { inbox } from "file-transfer"
import document from "document";

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