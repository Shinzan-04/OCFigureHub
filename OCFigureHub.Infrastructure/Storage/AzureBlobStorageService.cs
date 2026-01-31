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

    public string GenerateReadSasUrl(string storageKey, TimeSpan ttl)
    {
        var blob = _container.GetBlobClient(storageKey);

        if (!blob.CanGenerateSasUri)
        {
            // Nếu connection string không có quyền SAS
            // -> bạn cần dùng StorageSharedKeyCredential
            throw new InvalidOperationException("Blob client cannot generate SAS URI. Use account key credential.");
        }

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _container.Name,
            BlobName = storageKey,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.Add(ttl)
        };

        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        var sasUri = blob.GenerateSasUri(sasBuilder);
        return sasUri.ToString();
    }
}
