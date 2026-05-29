# Etapa de build: compila la API para generar artefactos listos para produccion.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copia el archivo de proyecto y restaura dependencias para aprovechar cache de capas.
COPY FinovaApi.csproj ./
RUN dotnet restore FinovaApi.csproj

# Copia el resto del codigo y publica la aplicacion.
COPY . ./
RUN dotnet publish FinovaApi.csproj -c Release -o /app/publish /p:UseAppHost=false

# Etapa runtime: imagen liviana solo para ejecucion.
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Configura el puerto interno del contenedor.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Copia el resultado compilado desde la etapa de build.
COPY --from=build /app/publish ./

# Arranca la API.
ENTRYPOINT ["dotnet", "FinovaApi.dll"]
