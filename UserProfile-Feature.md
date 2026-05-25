# User Profile API — Tài liệu triển khai

## 1. Tổng quan

Hệ thống **User Profile API** cho phép người dùng cập nhật thông tin cá nhân (DisplayName, Bio) và tải lên ảnh đại diện (avatar) bảo mật bằng Azure Blob Storage với SAS URL.

## 2. Backend (ASP.NET Core)

### 2.1. Entity — `OCFigureHub.Domain/Entities/User.cs`

```csharp
public class User : BaseEntity
{
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string? AvatarUrl { get; set; }        // SAS URL từ Azure Blob
    public string? Bio { get; set; }             // Giới thiệu bản thân (max 500)

    public Role Role { get; set; } = Role.Customer;
    public UserStatus Status { get; set; } = UserStatus.Active;
}
```

### 2.2. Database Migration

Migration tự động chạy khi API start (`db.Database.Migrate()` trong `Program.cs`).

```csharp
// Tên: AddUserProfileFields
// Ngày: 20260525132135
// Thêm 2 columns vào bảng Users:
migrationBuilder.AddColumn<string>(name: "AvatarUrl", table: "Users", type: "nvarchar(max)", nullable: true);
migrationBuilder.AddColumn<string>(name: "Bio",       table: "Users", type: "nvarchar(max)", nullable: true);
```

### 2.3. DTOs — `OCFigureHub.Application/DTOs/Users/`

**UserProfileDto.cs**
```csharp
public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string Role { get; set; } = default!;
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public VipInfoDto? VipInfo { get; set; }
}

public class VipInfoDto
{
    public string? PlanName { get; set; }
    public decimal? MonthlyPrice { get; set; }
    public int? MonthlyQuota { get; set; }
    public int? DownloadsUsed { get; set; }
    public bool IsActive { get; set; }
    public DateTime? EndAt { get; set; }
}
```

**UpdateProfileRequest.cs**
```csharp
public class UpdateProfileRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string DisplayName { get; set; } = default!;

    [StringLength(500)]
    public string? Bio { get; set; }
}
```

**UploadAvatarResponse.cs**
```csharp
public class UploadAvatarResponse
{
    public string AvatarUrl { get; set; } = default!; // SAS URL 365 ngày
}
```

### 2.4. Service — `OCFigureHub.Application/Services/UserProfileService.cs`

```csharp
public class UserProfileService
{
    private readonly IUserRepository _users;
    private readonly ISubscriptionRepository _subscriptions;
    private readonly IQuotaRepository _quotas;
    private readonly IStorageService _storage;

    // GET /api/users/me — trả về profile đầy đủ + VIP info
    public async Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken ct);

    // PUT /api/users/me — cập nhật DisplayName, Bio
    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest req, CancellationToken ct);

    // POST /api/users/me/avatar — upload lên Azure Blob, trả SAS URL 365 ngày
    public async Task<UploadAvatarResponse> UploadAvatarAsync(
        Guid userId, Stream fileStream, string fileName, string contentType, CancellationToken ct);
}
```

Logic upload:
1. Validate MIME type: chỉ chấp nhận `image/jpeg`, `image/png`, `image/gif`, `image/webp`
2. Validate size: tối đa **5MB**
3. Upload lên Azure Blob Storage (key format: `yyyy/MM/{guid}_{filename}`)
4. Generate **SAS URL 365 ngày** (read permission)
5. Update `AvatarUrl` field trong database
6. Trả về `UploadAvatarResponse` chứa SAS URL

### 2.5. Controller — `OCFigureHub.API/Controllers/UsersController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]  // Yêu cầu JWT token
public class UsersController : ControllerBase
{
    // GET /api/users/me
    // Trả về UserProfileDto (profile + VIP info + ngày tham gia)
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct);

    // PUT /api/users/me
    // Body: { "displayName": "...", "bio": "..." }
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] UpdateProfileRequest req, CancellationToken ct);

    // POST /api/users/me/avatar
    // Content-Type: multipart/form-data
    // Field: "file" (image, max 5MB)
    // Giới hạn request size: 5MB
    [HttpPost("me/avatar")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadAvatar(CancellationToken ct);
}
```

### 2.6. DI Registration — `OCFigureHub.API/Program.cs`

```csharp
builder.Services.AddScoped<UserProfileService>();
```

## 3. Frontend (React / Vite)

### 3.1. API Client — `src/api/users.ts`

```typescript
export interface VipInfo {
  planName: string | null;
  monthlyPrice: number | null;
  monthlyQuota: number | null;
  downloadsUsed: number;
  isActive: boolean;
  endAt: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  vipInfo: VipInfo | null;
}

export interface UpdateProfileRequest {
  displayName: string;
  bio?: string;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
}

