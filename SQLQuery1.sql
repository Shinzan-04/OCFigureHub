/* =========================================================
   OC FIGURE HUB - SQL SERVER DATABASE SCRIPT
   ========================================================= */

-- 1) Create Database
IF DB_ID(N'OCFigureHubDb') IS NULL
BEGIN
    CREATE DATABASE OCFigureHubDb;
END
GO

USE OCFigureHubDb;
GO

/* =========================================================
   2) Drop tables (optional - for re-run)
   ========================================================= */
IF OBJECT_ID('dbo.DownloadHistories', 'U') IS NOT NULL DROP TABLE dbo.DownloadHistories;
IF OBJECT_ID('dbo.DownloadTokens', 'U') IS NOT NULL DROP TABLE dbo.DownloadTokens;
IF OBJECT_ID('dbo.QuotaUsages', 'U') IS NOT NULL DROP TABLE dbo.QuotaUsages;
IF OBJECT_ID('dbo.Subscriptions', 'U') IS NOT NULL DROP TABLE dbo.Subscriptions;
IF OBJECT_ID('dbo.SubscriptionPlans', 'U') IS NOT NULL DROP TABLE dbo.SubscriptionPlans;
IF OBJECT_ID('dbo.PaymentTransactions', 'U') IS NOT NULL DROP TABLE dbo.PaymentTransactions;
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.ProductFiles', 'U') IS NOT NULL DROP TABLE dbo.ProductFiles;
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

/* =========================================================
   3) Create Tables
   ========================================================= */

-- USERS
CREATE TABLE dbo.Users (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Users PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(256) NOT NULL,
    PasswordHash NVARCHAR(512) NOT NULL,
    DisplayName NVARCHAR(200) NOT NULL,

    -- Role: 1=Customer, 2=Admin
    Role INT NOT NULL CONSTRAINT DF_Users_Role DEFAULT 1,

    -- Status: 1=Active, 2=Locked
    Status INT NOT NULL CONSTRAINT DF_Users_Status DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL
);

CREATE UNIQUE INDEX UX_Users_Email ON dbo.Users(Email);
GO


-- PRODUCTS
CREATE TABLE dbo.Products (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Products PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(250) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Price DECIMAL(18,2) NOT NULL CONSTRAINT DF_Products_Price DEFAULT 0,
    Category NVARCHAR(100) NOT NULL CONSTRAINT DF_Products_Category DEFAULT N'General',
    IsEnabled BIT NOT NULL CONSTRAINT DF_Products_IsEnabled DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL
);

CREATE INDEX IX_Products_Name ON dbo.Products(Name);
CREATE INDEX IX_Products_Category ON dbo.Products(Category);
GO


-- PRODUCT FILES
CREATE TABLE dbo.ProductFiles (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductFiles PRIMARY KEY DEFAULT NEWID(),
    ProductId UNIQUEIDENTIFIER NOT NULL,
    
    -- FileType: 1=Model, 2=Preview, 3=Thumbnail
    FileType INT NOT NULL,

    -- Format: STL/OBJ/GLB/JPG/PNG
    Format NVARCHAR(20) NOT NULL,

    -- StorageKey: blob path
    StorageKey NVARCHAR(500) NOT NULL,

    FileSize BIGINT NOT NULL CONSTRAINT DF_ProductFiles_FileSize DEFAULT 0,
    Sha256 NVARCHAR(128) NULL,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ProductFiles_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_ProductFiles_Products
        FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id)
        ON DELETE CASCADE
);

CREATE INDEX IX_ProductFiles_ProductId ON dbo.ProductFiles(ProductId);
CREATE INDEX IX_ProductFiles_FileType ON dbo.ProductFiles(FileType);
GO


-- ORDERS
CREATE TABLE dbo.Orders (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Orders PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,

    -- Status: 1=Pending, 2=Paid, 3=Expired
    Status INT NOT NULL CONSTRAINT DF_Orders_Status DEFAULT 1,

    TotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Orders_TotalAmount DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_Orders_Users
        FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
        ON DELETE NO ACTION
);

