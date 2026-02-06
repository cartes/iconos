// ==================== VARIABLES GLOBALES ====================
// Usamos el root folder por defecto, igual que el original.
const FOLDER_ID = DriveApp.getRootFolder();

// ==================== MODELOS DE DATOS (Nombres de Archivos) ====================
const DB_USUARIOS = "usuarios.json";
const DB_EMPRESAS = "empresas.json";
const DB_CARPETAS = "carpetas.json";
const DB_ICONOS = "iconos.json";

// ==================== MANUAL RESTORE ====================
function restaurarUsuarioManual() {
  const usuarioData = {
    "cristian.cartes@content360.cl": {
      hash: "MX6grk7OFu/WbIWgabBD9YMrzVPYV0NdhalKlmqSJVY=",
      nombre: "Cristian Cartes",
      rol: "admin",
      empresa: null,
      fechaCreacion: "2026-01-19T16:31:57.041Z",
      activo: true,
    },
  };

  const usuarios = obtenerArchivo(DB_USUARIOS, {});
  // Merge manual data
  Object.assign(usuarios, usuarioData);
  guardarArchivo(DB_USUARIOS, usuarios);

  console.log("Usuario restaurado con éxito.");
  return "Usuario restaurado";
}

// ==================== FUNCIONES DE UTILIDAD ====================

function obtenerArchivo(nombreArchivo, contenidoDefault = []) {
  try {
    const files = FOLDER_ID.getFilesByName(nombreArchivo);
    if (files.hasNext()) {
      const file = files.next();
      const text = file.getBlob().getDataAsString();
      return JSON.parse(text);
    } else {
      // Archivo no existe, crear nuevo
      const contenidoJSON = JSON.stringify(contenidoDefault, null, 2);
      FOLDER_ID.createFile(nombreArchivo, contenidoJSON, "application/json");
      return contenidoDefault;
    }
  } catch (e) {
    console.error(`Error leyendo ${nombreArchivo}: ${e}`);
    return contenidoDefault;
  }
}

function guardarArchivo(nombreArchivo, contenido) {
  try {
    const files = FOLDER_ID.getFilesByName(nombreArchivo);
    if (files.hasNext()) {
      const file = files.next();
      file.setContent(JSON.stringify(contenido, null, 2));
    } else {
      FOLDER_ID.createFile(
        nombreArchivo,
        JSON.stringify(contenido, null, 2),
        "application/json",
      );
    }
  } catch (e) {
    console.error(`Error guardando ${nombreArchivo}: ${e}`);
    throw e;
  }
}

function generarUUID() {
  return Utilities.getUuid();
}

// ==================== MIGRACIÓN / INICIALIZACIÓN ====================
// Asegura que existan los archivos base
function inicializarBD() {
  obtenerArchivo(DB_EMPRESAS, []);
  obtenerArchivo(DB_CARPETAS, []);
  obtenerArchivo(DB_ICONOS, []);
  // usuarios.json es un objeto en la versión anterior, mantengamos compatibilidad si es posible,
  // pero para facilitar búsquedas, la versión anterior usaba un objeto {email: data}.
  // Mantendremos { "email": { ... } } para usuarios.json por ahora para no romper todo,
  // aunque arrays suelen ser mejores para filtrar.
  // REVISION: El código anterior usaba Objeto. Mantendré Objeto para usuarios.json.
  obtenerArchivo(DB_USUARIOS, {});
}

// ==================== ADMIN & AUTH ====================

function verificarSiHayAdmin() {
  const usuarios = obtenerArchivo(DB_USUARIOS, {});
  const admins = Object.values(usuarios).filter((u) => u.rol === "admin");
  return admins.length > 0;
}

function verificarAdmin(email, clave) {
  const usuarios = obtenerArchivo(DB_USUARIOS, {});
  const user = usuarios[email];
  if (!user) return { success: false, error: "Usuario no existe" };

  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    clave,
  );
  const hashEncoded = Utilities.base64Encode(hash);

  if (hashEncoded !== user.hash)
    return { success: false, error: "Contraseña incorrecta" };
  if (user.rol !== "admin")
    return { success: false, error: "No tienes permisos de administrador" };

  return { success: true, usuario: user };
}

