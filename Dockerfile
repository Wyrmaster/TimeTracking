# --- Stage 1: Build React Frontend with npm ---
FROM node:20-alpine AS frontend-build
COPY ["./Application", "src/Application"]
WORKDIR /src/Application

# Install dependencies
RUN npm install

# Copy the rest of the source and build
COPY Application/ ./
RUN npm run build

# --- Stage 2: Base ASP.NET Image ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 9050

# --- Stage 3: Build .NET Backend ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY [".", "src/"]
RUN dotnet restore "src/Service/TimeTracking.Service.csproj"

# --- Stage 4: Publish ---
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "src/Service/TimeTracking.Service.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# --- Stage 5: Final Image ---
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# COPY the React build from Stage 1 into the wwwroot folder
COPY --from=frontend-build /src/Application/dist ./wwwroot

ENTRYPOINT ["dotnet", "TimeTracking.Service.dll"]