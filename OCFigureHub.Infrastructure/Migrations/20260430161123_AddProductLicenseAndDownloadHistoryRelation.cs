using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OCFigureHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductLicenseAndDownloadHistoryRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "License",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_DownloadHistories_ProductId",
                table: "DownloadHistories",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_DownloadHistories_Products_ProductId",
                table: "DownloadHistories",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DownloadHistories_Products_ProductId",
                table: "DownloadHistories");

            migrationBuilder.DropIndex(
                name: "IX_DownloadHistories_ProductId",
                table: "DownloadHistories");

            migrationBuilder.DropColumn(
                name: "License",
                table: "Products");
        }
    }
}
