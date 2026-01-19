// ==================== VARIABLES GLOBALES ====================
const FOLDER_ID = DriveApp.getRootFolder();

// ==================== FUNCIONES DE UTILIDAD ====================

function obtenerArchivo(nombreArchivo, contenidoDefault = {}) {
  try {
    const file = FOLDER_ID.getFilesByName(nombreArchivo).next();
    const contenido = file.getBlob().getDataAsString();
    return JSON.parse(contenido);
  } catch (e) {
    // Archivo no existe, crear nuevo
    const contenidoJSON = typeof contenidoDefault === 'string' ? contenidoDefault : JSON.stringify(contenidoDefault);
    FOLDER_ID.createFile(nombreArchivo, contenidoJSON, 'application/json');
    return contenidoDefault;
  }
}

function guardarArchivo(nombreArchivo, contenido) {
  try {
    const file = FOLDER_ID.getFilesByName(nombreArchivo).next();
    file.setContent(JSON.stringify(contenido, null, 2));
  } catch (e) {
    FOLDER_ID.createFile(nombreArchivo, JSON.stringify(contenido, null, 2), 'application/json');
  }
}

// ==================== BOOTSTRAP SEGURO ====================

function verificarSiHayAdmin() {
  const usuarios = obtenerArchivo('usuarios.json', {});
  
  // Contar admins
  const admins = Object.values(usuarios).filter(u => u.rol === 'admin');
  
  return admins.length > 0;
}

function crearPrimerAdmin(email, nombre, clave) {
  const usuarios = obtenerArchivo('usuarios.json', {});
  
  // Verificar que NO haya admin
  if (verificarSiHayAdmin()) {
    return { success: false, error: "Ya existe un administrador. No puedes crear otro." };
  }
  
  // Verificar que email sea válido
  if (!email || !email.includes('@')) {
    return { success: false, error: "Email inválido" };
  }
  
  // Verificar que nombre y clave no sean vacías
  if (!nombre || nombre.length < 3) {
    return { success: false, error: "El nombre debe tener al menos 3 caracteres" };
  }
  
  if (!clave || clave.length < 8) {
    return { success: false, error: "La contraseña debe tener al menos 8 caracteres" };
  }
  
  // Verificar que no exista el usuario
  if (usuarios[email]) {
    return { success: false, error: "El usuario ya existe" };
  }
  
  // Crear hash
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    clave
  );
  
  // Crear admin
  usuarios[email] = {
    hash: Utilities.base64Encode(hash),
    nombre: nombre,
    rol: 'admin',
    empresa: null,
    fechaCreacion: new Date().toISOString(),
    activo: true
  };
  
  guardarArchivo('usuarios.json', usuarios);
  
  return {
    success: true,
    mensaje: `Admin ${nombre} creado correctamente`,
    email: email
  };
}

// ==================== AUTENTICACIÓN ====================

function verificarAdmin(email, clave) {
  const usuarios = obtenerArchivo('usuarios.json', {});
  const user = usuarios[email];
  
  if (!user) return { success: false, error: "Usuario no existe" };
  
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    clave
  );
  
  const hashEncoded = Utilities.base64Encode(hash);
  
  if (hashEncoded !== user.hash) {
    return { success: false, error: "Contraseña incorrecta" };
  }
  
  if (user.rol !== 'admin') {
    return { success: false, error: "No tienes permisos de administrador" };
  }
  
  return { success: true, usuario: user };
}

// ==================== GESTIÓN DE USUARIOS ====================

function crearUsuario(emailAdmin, claveAdmin, nuevoEmail, nuevoNombre, nuevaClave, empresa, esAdmin) {
  // Verificar que quien lo hace es admin
  const adminCheck = verificarAdmin(emailAdmin, claveAdmin);
  if (!adminCheck.success) return adminCheck;
  
  const usuarios = obtenerArchivo('usuarios.json', {});
  
  // Verificar que no exista
  if (usuarios[nuevoEmail]) {
    return { success: false, error: "El usuario ya existe" };
  }
  
  // Validaciones
  if (!nuevoNombre || nuevoNombre.length < 3) {
    return { success: false, error: "El nombre debe tener al menos 3 caracteres" };
  }
  
  if (!nuevaClave || nuevaClave.length < 8) {
    return { success: false, error: "La contraseña debe tener al menos 8 caracteres" };
  }
  
  // Crear hash de la contraseña
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    nuevaClave
  );
  
  // Agregar usuario
  usuarios[nuevoEmail] = {
    hash: Utilities.base64Encode(hash),
    nombre: nuevoNombre,
    rol: esAdmin ? 'admin' : 'usuario',
    empresa: empresa || null,
    fechaCreacion: new Date().toISOString(),
    activo: true
  };
  
  guardarArchivo('usuarios.json', usuarios);
  
  return { 
    success: true, 
    mensaje: `Usuario ${nuevoNombre} creado correctamente`,
    email: nuevoEmail
  };
}

