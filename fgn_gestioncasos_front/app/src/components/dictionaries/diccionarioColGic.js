const pick = (dict, keys) =>
  Object.fromEntries(keys.map((k) => [k, dict[k]]));

// variantes "LugarHecho:X" y "LugarHecho_X" sin repetirlas a mano
const LUGAR_HECHO = {
  DPTO: 'Departamento',
  COD_MPIO: 'Código del municipio',
  NOM_MPIO: 'Nombre del municipio',
  LATITUD: 'Latitud',
  LONGITUD: 'Longitud',
};

const lugarHechoLabels = Object.fromEntries(
  Object.entries(LUGAR_HECHO).flatMap(([k, label]) => {
    const text = `Lugar del hecho (${label})`;
    return [[`LugarHecho:${k}`, text], [`LugarHecho_${k}`, text]];
  })
);

// ---------- tabal de entrada ----------
export const GIC_MAIN = {
  SeccionalOrigen: 'Seccional de origen',
  DespachoSolicita: 'Despacho que solicita',
  TematicaPriorizada: 'Temática priorizada',
  UltimoEstadoTramite: 'Último estado del trámite',
  LugarHecho: 'Lugar de los hechos',
  'Lugar de los hechos': 'Lugar de los hechos',
  ...lugarHechoLabels,
  RealizaVerificacion: '¿Se realiza verificación?',
  FechaEntregaVerifi: 'Fecha de entrega de verificación',
  ResponsableVerificacion: 'Responsable de verificación',
  RealizaAnalisis: '¿Se realiza el análisis?',
  FechaEntregaAnalisis: 'Fecha de entrega del análisis',
  ResponsableAnalisis: 'Responsable del análisis',
  ResumenHechos: 'Resumen de los hechos',
  CanalRecepción: 'Canal de recepción',
  EntidadRemite: 'Entidad remitente',
  EsActivo: '¿Es un caso activo?',
  EstadoTramite: 'Estado del trámite',
  FechaCierre: 'Fecha de cierre',
  FechaIngreso: 'Fecha de ingreso',
  FechaRemitente: 'Fecha remitente',
  FechaSalidaTramite: 'Fecha de salida del trámite',
  FechaUltimoEstadoTramite: 'Fecha del último estado del trámite',
  FechaUsuarioModifica: 'Fecha de actualización del registro',
  'GAO/GDO': 'GAO / GDO',
  'Item Type': 'Tipo de elemento',
  NoReferenciaOrigen: 'Número de referencia de origen',
  PaisRelacionado: 'País relacionado',
  Path: 'Ruta de la matriz',
  PoliciaRemite: 'Policía que remite',
  RefEntrada: 'Referencia de entrada',
  SistemaOrigen: 'Sistema de origen',
  TipoEntrada: 'Tipo de entrada',
  TipoRemitente: 'Tipo de remitente',
  Title: 'Title',
  UsuarioCreador: 'Usuario creador del registro',
  UsuarioModifica: 'Usuario que modificó el registro',
  NumOficioOrfeo: 'Número de Orfeo',
  IdEntrada: 'Id Entrada',
  UsuarioRegistra: 'Usuario que registra',
  FechaRegistra: 'Fecha que registra',
  FechaModifica: 'Fecha de actualización del registro',
};

// ---------- tabla de personas ----------
export const GIC_PERSONA = {
  NombreCompleto: 'Nombre completo',
  Identificacion: 'Identificación',
  TipoIdentificacion: 'Tipo de Identificación',
  RelacionPersona: 'Rol de la persona',
  TipoPersona: 'Tipo de persona',
  Nombre_1: 'Primer nombre',
  Nombre_2: 'Segundo nombre',
  Apellido_1: 'Primer apellido',
  Apellido_2: 'Segundo apellido',
};

// tarjeta de persona
export const GIC_PERSONA_CARD_KEYS = [
  'NombreCompleto',
  'Identificacion',
  'TipoIdentificacion',
  'RelacionPersona',
];

// ---------- tramites ----------
// orden de este objeto es el orden en que se muestran
export const GIC_TRAMITE = {
  Created: 'Fecha de Creación',
  'Created By': 'Creado por',
  'Decisión FiscalUGIC': 'Decisión del Fiscal',
  DescripciónResultado: 'Descrip. resultado',
  DestinoDireccion: 'Dirección de destino',
  DestinoSeccional: 'Seccional de destino',
  EsActivo: 'Estado',
  FechaAsignacionUGIC: 'Fecha asignación UGIC',
  FechaEntregaDEIF: 'Fecha entrega DEIF',
  FechaMesaTrabajo: 'Fecha mesa de trabajo',
  FechaRegistroTramite: 'Fecha de registro trámite',
  FechaUsuarioModificaTramite: 'Fecha de modificación de registro',
  FiscalResponsableUGIC: 'Fiscal responsable UGIC',
  GenNumIntervTemp: 'GenNumIntervTemp',
  GenNumIntervTempDEIF: 'GenNumIntervTempDEIF',
  NivelRelevancia: 'Nivel de relevancia',
  'Modified By': 'Modificado por',
  NoCasosAsociados: 'No. casos asociados',
  NoCasosIdentAsoc: 'NoCasosIdentAsoc',
  NumAsignacion: 'No. asignación',
  NumIniciativaDEIF: 'No. iniciativa DEIF',
  NumIntervTemp: 'NumIntervTemp',
  PolJudAsignada: 'Policía Judicial asignada',
  RealizaMesaTrabajo: 'Realiza mesa de trabajo',
  Resultado: 'Resultado',
  ResultadoInforme: 'Resultado informe',
  SistemaDestino: 'Sist. destino',
  SustentoNivelPrioridad: 'Sustento nivel prioridad',
  TipoGestion: 'Tipo de gestión',
  TipoMesaTrabajo: 'Tipo de mesa de trabajo',
  Title: 'Title',
  UsuarioCreadorTramite: 'Usuario que creó el trámite',
  UuarioModificaTramite: 'Usuario que modifica el trámite',
};

// Compatibilidad: el import por defecto sigue siendo el diccionario principal
export default GIC_MAIN;