// Las rutas de React Router (/notes/123, /login) no existen como archivos en S3.
// Si la ruta no tiene extensión, se sirve index.html y el router del navegador decide.
// Solo corre en el behavior de S3, así que no afecta a /api/* ni /auth/*.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.lastIndexOf('.') <= uri.lastIndexOf('/')) {
    request.uri = '/index.html';
  }

  return request;
}
