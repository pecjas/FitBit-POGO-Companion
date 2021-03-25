import { peerSocket } from "messaging";
import { me as companion } from "companion";
import * as fs from "fs";
import { transferFile } from "./transferWebFile";

let dataToSend =
{
  key: "TSRTaskList",
  newValue: []
};

let lastImageSent = "";

export function tsrSettingHandler(data)
{
  // Log debug info
  console.log("TSR Setting Handler initiated");
  console.log("Max message size: " + peerSocket.MAX_MESSAGE_SIZE);
  
  if ( companion.permissions.granted("access_internet") )
  {
    getCurrentTasks();
  }
  else
  {
    console.log("[tsrSettingHandler] Unable to downloaded latest data without internet permissions.");
  }
}

function getCurrentTasks()
{
  let url = "https://thesilphroad.com/research-tasks";
  
  fetch(url)
  .then(function (response)
  {
	  // The API call was successful!
    return response.text();
  })
  .then(function (html) {
    // This is the HTML from our response as a text string
    console.log("[getCurrentTasks] Retrieved TSR Task HTML.");
    
    // Delete current task file
    sendDeleteNotification();
    
    // Convert the HTML string into a document object
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    
    // Evaluate and track each task
    var pkmnTasks = doc.getElementsByClassName("task pkmn");
    for ( var i = 0; i < pkmnTasks.length; i++ )
    {
      evaluatePkmnTask(pkmnTasks[i]);
    }
    // Send final notification - trigger loading display
    sendFinalNotification();
  })
  .catch(function (err) {
    // There was an error
    console.warn('Error retrieving The Silph Road task data: ', err);
  });
};

function evaluatePkmnTask(pkmnTask)
{
  let taskDetails = {};
  
  let taskNameElement = pkmnTask.querySelector(".taskText");
  let taskName = taskNameElement ? taskNameElement.innerText : "<Unable to retrieve task name>";
  taskDetails.name = taskName;

  taskDetails.rewards = [];
  let pkmnElements = pkmnTask.getElementsByClassName("task-reward pokemon");
  if ( !pkmnElements || pkmnElements.length < 1 )
  {
    // Don't track non-pokemon reward tasks
    return;
  }
  
  var pkmnImageElement, pkmnImageUrl, pkmnImageName, rewardDetails;
  for ( var i = 0; i < pkmnElements.length; i++ )
  {
    pkmnImageElement = pkmnElements[i].querySelector("img");
    
    pkmnImageUrl = pkmnImageElement.src;
    pkmnImageName = pkmnImageUrl.split("/").pop(); // Name is last piece of url
    transferFile(pkmnImageUrl, pkmnImageName); // Send file to device
    
    // Track last image sent
    lastImageSent = `${pkmnImageName}.txi`;

    taskDetails.rewards.push({
      "img": `${pkmnImageName}.txi`,
      "isShiny": pkmnElements[i].classList.contains("shinyAvailable")
    });
  }
  
  dataToSend.newValue = taskDetails;
  sendTaskData(dataToSend);
}

function sendDeleteNotification()
{
  if (peerSocket.readyState === peerSocket.OPEN)
  {
    peerSocket.send({
      key: "TSRTask_DelFile",
      newValue: "true"
    });
  }
}

// Sending partial data to be stored on device file
function sendTaskData(formattedData)
{
  // Send data
  if (peerSocket.readyState === peerSocket.OPEN)
  {
    // Send notification that data is available
    peerSocket.send(formattedData);
  }
}

function sendFinalNotification()
{
  if (peerSocket.readyState === peerSocket.OPEN)
  {
    peerSocket.send({
      key: "TSRTask_LastFile",
      newValue: lastImageSent
    });

    // peerSocket.send({
    //   key: "TSRTask_NewFile",
    //   newValue: "true"
    // });
  }
}


