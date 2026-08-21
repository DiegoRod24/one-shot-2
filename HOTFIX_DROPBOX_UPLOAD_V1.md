# Hotfix Dropbox upload

Dropbox Content API requiere `Content-Type: application/octet-stream` para `/files/upload`. ONE SHOT preserva el MIME real solo como metadata de la evidencia; el transporte binario usa octet-stream.
