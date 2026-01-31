using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Products;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Application.Services;

public class AdminProductService
{
    private readonly IProductRepository _products;
    private readonly IProductFileRepository _files;
    private readonly IStorageService _storage;

    public AdminProductService(IProductRepository products, IProductFileRepository files, IStorageService storage)
    {
        _products = products;
        _files = files;
        _storage = storage;
    }

    public async Task<ProductDto> CreateAsync(AdminCreateProductRequest req, CancellationToken ct)
    {
        var p = new Product
        {
            Id = Guid.NewGuid(),
            Name = req.Name.Trim(),
            Description = req.Description.Trim(),
            Price = req.Price,
            Category = req.Category.Trim(),
            IsEnabled = true
        };

        await _products.AddAsync(p, ct);
        await _products.SaveChangesAsync(ct);

        return new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Category = p.Category,
            Price = p.Price,
            IsEnabled = p.IsEnabled
        };
    }

    public async Task<ProductDto> UpdateAsync(Guid id, AdminUpdateProductRequest req, CancellationToken ct)
    {
        var p = await _products.GetByIdAsync(id, ct) ?? throw new Exception("Product not found");

        p.Name = req.Name.Trim();
        p.Description = req.Description.Trim();
        p.Price = req.Price;
        p.Category = req.Category.Trim();
        p.IsEnabled = req.IsEnabled;
        p.UpdatedAt = DateTime.UtcNow;

        await _products.UpdateAsync(p, ct);
        await _products.SaveChangesAsync(ct);

        return new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Category = p.Category,
            Price = p.Price,
            IsEnabled = p.IsEnabled
        };
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var p = await _products.GetByIdAsync(id, ct) ?? throw new Exception("Product not found");
        await _products.DeleteAsync(p, ct);
        await _products.SaveChangesAsync(ct);
    }

    public async Task UploadFileAsync(Guid productId, FileType fileType, string format,
        Stream stream, string fileName, string contentType, CancellationToken ct)
    {
        var product = await _products.GetByIdAsync(productId, ct);
        if (product == null) throw new Exception("Product not found");

        var (storageKey, size) = await _storage.UploadAsync(stream, fileName, contentType, ct);

        var pf = new ProductFile
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            FileType = fileType,
            Format = format.Trim().ToUpper(),
            StorageKey = storageKey,
            FileSize = size
        };

        await _files.AddAsync(pf, ct);
        await _files.SaveChangesAsync(ct);
    }
}