export const usersApi = {
  getMyProfile: () => API.get<UserProfile>('/users/me'),
  updateProfile: (data) => API.put<UserProfile>('/users/me', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post<UploadAvatarResponse>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
```

### 3.2. Zustand Store — `src/store/authStore.ts`

```typescript
interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  role: 'Customer' | 'Admin';
  avatarUrl?: string | null;
  bio?: string | null;
}

interface AuthState {
  // ... existing fields
  updateProfile: (displayName: string, bio?: string) => Promise<boolean>;
  updateAvatar: (avatarUrl: string) => void;
  refreshProfile: () => Promise<void>;
}
```

- `updateProfile` — gọi API cập nhật DisplayName + Bio, sync store
- `updateAvatar` — cập nhật `avatarUrl` trong store (sau khi upload thành công)
- `refreshProfile` — fetch đầy đủ từ API, sync displayName/avatarUrl/bio về store

### 3.3. Navbar — `src/app/components/Navbar.tsx`

**Thay đổi:**
- Thêm `avatarUrl` từ `user?.avatarUrl`
- Desktop: Thay avatar initials bằng `<img>` nếu có `AvatarUrl`, fallback về gradient initials
- Dropdown menu header: hiển thị avatar + displayName + email + badge Admin
- Thêm menu item **"Cài đặt"** (`/settings`) với icon `Settings`
- Mobile menu: hiển thị avatar + link "Cài đặt tài khoản"
- Import thêm `Settings` icon từ `lucide-react`

### 3.4. Settings Page — `src/app/pages/SettingsPage.tsx`

Trang Settings gồm **3 sections**:

#### Section 1: Avatar Upload
- Preview avatar hiện tại (ảnh thật hoặc gradient initials)
- Nút camera overlay để chọn file
- Chọn file → preview bằng FileReader (base64) → nút "Lưu ảnh" / "Hủy"
- Validate: chỉ chấp nhận JPEG/PNG/GIF/WebP, max 5MB
- Upload: `FormData` → `POST /api/users/me/avatar`
- Sau khi upload thành công: gọi `updateAvatar()` để sync store + hiển thị toast

#### Section 2: Profile Info
- Email (read-only, lấy từ store)
- DisplayName (editable, max 100 ký tự)
- Bio (textarea, max 500 ký tự, có counter)
- Nút "Lưu thông tin" → `PUT /api/users/me`

#### Section 3: Account Summary
- **Vai trò**: Badge hiển thị "Khách hàng" / "Quản trị viên"
- **Tham gia**: Ngày tạo tài khoản (định dạng tiếng Việt)
- **Gói VIP**: Nếu có active subscription → hiển thị plan name + quota usage; nếu không → nút "Nâng cấp ngay →" link tới `/upgrade`

### 3.5. Routes — `src/app/routes.tsx`

```typescript
// Import
import { SettingsPage } from './pages/SettingsPage';

// Protected route
{
  Component: ProtectedRoute,
  children: [
    // ... existing routes
    { path: 'settings', Component: SettingsPage },
  ],
},
```

## 4. API Reference

### GET /api/users/me

**Request:** Header `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "displayName": "Nguyễn Văn A",
  "avatarUrl": "https://xxx.blob.core.windows.net/...sv=...",
  "bio": "I love 3D printing!",
  "role": "Customer",
  "status": "Active",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-05-20T08:45:00Z",
  "vipInfo": {
    "planName": "Premium Monthly",
    "monthlyPrice": 99000,
    "monthlyQuota": 50,
    "downloadsUsed": 23,
    "isActive": true,
    "endAt": "2026-06-15T10:30:00Z"
  }
}
```

### PUT /api/users/me

**Request Body:**
```json
{
  "displayName": "Tên mới",
  "bio": "Giới thiệu bản thân"
}
```

**Response 200:** `UserProfileDto` (profile đã cập nhật)

### POST /api/users/me/avatar

**Request:** `multipart/form-data`, field name = `file`

**Response 200:**
```json
{
  "avatarUrl": "https://xxx.blob.core.windows.net/...sv=...&sig=...&se=..."
}
```

**Lỗi:**
- `400 BadRequest` — file không hợp lệ (sai định dạng / quá 5MB / chưa chọn file)
- `401 Unauthorized` — token không hợp lệ

## 5. Các files mới được tạo

| Layer | File | Mô tả |
|-------|------|--------|
| Domain | `Entities/User.cs` | Thêm `AvatarUrl`, `Bio` |
| Infrastructure | `Migrations/20260525132135_AddUserProfileFields.cs` | Migration |
| Application | `DTOs/Users/UserProfileDto.cs` | DTO profile + VIP |
| Application | `DTOs/Users/UpdateProfileRequest.cs` | Request cập nhật |
| Application | `DTOs/Users/UploadAvatarResponse.cs` | Response upload |
| Application | `Services/UserProfileService.cs` | Logic nghiệp vụ |
| API | `Controllers/UsersController.cs` | REST endpoints |
| API | `Program.cs` | Đăng ký DI |
| Frontend | `src/api/users.ts` | API client |
| Frontend | `src/app/pages/SettingsPage.tsx` | Trang Settings |
| Frontend | `src/app/components/Navbar.tsx` | Cập nhật avatar + menu |
| Frontend | `src/app/routes.tsx` | Thêm route /settings |
| Frontend | `src/store/authStore.ts` | Thêm profile methods |

## 6. Build & Deploy

### Backend
```bash
dotnet build OCFigureHub.API
dotnet run --project OCFigureHub.API
```

### Frontend
```bash
cd ocfigurehub_Figmacode
npm run build
npm run dev
```

### Database Migration
Migration chạy tự động khi API start (trong `Program.cs`):
```csharp
db.Database.Migrate();
```
