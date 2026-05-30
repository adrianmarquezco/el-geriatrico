'use client'
import { useState } from 'react'
import { Resident, Residence } from '@/lib/types'

const PERSONALITY_EMOJI: Record<string, string> = {
  quejica: '👴', cotilla: '👵', mandón: '🧓', devota: '👵',
  sordo: '👴', coqueta: '💃', misterioso: '🕵️', exigente: '👵', normal: '🧓',
}
const MOOD_EMOJI: Record<string, string> = {
  feliz: '😊', normal: '😐', enfadado: '😠', furioso: '😤',
}

type P = string
type M = 'feliz' | 'normal' | 'enfadado' | 'furioso'

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

/* ─── Opening lines ─────────────────────────────────────────── */
const OPENINGS: Record<P, Record<M, string[]>> = {
  quejica: {
    feliz:    ['¡Hoy me encuentro de buen humor! No sé cómo, pero así estoy.', '¡Menos mal que vienes! Hoy está todo más o menos soportable.'],
    normal:   ['Bueno, ya era hora de que aparecieras.', '¿Qué quieres ahora? Habla, que tengo tiempo.', 'Pasa, pasa. No te quedes ahí.'],
    enfadado: ['¡Menos mal que vienes! Esto es un desastre hoy.', '¿Dónde estabas? Llevo un rato esperando.'],
    furioso:  ['¡POR FIN! ¡Nadie hace nada aquí! ¡Un desastre!', '¡Esto es intolerable! ¡Intolerable, te digo!'],
  },
  cotilla: {
    feliz:    ['¡Ven, ven! Tengo un chisme increíble que contarte.', '¡Precisamente quería verte! Siéntate, esto tiene mucha miga.'],
    normal:   ['Siéntate. Tengo información privilegiada que darte.', '¿Sabes qué me enteré esta mañana?', 'Espera, espera... ¿has visto lo que está pasando?'],
    enfadado: ['Habrás visto lo que ha pasado, ¿no? Estoy muy disgustada.', 'Estoy enfadada con cierta persona. Te cuento...'],
    furioso:  ['¡No me creo lo que está pasando aquí! ¡Es un escándalo!', '¡Hay mucho que no te están contando! Escúchame bien.'],
  },
  mandón: {
    feliz:    ['Bien. Estás aquí. Tengo varias instrucciones para ti.', 'Como responsable en funciones, voy a darte unas directrices.'],
    normal:   ['Apunta. Primero: quiero hablar contigo.', 'Siéntate. Tenemos que hablar de la organización de aquí.'],
    enfadado: ['¿Cuánto tiempo llevo esperando? Inadmisible. Escúchame.', 'Esto no funciona. Voy a tener que tomar cartas en el asunto.'],
    furioso:  ['¡SE ACABÓ! ¡O se pone orden o me encargo yo personalmente!', '¡Esta gestión es nefasta! Siéntate, que vamos a hablar.'],
  },
  devota: {
    feliz:    ['¡Que Dios te bendiga, hijo! ¡Hoy es un día hermoso!', '¡Alabado sea el Señor! Justo rezaba por ti.'],
    normal:   ['Ave María Purísima. Justo pensaba en ti, siéntate.', '¡Qué alegría! ¿Vienes a hacerme compañía?'],
    enfadado: ['Dios mío, ten piedad de nosotros... Estoy muy afligida.', 'He estado rezando mucho hoy. Hay mucho que rezar.'],
    furioso:  ['¡Virgen Santísima! ¡Esto no puede seguir así, Señor!', 'Dios lo ve todo. Todo lo que pasa aquí, lo ve.'],
  },
  sordo: {
    feliz:    ['¡BUENAS! ¿CÓMO DICE? ¡AH, HOLA! ¡QUÉ ALEGRÍA!', '¡¿QUIÉN ES?! ¡Ah, eres tú! ¡Habla más alto, anda!'],
    normal:   ['¿Eh? ¿Quién es? ¡Ah, eres tú! ¡Que no te oía!', '¡Perdona, no te había oído entrar! ¿Qué dices?'],
    enfadado: ['¡¿QUÉ PASA?! ¡No entiendo nada aquí!', 'No sé dónde dejé el aparato ese del oído. ¿Qué me dices?'],
    furioso:  ['¡¿QUÉ PASA AQUÍ QUE TODO EL MUNDO GRITA?!', '¡No oigo nada! ¡Esto es un caos! ¿Qué me estás diciendo?'],
  },
  coqueta: {
    feliz:    ['¡Ay, qué guapo que estás! Siéntate, que te veo mejor.', '¡Mira qué bien! Yo también estoy guapa hoy, ¿verdad?'],
    normal:   ['Habrás notado que me he arreglado un poco hoy.', '¿A que estoy presentable? Con esto y todo...'],
    enfadado: ['No me hagas fotos hoy, que no estoy favorecida.', 'Con lo guapa que yo era... mira ahora. Siéntate.'],
    furioso:  ['¡Estoy fatal! ¡No me han traído mis cremas esta mañana!', '¡Mi peinado! ¿Quién ha tocado mis cosas? ¡Un desastre!'],
  },
  misterioso: {
    feliz:    ['...te estaba esperando. Qué bien que hayas venido.', 'Sabía que vendrías. Siempre lo sé.'],
    normal:   ['...', 'Tengo mucho tiempo para pensar últimamente. Siéntate.'],
    enfadado: ['Algo no va bien aquí. Lo presiento desde hace días.', 'Hay cosas que tú no sabes. Aún.'],
    furioso:  ['Lo que está pasando aquí... no es lo que parece.', '...No hables. Solo escucha.'],
  },
  exigente: {
    feliz:    ['Hoy tengo que reconocer que las cosas están aceptables.', 'Relativamente bien. Dentro de los estándares mínimos.'],
    normal:   ['Tengo una lista de cosas que mejorar aquí.', 'En mi anterior residencia esto era bastante diferente.'],
    enfadado: ['No se cumplen los estándares. Hay mucho margen de mejora.', 'Necesito hablar contigo sobre la calidad del servicio.'],
    furioso:  ['¡Inaceptable! ¡Todo está por debajo del nivel mínimo!', '¡Exijo hablar con el responsable! ¡Esto no puede ser!'],
  },
  normal: {
    feliz:    ['¡Hola! ¡Qué alegría verte por aquí!', '¡Buenas! Hoy estoy de maravilla, la verdad.'],
    normal:   ['Buenas tardes. ¿Qué tal estás tú?', '¡Hola! Me alegra que hayas pasado.', '¡Ven! Justo tenía ganas de hablar con alguien.'],
    enfadado: ['Uf... no estoy muy bien hoy, la verdad.', 'Qué día más largo. Me alegra verte.'],
    furioso:  ['Necesito ayuda. De verdad, no estoy bien.', 'No puedo más hoy. ¿Cuándo mejoran las cosas?'],
  },
}

