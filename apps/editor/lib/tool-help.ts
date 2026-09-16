/**
 * Plain-language help for every tile in the Build tab.
 * Keyed by the tile id (which equals the node kind for placement tools).
 */
export type ToolHelp = {
  title: string
  what: string
  how: string
}

const HELP: Record<string, ToolHelp> = {
  wall: {
    title: 'Muro',
    what: 'Pared recta o curva. Sobre ella se colocan puertas, ventanas y objetos de pared.',
    how: 'Clic para empezar, clic para cada esquina, Esc o doble clic para terminar. Mantén Shift para curvarla.',
  },
  fence: {
    title: 'Cerca',
    what: 'Valla o cerramiento perimetral ligero para jardines y linderos.',
    how: 'Clic para el inicio, clic para cada tramo, Esc para terminar.',
  },
  slab: {
    title: 'Losa',
    what: 'Piso o plataforma de hormigón que define el área construida de una planta.',
    how: 'Dibuja el contorno con clics; cierra en el primer punto para crear la losa.',
  },
  ceiling: {
    title: 'Cielo raso',
    what: 'Techo interior plano de una habitación.',
    how: 'Dibuja el contorno con clics y ciérralo en el primer punto.',
  },
  roof: {
    title: 'Cubierta',
    what: 'Techo a dos, cuatro aguas, plano u otras formas. Elige el tipo en el panel de abajo.',
    how: 'Selecciona el tipo de cubierta y arrastra un rectángulo sobre la planta.',
  },
  stair: {
    title: 'Escalera',
    what: 'Conecta dos niveles del edificio.',
    how: 'Clic en el punto de arranque y arrastra en la dirección de subida. R para rotar.',
  },
  elevator: {
    title: 'Ascensor',
    what: 'Caja de ascensor que atraviesa los niveles.',
    how: 'Clic para colocarlo; R para rotar.',
  },
  door: {
    title: 'Puerta',
    what: 'Abertura con hoja en un muro existente.',
    how: 'Pasa el cursor sobre un muro y haz clic donde quieras la puerta. F para forzar la posición.',
  },
  window: {
    title: 'Ventana',
    what: 'Abertura acristalada en un muro existente.',
    how: 'Pasa el cursor sobre un muro y haz clic donde quieras la ventana.',
  },
  column: {
    title: 'Columna',
    what: 'Pilar estructural vertical.',
    how: 'Clic para colocar cada columna.',
  },
  shelf: {
    title: 'Estante',
    what: 'Repisa fijada a la pared.',
    how: 'Pasa el cursor sobre un muro y haz clic para fijarla.',
  },
  spawn: {
    title: 'Punto de inicio',
    what: 'Dónde aparece el visitante al recorrer el proyecto en primera persona.',
    how: 'Clic para colocarlo y R para orientar la mirada.',
  },
  kitchen: {
    title: 'Cocina',
    what: 'Módulos de cocina (muebles bajos y altos) que se encadenan entre sí.',
    how: 'Elige un módulo y haz clic junto a una pared; los módulos se alinean solos.',
  },
  mep: {
    title: 'Instalaciones',
    what: 'Ductos de aire, unidades de climatización y tuberías sanitarias.',
    how: 'Abre el grupo y elige el elemento a trazar.',
  },
  painting: {
    title: 'Pintura',
    what: 'Aplica materiales y colores a muros, pisos y techos.',
    how: 'Elige un material y haz clic sobre la superficie a pintar.',
  },
  terrain: {
    title: 'Terreno',
    what: 'Esculpe el relieve del solar: montículos, hondonadas y nivelaciones.',
    how: 'Elige subir, bajar o alisar y arrastra sobre el terreno.',
  },
  block: {
    title: 'Bloque',
    what: 'Volumen macizo genérico para masas o elementos sin detalle.',
    how: 'Clic para colocarlo; R para rotar.',
  },
  'structural-grid': {
    title: 'Retícula estructural',
    what: 'Ejes de referencia para alinear columnas y muros.',
    how: 'Arrastra para definir el área de la retícula.',
  },
  'duct-segment': {
    title: 'Ducto',
    what: 'Tramo de conducto de aire acondicionado.',
    how: 'Clic para el inicio y cada quiebre; Esc para terminar.',
  },
  'duct-fitting': {
    title: 'Accesorio de ducto',
    what: 'Codo o derivación entre tramos de ducto.',
    how: 'Clic sobre el extremo de un ducto.',
  },
  'duct-terminal': {
    title: 'Rejilla',
    what: 'Salida de aire en techo o pared.',
    how: 'Clic sobre un cielo raso o muro.',
  },
  'hvac-equipment': {
    title: 'Equipo de clima',
    what: 'Unidad de aire acondicionado interior o exterior.',
    how: 'Clic para colocarla; R para rotar.',
  },
  lineset: {
    title: 'Línea frigorífica',
    what: 'Tuberías de cobre entre la unidad interior y la exterior.',
    how: 'Clic para el inicio y cada quiebre; Esc para terminar.',
  },
  'liquid-line': {
    title: 'Línea de líquido',
    what: 'Tubería de refrigerante en fase líquida.',
    how: 'Clic para el inicio y cada quiebre; Esc para terminar.',
  },
  'pipe-segment': {
    title: 'Tubería sanitaria',
    what: 'Desagüe, ventilación o alcantarillado.',
    how: 'Clic para el inicio y cada quiebre; Esc para terminar.',
  },
  'pipe-fitting': {
    title: 'Accesorio de tubería',
    what: 'Codo, yee o unión entre tuberías.',
    how: 'Clic sobre el extremo de una tubería.',
  },
  'pipe-trap': {
    title: 'Sifón',
    what: 'Trampa de agua bajo un aparato sanitario.',
    how: 'Clic bajo el punto de desagüe.',
  },
  dormer: {
    title: 'Buhardilla',
    what: 'Ventana saliente sobre la cubierta.',
    how: 'Pasa el cursor sobre la cubierta y haz clic; R para rotar.',
  },
  chimney: {
    title: 'Chimenea',
    what: 'Conducto de humos que atraviesa la cubierta.',
    how: 'Clic sobre la cubierta.',
  },
  cupola: {
    title: 'Cúpula',
    what: 'Remate decorativo o de ventilación en la cumbrera.',
    how: 'Clic sobre la cubierta.',
  },
  'eyebrow-vent': {
    title: 'Respiradero',
    what: 'Ventilación baja sobre el faldón de la cubierta.',
    how: 'Clic sobre la cubierta.',
  },
  'box-vent': {
    title: 'Ventilador de caja',
    what: 'Salida de aire del entretecho.',
    how: 'Clic sobre la cubierta.',
  },
  'ridge-vent': {
    title: 'Ventilación de cumbrera',
    what: 'Ventilación continua a lo largo de la cumbrera.',
    how: 'Clic sobre la cumbrera de la cubierta.',
  },
  downspout: {
    title: 'Bajante',
    what: 'Tubo que baja el agua de lluvia del canalón al suelo.',
    how: 'Clic en el borde de la cubierta.',
  },
  'solar-panel': {
    title: 'Panel solar',
    what: 'Módulo fotovoltaico sobre el faldón.',
    how: 'Clic sobre la cubierta; arrastra para varias filas.',
  },
  'lean-to-extension': {
    title: 'Marquesina',
    what: 'Techo adosado a un muro: porche, cochera o galería.',
    how: 'Clic en el muro de apoyo y arrastra; F cambia la forma, R/T la orientación.',
  },
}

export function toolHelp(id: string): ToolHelp | null {
  return HELP[id] ?? null
}
