# Tính năng Wishlist / Saved Items

Tài liệu này mô tả toàn bộ chức năng **Saved Items (Wishlist)** đã được triển khai ở cả Backend (ASP.NET Core) và Frontend (React/Vite).

---

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Backend — Entity & Database](#1-backend--entity--database)
3. [Backend — Repository Layer](#2-backend--repository-layer)
4. [Backend — Application Layer (DTO + Service)](#3-backend--application-layer-dto--service)
5. [Backend — API Controller](#4-backend--api-controller)
6. [Backend — Dependency Injection & Migration](#5-backend--dependency-injection--migration)
7. [Frontend — API Client](#6-frontend--api-client)
8. [Frontend — Zustand Store](#7-frontend--zustand-store)
9. [Frontend — Pages & Components](#8-frontend--pages--components)
10. [Cách hoạt động](#9-cách-hoạt-động)
11. [Các bước triển khai tiếp theo](#10-các-bước-triển-khai-tiếp-theo)

---

## Tổng quan

Mỗi user đã đăng nhập có thể lưu/bỏ lưu sản phẩm vào danh sách yêu thích của mình. Danh sách này được đồng bộ với database (không chỉ localStorage như trước).

### Các endpoint API

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| `GET` | `/api/users/me/saved` | Lấy danh sách sản phẩm đã lưu | JWT |
| `GET` | `/api/users/me/saved/{productId}` | Kiểm tra sản phẩm có được lưu không | JWT |
| `POST` | `/api/users/me/saved/{productId}` | Lưu sản phẩm | JWT |
| `DELETE` | `/api/users/me/saved/{productId}` | Xóa sản phẩm khỏi danh sách | JWT |

---

## 1. Backend — Entity & Database

### 1.1 SavedItem Entity

**File:** `OCFigureHub.Domain/Entities/SavedItem.cs`

```csharp
using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class SavedItem : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = default!;
    public Product Product { get; set; } = default!;
}
```

- Kế thừa `BaseEntity` nên có sẵn `Id` (Guid) và `CreatedAt`, `UpdatedAt`
- `SavedAt` lưu thời gian user lưu sản phẩm (để sắp xếp theo thứ tự gần nhất)

### 1.2 AppDbContext Configuration

**File:** `OCFigureHub.Infrastructure/Persistence/AppDbContext.cs`

```csharp
public DbSet<SavedItem> SavedItems => Set<SavedItem>();

// Trong OnModelCreating:
modelBuilder.Entity<SavedItem>()
    .HasOne(x => x.User)
    .WithMany()
    .HasForeignKey(x => x.UserId)
    .OnDelete(DeleteBehavior.Cascade);

modelBuilder.Entity<SavedItem>()
    .HasOne(x => x.Product)
    .WithMany()
    .HasForeignKey(x => x.ProductId)
    .OnDelete(DeleteBehavior.Cascade);

// Unique index để ngăn duplicate save
modelBuilder.Entity<SavedItem>()
    .HasIndex(x => new { x.UserId, x.ProductId })
    .IsUnique();
```

- Quan hệ **nhiều-nhiều** giữa `User` và `Product` thông qua bảng trung gian `SavedItem`
- Xóa cascade: khi user hoặc product bị xóa → bản ghi SavedItem liên quan cũng bị xóa
- Unique index ngăn user lưu cùng 1 sản phẩm 2 lần

### 1.3 Migration

```bash
cd e:\Githup\OCFigureHub\OCFigureHub.API
dotnet ef migrations add AddSavedItems --project "..\OCFigureHub.Infrastructure" --startup-project "."
dotnet ef database update
```

---

## 2. Backend — Repository Layer

### 2.1 ISavedItemRepository

**File:** `OCFigureHub.Application/Abstractions/ISavedItemRepository.cs`

```csharp
using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface ISavedItemRepository
{
    Task<List<SavedItem>> GetByUserIdAsync(Guid userId, CancellationToken ct);
    Task<SavedItem?> GetByUserAndProductAsync(Guid userId, Guid productId, CancellationToken ct);
    Task<bool> ExistsAsync(Guid userId, Guid productId, CancellationToken ct);
    Task AddAsync(SavedItem item, CancellationToken ct);
    Task RemoveAsync(SavedItem item, CancellationToken ct);
    Task RemoveByUserAndProductAsync(Guid userId, Guid productId, CancellationToken ct);
}
```

### 2.2 SavedItemRepository

**File:** `OCFigureHub.Infrastructure/Repositories/SavedItemRepository.cs`

```csharp
public class SavedItemRepository : ISavedItemRepository
{
    private readonly AppDbContext _db;
    public SavedItemRepository(AppDbContext db) => _db = db;

    public async Task<List<SavedItem>> GetByUserIdAsync(Guid userId, CancellationToken ct)
    {
        return await _db.SavedItems
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.SavedAt)
            .ToListAsync(ct);
    }

    public async Task<bool> ExistsAsync(Guid userId, Guid productId, CancellationToken ct)
    {
        return await _db.SavedItems
            .AnyAsync(x => x.UserId == userId && x.ProductId == productId, ct);
    }

    // ... các method khác
}
```

### 2.3 Mở rộng IProductRepository

**File:** `OCFigureHub.Application/Abstractions/IProductRepository.cs`

Thêm method `GetByIdsAsync` để lấy nhiều sản phẩm cùng lúc (tối ưu cho wishlist):

```csharp
public interface IProductRepository
{
    // ... existing methods
    Task<List<Product>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct); // MỚI
}
```

---

## 3. Backend — Application Layer (DTO + Service)

### 3.1 SavedItemDto

**File:** `OCFigureHub.Application/DTOs/SavedItems/SavedItemDto.cs`

```csharp
namespace OCFigureHub.Application.DTOs.SavedItems;

public class SavedItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = default!;
    public string Category { get; set; } = default!;
    public string Creator { get; set; } = default!;
    public decimal Price { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? PreviewModelUrl { get; set; }
    public string License { get; set; } = default!;
    public bool IsPro { get; set; }
    public DateTime SavedAt { get; set; }
}
```

### 3.2 ISavedItemService

**File:** `OCFigureHub.Application/Abstractions/ISavedItemService.cs`

```csharp
using OCFigureHub.Application.DTOs.SavedItems;

namespace OCFigureHub.Application.Abstractions;

public interface ISavedItemService
{
    Task<List<SavedItemDto>> GetSavedItemsAsync(Guid userId, CancellationToken ct);
    Task<bool> IsSavedAsync(Guid userId, Guid productId, CancellationToken ct);
    Task SaveItemAsync(Guid userId, Guid productId, CancellationToken ct);
    Task RemoveItemAsync(Guid userId, Guid productId, CancellationToken ct);
}
```

### 3.3 SavedItemService

**File:** `OCFigureHub.Application/Services/SavedItemService.cs`

```csharp
public class SavedItemService : ISavedItemService
{
    private readonly ISavedItemRepository _savedRepo;
    private readonly IProductRepository _productRepo;
    private readonly IStorageService _storage;

    // Lấy danh sách + map sang DTO với thumbnail URL có SAS token
    public async Task<List<SavedItemDto>> GetSavedItemsAsync(Guid userId, CancellationToken ct)
    {
        var savedItems = await _savedRepo.GetByUserIdAsync(userId, ct);
        if (savedItems.Count == 0) return new List<SavedItemDto>();

        var productIds = savedItems.Select(s => s.ProductId).ToList();
        var products = await _productRepo.GetByIdsAsync(productIds, ct);
        var productMap = products.ToDictionary(p => p.Id);

        return savedItems
            .Where(s => productMap.ContainsKey(s.ProductId))
            .Select(s =>
            {
                var p = productMap[s.ProductId];
                return new SavedItemDto
                {
                    Id = s.Id,
                    ProductId = p.Id,
                    ProductName = p.Name,
                    Category = p.Category,
                    Creator = p.Creator,
                    Price = p.Price,
                    IsPro = p.IsPro,
                    License = p.License.ToString(),
                    SavedAt = s.SavedAt,
                    ThumbnailUrl = !string.IsNullOrEmpty(p.ThumbnailUrl)
                        ? _storage.GenerateReadSasUrl(p.ThumbnailUrl, TimeSpan.FromHours(1))
                        : null,
                    PreviewModelUrl = !string.IsNullOrEmpty(p.PreviewModelUrl)
                        ? _storage.GenerateReadSasUrl(p.PreviewModelUrl, TimeSpan.FromHours(1))
                        : null,
                };
            })
            .ToList();
    }

    // Lưu — kiểm tra duplicate trước khi thêm
    public async Task SaveItemAsync(Guid userId, Guid productId, CancellationToken ct)
    {
        var exists = await _savedRepo.ExistsAsync(userId, productId, ct);
        if (exists) return;

        var product = await _productRepo.GetByIdAsync(productId, ct);
        if (product == null)
            throw new KeyNotFoundException($"Product with id {productId} not found.");

        var item = new SavedItem
        {
            UserId = userId,
            ProductId = productId,
            SavedAt = DateTime.UtcNow
        };

        await _savedRepo.AddAsync(item, ct);
    }
}
```

---

## 4. Backend — API Controller

**File:** `OCFigureHub.API/Controllers/UserSavedController.cs`

```csharp
[ApiController]
[Authorize(Roles = "Customer,Admin")]
public class UserSavedController : ControllerBase
{
    private readonly ISavedItemService _savedService;

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/users/me/saved
    [HttpGet("api/users/me/saved")]
    public async Task<IActionResult> GetSavedItems(CancellationToken ct)
    {
        var userId = GetUserId();
        var items = await _savedService.GetSavedItemsAsync(userId, ct);
        return Ok(items);
    }

    // GET /api/users/me/saved/{productId}
    [HttpGet("api/users/me/saved/{productId:guid}")]
    public async Task<IActionResult> IsSaved(Guid productId, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await _savedService.IsSavedAsync(userId, productId, ct);
        return Ok(result);
    }

    // POST /api/users/me/saved/{productId}
    [HttpPost("api/users/me/saved/{productId:guid}")]
    public async Task<IActionResult> SaveItem(Guid productId, CancellationToken ct)
    {
        var userId = GetUserId();
        await _savedService.SaveItemAsync(userId, productId, ct);
        return Ok(new { message = "Item saved successfully." });
    }

    // DELETE /api/users/me/saved/{productId}
    [HttpDelete("api/users/me/saved/{productId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid productId, CancellationToken ct)
    {
        var userId = GetUserId();
        await _savedService.RemoveItemAsync(userId, productId, ct);
        return Ok(new { message = "Item removed successfully." });
    }
}
```

---

## 5. Backend — Dependency Injection & Migration

**File:** `OCFigureHub.API/Program.cs`

```csharp
// Repository
builder.Services.AddScoped<ISavedItemRepository, SavedItemRepository>();

// Service
builder.Services.AddScoped<ISavedItemService, SavedItemService>();
```

**Migration đã tạo:** `AddSavedItems`
- Chạy `dotnet ef database update` để apply bảng mới vào SQL Server

---

## 6. Frontend — API Client

**File:** `ocfigurehub_Figmacode/src/api/saved.ts`

```typescript
import API from './client';
import type { Product } from '../types/product';

export interface SavedItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  creator: string;
  price: number;
  thumbnailUrl?: string;
  previewModelUrl?: string;
  license: string;
  isPro: boolean;
  savedAt: string;
}

export const savedApi = {
  /** GET /api/users/me/saved — lấy tất cả sản phẩm đã lưu */
  getAll: async (): Promise<SavedItem[]> => {
    const res = await API.get<SavedItem[]>('/users/me/saved');
    return res.data;
  },

  /** GET /api/users/me/saved/{productId} — kiểm tra có lưu không */
  isSaved: async (productId: string): Promise<boolean> => {
    const res = await API.get<boolean>(`/users/me/saved/${productId}`);
    return res.data;
  },

  /** POST /api/users/me/saved/{productId} — lưu sản phẩm */
  save: async (productId: string): Promise<void> => {
    await API.post(`/users/me/saved/${productId}`);
  },

  /** DELETE /api/users/me/saved/{productId} — xóa khỏi danh sách */
  remove: async (productId: string): Promise<void> => {
    await API.delete(`/users/me/saved/${productId}`);
  },
};
```

---

## 7. Frontend — Zustand Store

**File:** `ocfigurehub_Figmacode/src/store/savedStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { savedApi, type SavedItem } from '../api/saved';
import { useAuthStore } from './authStore';

interface SavedState {
  savedIds: string[];         // Danh sách ID để check nhanh isSaved()
  savedItems: SavedItem[];     // Full data cho SavedPage hiển thị
  isLoaded: boolean;           // Đã fetch từ API chưa
  isLoading: boolean;          // Đang loading

  fetchSaved: () => Promise<void>;    // Gọi API lấy danh sách
  saveItem: (productId: string) => Promise<void>;    // Lưu + call API
  removeItem: (productId: string) => Promise<void>;  // Xóa + call API
  toggleSaved: (productId: string) => Promise<void>; // Toggle save/unsave
  isSaved: (productId: string) => boolean;            // Check nhanh
  reset: () => void;                                 // Clear khi logout
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      savedItems: [],
      isLoaded: false,
      isLoading: false,

      // Hydrate từ API khi đã đăng nhập
      fetchSaved: async () => {
        const { isLoggedIn } = useAuthStore.getState();
        if (!isLoggedIn) {
          set({ savedIds: [], savedItems: [], isLoaded: true });
          return;
        }
        set({ isLoading: true });
        try {
          const items = await savedApi.getAll();
          const ids = items.map(i => i.productId);
          set({ savedIds: ids, savedItems: items, isLoaded: true });
        } catch {
          toast.error('Không thể tải danh sách yêu thích.');
          set({ isLoaded: true });
        } finally {
          set({ isLoading: false });
        }
      },

      // Lưu vào database + cập nhật local state
      saveItem: async (productId: string) => {
        await savedApi.save(productId);
        set(state => ({
          savedIds: state.savedIds.includes(productId)
            ? state.savedIds
            : [...state.savedIds, productId],
        }));
      },

      // Xóa khỏi database + cập nhật local state
      removeItem: async (productId: string) => {
        await savedApi.remove(productId);
        set(state => ({
          savedIds: state.savedIds.filter(id => id !== productId),
          savedItems: state.savedItems.filter(i => i.productId !== productId),
        }));
      },

      // Toggle — tự động gọi save hoặc remove
      toggleSaved: async (productId: string) => {
        const { isLoggedIn } = useAuthStore.getState();
        if (!isLoggedIn) {
          toast.error('Vui lòng đăng nhập để lưu sản phẩm yêu thích.');
          return;
        }
        const saved = get().isSaved(productId);
        if (saved) {
          await get().removeItem(productId);
          toast.success('Đã xóa khỏi danh sách yêu thích.');
        } else {
          await get().saveItem(productId);
          toast.success('Đã lưu vào danh sách yêu thích!');
        }
      },

      isSaved: (productId: string) => get().savedIds.includes(productId),

      reset: () => set({ savedIds: [], savedItems: [], isLoaded: false, isLoading: false }),
    }),
    {
      name: 'oc-saved',
      partialize: state => ({ savedIds: state.savedIds }),
    }
  )
);
```

### Persist Strategy

- Key `oc-saved` trong localStorage: chỉ persist `savedIds` (array string)
- Lý do: `savedItems` (full DTO) có thể stale khi product thay đổi → luôn fetch từ API khi cần
- `savedIds` từ localStorage cho phép heart icon hoạt động **ngay lập tức** sau page reload mà không cần chờ API

---

## 8. Frontend — Pages & Components

### 8.1 SavedPage — Trang danh sách yêu thích

**File:** `ocfigurehub_Figmacode/src/app/pages/SavedPage.tsx`

```typescript
export function SavedPage() {
  const { savedItems, isLoading, isLoaded, fetchSaved, removeItem } = useSavedStore();

  // Fetch từ API nếu chưa từng load
  useEffect(() => {
    if (!isLoaded) fetchSaved();
  }, [isLoaded, fetchSaved]);

  // Xóa với stopPropagation để không navigate vào product
  const handleRemove = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeItem(productId);
  };

  // Loading spinner
  if (isLoading) return <LoaderSpinner />;

  // Empty state
  if (savedItems.length === 0) return <EmptyState />;

  // Grid hiển thị — mỗi card có nút xóa (trash icon) đỏ ở góc
  return (
    <div className="grid...">
      {savedItems.map(item => (
        <div key={item.productId} className="relative">
          <ProductCard product={savedItemToProduct(item)} />
          <button
            onClick={e => handleRemove(item.productId, e)}
            className="absolute top-3 right-3 ... bg-red-500"
          >
            <Trash2 size={14} className="text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 8.2 ProductCard — Thẻ sản phẩm có nút tim

**File:** `ocfigurehub_Figmacode/src/app/components/ProductCard.tsx`

```typescript
// Trước đây dùng SavedContext (localStorage only)
// Bây giờ dùng savedStore (sync với database)
import { useSavedStore } from '../../store/savedStore';

export function ProductCard({ product }: ProductCardProps) {
  const { toggleSaved, isSaved } = useSavedStore();
  const saved = isSaved(product.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaved(product.id);  // Gọi API + toast + cập nhật UI ngay
  };

  return (
    <div>
      {/* ... thumbnail, badges, info ... */}
      <button
        onClick={handleHeartClick}
        style={{ backgroundColor: saved ? '#8B5CF6' : 'rgba(0,0,0,0.6)' }}
      >
        <Heart size={16} fill={saved ? 'white' : 'none'} className="text-white" />
      </button>
    </div>
  );
}
```

### 8.3 ProductDetailPage — Trang chi tiết sản phẩm

**File:** `ocfigurehub_Figmacode/src/app/pages/ProductDetailPage.tsx`

- Thay `useSaved()` bằng `useSavedStore()`
- Gọi `fetchSaved()` trong `useEffect` on mount để sync trạng thái tim
- Nút trái tim trong card thông tin sản phẩm gọi `toggleSaved(product.id)`

### 8.4 AuthStore — Hydration on login/logout

**File:** `ocfigurehub_Figmacode/src/store/authStore.ts`

```typescript
// Sau khi đăng nhập thành công → fetch wishlist từ API
login: async (...) => {
  // ...
  set({ token, user, isLoggedIn: true });
  useSavedStore.getState().fetchSaved();  // MỚI
}

// Khi logout → clear wishlist state
logout: () => {
  useSavedStore.getState().reset();  // MỚI
  set({ token: null, user: null, isLoggedIn: false });
};
```

### 8.5 Root — Loại bỏ SavedProvider cũ

**File:** `ocfigurehub_Figmacode/src/app/pages/Root.tsx`

Đã loại bỏ `<SavedProvider>` vì chức năng wishlist giờ do `savedStore` (Zustand) quản lý thay vì React Context.

---

## 9. Cách hoạt động

### Luồng 1: Người dùng đăng nhập lần đầu

```
1. User đăng nhập → authStore.login() thành công
2. → gọi savedStore.fetchSaved()
3. → GET /api/users/me/saved (với JWT token)
4. → Backend trả về danh sách SavedItem[]
5. → savedStore lưu savedIds[] vào state + localStorage
6. → Tất cả heart icons trên UI đổi màu theo đúng trạng thái
```

### Luồng 2: Người dùng bấm nút tim

```
1. User bấm heart → toggleSaved(productId)
2. → isLoggedIn check → nếu chưa login → toast "đăng nhập"
3. → Nếu đã login: kiểm tra isSaved(productId)
4. → Nếu CHƯA lưu: POST /api/users/me/saved/{productId}
   → Update savedIds (thêm productId)
   → Toast "Đã lưu!"
5. → Nếu ĐÃ lưu: DELETE /api/users/me/saved/{productId}
   → Update savedIds (xóa productId)
   → Toast "Đã xóa khỏi danh sách yêu thích."
6. → Heart icon đổi màu TỨC THÌ (optimistic update)
7. → Nếu API lỗi → toast báo lỗi
```

### Luồng 3: Người dùng mở trang Saved

```
1. SavedPage mount → useEffect gọi fetchSaved()
2. → Loading spinner hiển thị
3. → GET /api/users/me/saved
4. → Trả về danh sách với thumbnail URL có SAS token
5. → Render grid với ProductCard + nút xóa (trash)
6. → User bấm trash → removeItem() → DELETE API → card biến mất
```

---

## 10. Các bước triển khai tiếp theo

### Bắt buộc

```bash
# 1. Apply migration vào database
cd e:\Githup\OCFigureHub\OCFigureHub.API
dotnet ef database update

# 2. Restart backend (để load controller mới)
# 3. Restart frontend
```

### Tùy chọn — Cải thiện thêm

1. **Thêm badge số yêu thích trên Navbar**: Hiển thị số lượng `savedIds.length` trên icon trái tim ở Navbar

2. **Cải thiện AdminSavedItems**: Thay mock data bằng API endpoint mới cho admin xem thống kê wishlist toàn hệ thống

3. **Pagination cho SavedPage**: Nếu danh sách yêu thích có thể rất dài, thêm pagination ở backend (`GetSavedItemsAsync` nhận thêm `page`/`pageSize`)

4. **Notification khi sản phẩm trong wishlist được giảm giá**: So sánh giá khi user online và gửi thông báo

5. **Share wishlist**: Tạo endpoint để user có thể chia sẻ wishlist công khai qua link

---

## Cấu trúc file mới

```
Backend/
├── OCFigureHub.Domain/
│   └── Entities/
│       └── SavedItem.cs                    [NEW]
├── OCFigureHub.Application/
│   ├── Abstractions/
│   │   ├── ISavedItemRepository.cs         [NEW]
│   │   ├── ISavedItemService.cs            [NEW]
│   │   └── IProductRepository.cs          [MODIFIED - thêm GetByIdsAsync]
│   ├── DTOs/
│   │   └── SavedItems/
│   │       └── SavedItemDto.cs             [NEW]
│   └── Services/
│       └── SavedItemService.cs             [NEW]
├── OCFigureHub.Infrastructure/
│   ├── Persistence/
│   │   └── AppDbContext.cs                [MODIFIED - thêm SavedItems]
│   ├── Repositories/
│   │   ├── SavedItemRepository.cs          [NEW]
│   │   └── ProductRepository.cs           [MODIFIED - thêm GetByIdsAsync]
│   └── Migrations/
│       └── AddSavedItems.cs               [NEW - migration]
└── OCFigureHub.API/
    ├── Controllers/
    │   └── UserSavedController.cs          [NEW]
    └── Program.cs                         [MODIFIED - DI registration]

Frontend/
├── src/
│   ├── api/
│   │   └── saved.ts                       [NEW]
│   ├── store/
│   │   └── savedStore.ts                  [NEW]
│   └── app/
│       ├── pages/
│       │   ├── SavedPage.tsx              [MODIFIED - dùng API thật)
│       │   └── Root.tsx                   [MODIFIED - loại bỏ SavedProvider)
│       └── components/
│           └── ProductCard.tsx            [MODIFIED - dùng savedStore)
└── store/
    └── authStore.ts                       [MODIFIED - gọi fetchSaved/reset)
```
