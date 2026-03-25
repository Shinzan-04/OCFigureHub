using OCFigureHub.Application.Abstractions;
using System.Diagnostics;

namespace OCFigureHub.Infrastructure.Storage;

public class DracoModelOptimizer : IModelOptimizer
{
    public async Task<Stream> OptimizeAsync(Stream input, string format, CancellationToken ct)
    {
        // Only optimize GLB files (most common for web previews)
        if (format.Trim().ToUpper() != "GLB") return input;

        string tempIn = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.glb");
        string tempOut = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.glb");

        try
        {
            // Reset input stream position if possible
            if (input.CanSeek) input.Position = 0;

            using (var fs = new FileStream(tempIn, FileMode.Create))
            {
                await input.CopyToAsync(fs, ct);
            }

            var startInfo = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/c npx gltf-pipeline -i \"{tempIn}\" -o \"{tempOut}\" -d",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                WorkingDirectory = AppContext.BaseDirectory // Or project root if needed
            };

            using (var process = Process.Start(startInfo))
            {
                if (process == null) return input;
                
                await process.WaitForExitAsync(ct);
                
                if (process.ExitCode != 0)
                {
                    // If compression fails (e.g. node not found), fallback to original
                    return input;
                }
            }

            if (File.Exists(tempOut))
            {
                var ms = new MemoryStream();
                using (var fsOut = new FileStream(tempOut, FileMode.Open, FileAccess.Read))
                {
                    await fsOut.CopyToAsync(ms, ct);
                }
                ms.Position = 0;
                return ms;
            }

            return input;
        }
        catch (Exception ex)
        {
            // Logging would go here. For now, fallback to original to avoid breaking the upload
            Console.WriteLine($"Optimization failed: {ex.Message}");
            return input;
        }
        finally
        {
            // Clean up temp files
            try { if (File.Exists(tempIn)) File.Delete(tempIn); } catch { }
            try { if (File.Exists(tempOut)) File.Delete(tempOut); } catch { }
        }
    }
}
