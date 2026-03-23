interface FakeQRCodeProps {
  size?: number;
  seed?: number;
}

export function FakeQRCode({ size = 200, seed = 1 }: FakeQRCodeProps) {
  const cells = 25;
  const cellSize = size / cells;
  const padding = 8;

  const isBlack = (x: number, y: number): boolean => {
    // Top-left finder pattern (7×7)
    if (x <= 6 && y <= 6) {
      if (x === 0 || x === 6 || y === 0 || y === 6) return true;
      if (x >= 2 && x <= 4 && y >= 2 && y <= 4) return true;
      return false;
    }
    // Top-right finder pattern
    if (x >= cells - 7 && y <= 6) {
      const lx = x - (cells - 7);
      if (lx === 0 || lx === 6 || y === 0 || y === 6) return true;
      if (lx >= 2 && lx <= 4 && y >= 2 && y <= 4) return true;
      return false;
    }
    // Bottom-left finder pattern
    if (x <= 6 && y >= cells - 7) {
      const ly = y - (cells - 7);
      if (x === 0 || x === 6 || ly === 0 || ly === 6) return true;
      if (x >= 2 && x <= 4 && ly >= 2 && ly <= 4) return true;
      return false;
    }
    // Timing patterns
    if (x === 6 && y > 7 && y < cells - 7) return y % 2 === 0;
    if (y === 6 && x > 7 && x < cells - 7) return x % 2 === 0;
    // Alignment pattern (center-ish)
    if (x >= 16 && x <= 20 && y >= 16 && y <= 20) {
      if (x === 16 || x === 20 || y === 16 || y === 20) return true;
      if (x === 18 && y === 18) return true;
      return false;
    }
    // Data area - deterministic pseudo-random based on seed
    return (
      ((x * 11 + y * 7 + seed * 3) % 3 === 0) ||
      ((x * (seed + 5) + y * 13) % 4 === 0)
    );
  };

  const totalSize = size + padding * 2;

  return (
    <svg
      width={totalSize}
      height={totalSize}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      style={{ background: '#ffffff', borderRadius: 12, display: 'block' }}
    >
      {/* White background */}
      <rect width={totalSize} height={totalSize} fill="#ffffff" rx={12} />
      {/* QR cells */}
      {Array.from({ length: cells }, (_, y) =>
        Array.from({ length: cells }, (_, x) =>
          isBlack(x, y) ? (
            <rect
              key={`${x}-${y}`}
              x={padding + x * cellSize + 0.5}
              y={padding + y * cellSize + 0.5}
              width={cellSize - 1}
              height={cellSize - 1}
              fill="#1a1a1a"
              rx={0.5}
            />
          ) : null
        )
      )}
    </svg>
  );
}
