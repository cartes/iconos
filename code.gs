// code.gs (Google Apps Script)

// Función para crear credenciales (ejecuta una sola vez)
function crearUsuario(usuario, clave) {
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, 
    clave
  );
  
  const usuarios = obtenerUsuarios();
  usuarios.push({
    usuario: usuario,
    hash: Utilities.base64Encode(hash),
    fechaCreacion: new Date()
  });
  
  guardarUsuarios(usuarios);
  return { success: true, mensaje: "Usuario creado" };
}

// Verificar login
function verificarLogin(usuario, clave) {
  const usuarios = obtenerUsuarios();
  const user = usuarios.find(u => u.usuario === usuario);
  
  if (!user) return { success: false, error: "Usuario no existe" };
  
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, 
    clave
  );
  
  const hashEncoded = Utilities.base64Encode(hash);
  
  if (hashEncoded === user.hash) {
    return { success: true, usuario: usuario };
  }
  
  return { success: false, error: "Contraseña incorrecta" };
}

// Guardar datos cifrados
function guardarDatoCifrado(usuario, contenido, clave) {
  // Verificar que está autenticado
  const login = verificarLogin(usuario, clave);
  if (!login.success) return login;
  
  // Cifrar contenido
  const datoCifrado = Utilities.base64Encode(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      contenido
    ).toString()
  );
  
  // Obtener datos existentes
  let datos = obtenerDatos();
  
  // Agregar nuevo registro
  datos.push({
    id: Utilities.getUuid(),
    usuario: usuario,
    contenido: contenido, // Guardar también en texto
    cifrado: datoCifrado,
    fecha: new Date().toISOString()
  });
  
  guardarDatos(datos);
  return { success: true, mensaje: "Dato guardado" };
}

// Obtener todos mis datos
function obtenerMisDatos(usuario, clave) {
  const login = verificarLogin(usuario, clave);
  if (!login.success) return login;
  
  let datos = obtenerDatos();
  return datos.filter(d => d.usuario === usuario);
}

// Funciones auxiliares
function obtenerUsuarios() {
  const folder = DriveApp.getRootFolder();
  let file;
  
  try {
    file = folder.getFilesByName('usuarios.json').next();
  } catch (e) {
    // Crear archivo si no existe
    file = folder.createFile('usuarios.json', JSON.stringify([]), 'application/json');
    return [];
  }
  
  return JSON.parse(file.getBlob().getDataAsString());
}

function guardarUsuarios(usuarios) {
  const folder = DriveApp.getRootFolder();
  let file;
  
  try {
    file = folder.getFilesByName('usuarios.json').next();
    file.setContent(JSON.stringify(usuarios, null, 2));
  } catch (e) {
    folder.createFile('usuarios.json', JSON.stringify(usuarios, null, 2), 'application/json');
  }
}

function obtenerDatos() {
  const folder = DriveApp.getRootFolder();
  let file;
  
  try {
    file = folder.getFilesByName('datos.json').next();
    return JSON.parse(file.getBlob().getDataAsString());
  } catch (e) {
    return [];
  }
}

function guardarDatos(datos) {
  const folder = DriveApp.getRootFolder();
  let file;
  
  try {
    file = folder.getFilesByName('datos.json').next();
    file.setContent(JSON.stringify(datos, null, 2));
  } catch (e) {
    folder.createFile('datos.json', JSON.stringify(datos, null, 2), 'application/json');
  }
}

// Exponer como API Web
function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  
  switch (params.accion) {
    case 'crearUsuario':
      return ContentService.createTextOutput(JSON.stringify(
        crearUsuario(params.usuario, params.clave)
      )).setMimeType(ContentService.MimeType.JSON);
      
    case 'login':
      return ContentService.createTextOutput(JSON.stringify(
        verificarLogin(params.usuario, params.clave)
      )).setMimeType(ContentService.MimeType.JSON);
      
    case 'guardar':
      return ContentService.createTextOutput(JSON.stringify(
        guardarDatoCifrado(params.usuario, params.contenido, params.clave)
      )).setMimeType(ContentService.MimeType.JSON);
      
    case 'obtenerDatos':
      return ContentService.createTextOutput(JSON.stringify(
        obtenerMisDatos(params.usuario, params.clave)
      )).setMimeType(ContentService.MimeType.JSON);
      
    default:
      return ContentService.createTextOutput(JSON.stringify({ error: "Acción no válida" }))
        .setMimeType(ContentService.MimeType.JSON);
  }
}
