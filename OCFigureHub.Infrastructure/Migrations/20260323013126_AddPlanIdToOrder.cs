using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OCFigureHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanIdToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PlanId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_PlanId",
                table: "Orders",
                column: "PlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_SubscriptionPlans_PlanId",
                table: "Orders",
                column: "PlanId",
                principalTable: "SubscriptionPlans",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_SubscriptionPlans_PlanId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_PlanId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PlanId",
                table: "Orders");
        }
    }
}
