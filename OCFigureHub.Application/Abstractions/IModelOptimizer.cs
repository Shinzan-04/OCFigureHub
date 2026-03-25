namespace OCFigureHub.Application.Abstractions;

public interface IModelOptimizer
{
    /// <summary>
    /// Minimizes the size of a 3D model file (e.g., using Draco compression for GLB).
    /// </summary>
    Task<Stream> OptimizeAsync(Stream input, string format, CancellationToken ct);
}