/* ─── Topic responses ────────────────────────────────────────── */
const RESPONSES_FEELINGS: Record<P, { feliz: string; mal: string; regular: string }> = {
  quejica: {
    feliz:   'Hoy, por una vez, no tengo queja. La espalda regular, como siempre, pero bueno. No me puedo quejar... mucho.',
    regular: 'Regular. La espalda, los pies, el estómago... todo en plan regular. Pero aquí sigo.',
    mal:     '¡Fatal! Todo me duele, nadie hace nada, y encima la comida estaba sosa. ¡Esto es un sufrimiento!',
  },
  cotilla: {
    feliz:   'Estoy de maravilla, ¡y con muchas cosas que contarte! Aunque primero dime tú cómo estás...',
    regular: 'Más o menos. Aunque he oído cosas últimamente que me tienen muy intranquila.',
    mal:     'Muy mal. Y encima, con lo que me entero aquí cada día... no me ayuda nada al ánimo.',
  },
  mandón: {
    feliz:   'Todo bajo control. Como siempre cuando se hacen las cosas bien, que es cuando yo superviso.',
    regular: 'Podría estar mejor si se hicieran las cosas como yo digo. Ya lo he explicado mil veces.',
    mal:     'ESTO ES UN DESASTRE. Todo el mundo haciendo lo que le da la gana. Necesito que alguien actúe.',
  },
  devota: {
    feliz:   '¡Bendito sea el Señor, estoy muy bien! Hoy rezé el rosario entero. Me siento ligera como una pluma.',
    regular: 'El cuerpo no siempre acompaña, pero el alma está en paz. Eso es lo importante.',
    mal:     'Ay, Diosito mío... no me encuentro bien. Estoy ofreciéndole mi sufrimiento, pero cuesta.',
  },
  sordo: {
    feliz:   '¡¿QUÉ CÓMO ESTOY?! ¡BIEN! ¡MUY BIEN! ¡Gracias por preguntar! ¡No me lo pregunta nadie!',
    regular: '¡¿QUÉ DICES?! ¡Ah, cómo estoy! Pues... tirando. ¡Se podría estar peor!',
    mal:     '¡¿MAL?! ¡SÍ, MAL! ¡No oigo bien, me duele todo, y encima no encuentro mis cosas!',
  },
  coqueta: {
    feliz:   'Divina, cariño. Estoy radiante. ¿No lo notas? A ver, miro el espejo y digo: aún hay nivel.',
    regular: 'Hoy no me veo muy favorecida. Necesito mis cremas, que si no... ay.',
    mal:     '¡Horrible! No tengo mis cosas, no me han arreglado bien, y estoy hecha un desastre. Fatal.',
  },
  misterioso: {
    feliz:   'Mejor de lo que parece. Siempre. Hay cosas que solo yo sé.',
    regular: '...así, así. Como el tiempo. Ni bien ni mal.',
    mal:     'Peor de lo que nadie imagina. Pero sigo aquí. Eso ya es algo.',
  },
  exigente: {
    feliz:   'Dentro de lo que cabe, aceptable. Los estándares que me marco no son fáciles de cumplir, pero hoy van bien.',
    regular: 'Con varias pegas, como siempre. El servicio, la comida, la temperatura... hay margen.',
    mal:     'Pésimamente. Esto no reúne las condiciones mínimas. No voy a entrar en detalles porque llevaría horas.',
  },
  normal: {
    feliz:   '¡Muy bien! Hoy es un buen día. No sé por qué, pero me siento con energía. ¡Hasta he paseado!',
    regular: 'Regular tirando a bien. Días hay mejores y peores, ya sabes. Hoy ha sido un día normal.',
    mal:     'La verdad es que no estoy muy bien... me siento un poco solo/a y las cosas están un poco grises hoy.',
  },
}