CREATE INDEX IX_Orders_UserId ON dbo.Orders(UserId);
CREATE INDEX IX_Orders_Status ON dbo.Orders(Status);
GO


-- ORDER ITEMS
CREATE TABLE dbo.OrderItems (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OrderItems PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,

    -- LicenseType: 1=Personal, 2=Commercial
    LicenseType INT NOT NULL,

    UnitPrice DECIMAL(18,2) NOT NULL CONSTRAINT DF_OrderItems_UnitPrice DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_OrderItems_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_OrderItems_Orders
        FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Id)
        ON DELETE CASCADE,

    CONSTRAINT FK_OrderItems_Products
        FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id)
        ON DELETE NO ACTION
);

CREATE INDEX IX_OrderItems_OrderId ON dbo.OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId ON dbo.OrderItems(ProductId);
GO


-- PAYMENT TRANSACTIONS
CREATE TABLE dbo.PaymentTransactions (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PaymentTransactions PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL,

    Provider NVARCHAR(50) NOT NULL CONSTRAINT DF_PaymentTransactions_Provider DEFAULT N'FAKE',
    ProviderTxnId NVARCHAR(100) NOT NULL,
    
    -- Status: 1=Pending, 2=Paid, 3=Failed, 4=Refunded
    Status INT NOT NULL CONSTRAINT DF_PaymentTransactions_Status DEFAULT 1,

    Amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_PaymentTransactions_Amount DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_PaymentTransactions_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_PaymentTransactions_Orders
        FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Id)
        ON DELETE CASCADE
);

CREATE INDEX IX_PaymentTransactions_OrderId ON dbo.PaymentTransactions(OrderId);
CREATE INDEX IX_PaymentTransactions_Status ON dbo.PaymentTransactions(Status);
GO


-- SUBSCRIPTION PLANS
CREATE TABLE dbo.SubscriptionPlans (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_SubscriptionPlans PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    MonthlyPrice DECIMAL(18,2) NOT NULL CONSTRAINT DF_SubscriptionPlans_MonthlyPrice DEFAULT 0,
    MonthlyQuotaDownloads INT NOT NULL CONSTRAINT DF_SubscriptionPlans_Quota DEFAULT 0,
    IsActive BIT NOT NULL CONSTRAINT DF_SubscriptionPlans_IsActive DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_SubscriptionPlans_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL
);

CREATE INDEX IX_SubscriptionPlans_IsActive ON dbo.SubscriptionPlans(IsActive);
GO


-- SUBSCRIPTIONS
CREATE TABLE dbo.Subscriptions (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Subscriptions PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    PlanId UNIQUEIDENTIFIER NOT NULL,

    IsActive BIT NOT NULL CONSTRAINT DF_Subscriptions_IsActive DEFAULT 1,
    StartAt DATETIME2 NOT NULL CONSTRAINT DF_Subscriptions_StartAt DEFAULT SYSUTCDATETIME(),
    EndAt DATETIME2 NULL,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Subscriptions_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_Subscriptions_Users
        FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Subscriptions_Plans
        FOREIGN KEY (PlanId) REFERENCES dbo.SubscriptionPlans(Id)
        ON DELETE NO ACTION
);

CREATE INDEX IX_Subscriptions_UserId ON dbo.Subscriptions(UserId);
CREATE INDEX IX_Subscriptions_IsActive ON dbo.Subscriptions(IsActive);
GO


