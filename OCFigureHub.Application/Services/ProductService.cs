using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Products;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Application.Services;

public class ProductService
{
    private readonly IProductRepository _products;

    public ProductService(IProductRepository products)
    {
        _products = products;
    }

    public async Task<List<ProductDto>> GetAllAsync(CancellationToken ct)
    {
        var list = await _products.GetAllEnabledAsync(ct);
        return list.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Category = p.Category,
            Price = p.Price,
            IsEnabled = p.IsEnabled
        }).ToList();
    }

    public async Task<ProductDetailDto?> GetDetailAsync(Guid id, CancellationToken ct)
    {
        var p = await _products.GetByIdWithFilesAsync(id, ct);
        if (p == null) return null;

        return new ProductDetailDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Category = p.Category,
            Price = p.Price,
            IsEnabled = p.IsEnabled,
            Files = p.Files.Select(f => new ProductFileDto
            {
                Id = f.Id,
                FileType = f.FileType,
                Format = f.Format,
                FileSize = f.FileSize
            }).ToList()
        };
    }
}
