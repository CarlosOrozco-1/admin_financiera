#!/bin/bash
set -e

echo "Esperando SQL Server..."
until /opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1
do
  sleep 2
done

echo "SQL listo. Creando BD si no existe..."
/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -d master -Q "IF DB_ID(N'$DB_NAME') IS NULL BEGIN CREATE DATABASE [$DB_NAME]; END"

echo "Ejecutando scripts versionados..."
for f in /scripts/*.sql; do
  echo "Ejecutando $f"
  /opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -d "$DB_NAME" -i "$f"
done

echo "Inicializacion completada."
