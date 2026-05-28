#!/bin/bash
set -e

echo "Esperando SQL Server..."
until /opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1
do
  sleep 2
done

echo "SQL listo. Creando BD si no existe..."
/opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -C -i /init/init.sql

echo "Ejecutando scripts versionados..."
for f in /scripts/*.sql; do
  echo "Ejecutando $f"
  /opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -C -d FinovaDb -i "$f"
done

echo "Inicialización completada."