using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;
using OCFigureHub.Application.Abstractions;

namespace OCFigureHub.Infrastructure.Storage;

public class AzureBlobStorageService : IStorageService
{
    private readonly BlobContainerClient _container;
    private readonly IConfiguration _cfg;

    public AzureBlobStorageService(IConfiguration cfg)
    {
        _cfg = cfg;

        var conn = _cfg["AzureBlob:ConnectionString"];
        var containerName = _cfg["AzureBlob:ContainerName"];

        _container = new BlobContainerClient(conn, containerName);
        _container.CreateIfNotExists();
    }

    public async Task<(string storageKey, long size)> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        CancellationToken ct)
    {
        var key = $"{DateTime.UtcNow:yyyy/MM}/{Guid.NewGuid()}_{fileName}";
        var blob = _container.GetBlobClient(key);

        await blob.UploadAsync(content, overwrite: true, cancellationToken: ct);

        await blob.SetHttpHeadersAsync(new Azure.Storage.Blobs.Models.BlobHttpHeaders
        {
            ContentType = contentType
        }, cancellationToken: ct);

        // size (best effort)
        var props = await blob.GetPropertiesAsync(cancellationToken: ct);
        return (key, props.Value.ContentLength);
    }

    public string GenerateReadSasUrl(string storageKey, TimeSpan ttl, string? ipAddress = null)
    {
        var blob = _container.GetBlobClient(storageKey);

        if (!blob.CanGenerateSasUri)
        {
            throw new InvalidOperationException("Blob client cannot generate SAS URI. Use account key credential.");
        }

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _container.Name,
            BlobName = storageKey,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.Add(ttl)
        };

        if (!string.IsNullOrEmpty(ipAddress) && 
            System.Net.IPAddress.TryParse(ipAddress, out var parsedIp) && 
            parsedIp.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork && 
            ipAddress != "127.0.0.1")
        {
            sasBuilder.IPRange = new SasIPRange(parsedIp, parsedIp);
        }

        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        var sasUri = blob.GenerateSasUri(sasBuilder);
        return sasUri.ToString();
    }
}
