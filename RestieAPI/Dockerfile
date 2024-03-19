FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src/RestieAPI

# Copy csproj and restore as distinct layers
COPY ["RestieAPI/RestieAPI.csproj", "RestieAPI/"]
RUN dotnet restore "RestieAPI/RestieAPI.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/RestieAPI"
RUN dotnet build "RestieAPI/RestieAPI.csproj" -c ${BUILD_CONFIGURATION} -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "RestieAPI/RestieAPI.csproj" -c ${BUILD_CONFIGURATION} -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RestieAPI.dll"]
