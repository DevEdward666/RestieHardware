# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Use the .NET SDK image for building
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

# Publish the app
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "RestieAPI/RestieAPI.csproj" -c ${BUILD_CONFIGURATION} -o /app/publish /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app

# Copy the published files to the final image
COPY --from=publish /app/publish .

# Ensure that the target folder for images exists
RUN mkdir -p /app/Resources/Images && chown -R app:app /app/Resources

# Optional: If you want to store files in a writable location like /tmp in Fly.io or other cloud environments
#RUN mkdir -p /tmp/Images

# Copy the resources into the container
# If you're moving to a writable location, change the target path to /tmp or other suitable directory
COPY ./RestieAPI/Resources/Images /app/Resources/Images

# Set the entrypoint for the application
ENTRYPOINT ["dotnet", "RestieAPI.dll"]