function verificarLogin(email, clave) {
  const usuarios = obtenerArchivo(DB_USUARIOS, {});
  const user = usuarios[email];

  if (!user) return { success: false, error: "Usuario no existe" };

  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    clave,
  );
  const hashEncoded = Utilities.base64Encode(hash);

  if (hashEncoded !== user.hash)
    return { success: false, error: "Contraseña incorrecta" };

  return {
    success: true,
    usuario: email,
    nombre: user.nombre,
    rol: user.rol,
    empresaId: user.empresaId || null, // Usamos ID ahora
    empresaNombre: user.empresaNombre || user.empresa || null, // Fallback
  };
}

function cambiarClave(email, claveActual, nuevaClave) {
  const usuarios = obtenerArchivo(DB_USUARIOS, {});
  const user = usuarios[email];

  if (!user) return { success: false, error: "Usuario no existe" };

  // Verificar clave actual
  const hashActual = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, claveActual),
  );
  if (user.hash !== hashActual) {
    return { success: false, error: "Contraseña actual incorrecta" };
  }

  // Validar nueva clave
  if (!nuevaClave || nuevaClave.length < 8) {
    return {
      success: false,
      error: "La nueva contraseña debe tener al menos 8 caracteres",
    };
  }

  // Actualizar
  const nuevoHash = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, nuevaClave),
  );
  user.hash = nuevoHash;

  guardarArchivo(DB_USUARIOS, usuarios);

  return { success: true, mensaje: "Contraseña actualizada correctamente" };
}

function crearPrimerAdmin(email, nombre, clave) {
  const usuarios = obtenerArchivo(DB_USUARIOS, {});
  if (verificarSiHayAdmin())
    return { success: false, error: "Ya existe administrador" };

  const hash = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, clave),
  );

  usuarios[email] = {
    hash: hash,
    nombre: nombre,
    rol: "admin",
    empresaId: null,
    fechaCreacion: new Date().toISOString(),
    activo: true,
  };

  guardarArchivo(DB_USUARIOS, usuarios);
  return { success: true };
}

// ==================== GESTIÓN DE EMPRESAS ====================

function crearEmpresa(emailAdmin, claveAdmin, nombreEmpresa) {
  const auth = verificarAdmin(emailAdmin, claveAdmin);
  if (!auth.success) return auth;

  const empresas = obtenerArchivo(DB_EMPRESAS, []);

  // Validar duplicados nombre
  if (
    empresas.some((e) => e.nombre.toLowerCase() === nombreEmpresa.toLowerCase())
  ) {
    return { success: false, error: "Ya existe una empresa con este nombre" };
  }

  const nuevaEmpresa = {
    id: generarUUID(),
    nombre: nombreEmpresa,
    fechaCreacion: new Date().toISOString(),
  };

  empresas.push(nuevaEmpresa);
  guardarArchivo(DB_EMPRESAS, empresas);

  return { success: true, empresa: nuevaEmpresa };
}

function listarEmpresas(emailAdmin, claveAdmin) {
  const auth = verificarAdmin(emailAdmin, claveAdmin);
  if (!auth.success) return auth;

  const empresas = obtenerArchivo(DB_EMPRESAS, []);
  return { success: true, empresas: empresas };
}

function eliminarEmpresa(emailAdmin, claveAdmin, idEmpresa) {
  const auth = verificarAdmin(emailAdmin, claveAdmin);
  if (!auth.success) return auth;

  let empresas = obtenerArchivo(DB_EMPRESAS, []);
  empresas = empresas.filter((e) => e.id !== idEmpresa);
  guardarArchivo(DB_EMPRESAS, empresas);

  // Opcional: Eliminar o desvincular usuarios/iconos de esta empresa?
  // Por ahora dejamos huérfanos o se maneja manualmente.

  return { success: true };
}

// ==================== GESTIÓN DE USUARIOS (Con Empresas Dinámicas) ====================

function crearUsuario(
  emailAdmin,
  claveAdmin,
  nuevoEmail,
  nuevoNombre,
  nuevaClave,
  empresaId,
  esAdmin,
) {
  const auth = verificarAdmin(emailAdmin, claveAdmin);
  if (!auth.success) return auth;

  const usuarios = obtenerArchivo(DB_USUARIOS, {});
  if (usuarios[nuevoEmail])
    return { success: false, error: "El usuario ya existe" };

  // Obtener nombre de empresa para guardar cache (opcional, pero útil)
  let empresaNombre = null;
  if (empresaId) {
    const empresas = obtenerArchivo(DB_EMPRESAS, []);
    const emp = empresas.find((e) => e.id === empresaId);
    if (emp) empresaNombre = emp.nombre;
  }

  const hash = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, nuevaClave),
  );

  usuarios[nuevoEmail] = {
    hash: hash,
    nombre: nuevoNombre,
    rol: esAdmin ? "admin" : "usuario",
    empresaId: empresaId || null,
    empresaNombre: empresaNombre, // Guardamos nombre para facilitar display sin joins
    fechaCreacion: new Date().toISOString(),
    activo: true,
  };

  guardarArchivo(DB_USUARIOS, usuarios);
  return { success: true, mensaje: "Usuario creado" };
}

