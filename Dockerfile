# --- Stage 1: Build React Frontend with pnpm ---
FROM node:22-alpine AS frontend-build
WORKDIR /src/Application

# install the dependencies first, so they are cached as long as the lockfile does not change
COPY Application/package.json Application/pnpm-lock.yaml Application/pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# copy the rest of the source and build
COPY Application/ ./
RUN pnpm run build

# --- Stage 2: Base ASP.NET Image ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS base
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:9500
EXPOSE 9500

# --- Stage 3: Build .NET Backend ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY [".", "src/"]
RUN dotnet restore "src/Service/Library/TimeTracking.Service.csproj"

# --- Stage 4: Publish ---
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "src/Service/Library/TimeTracking.Service.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# --- Stage 5: Final Image ---
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# COPY the React build from Stage 1 into the wwwroot folder
COPY --from=frontend-build /src/Application/dist ./wwwroot

ENTRYPOINT ["dotnet", "TimeTracking.Service.dll"]