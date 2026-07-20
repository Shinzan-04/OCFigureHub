using Azure.Storage.Blobs;
using System.Text;

var conn = "DefaultEndpointsProtocol=https;AccountName=test;AccountKey=test;EndpointSuffix=core.windows.net";
// we just need to see if Azure SDK throws before network.
var client = new BlobContainerClient("UseDevelopmentStorage=true", "test");
try
{
    var ms = new MemoryStream(Encoding.UTF8.GetBytes("hello"));
    ms.Position = ms.Length; // Position at end
    await client.GetBlobClient("test.txt").UploadAsync(ms);
}
catch (Exception ex)
{
    Console.WriteLine($"Exception: {ex.Message}");
}