const RESPONSES_LIFE: Record<P, string[]> = {
  quejica:   [
    'Pues mira, trabajé toda la vida y mira dónde he acabado. Aunque peor podría estar, no te digo que no.',
    'Cuarenta años trabajando. Cuarenta. Y al final, con la espalda hecha polvo. Pero aquí sigo, que es lo que toca.',
  ],
  cotilla:   [
    '¡Ay, tengo tantas historias! ¿Por dónde empiezo? ¿Conoces a mi prima Eulalia? Pues resulta que ella un día...',
    'Mi vida ha sido un culebrón, te lo juro. Bodas, divorcios, secretos de familia... ¡Si esto lo publican, arrasa!',
  ],
  mandón:    [
    'Lideré equipos durante treinta años. Proyectos grandes, con mucha gente a cargo. Aquí lo que falta es liderazgo.',
    'Fui director de una empresa. Pequeña, pero mía. Sabía lo que me hacía. Ahora aquí... veo muchas cosas que mejorar.',
  ],
  devota:    [
    'Una vida humilde pero llena de fe. Cada mañana, misa. Cada tarde, rosario. Así me crié y así seguiré.',
    'He rezado mucho en esta vida. Por mí, por mi familia, por los que ya no están. La fe es lo único que no falla.',
  ],
  sordo:     [
    '¡¿MI VIDA?! ¡PUES MIRA! ¡MUCHOS AÑOS, MUCHO TRABAJO, MUCHA FAMILIA! ¡Y AQUÍ ESTOY, QUE ES LO IMPORTANTE!',
    '¡No oigo bien hace años! ¡Antes sí! ¡Era músico, ¿sabes?! ¡Tocaba el acordeón! ¡Bien que lo tocaba!',
  ],
  coqueta:   [
    'Yo de joven era un peligro, te lo juro. Los hombres se volvían locos. Ahora miro las fotos y digo... sí, tenía nivel.',
    'He sido siempre muy cuidadosa con mi imagen. Toda la vida. El día que deje de cuidarme es que ya no estoy, jeje.',
  ],
  misterioso:[
    'Mi vida... es complicada de explicar. Hay capítulos que mejor no abrir. Pero los hay buenos también, ¿eh?',
    'He visto muchas cosas. Y callado muchas más. A veces pienso que debería haberlas contado. Pero ya es tarde.',
  ],
  exigente:  [
    'He tenido los mejores estándares en todo. La mejor formación, el mejor trabajo, la mejor casa. No me conformo con menos.',
    'Fui muy exigente siempre. Conmigo y con los demás. Algunos lo agradecían. Otros no tanto. Pero así se hacen las cosas bien.',
  ],
  normal:    [
    'Una vida normal, con sus cosas buenas y malas. Familia, trabajo, algún viaje... No me puedo quejar.',
    'Trabajé muchos años, crié a mis hijos, y ahora descanso. Que para eso se trabaja, ¿no? Para luego descansar.',
  ],
}