function listarUsuarios(emailAdmin, claveAdmin) {
  const auth = verificarAdmin(emailAdmin, claveAdmin);
  if (!auth.success) return auth;

  const usuarios = obtenerArchivo(DB_USUARIOS, {});
  const listado = Object.keys(usuarios).map((email) => {
    const u = usuarios[email];
    return {
      email: email,
      nombre: u.nombre,
      rol: u.rol,
      empresaId: u.empresaId,
      empresaNombre: u.empresaNombre || u.empresa, // fallback legacy
    };
  });

  return { success: true, usuarios: listado };
}

function editarUsuario(emailAdmin, claveAdmin, targetEmail, datos) {
  const auth = verificarAdmin(emailAdmin, claveAdmin);
  if (!auth.success) return auth;

  let usuarios = obtenerArchivo(DB_USUARIOS, {});
  const user = usuarios[targetEmail];

  if (!user) return { success: false, error: "Usuario no existe" };

  // Actualizar datos básicos
  if (datos.nombre) user.nombre = datos.nombre;

  // Actualizar empresa
  if (datos.empresaId !== undefined) {
    user.empresaId = datos.empresaId;
    // Buscar nombre empresa para cache
    const empresas = obtenerArchivo(DB_EMPRESAS, []);
    const emp = empresas.find((e) => e.id === datos.empresaId);
    user.empresaNombre = emp ? emp.nombre : null;
  }

  // Actualizar clave (opcional)
  if (datos.nuevaClave && datos.nuevaClave.length >= 8) {
    const hash = Utilities.base64Encode(
      Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        datos.nuevaClave,
      ),
    );
    user.hash = hash;
  }

  guardarArchivo(DB_USUARIOS, usuarios);
  return { success: true };
}

function eliminarUsuario(emailAdmin, claveAdmin, usuarioTarget) {
  const auth = verificarAdmin(emailAdmin, claveAdmin);
  if (!auth.success) return auth;

  const usuarios = obtenerArchivo(DB_USUARIOS, {});
  if (!usuarios[usuarioTarget])
    return { success: false, error: "Usuario no existe" };
  if (emailAdmin === usuarioTarget)
    return { success: false, error: "No puedes eliminarte a ti mismo" };

  delete usuarios[usuarioTarget];
  guardarArchivo(DB_USUARIOS, usuarios);

  return { success: true };
}

// ==================== GESTIÓN DE CARPETAS Y ICONOS ====================

function crearCarpeta(usuarioEmail, clave, nombreCarpeta, targetEmpresaId) {
  const login = verificarLogin(usuarioEmail, clave);
  if (!login.success) return login;

  const contextEmpresaId =
    login.rol === "admin" && targetEmpresaId
      ? targetEmpresaId
      : login.empresaId;

  if (!contextEmpresaId)
    return { success: false, error: "No tienes empresa asignada" };

  const carpetas = obtenerArchivo(DB_CARPETAS, []);

  // Validar duplicados en la misma empresa
  const existe = carpetas.some(
    (c) => c.nombre === nombreCarpeta && c.empresaId === contextEmpresaId,
  );
  if (existe) return { success: false, error: "La carpeta ya existe" };

  const nuevaCarpeta = {
    id: generarUUID(),
    nombre: nombreCarpeta,
    empresaId: contextEmpresaId,
    creadoPor: usuarioEmail,
  };

  carpetas.push(nuevaCarpeta);
  guardarArchivo(DB_CARPETAS, carpetas);

  return { success: true, carpeta: nuevaCarpeta };
}

function listarCarpetas(usuarioEmail, clave, targetEmpresaId) {
  const login = verificarLogin(usuarioEmail, clave);
  if (!login.success) return login;

  // Determine context: Admin override or user's own company
  const contextEmpresaId =
    login.rol === "admin" && targetEmpresaId
      ? targetEmpresaId
      : login.empresaId;

  const carpetas = obtenerArchivo(DB_CARPETAS, []);
  const misCarpetas = carpetas.filter((c) => c.empresaId === contextEmpresaId);

  return { success: true, carpetas: misCarpetas };
}