function listarUsuarios(email, clave) {
  // Verificar que quien lo hace es admin
  const adminCheck = verificarAdmin(email, clave);
  if (!adminCheck.success) return adminCheck;
  
  const usuarios = obtenerArchivo('usuarios.json', {});
  
  // Convertir a array
  const usuariosArray = Object.keys(usuarios).map(email => ({
    email: email,
    nombre: usuarios[email].nombre,
    rol: usuarios[email].rol,
    empresa: usuarios[email].empresa,
    fechaCreacion: usuarios[email].fechaCreacion,
    activo: usuarios[email].activo
  }));
  
  return usuariosArray;
}

function editarEmpresaUsuario(emailAdmin, claveAdmin, usuarioTarget, nuevaEmpresa) {
  // Verificar que quien lo hace es admin
  const adminCheck = verificarAdmin(emailAdmin, claveAdmin);
  if (!adminCheck.success) return adminCheck;
  
  const usuarios = obtenerArchivo('usuarios.json', {});
  
  if (!usuarios[usuarioTarget]) {
    return { success: false, error: "Usuario no encontrado" };
  }
  
  // Actualizar empresa
  usuarios[usuarioTarget].empresa = nuevaEmpresa;
  guardarArchivo('usuarios.json', usuarios);
  
  return { 
    success: true,
    mensaje: `Empresa de ${usuarioTarget} actualizada a ${nuevaEmpresa}`
  };
}

function eliminarUsuario(emailAdmin, claveAdmin, usuarioTarget) {
  // Verificar que quien lo hace es admin
  const adminCheck = verificarAdmin(emailAdmin, claveAdmin);
  if (!adminCheck.success) return adminCheck;
  
  const usuarios = obtenerArchivo('usuarios.json', {});
  
  if (!usuarios[usuarioTarget]) {
    return { success: false, error: "Usuario no encontrado" };
  }
  
  // No permitir eliminar a sí mismo
  if (emailAdmin === usuarioTarget) {
    return { success: false, error: "No puedes eliminar tu propia cuenta" };
  }
  
  delete usuarios[usuarioTarget];
  guardarArchivo('usuarios.json', usuarios);
  
  return { 
    success: true,
    mensaje: `Usuario ${usuarioTarget} eliminado`
  };
}

// ==================== AUTENTICACIÓN DE USUARIO NORMAL ====================

function verificarLogin(email, clave) {
  const usuarios = obtenerArchivo('usuarios.json', {});
  const user = usuarios[email];
  
  if (!user) return { success: false, error: "Usuario no existe" };
  
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    clave
  );
  
  const hashEncoded = Utilities.base64Encode(hash);
  
  if (hashEncoded !== user.hash) {
    return { success: false, error: "Contraseña incorrecta" };
  }
  
  return { 
    success: true,
    usuario: email,
    nombre: user.nombre,
    rol: user.rol,
    empresa: user.empresa
  };
}

// ==================== VERIFICAR ESTADO DEL SISTEMA ====================

function verificarEstadoSistema() {
  const hayAdmin = verificarSiHayAdmin();
  
  return {
    hayAdmin: hayAdmin,
    necesitaBootstrap: !hayAdmin
  };
}

// ==================== API WEB ====================

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    
    let resultado;
    
    switch (params.accion) {
      // Bootstrap seguro
      case 'verificarEstado':
        resultado = verificarEstadoSistema();
        break;
        
      case 'crearPrimerAdmin':
        resultado = crearPrimerAdmin(
          params.email,
          params.nombre,
          params.clave
        );
        break;
      
      // Login
      case 'login':
        resultado = verificarLogin(params.email, params.clave);
        break;
        
      // Gestión de usuarios (admin)
      case 'crearUsuario':
        resultado = crearUsuario(
          params.email,
          params.clave,
          params.nuevoEmail,
          params.nuevoNombre,
          params.nuevaClave,
          params.empresa,
          params.esAdmin
        );
        break;
        
      case 'listarUsuarios':
        resultado = listarUsuarios(params.email, params.clave);
        break;
        
      case 'editarEmpresaUsuario':
        resultado = editarEmpresaUsuario(
          params.email,
          params.clave,
          params.usuarioTarget,
          params.nuevaEmpresa
        );
        break;
        
      case 'eliminarUsuario':
        resultado = eliminarUsuario(
          params.email,
          params.clave,
          params.usuarioTarget
        );
        break;
        
      default:
        resultado = { success: false, error: "Acción no reconocida" };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: "Error del servidor: " + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
