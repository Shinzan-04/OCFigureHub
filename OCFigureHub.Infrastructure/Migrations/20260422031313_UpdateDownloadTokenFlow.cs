using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OCFigureHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDownloadTokenFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SignedUrlHash",
                table: "DownloadTokens");

            migrationBuilder.AddColumn<Guid>(
                name: "ProductFileId",
                table: "DownloadTokens",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductFileId",
                table: "DownloadTokens");

            migrationBuilder.AddColumn<string>(
                name: "SignedUrlHash",
                table: "DownloadTokens",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");
        }
    }
}