-- QUOTA USAGES (Monthly quota usage)
CREATE TABLE dbo.QuotaUsages (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_QuotaUsages PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    YearMonth NVARCHAR(7) NOT NULL, -- e.g. 2026-01

    UsedDownloads INT NOT NULL CONSTRAINT DF_QuotaUsages_Used DEFAULT 0,
    LimitDownloads INT NOT NULL CONSTRAINT DF_QuotaUsages_Limit DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_QuotaUsages_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_QuotaUsages_Users
        FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX UX_QuotaUsages_User_YearMonth ON dbo.QuotaUsages(UserId, YearMonth);
GO


-- DOWNLOAD TOKENS (store token hash, time-limited)
CREATE TABLE dbo.DownloadTokens (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_DownloadTokens PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,

    ExpiresAt DATETIME2 NOT NULL,
    Used BIT NOT NULL CONSTRAINT DF_DownloadTokens_Used DEFAULT 0,

    SignedUrlHash NVARCHAR(128) NOT NULL,

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_DownloadTokens_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_DownloadTokens_Users
        FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
        ON DELETE CASCADE,

    CONSTRAINT FK_DownloadTokens_Products
        FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id)
        ON DELETE NO ACTION
);

CREATE INDEX IX_DownloadTokens_UserId ON dbo.DownloadTokens(UserId);
CREATE INDEX IX_DownloadTokens_ProductId ON dbo.DownloadTokens(ProductId);
CREATE INDEX IX_DownloadTokens_ExpiresAt ON dbo.DownloadTokens(ExpiresAt);
GO


-- DOWNLOAD HISTORIES (audit log)
-- DOWNLOAD HISTORIES (audit log)
CREATE TABLE dbo.DownloadHistories (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_DownloadHistories PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,

    OrderId UNIQUEIDENTIFIER NULL,
    SubscriptionId UNIQUEIDENTIFIER NULL,

    IpAddress NVARCHAR(60) NULL,
    UserAgent NVARCHAR(300) NULL,

    Success BIT NOT NULL CONSTRAINT DF_DownloadHistories_Success DEFAULT 1,
    FailureReason NVARCHAR(300) NULL,

    DownloadedAt DATETIME2 NOT NULL CONSTRAINT DF_DownloadHistories_DownloadedAt DEFAULT SYSUTCDATETIME(),

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_DownloadHistories_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,

    -- ❌ FIX: đổi CASCADE -> NO ACTION để tránh multiple cascade paths
    CONSTRAINT FK_DownloadHistories_Users
        FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
        ON DELETE NO ACTION,

    CONSTRAINT FK_DownloadHistories_Products
        FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id)
        ON DELETE NO ACTION,

    CONSTRAINT FK_DownloadHistories_Orders
        FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Id)
        ON DELETE SET NULL,

    CONSTRAINT FK_DownloadHistories_Subscriptions
        FOREIGN KEY (SubscriptionId) REFERENCES dbo.Subscriptions(Id)
        ON DELETE SET NULL
);
GO


/* =========================================================
   4) Seed Data (Optional)
   ========================================================= */

-- Seed Admin user (passwordHash demo)
INSERT INTO dbo.Users (Email, PasswordHash, DisplayName, Role, Status)
VALUES (N'admin@ocfigurehub.com', N'ADMIN_HASH_DEMO', N'OC Admin', 2, 1);

-- Seed Customer demo
INSERT INTO dbo.Users (Email, PasswordHash, DisplayName, Role, Status)
VALUES (N'customer@ocfigurehub.com', N'CUSTOMER_HASH_DEMO', N'Demo Customer', 1, 1);

-- Seed Subscription Plans
INSERT INTO dbo.SubscriptionPlans (Name, MonthlyPrice, MonthlyQuotaDownloads, IsActive)
VALUES 
(N'Basic', 9.99, 5, 1),
(N'Pro', 19.99, 15, 1),
(N'Unlimited', 49.99, 9999, 1);

-- Seed Products
INSERT INTO dbo.Products (Name, Description, Price, Category, IsEnabled)
VALUES
(N'Anime Figure Base - STL', N'High quality base model for anime figure printing.', 4.99, N'Figure Base', 1),
(N'OC Character Pose Pack', N'Pose pack for OC figure collection.', 9.99, N'Characters', 1);

GO

PRINT 'OCFigureHubDb schema created successfully.';
GO