function eliminarCarpeta(usuarioEmail, clave, idCarpeta) {
  const login = verificarLogin(usuarioEmail, clave);
  if (!login.success) return login;

  let carpetas = obtenerArchivo(DB_CARPETAS, []);

  const carpetaIndex = carpetas.findIndex((c) => c.id === idCarpeta);
  if (carpetaIndex === -1)
    return { success: false, error: "Carpeta no encontrada" };

  const carpeta = carpetas[carpetaIndex];

  // Validar permisos: Admin puede borrar cualquiera, usuario solo suyas
  if (login.rol !== "admin" && carpeta.empresaId !== login.empresaId)
    return { success: false, error: "No tienes permisos" };

  // Validar que esté vacía
  const iconos = obtenerArchivo(DB_ICONOS, []);
  const tieneIconos = iconos.some((i) => i.carpetaId === idCarpeta);

  if (tieneIconos) {
    return {
      success: false,
      error: "La carpeta no está vacía. Elimina los iconos primero.",
    };
  }

  carpetas.splice(carpetaIndex, 1);
  guardarArchivo(DB_CARPETAS, carpetas);

  return { success: true };
}

function renombrarCarpeta(usuarioEmail, clave, idCarpeta, nuevoNombre) {
  const login = verificarLogin(usuarioEmail, clave);
  if (!login.success) return login;

  let carpetas = obtenerArchivo(DB_CARPETAS, []);

  const carpeta = carpetas.find((c) => c.id === idCarpeta);
  if (!carpeta) return { success: false, error: "Carpeta no encontrada" };

  // Admin bypass or same company
  if (login.rol !== "admin" && carpeta.empresaId !== login.empresaId)
    return { success: false, error: "No tienes permisos" };

  // Validar duplicados en el contexto de la carpeta
  const existe = carpetas.some(
    (c) =>
      c.nombre === nuevoNombre &&
      c.empresaId === carpeta.empresaId && // Chequear en la misma empresa
      c.id !== idCarpeta,
  );
  if (existe)
    return { success: false, error: "Ya existe una carpeta con ese nombre" };

  carpeta.nombre = nuevoNombre;
  guardarArchivo(DB_CARPETAS, carpetas);

  return { success: true };
}

function subirIcono(
  usuarioEmail,
  clave,
  url,
  carpetaId,
  etiqueta,
  targetEmpresaId,
) {
  const login = verificarLogin(usuarioEmail, clave);
  if (!login.success) return login;

  const contextEmpresaId =
    login.rol === "admin" && targetEmpresaId
      ? targetEmpresaId
      : login.empresaId;

  const iconos = obtenerArchivo(DB_ICONOS, []);

  const nuevoIcono = {
    id: generarUUID(),
    url: url,
    carpetaId: carpetaId,
    etiqueta: etiqueta || "", // Nuevo campo
    empresaId: contextEmpresaId,
    subidoPor: usuarioEmail,
    fechaSubida: new Date().toISOString(),
  };

  iconos.push(nuevoIcono);
  guardarArchivo(DB_ICONOS, iconos);

  return { success: true, icono: nuevoIcono };
}

function listarIconos(usuarioEmail, clave, targetEmpresaId) {
  const login = verificarLogin(usuarioEmail, clave);
  if (!login.success) return login;

  const contextEmpresaId =
    login.rol === "admin" && targetEmpresaId
      ? targetEmpresaId
      : login.empresaId;

  const iconos = obtenerArchivo(DB_ICONOS, []);

  // Filtrar por empresa
  const misIconos = iconos.filter((i) => i.empresaId === contextEmpresaId);

  return { success: true, iconos: misIconos };
}

function editarIcono(usuarioEmail, clave, idIcono, nuevaEtiqueta) {
  const login = verificarLogin(usuarioEmail, clave);
  if (!login.success) return login;

  let iconos = obtenerArchivo(DB_ICONOS, []);

  const iconoIndex = iconos.findIndex((i) => i.id === idIcono);
  if (iconoIndex === -1)
    return { success: false, error: "Icono no encontrado" };

  const icono = iconos[iconoIndex];

  // Permisos: Admin, Dueño, o Compañero de empresa
  // (Si es colaborativo, cualquiera de la empresa puede editar. Si es estricto, solo dueño/admin).
  // Asumiremos colaborativo nivel empresa.
  if (login.rol !== "admin" && icono.empresaId !== login.empresaId) {
    return { success: false, error: "No tienes permisos" };
  }

  icono.etiqueta = nuevaEtiqueta;
  guardarArchivo(DB_ICONOS, iconos);

  return { success: true };
}

