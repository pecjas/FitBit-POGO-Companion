import { outbox } from "file-transfer"

export function transferFile(fileURL, fileName)
{
  // Fetch the image from the internet
  fetch(fileURL).then(function (response)
  {
    return response.arrayBuffer();
  })
  .then(data =>
  {
    outbox.enqueue(fileName, data)
    .then(ft =>
    {
      console.log(`Transfer of '${fileName}' successfully queued.`);
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