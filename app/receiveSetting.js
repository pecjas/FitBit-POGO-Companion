import document from "document";
import { readFileSync, existsSync, unlinkSync, writeFileSync } from "fs";
import { addListenerForFile, deleteUnusedFiles } from "./transferFile";

export function handleSettingEvent(evt)
{
  console.log(`App received: ${JSON.stringify(evt)}`);
  updateBackground(evt);
};

function updateBackground(evt)
{
  let background = document.getElementById("background");
  
  // Color update
  if (evt.data.key === "color" && evt.data.newValue)
  {
    let color = JSON.parse(evt.data.newValue);
    if (color != background.style.fill)
    {
      console.log(`Setting background color: ${color}`);
      background.style.fill = color;
    }
  }
  
  // Task data - delete old file
  if (evt.data.key === "TSRTask_DelFile" && evt.data.newValue)
  {
    if ( existsSync(`/private/data/TSRTaskData.txt`) )
    {
      unlinkSync("TSRTaskData.txt");
    }
  }
  
  // Task partial data - store in file
  if (evt.data.key === "TSRTaskList" && evt.data.newValue)
  {
    // Create file if one doesn't exist yet
    if ( !existsSync(`/private/data/TSRTaskData.txt`) )
    {
      writeFileSync("TSRTaskData.txt", [], "json");
    }
    
    // Read current data
    let currentData = readFileSync("TSRTaskData.txt", "json");
    
    // Set updated data
    let newData = currentData.concat( evt.data.newValue );
    writeFileSync("TSRTaskData.txt", newData, "json");
  }

  if (evt.data.key === "TSRTask_LastFile" && evt.data.newValue)
  {
    let mockEvt =
    {
      data:
      {
        key: "TSRTask_NewFile",
        newValue: "true"
      }
    };
    // TODO - Extend to not just listen for last file
    addListenerForFile( evt.data.newValue, handleSettingEvent, mockEvt );
  }
  
  //if (evt.data.key === "TSRTaskList" && evt.data.newValue)
  if (evt.data.key === "TSRTask_NewFile" && evt.data.newValue)
  {
    //let taskList = evt.data.newValue;
    if ( existsSync(`/private/data/TSRTaskData.txt`) )
    {
      let taskList = readFileSync("TSRTaskData.txt", "json");
      if (taskList && taskList.length > 0)
      {
        populateTaskListElement(taskList);
        
        // Identify all used files in private data storage
        var usedFiles = taskList.reduce((allResults, taskDetails) =>
        {
          if ( taskDetails.hasOwnProperty("rewards") && Array.isArray(taskDetails.rewards) )
          {
            // Get array of reward images for current task
            var rewardImages = taskDetails.rewards.map((rewardDetails) =>
            {
              if ( rewardDetails.img )
              {
                return rewardDetails.img;
              }
            });

            // Add all reward images to result array
            allResults = allResults.concat(rewardImages);
          }
          
          return allResults;
        },
        []);
        
        // Remove any files not currently used
        usedFiles.push("TSRTaskData.txt");
        deleteUnusedFiles(usedFiles);
      }
    }
  }
  
};

function populateTaskListElement(taskList)
{
  var taskListElement = document.getElementById("myList");
  
  taskListElement.delegate = 
  {
    getTileInfo: (index) =>
    {
      var tileInfo = 
      {
        type: "my-pool",
        value: `${taskList[index].name}`,
        rewards: taskList[index].rewards,
        index: index
      };
      
      return tileInfo;
    },
    
    configureTile: (tile, info) =>
    {
      console.log(`Item: ${info.index}`);
      if (info.type == "my-pool")
      {
        tile.getElementById("text").text = `${info.value}`;
        setTileImages(tile, info);
        
        let touch = tile.getElementById("touch");
        touch.addEventListener("click", evt =>
        {
          console.log(`touched: ${info.index}`);
        });
      }
    }
  };
  
  taskListElement.length = taskList.length;
}


function setTileImages(tile, info)
{
  var imgCount = info.rewards.length;
  if (imgCount > 3) imgCount = 3; // Max of 3 displayed per tile currently
  
  // Assign image pointers
  var image3 = tile.getElementById("image3");
  var image3Shiny = tile.getElementById("image3-shiny");

  var image2 = tile.getElementById("image2");
  var image2Shiny = tile.getElementById("image2-shiny");

  var image = tile.getElementById("image");
  var imageShiny = tile.getElementById("image-shiny");

  switch( imgCount )
  {
    case 3:
      
      image3.href = `/private/data/${info.rewards[2].img}`;

      // Add shiny icon if available
      if ( info.rewards[2].isShiny )
      {
        image3Shiny.href = "shiny-icon.png";
      }
      else
      {
        image3Shiny.href = "";
      }
    case 2:
      image2.href = `/private/data/${info.rewards[1].img}`;
      
      // Add shiny icon if available
      if ( info.rewards[1].isShiny )
      {
        image2Shiny.href = "shiny-icon.png";
      }
      else
      {
        image2Shiny.href = "";
      }
    case 1:
      image.href = `/private/data/${info.rewards[0].img}`;

      // Add shiny icon if available
      if ( info.rewards[0].isShiny )
      {
        imageShiny.href = "shiny-icon.png";
      }
      else
      {
        imageShiny.href = "";
      }

      // Clear previous images if we're no longer displaying them
      if ( imgCount < 3 )
      {
        image3.href = "";
        image3Shiny.href = "";
      }
      if ( imgCount < 2 )
      {
        image2.href = "";
        image2Shiny.href = "";
      }
      break;
    
    // No images - use missingNo resouce
    case 0:
      var image = tile.getElementById("image");
      image.href = "missingNo.png";
  }
}
