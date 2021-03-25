import { outbox } from "file-transfer";
import { me as companion } from "companion";
import { Image } from "image";

export function transferFile(fileURL, fileName)
{
  // Fetch the image from the internet
  if ( !companion.permissions.granted("access_internet") )
  {
    console.log("[tsrSettingHandler] Unable to downloaded web file without internet permissions.");
    return;
  }

  fetch(fileURL).then(function (response)
  {
    return response.arrayBuffer();
  })
  .then(buffer => 
  {
    return Image.from(buffer, "image/png");
  })
  .then(function(image)
  {
    return image.export( "image/vnd.fitbit.txi",
    {
      background: "#111111" //"#000000"
    });
  })
  .then(buffer =>
  {
    var convertedFileName = fileName + ".txi";
    outbox.enqueue(convertedFileName, buffer)
    .then(ft =>
    {
      console.log(`Transfer of '${convertedFileName}' successfully queued.`);
    })
    .catch(err =>
    {
      throw new Error(`Failed to queue '${fileName}'. Error: ${err}`);
    });
  })
  .catch(err =>
  {
    console.error(`Failure: ${err}`);
  });
}