const RESPONSES_RESIDENCE: Record<P, { buena: string; mala: string }> = {
  quejica: {
    buena: 'Podría ser peor. Dicho esto, la comida tiene mucho margen de mejora y la cama está dura. Pero podría ser peor.',
    mala:  '¡Un desastre! La comida, el servicio, la organización... todo mejorable. Mucho, mucho margen de mejora.',
  },
  cotilla: {
    buena: 'JR lo hace muy bien, aunque yo te podría gestionar esto bastante mejor, entre nosotros. Pero está bien.',
    mala:  'Mira, entre nosotros... necesita muchas mejoras. Y hay cosas que pasan aquí que tú no te imaginas...',
  },
  mandón: {
    buena: 'Funciona aceptablemente. Bajo mi supervisión continuada ha mejorado bastante. Hay que seguir así.',
    mala:  'Esta gestión es deficiente. Si me dejasen a mí llevar esto una semana, verías la diferencia.',
  },
  devota: {
    buena: '¡Es un lugar muy especial! Se siente paz aquí. A veces parece que Dios mismo está entre estas paredes.',
    mala:  'Ay, hay que rezar para que mejore. Y cuidar más a las personas. Eso es lo que falta aquí.',
  },
  sordo: {
    buena: '¡¿LA RESIDENCIA?! ¡MUY BIEN! ¡JR ES UN BUEN CHICO! ¡SE NOTA QUE SE ESFUERZA!',
    mala:  '¡¿QUÉ TAL?! ¡REGULAR! ¡FALTA ORGANIZACIÓN Y LA TELE SIEMPRE ESTÁ ALTA!',
  },
  coqueta: {
    buena: 'Podría tener mejores espejos, pero el ambiente es muy agradable. Y JR tiene buena planta, también.',
    mala:  'Necesita más luz y mejores instalaciones. No favorece a nadie. Aunque yo me arreglo con lo que hay.',
  },
  misterioso: {
    buena: 'Hay algo especial en estas paredes. No sé qué es, pero está. Lo noto.',
    mala:  'Algo no está bien aquí. Lo noto desde que llegué. Hay corrientes... no sé cómo explicarlo.',
  },
  exigente: {
    buena: 'Comparado con lo que he visto, este lugar tiene un nivel aceptable. Dentro de sus limitaciones, claro.',
    mala:  'Está muy por debajo de lo que requiero. El servicio, la limpieza, la organización... necesita una auditoría.',
  },
  normal: {
    buena: '¡Muy bien! Estoy bastante a gusto aquí. JR se esfuerza mucho y se nota. Me alegra estar aquí.',
    mala:  'Podría estar mejor... aunque sé que se está trabajando en ello. Hay que tener paciencia.',
  },
}

