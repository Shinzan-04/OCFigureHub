namespace OCFigureHub.Application.Abstractions;

public interface IStorageService
{
    Task<(string storageKey, long size)> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        CancellationToken ct);

    string GenerateReadSasUrl(string storageKey, TimeSpan ttl);
}