function eliminarIcono(usuarioEmail, clave, idIcono) {
  const login = verificarLogin(usuarioEmail, clave);
  if (!login.success) return login;

  let iconos = obtenerArchivo(DB_ICONOS, []);

  // Validar permisos: solo dueño, o alguien de la misma empresa (si es colaborativo), o admin
  const iconoIndex = iconos.findIndex((i) => i.id === idIcono);
  if (iconoIndex === -1)
    return { success: false, error: "Icono no encontrado" };

  const icono = iconos[iconoIndex];

  if (login.rol !== "admin" && icono.empresaId !== login.empresaId) {
    return { success: false, error: "No tienes permisos" };
  }

  iconos.splice(iconoIndex, 1);
  guardarArchivo(DB_ICONOS, iconos);

  return { success: true };
}

// ==================== API WEB (DoPost) ====================

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    let resultado = { success: false, error: "Accion desconocida" };

    switch (params.accion) {
      // SISTEMA
      case "verificarEstado":
        resultado = {
          hayAdmin: verificarSiHayAdmin(),
          necesitaBootstrap: !verificarSiHayAdmin(),
        };
        break;
      case "crearPrimerAdmin":
        resultado = crearPrimerAdmin(params.email, params.nombre, params.clave);
        break;
      case "login":
        resultado = verificarLogin(params.email, params.clave);
        break;
      case "cambiarClave":
        resultado = cambiarClave(params.email, params.clave, params.nuevaClave);
        break;

      // EMPRESAS (Admin)
      case "crearEmpresa":
        resultado = crearEmpresa(
          params.email,
          params.clave,
          params.nombreEmpresa,
        );
        break;
      case "listarEmpresas":
        resultado = listarEmpresas(params.email, params.clave);
        break;
      case "eliminarEmpresa":
        resultado = eliminarEmpresa(
          params.email,
          params.clave,
          params.idEmpresa,
        );
        break;

      // USUARIOS
      case "crearUsuario":
        resultado = crearUsuario(
          params.email,
          params.clave,
          params.nuevoEmail,
          params.nuevoNombre,
          params.nuevaClave,
          params.empresaId,
          params.esAdmin,
        );
        break;
      case "listarUsuarios":
        resultado = listarUsuarios(params.email, params.clave);
        break;
      case "editarUsuario":
        resultado = editarUsuario(
          params.email,
          params.clave,
          params.targetEmail,
          params.datos,
        );
        break;
      case "eliminarUsuario":
        resultado = eliminarUsuario(
          params.email,
          params.clave,
          params.usuarioTarget,
        );
        break;

      // CARPETAS Y ICONOS
      case "crearCarpeta":
        resultado = crearCarpeta(
          params.email,
          params.clave,
          params.nombreCarpeta,
          params.targetEmpresaId, // Optional param
        );
        break;
      case "eliminarCarpeta":
        resultado = eliminarCarpeta(
          params.email,
          params.clave,
          params.idCarpeta,
        );
        break;
      case "renombrarCarpeta":
        resultado = renombrarCarpeta(
          params.email,
          params.clave,
          params.idCarpeta,
          params.nuevoNombre,
        );
        break;
      case "listarCarpetas":
        resultado = listarCarpetas(
          params.email,
          params.clave,
          params.targetEmpresaId, // Optional param
        );
        break;
      case "subirIcono":
        resultado = subirIcono(
          params.email,
          params.clave,
          params.url,
          params.carpetaId,
          params.etiqueta,
          params.targetEmpresaId, // Optional param
        );
        break;
      case "editarIcono":
        resultado = editarIcono(
          params.email,
          params.clave,
          params.idIcono,
          params.nuevaEtiqueta,
        );
        break;
      case "listarIconos":
        resultado = listarIconos(
          params.email,
          params.clave,
          params.targetEmpresaId, // Optional param
        );
        break;
      case "eliminarIcono":
        resultado = eliminarIcono(params.email, params.clave, params.idIcono);
        break;
    }

    return ContentService.createTextOutput(
      JSON.stringify(resultado),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "Error servidor: " + error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
