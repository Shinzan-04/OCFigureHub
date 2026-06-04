# ===== Build Stage =====
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files for restore
COPY OCFigureHub.Domain/OCFigureHub.Domain.csproj OCFigureHub.Domain/
COPY OCFigureHub.Application/OCFigureHub.Application.csproj OCFigureHub.Application/
COPY OCFigureHub.Infrastructure/OCFigureHub.Infrastructure.csproj OCFigureHub.Infrastructure/
COPY OCFigureHub.API/OCFigureHub.API.csproj OCFigureHub.API/

RUN dotnet restore OCFigureHub.API/OCFigureHub.API.csproj

# Copy all source code
COPY . .

# Build and publish
RUN dotnet publish OCFigureHub.API/OCFigureHub.API.csproj -c Release -o /app/publish --no-restore

# ===== Runtime Stage =====
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Render uses port 10000 by default
ENV ASPNETCORE_URLS=http://0.0.0.0:10000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 10000

ENTRYPOINT ["dotnet", "OCFigureHub.API.dll"]
