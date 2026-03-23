using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OCFigureHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPreviewModelUrlToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreviewModelUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreviewModelUrl",
                table: "Products");
        }
    }
}