const NEED_NAMES: Record<string, string> = {
  hunger: 'comer algo', medication: 'mis pastillas', hygiene: 'asearme un poco',
  entertainment: 'que me pongan algo de entretenimiento', companionship: 'compañía, la verdad',
}
const NEED_PFX: Record<P, string> = {
  quejica:    '¡Por supuesto que necesito! Necesito ',
  cotilla:    'Bueno, ahora que me preguntas... necesito ',
  mandón:     'Lista de necesidades: primero, necesito ',
  devota:     'Con humildad te lo pido: necesito ',
  sordo:      '¡¿QUÉ NECESITO?! PUES... necesito ',
  coqueta:    'Pues mira, la verdad es que necesito ',
  misterioso: '...necesito ',
  exigente:   'Mis necesidades son claras: necesito ',
  normal:     'Pues la verdad es que ahora mismo necesito ',
}

const TOPICS = [
  { key: 'feelings',  emoji: '💭', label: '¿Cómo estás?' },
  { key: 'life',      emoji: '📖', label: 'Cuéntame de ti' },
  { key: 'residence', emoji: '🏠', label: '¿Qué tal la residencia?' },
  { key: 'needs',     emoji: '✨', label: '¿Qué necesitas ahora?' },
]

function getOpening(r: Resident): string {
  const p = r.personality || 'normal'
  const m = (r.mood || 'normal') as M
  const map = OPENINGS[p] ?? OPENINGS.normal
  const lines = map[m] ?? map.normal
  return pick(lines)
}

function getResponse(r: Resident, topic: string): string {
  const p = r.personality || 'normal'

  if (topic === 'feelings') {
    const map = RESPONSES_FEELINGS[p] ?? RESPONSES_FEELINGS.normal
    if (r.happiness >= 68) return map.feliz
    if (r.happiness >= 38) return map.regular
    return map.mal
  }

  if (topic === 'life') {
    const pool = RESPONSES_LIFE[p] ?? RESPONSES_LIFE.normal
    if (r.backstory) {
      const intros: Record<string, string> = {
        quejica: 'Te lo voy a contar, aunque ya sé que tienes prisa: ',
        cotilla: '¡Ay, cómo me alegra que preguntes! Mira: ',
        mandón: 'Bien. En resumen ejecutivo: ',
        devota: 'Con la gracia de Dios: ',
        sordo: '¡¿MI VIDA?! ¡PUES MIRA! ',
        coqueta: '¿Quieres que te cuente? ¡Menuda historia la mía! ',
        misterioso: '...hay cosas que no se pueden contar fácilmente. Pero escucha: ',
        exigente: 'Mi trayectoria ha sido bastante notable: ',
        normal: 'Te cuento: ',
      }
      return (intros[p] ?? intros.normal) + r.backstory
    }
    return pick(pool)
  }

  if (topic === 'residence') {
    const map = RESPONSES_RESIDENCE[p] ?? RESPONSES_RESIDENCE.normal
    return r.happiness >= 55 ? map.buena : map.mala
  }

  if (topic === 'needs') {
    const NEED_FIELDS = ['hunger', 'medication', 'hygiene', 'entertainment', 'companionship'] as const
    const lowest = [...NEED_FIELDS].sort((a, b) => (r[a] ?? 100) - (r[b] ?? 100))[0]
    const pfx = NEED_PFX[p] ?? NEED_PFX.normal
    return pfx + (NEED_NAMES[lowest] ?? 'que me cuiden un poco')
  }

  return '...'
}

interface Props {
  resident: Resident
  residence: Residence
  onClose: () => void
  onCare?: (residentId: string, action: 'chat') => Promise<void>
}

export default function ResidentConversationModal({ resident, residence, onClose, onCare }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [chatting, setChatting] = useState(false)
  const [chatDone, setChatDone] = useState(false)
  const [opening] = useState(() => getOpening(resident))

  const response = selectedTopic ? getResponse(resident, selectedTopic) : null
  const mood = (resident.mood || 'normal') as M
  const happColor = resident.happiness >= 70 ? '#22c55e' : resident.happiness >= 40 ? '#f59e0b' : '#ef4444'
  const canChat = (residence.jr_energy ?? 0) >= 10

  async function handleChat() {
    if (!onCare || chatDone || !canChat) return
    setChatting(true)
    await onCare(resident.id, 'chat')
    setChatting(false)
    setChatDone(true)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full animate-slide-up rounded-t-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg,#0e1020 0%,#080a14 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-2 pb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {PERSONALITY_EMOJI[resident.personality] ?? '🧓'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-black text-lg leading-none">{resident.name.split(' ')[0]}</h3>
              <span className="text-xl leading-none">{MOOD_EMOJI[mood] ?? '😐'}</span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{resident.age} años · {resident.personality}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="h-1.5 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${resident.happiness}%`, background: happColor }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: happColor }}>{resident.happiness}% ánimo</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 active:scale-90 shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            ✕
          </button>
        </div>

        {/* Opening speech */}
        <div className="mx-5 mb-5 px-4 py-3.5 rounded-2xl rounded-tl-sm"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-slate-200 text-sm leading-relaxed italic">"{opening}"</p>
        </div>

        {/* Topics or response */}
        {!selectedTopic ? (
          <div className="px-5 pb-6 flex flex-col gap-2">
            <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest mb-1">¿Sobre qué quieres hablar?</p>
            {TOPICS.map(t => (
              <button
                key={t.key}
                onClick={() => setSelectedTopic(t.key)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-[0.97] transition-transform text-left"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xl shrink-0">{t.emoji}</span>
                <span className="text-slate-200 text-sm font-bold">{t.label}</span>
                <span className="text-slate-600 ml-auto">›</span>
              </button>
            ))}
            <button
              onClick={onClose}
              className="mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl active:scale-[0.97] transition-transform text-sm font-bold"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c4b5fd' }}>
              👋 Hasta luego
            </button>
          </div>
        ) : (
          <div className="px-5 pb-8">
            {/* Response */}
            <div
              className="mb-4 px-4 py-3.5 rounded-2xl rounded-tl-sm animate-slide-up"
              style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-slate-100 text-sm leading-relaxed">"{response}"</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedTopic(null)}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl active:scale-[0.97] transition-transform text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                ← Otro tema
              </button>

              {onCare && !chatDone && (
                <button
                  onClick={handleChat}
                  disabled={chatting || !canChat}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl active:scale-[0.97] transition-transform text-sm font-black disabled:opacity-40"
                  style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.35)', color: '#93c5fd' }}>
                  {chatting ? '⏳ Un momento...' : !canChat ? '⚡ Sin energía para charlar' : '💛 Dar compañía (−10⚡)'}
                </button>
              )}

              {chatDone && (
                <div
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black animate-slide-up"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
                  ✅ ¡+25 compañía! Le has alegrado el día
                </div>
              )}

              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl active:scale-[0.97] transition-transform text-sm font-bold"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c4b5fd' }}>
                👋 Hasta luego
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
