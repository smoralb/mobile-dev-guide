var iosBasics = [
  {
    id: 'swift-essentials',
    title: 'Swift Esencial',
    icon: '🦅',
    summary: 'Tipos, optionals, closures, protocolos y structs. Las bases del lenguaje antes de SwiftUI.',
    content: [
      {
        type: 'text',
        body: `<p><strong>Swift</strong> es el lenguaje de Apple: seguro, moderno y con inferencia de tipos. Si vienes de Kotlin, te resultará muy familiar en muchos aspectos.</p>
        <h4>Tipos básicos</h4>
        <ul>
          <li><code>Int, Double, Float, Bool, String</code> — Tipos de valor (value types)</li>
          <li><code>Array&lt;T&gt; / [T]</code>, <code>Dictionary&lt;K,V&gt; / [K:V]</code>, <code>Set&lt;T&gt;</code></li>
          <li><code>struct</code> — Value type (se copia al asignar). La mayoría de tipos en SwiftUI son structs.</li>
          <li><code>class</code> — Reference type (se comparte al asignar). Necesario para <code>@Observable</code>.</li>
          <li><code>enum</code> — Con valores asociados, mucho más potente que en Java/Kotlin</li>
        </ul>
        <h4>Optionals</h4>
        <p>En Swift nada puede ser <code>nil</code> a menos que se declare como Optional (<code>Type?</code>). El compilador te obliga a gestionar el nil.</p>
        <h4>Struct vs Class</h4>
        <ul>
          <li>Struct: copiado, en la pila, sin herencia, sin ciclos de memoria</li>
          <li>Class: referenciado, en el heap, con herencia, requiere gestión de memoria (ARC)</li>
          <li><strong>Regla en SwiftUI:</strong> Modelos de UI como structs. ViewModels/servicios como classes.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// Tipos e inferencia
let name = "Ana"              // String inferido
var age: Int = 28             // explícito
let pi = 3.14159              // Double

// Optionals
var email: String? = nil       // puede ser nil
email = "ana@example.com"

// Desenvuelve el optional
if let safeEmail = email {
    print("Email: \\(safeEmail)")
}

// guard let — sale si es nil
func sendEmail(to email: String?) {
    guard let email = email else {
        print("Sin email")
        return
    }
    // aquí email es String (no String?)
}

// Nil coalescing ??
let displayEmail = email ?? "Sin email"

// Optional chaining
let length = email?.count     // Int? — no crash si email es nil

// Fuerza (¡peligroso! solo cuando estás 100% seguro)
let forced = email!           // crash si nil`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// Struct (value type)
struct User {
    let id: Int
    var name: String
    var email: String

    // Métodos mutantes deben marcarse (las instancias son const por defecto)
    mutating func updateName(_ newName: String) {
        name = newName
    }
}

// Enum con valores asociados (como sealed classes)
enum NetworkResult<T> {
    case success(T)
    case failure(Error)
    case loading
}

// Switch exhaustivo sobre enum
func handleResult(_ result: NetworkResult<User>) {
    switch result {
    case .success(let user): print("Bienvenido \\(user.name)")
    case .failure(let error): print("Error: \\(error)")
    case .loading: print("Cargando...")
    }
}

// Closures (como lambdas en Kotlin)
let numbers = [3, 1, 4, 1, 5]
let sorted = numbers.sorted { $0 < $1 }      // trailing closure
let doubled = numbers.map { $0 * 2 }          // shorthand arguments
let evens = numbers.filter { $0 % 2 == 0 }

// Protocols (como interfaces en Kotlin)
protocol Greetable {
    var name: String { get }
    func greet() -> String
}

extension User: Greetable {
    func greet() -> String { "Hola, soy \\(name)" }
}

// Generics
func printAll<T: CustomStringConvertible>(_ items: [T]) {
    items.forEach { print($0.description) }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia principal entre struct y class en Swift?',
          options: [
            'struct es reference type, class es value type',
            'struct es value type (se copia), class es reference type (se comparte)',
            'No hay diferencia significativa, ambos se comportan igual',
            'class se usa solo en SwiftUI, struct solo en UIKit'
          ],
          correct: 1,
          explanation: 'Los structs son value types: al asignar una variable a otra, se crea una copia independiente. Las classes son reference types: al asignar, ambas variables apuntan al mismo objeto en memoria. En SwiftUI, la regla es: modelos de UI como structs, ViewModels/servicios como classes.'
        },
        {
          question: '¿Qué ocurre si intentas acceder al valor de un Optional que es nil usando force unwrapping (!)?',
          options: [
            'Retorna nil sin crash',
            'El compilador lo detecta y no compila',
            'La app crashea en runtime',
            'Retorna un valor por defecto del tipo'
          ],
          correct: 2,
          explanation: 'El force unwrapping (!) accede al valor sin verificar si es nil. Si el optional es nil, la app crashea en runtime. Por eso solo debe usarse cuando estás 100% seguro de que hay un valor. Alternativas seguras: if let, guard let, nil coalescing (??), optional chaining (?.).'
        },
        {
          question: '¿Para qué sirve guard let en Swift?',
          options: [
            'Para declarar una constante global',
            'Para desenvolver un optional y salir de la función si es nil, garantizando que el valor existe en el resto del scope',
            'Para crear un binding entre dos vistas',
            'Para definir un valor por defecto cuando un optional es nil'
          ],
          correct: 1,
          explanation: 'guard let desenvuelve un optional y, si es nil, ejecuta el bloque else (típicamente return). Si no es nil, la constante existe con valor no-optional en el resto de la función. Es preferido sobre if let anidado porque mantiene el código plano y legible — "early return pattern".'
        },
        {
          question: '¿Qué imprime este código?',
          code: 'let result: NetworkResult<User> = .loading\nswitch result {\ncase .success(let user): print(user.name)\ncase .failure(let error): print(error)\ncase .loading: print("Cargando...")\n}',
          options: [
            'Crash: no se puede switch sobre enum con valores asociados',
            '"Cargando..."',
            'nil',
            'Error de compilación: faltan casos'
          ],
          correct: 1,
          explanation: 'El switch sobre enums en Swift es exhaustivo: debes cubrir todos los casos. Como result es .loading, entra en ese case e imprime "Cargando...". Los enums con valores asociados funcionan como sealed classes en Kotlin, permitiendo extraer el valor con let en cada case.'
        },
        {
          question: '¿Qué significan $0 y $1 en un closure de Swift?',
          options: [
            'Son variables globales del scope',
            'Son shorthand arguments: $0 es el primer parámetro, $1 el segundo, etc.',
            'Son errors que se propagan automáticamente',
            'Son referencias a propiedades del objeto'
          ],
          correct: 1,
          explanation: 'Swift permite omitir los nombres de parámetros en closures cortos usando $0, $1, $2... como referencias posicionales. Ejemplo: numbers.sorted { $0 < $1 } es equivalente a numbers.sorted { a, b in a < b }. Reduce verbosidad en operaciones funcionales como map, filter, sorted.'
        }
      ]
    }
  },
  {
    id: 'swiftui-view',
    title: 'View Protocol en SwiftUI',
    icon: '🖼️',
    summary: 'Todo en SwiftUI es una View. Un struct que implementa body retornando some View.',
    content: [
      {
        type: 'text',
        body: `<p>En SwiftUI, la UI se construye con structs que conforman el protocolo <strong>View</strong>. A diferencia de UIKit donde mutabas objetos View, en SwiftUI describes el estado deseado y el framework se encarga de actualizar la pantalla.</p>
        <h4>Protocolo View</h4>
        <p>Requiere una sola propiedad: <code>var body: some View</code>. El tipo de retorno <code>some View</code> usa <em>opaque return types</em> — el compilador sabe el tipo concreto aunque tú no lo escribas.</p>
        <h4>Composición</h4>
        <p>Las Views se componen como bloques de construcción: combinas Views simples para crear Views complejas. No hay herencia de View.</p>
        <h4>Rendering declarativo</h4>
        <p>Cuando el estado cambia, SwiftUI llama de nuevo a <code>body</code> y compara el resultado con el árbol anterior para actualizar solo lo necesario (similar a la recomposición de Compose).</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `import SwiftUI

// View básica
struct WelcomeView: View {
    var body: some View {
        Text("¡Bienvenido!")
            .font(.largeTitle)
            .foregroundStyle(.blue)
    }
}

// Composición: View que usa otras Views
struct ProfileView: View {
    let user: User

    var body: some View {
        VStack(spacing: 16) {
            AvatarView(name: user.name)     // View personalizada
            UserInfoView(user: user)         // otra View personalizada
            ActionButtons(userId: user.id)   // y otra más
        }
        .padding()
    }
}

// View con lógica condicional
struct StatusView: View {
    let isActive: Bool

    var body: some View {
        HStack {
            Circle()
                .fill(isActive ? Color.green : Color.gray)
                .frame(width: 12, height: 12)
            Text(isActive ? "Activo" : "Inactivo")
                .foregroundStyle(isActive ? .primary : .secondary)
        }
    }
}

// Extraer subviews para mantener body legible
struct UserCard: View {
    let user: User

    var body: some View {
        VStack(alignment: .leading) {
            header    // computed property
            divider
            footer
        }
    }

    private var header: some View {
        Text(user.name).font(.headline)
    }

    private var divider: some View {
        Divider()
    }

    private var footer: some View {
        Text(user.email).font(.caption).foregroundStyle(.secondary)
    }
}

// Preview
#Preview {
    ProfileView(user: User(id: 1, name: "Ana", email: "ana@test.com"))
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué propiedad obligatoria requiere el protocolo View en SwiftUI?',
          options: [
            'var content: some View',
            'var body: some View',
            'func render() -> View',
            'var view: View'
          ],
          correct: 1,
          explanation: 'El protocolo View requiere una única propiedad: var body: some View. El tipo de retorno "some View" usa opaque return types — el compilador inferirá el tipo concreto, pero no necesitas escribirlo. Cada vez que el estado cambia, SwiftUI reevalúa body y compara con el árbol anterior.'
        },
        {
          question: '¿Qué significa some View como tipo de retorno en Swift?',
          options: [
            'Que retorna cualquier View de forma dinámica',
            'Es un opaque return type: retornas un tipo concreto específico, pero el compilador lo oculta para simplificar la firma',
            'Que la View puede ser nil (es optional)',
            'Que retorna múltiples Views simultáneamente'
          ],
          correct: 1,
          explanation: '"some View" es un opaque return type: la función retorna siempre el mismo tipo concreto, pero no quieres escribir el tipo exacto (que puede ser muy largo al componer modifiers). Diferente de "any View" (existential), que permite tipos diferentes en cada llamada y tiene coste de rendimiento."'
        },
        {
          question: '¿Cómo extraes subviews en SwiftUI para mantener body legible?',
          options: [
            'Creando clases hijas que heredan de la View padre',
            'Usando computed properties que retornan some View o extrayendo Views en structs separadas',
            'Declarando métodos @ViewBuilder dentro del body',
            'No es posible, body debe contener todo el código'
          ],
          correct: 1,
          explanation: 'SwiftUI no usa herencia de Views. La composición se logra extrayendo subviews: (1) computed properties privadas que retornan some View, (2) structs separadas conformando View. Ambos enfoques mantienen body corto y legible. Por ejemplo: private var header: some View { Text(user.name).font(.headline) }.'
        },
        {
          question: '¿Qué sucede cuando el estado de una View cambia en SwiftUI?',
          options: [
            'Se recrea toda la jerarquía de Views desde cero',
            'SwiftUI reevalúa body, compara el resultado con el árbol anterior (diffing) y actualiza solo las partes que cambiaron',
            'Se llama a un método invalidate() manualmente',
            'La View se destruye y se vuelve a crear completamente'
          ],
          correct: 1,
          explanation: 'Cuando el estado cambia, SwiftUI reevalúa body de la View afectada y compara el nuevo árbol con el anterior (similar a virtual DOM en React o recomposición en Compose). Solo las diferencias se aplican al renderizado real. Esto es eficiente: no se recrea toda la UI, solo las partes que cambiaron.'
        }
      ]
    }
  },
  {
    id: 'common-views',
    title: 'Vistas Comunes',
    icon: '🧱',
    summary: 'Text, Image, Button, TextField, Toggle, Slider, Picker. Los bloques fundamentales de SwiftUI.',
    content: [
      {
        type: 'text',
        body: `<p>SwiftUI proporciona un conjunto de vistas primitivas que usas como base para construir cualquier UI. Todas se personalizan con <strong>modifiers</strong> encadenados.</p>
        <h4>Vistas más usadas</h4>
        <ul>
          <li><code>Text</code> — Mostrar texto. Soporta Markdown, atributos, localización.</li>
          <li><code>Image</code> — Imágenes del catálogo de assets o SF Symbols.</li>
          <li><code>Button</code> — Acción táctil con label personalizable.</li>
          <li><code>TextField</code> — Entrada de texto. <code>SecureField</code> para contraseñas.</li>
          <li><code>Toggle</code> — Switch on/off.</li>
          <li><code>Slider</code> — Valor numérico en rango.</li>
          <li><code>Picker</code> — Selección de opciones. Varios estilos: segmented, wheel, menu.</li>
          <li><code>AsyncImage</code> — Carga imágenes desde URL con placeholder.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `struct CommonViewsDemo: View {
    @State private var name = ""
    @State private var password = ""
    @State private var isEnabled = true
    @State private var volume = 0.5
    @State private var selectedColor = "Rojo"
    let colors = ["Rojo", "Verde", "Azul"]

    var body: some View {
        Form {
            Section("Texto e Imagen") {
                // Text con modifiers
                Text("Hola **mundo**")  // ← Markdown soportado
                    .font(.title2)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.center)

                // SF Symbols
                Image(systemName: "star.fill")
                    .foregroundStyle(.yellow)
                    .font(.largeTitle)

                // Asset de la app
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 80)

                // URL
                AsyncImage(url: URL(string: "https://picsum.photos/200")) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    ProgressView()
                }
                .frame(width: 100, height: 100)
                .clipShape(.circle)
            }

            Section("Inputs") {
                TextField("Tu nombre", text: $name)
                    .textFieldStyle(.roundedBorder)
                    .autocorrectionDisabled()

                SecureField("Contraseña", text: $password)

                Toggle("Notificaciones", isOn: $isEnabled)

                Slider(value: $volume, in: 0...1) {
                    Text("Volumen")
                } minimumValueLabel: {
                    Image(systemName: "speaker")
                } maximumValueLabel: {
                    Image(systemName: "speaker.3")
                }

                Picker("Color", selection: $selectedColor) {
                    ForEach(colors, id: \\.self) { Text($0) }
                }
                .pickerStyle(.segmented)
            }

            Section("Botones") {
                Button("Guardar") { save() }
                    .buttonStyle(.borderedProminent)

                Button(role: .destructive) { delete() } label: {
                    Label("Eliminar", systemImage: "trash")
                }
            }
        }
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué vista usas en SwiftUI para cargar una imagen desde una URL remota con placeholder?',
          options: [
            'Image(url:) con un modifier .placeholder()',
            'AsyncImage(url:content:placeholder:)',
            'URLImage con callback de carga',
            'Image con modifier .asyncLoad(url:)'
          ],
          correct: 1,
          explanation: 'AsyncImage es la vista nativa de SwiftUI para cargar imágenes desde URL. Acepta un closure content para configurar la imagen cargada y un closure placeholder para mostrar algo (como ProgressView) mientras se descarga. Internamente gestiona la descarga async y la caché básica.'
        },
        {
          question: '¿Qué vista usas para una entrada de texto donde el contenido se oculta (contraseñas)?',
          options: [
            'TextField con modifier .isSecure(true)',
            'SecureField',
            'TextField con keyboard type .default',
            'HiddenTextField'
          ],
          correct: 1,
          explanation: 'SecureField es el componente nativo de SwiftUI para entradas de contraseña: oculta los caracteres mientras se escriben. Su API es idéntica a TextField: SecureField("Placeholder", text: $password). No necesita modifiers adicionales para ocultar el texto.'
        },
        {
          question: '¿Cuál es la forma correcta de usar SF Symbols en SwiftUI?',
          options: [
            'Image("star.fill")',
            'Image(systemName: "star.fill")',
            'SFImage("star.fill")',
            'Icon(systemName: "star.fill")'
          ],
          correct: 1,
          explanation: 'SF Symbols se cargan con Image(systemName:), mientras que imágenes del asset catalog usan Image("nombre"). Los SF Symbols son los iconos de sistema de Apple con más de 5000 variantes, soportan múltiples pesos y escalas, y se adaptan al tamaño de fuente automáticamente.'
        },
        {
          question: '¿Qué estilo de Picker muestra las opciones como segmentos horizontales en SwiftUI?',
          options: [
            '.pickerStyle(.wheel)',
            '.pickerStyle(.menu)',
            '.pickerStyle(.segmented)',
            '.pickerStyle(.automatic)'
          ],
          correct: 2,
          explanation: '.pickerStyle(.segmented) muestra las opciones como segmentos horizontales tipo UISegmentedControl. Otros estilos: .wheel (rueda vertical, típico de selectores de fecha iOS), .menu (menú desplegable), .automatic (el sistema elige según plataforma y contexto).'
        }
      ]
    }
  },
  {
    id: 'layout',
    title: 'Layout: Stacks y Grids',
    icon: '📐',
    summary: 'VStack, HStack, ZStack para layouts básicos. LazyVGrid y LazyHGrid para cuadrículas eficientes.',
    content: [
      {
        type: 'text',
        body: `<p>SwiftUI usa un sistema de layout flexible basado en contenedores que negocian el tamaño con sus hijos.</p>
        <h4>Contenedores básicos</h4>
        <ul>
          <li><code>VStack</code> — Apila hijos verticalmente</li>
          <li><code>HStack</code> — Apila hijos horizontalmente</li>
          <li><code>ZStack</code> — Superpone hijos (z-order)</li>
          <li><code>Spacer()</code> — Ocupa todo el espacio disponible</li>
          <li><code>Divider()</code> — Línea separadora</li>
        </ul>
        <h4>Contenedores lazy (para listas/grids)</h4>
        <ul>
          <li><code>LazyVStack / LazyHStack</code> — Como VStack/HStack pero renderizan bajo demanda</li>
          <li><code>LazyVGrid / LazyHGrid</code> — Para cuadrículas. Define columnas/filas con <code>GridItem</code></li>
        </ul>
        <h4>GridItem</h4>
        <ul>
          <li><code>.fixed(100)</code> — Ancho fijo</li>
          <li><code>.flexible(minimum:, maximum:)</code> — Flexible dentro de rango</li>
          <li><code>.adaptive(minimum:)</code> — Tantas columnas como quepan</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `struct LayoutDemo: View {
    let items = Array(1...20)

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {

                // HStack con Spacer — distribuye espacio
                HStack {
                    Text("Izquierda")
                    Spacer()
                    Text("Derecha")
                }
                .padding(.horizontal)

                // ZStack — superponer
                ZStack(alignment: .bottomTrailing) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 80))
                        .foregroundStyle(.blue)
                    Circle()
                        .fill(.green)
                        .frame(width: 20, height: 20)
                }

                // Grid adaptativa — tantas columnas como quepan (mín 80pt)
                LazyVGrid(
                    columns: [GridItem(.adaptive(minimum: 80))],
                    spacing: 12
                ) {
                    ForEach(items, id: \\.self) { item in
                        RoundedRectangle(cornerRadius: 8)
                            .fill(.blue.opacity(0.3))
                            .frame(height: 80)
                            .overlay(Text("\\(item)").fontWeight(.bold))
                    }
                }

                // Grid de 3 columnas fijas
                LazyVGrid(
                    columns: Array(repeating: GridItem(.flexible()), count: 3),
                    spacing: 8
                ) {
                    ForEach(items, id: \\.self) { item in
                        Color.purple.opacity(0.3)
                            .frame(height: 60)
                            .overlay(Text("\\(item)"))
                            .cornerRadius(6)
                    }
                }
            }
            .padding()
        }
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué contenedor usas para superponer vistas una encima de otra (z-order)?',
          options: [
            'VStack',
            'HStack',
            'ZStack',
            'OverlayStack'
          ],
          correct: 2,
          explanation: 'ZStack superpone sus hijos en el eje Z — el último hijo se dibuja encima. Es útil para badges sobre iconos, texto sobre imágenes, etc. VStack apila verticalmente y HStack horizontalmente. También puedes usar .overlay() como modifier para superponer sin ZStack.'
        },
        {
          question: '¿Qué tipo de GridItem usas para crear tantas columnas como quepan con un ancho mínimo?',
          options: [
            'GridItem(.fixed(80))',
            'GridItem(.flexible(minimum: 80))',
            'GridItem(.adaptive(minimum: 80))',
            'GridItem(.auto(minimum: 80))'
          ],
          correct: 2,
          explanation: '.adaptive(minimum:) calcula cuántas columnas caben en el ancho disponible, cada una con al menos el mínimo especificado. .fixed(80) crea columnas de exactamente 80pt. .flexible() distribuye el espacio equitativamente entre las columnas hasta llegar al máximo. Para un grid responsivo, .adaptive es la mejor opción.'
        },
        {
          question: '¿Para qué sirve Spacer() dentro de un HStack?',
          options: [
            'Añade una línea divisoria horizontal',
            'Ocupa todo el espacio disponible, empujando los elementos a los extremos',
            'Crea un espacio fijo de 16pt',
            'Centra automáticamente el contenido'
          ],
          correct: 1,
          explanation: 'Spacer() es un elemento flexible que absorbe todo el espacio disponible en su contenedor. En un HStack, un Spacer() entre dos elementos los empuja a los extremos (izquierda y derecha). Útil para layouts con elementos en ambos lados como barra de navegación o celdas de lista.'
        },
        {
          question: '¿Cuál es la diferencia entre VStack y LazyVStack?',
          options: [
            'No hay diferencia, LazyVStack es un alias',
            'VStack renderiza todos sus hijos siempre; LazyVStack solo renderiza los que están visibles en pantalla (bajo demanda)',
            'LazyVStack no soporta modifiers',
            'VStack es más eficiente para listas grandes'
          ],
          correct: 1,
          explanation: 'VStack renderiza todos sus hijos inmediatamente, funcionando bien para pocas vistas. LazyVStack solo renderiza las vistas que están siendo mostradas en pantalla, creándolas bajo demanda al hacer scroll. Para listas largas (cientos de items), LazyVStack o LazyVGrid son esenciales para mantener buena performance.'
        }
      ]
    }
  },
  {
    id: 'modifiers',
    title: 'Sistema de Modifiers',
    icon: '🎛️',
    summary: 'Los modifiers transforman vistas. El orden importa. Puedes crear custom modifiers reutilizables.',
    content: [
      {
        type: 'text',
        body: `<p>Los <strong>modifiers</strong> en SwiftUI son métodos que retornan una nueva View con una transformación aplicada. Se encadenan en orden, y el <strong>orden importa</strong>: cada modifier envuelve la vista anterior.</p>
        <h4>Modifiers más usados</h4>
        <ul>
          <li><code>.padding()</code> — Espacio interno. Afecta el área táctil.</li>
          <li><code>.background()</code> — Fondo de la vista.</li>
          <li><code>.foregroundStyle()</code> — Color del contenido (texto, iconos).</li>
          <li><code>.frame(width:height:alignment:)</code> — Tamaño y alineación.</li>
          <li><code>.cornerRadius()</code> / <code>.clipShape()</code> — Esquinas/forma.</li>
          <li><code>.shadow()</code> — Sombra.</li>
          <li><code>.overlay()</code> — Vista encima del contenido.</li>
          <li><code>.opacity()</code> — Transparencia.</li>
          <li><code>.scaleEffect()</code>, <code>.rotationEffect()</code> — Transformaciones 2D.</li>
          <li><code>.onAppear { }</code> / <code>.onDisappear { }</code> — Lifecycle callbacks.</li>
          <li><code>.task { }</code> — Equivalente a <code>onAppear</code> pero async.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// El orden importa
VStack(spacing: 20) {
    // padding ANTES del background: el padding tiene el color de fondo
    Text("Padding antes")
        .padding()
        .background(.blue.opacity(0.2))

    // background ANTES del padding: el padding es transparente
    Text("Background antes")
        .background(.blue.opacity(0.2))
        .padding()

    // Composición de modifiers para un card
    Text("Card estilizado")
        .font(.headline)
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.white)
        .foregroundStyle(.primary)
        .cornerRadius(10)
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
}

// Custom ViewModifier — reutilizable
struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(.background)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.08), radius: 8, y: 4)
    }
}

// Extension para uso limpio
extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}

// Uso
Text("Soy un card")
    .cardStyle()

// onAppear, onDisappear, task
struct DataView: View {
    @State private var data: [Item] = []

    var body: some View {
        List(data, id: \\.id) { ItemRow(item: $0) }
            .task { // async, se cancela cuando la View desaparece
                data = await loadData()
            }
            .onDisappear {
                print("View desapareció")
            }
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué diferencia visual hay entre estos dos textos?',
          code: 'Text("Hola").padding().background(.blue)\nText("Hola").background(.blue).padding()',
          options: [
            'Son visualmente idénticos, el orden no afecta el resultado',
            'En el primero el padding tiene fondo azul; en el segundo el padding es transparente',
            'El primero no tiene padding, el segundo sí',
            'Solo cambia el color del texto'
          ],
          correct: 1,
          explanation: 'El orden de los modifiers es crucial porque cada modifier envuelve la vista anterior. En el primer caso, background se aplica DESPUÉS de padding, así que el fondo cubre tanto el texto como el padding. En el segundo caso, background se aplica ANTES del padding, así que solo el texto tiene fondo azul y el padding queda transparente.'
        },
        {
          question: '¿Cuál es la ventaja de crear un custom ViewModifier frente a encadenar modifiers directamente?',
          options: [
            'Es más rápido en rendimiento',
            'Permite reutilizar un conjunto de modifiers con un solo nombre, manteniendo el código limpio y consistente',
            'Es la única forma de aplicar modifiers a una View',
            'Permite usar modifiers que no están disponibles por defecto'
          ],
          correct: 1,
          explanation: 'Un custom ViewModifier agrupa un conjunto de modifiers reutilizables bajo un solo nombre. Por ejemplo, .cardStyle() en vez de repetir .padding().background().cornerRadius().shadow() en cada sitio. Se combina con una extensión de View para un uso limpio: Text("Hola").cardStyle().'
        },
        {
          question: '¿Qué diferencia hay entre .onAppear y .task para ejecutar código cuando aparece una View?',
          options: [
            'No hay diferencia, son sinónimos',
            '.onAppear ejecuta código síncrono; .task ejecuta código async y se cancela automáticamente cuando la View desaparece',
            '.task se ejecuta en el hilo principal y .onAppear en background',
            '.onAppear es para iOS 16+ y .task para iOS 17+'
          ],
          correct: 1,
          explanation: '.task es el equivalente async de .onAppear: (1) permite usar await directamente sin Task { }, (2) el trabajo se cancela automáticamente cuando la View desaparece (la tarea se ejecuta en un scope vinculado al lifecycle de la View), (3) es ideal para cargar datos remotos: .task { data = await fetchData() }.'
        },
        {
          question: '¿Qué modifier usas para añadir una vista encima del contenido existente?',
          options: [
            '.background()',
            '.overlay()',
            '.zIndex()',
            '.above()'
          ],
          correct: 1,
          explanation: '.overlay() coloca una vista encima del contenido (en el eje Z), mientras que .background() la coloca detrás. Por ejemplo: Image("photo").overlay(alignment: .bottomTrailing) { Text("Foto") } coloca el texto sobre la imagen en la esquina inferior derecha.'
        }
      ]
    }
  },
  {
    id: 'state',
    title: '@State',
    icon: '🔵',
    summary: 'Fuente de verdad local a una Vista. SwiftUI gestiona su almacenamiento y reconstruye la Vista al cambiar.',
    content: [
      {
        type: 'text',
        body: `<p><code>@State</code> es el property wrapper para estado <strong>local y privado</strong> de una Vista. Cuando el valor cambia, SwiftUI reconstruye la Vista automáticamente.</p>
        <h4>Características</h4>
        <ul>
          <li>Solo para structs SwiftUI (Views)</li>
          <li>Siempre <code>private</code> — no se comparte directamente con otras Views</li>
          <li>SwiftUI gestiona el almacenamiento en el heap (el struct se puede recriar, el valor persiste durante la vida de la Vista)</li>
          <li>Para pasarlo a hijos, usa <code>$variableName</code> para crear un <code>Binding</code></li>
          <li>No sobrevive a la destrucción de la Vista (para eso: <code>@SceneStorage</code> o <code>AppStorage</code>)</li>
        </ul>
        <h4>Cuándo usarlo</h4>
        <p>Estado simple y local: ¿está expandido un accordion? ¿qué item está seleccionado? ¿está visible un sheet? Si el estado necesita compartirse más arriba → sube a un ViewModel.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `struct StateExamples: View {
    // Tipos simples
    @State private var isExpanded = false
    @State private var count = 0
    @State private var selectedTab = 0

    // Tipos complejos
    @State private var users: [User] = []
    @State private var selectedUser: User? = nil

    var body: some View {
        VStack(spacing: 20) {
            // Toggle con animación
            Button("\\(isExpanded ? "Contraer" : "Expandir")") {
                withAnimation(.spring()) {
                    isExpanded.toggle()
                }
            }

            if isExpanded {
                Text("Contenido expandido")
                    .transition(.opacity.combined(with: .slide))
            }

            // Counter
            HStack {
                Button("-") { if count > 0 { count -= 1 } }
                Text("\\(count)")
                    .frame(minWidth: 40)
                    .font(.title2.monospacedDigit())
                Button("+") { count += 1 }
            }
            .buttonStyle(.bordered)

            // Pasar Binding a un hijo con $
            ExpandableSection(isExpanded: $isExpanded) {
                Text("Contenido de la sección")
            }
        }
    }
}

// Hijo recibe Binding (no @State)
struct ExpandableSection<Content: View>: View {
    @Binding var isExpanded: Bool
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack {
            Button(action: { isExpanded.toggle() }) {
                HStack {
                    Text("Sección")
                    Spacer()
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                }
            }
            if isExpanded { content() }
        }
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué hace @State en SwiftUI?',
          options: [
            'Convierte la variable en una constante inmutable',
            'Crea un almacenamiento persistente que SwiftUI gestiona y que al cambiar provoca la recreación de la View',
            'Sincroniza la variable con una base de datos local',
            'Reemplaza el ViewModel por completo'
          ],
          correct: 1,
          explanation: '@State es un property wrapper para estado local y privado de una Vista. Cuando el valor cambia, SwiftUI reconstruye la Vista automáticamente. SwiftUI gestiona el almacenamiento en el heap para que persista aunque el struct de la View se recree.'
        },
        {
          question: '¿Qué hace el prefijo $ delante de una variable @State?',
          options: [
            'Convierte el valor a un Optional',
            'Crea un Binding de dos direcciones para que vistas hijas puedan leer y modificar el valor',
            'Hace que la variable sea global',
            'Persiste el valor en UserDefaults'
          ],
          correct: 1,
          explanation: 'El prefijo $ delante de una variable @State crea un Binding, que es una referencia bidireccional al estado. Se usa para pasar a vistas hijas que necesitan modificar el estado, como TextField(text: $name) o Toggle(isOn: $isEnabled).'
        },
        {
          question: '¿Cuándo es apropiado usar @State en lugar de un ViewModel con @StateObject?',
          options: [
            'Siempre, @State es mejor que @StateObject en todos los casos',
            'Para estado simple y local como un accordion expandido, un tab seleccionado o la visibilidad de un sheet',
            'Solo para strings y números enteros',
            'Nunca, @State está obsoleto desde iOS 16'
          ],
          correct: 1,
          explanation: '@State es para estado local simple: ¿está expandido un accordion? ¿qué tab está seleccionado? ¿está visible un sheet? Si el estado necesita compartirse con múltiples vistas o tiene lógica compleja, se debe subir a un ViewModel con @StateObject.'
        },
        {
          question: '¿Qué sucede con el valor de @State cuando la Vista se destruye?',
          options: [
            'El valor se conserva permanentemente en el heap',
            'El valor se pierde porque @State no sobrevive a la destrucción de la Vista',
            'El valor se guarda automáticamente en UserDefaults',
            'El valor se transfiere a la siguiente Vista que se cree'
          ],
          correct: 1,
          explanation: '@State está ligado al ciclo de vida de la Vista. Cuando la Vista se destruye, el estado se pierde. Para persistir datos entre lanzamientos de la app se usa @AppStorage, y para restaurar estado después de que el sistema mate la app se usa @SceneStorage.'
        }
      ]
    }
  },

  {
    id: 'binding',
    title: '@Binding',
    icon: '🔗',
    summary: 'Referencia bidireccional al estado del padre. El hijo lee y escribe, el padre es dueño del valor.',
    content: [
      {
        type: 'text',
        body: `<p><code>@Binding</code> crea una <strong>referencia bidireccional</strong> al estado de otra Vista. El hijo puede leer y modificar el valor, pero no es el propietario — el padre lo es.</p>
        <h4>Cuándo usarlo</h4>
        <ul>
          <li>Cuando una View hija necesita <em>modificar</em> el estado del padre</li>
          <li>Componentes reutilizables: TextField, Toggle, custom pickers</li>
          <li>Controlar sheets, alerts: <code>isPresented: $showSheet</code></li>
        </ul>
        <h4>Cómo se crea un Binding</h4>
        <ul>
          <li>De <code>@State</code> con prefijo <code>$</code>: <code>$count</code></li>
          <li>De <code>@StateObject/@ObservedObject</code>: <code>$viewModel.propertyName</code></li>
          <li>Manual: <code>Binding(get: { }, set: { })</code></li>
          <li>Constante para previews: <code>.constant(value)</code></li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// Padre — dueño del estado
struct LoginScreen: View {
    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false

    var body: some View {
        VStack {
            // Pasa Binding a los hijos
            EmailField(text: $email)
            PasswordField(text: $password, showPassword: $showPassword)
            Button("Iniciar sesión") { login(email: email, password: password) }
        }
    }
}

// Hijo — recibe y puede modificar el estado
struct EmailField: View {
    @Binding var text: String  // referencia al @State del padre

    var body: some View {
        TextField("Email", text: $text)  // pasa el Binding más abajo con $
            .keyboardType(.emailAddress)
            .autocorrectionDisabled()
            .textInputAutocapitalization(.never)
    }
}

struct PasswordField: View {
    @Binding var text: String
    @Binding var showPassword: Bool

    var body: some View {
        HStack {
            if showPassword {
                TextField("Contraseña", text: $text)
            } else {
                SecureField("Contraseña", text: $text)
            }
            Button { showPassword.toggle() } label: {
                Image(systemName: showPassword ? "eye.slash" : "eye")
            }
        }
    }
}

// Binding manual — para transformar o derivar valores
struct RatingView: View {
    @Binding var rating: Double // 0.0 - 5.0

    // Binding derivado: convierte Double → Int para el Stepper
    var intRating: Binding<Int> {
        Binding(
            get: { Int(rating) },
            set: { rating = Double($0) }
        )
    }

    var body: some View {
        Stepper("Rating: \\(Int(rating))", value: intRating, in: 0...5)
    }
}

// .constant() para previews/testing
#Preview {
    EmailField(text: .constant("test@example.com"))
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué es @Binding en SwiftUI?',
          options: [
            'Un property wrapper que crea una copia independiente del estado del padre',
            'Una referencia bidireccional al estado propiedad de otra Vista, permitiendo leer y modificar el valor desde el hijo',
            'Un contenedor de datos persistente en disco',
            'Un sustituto de @State a partir de iOS 17'
          ],
          correct: 1,
          explanation: '@Binding crea una referencia bidireccional al estado de otra Vista. El hijo puede leer y modificar el valor, pero el padre sigue siendo el propietario. Se usa para componentes reutilizables como TextField, Toggle, o para controlar sheets y alerts.'
        },
        {
          question: '¿Cómo se pasa un @State como Binding a una vista hija?',
          options: [
            'Pasando la variable directamente: Hijo(valor: stateVar)',
            'Usando el prefijo $: Hijo(valor: $stateVar)',
            'Declarando @Binding en el padre y @State en el hijo',
            'Usando un ViewModel intermedio'
          ],
          correct: 1,
          explanation: 'El prefijo $ delante de una variable @State genera un Binding que se puede pasar a vistas hijas. Por ejemplo: TextField("Nombre", text: $name) pasa el Binding al TextField para que pueda leer y escribir el valor.'
        },
        {
          question: '¿Para qué sirve Binding(get:set:) en SwiftUI?',
          options: [
            'Para crear un Binding que no se puede modificar',
            'Para crear un Binding manual que transforma o deriva valores entre la fuente y el consumidor',
            'Para depurar cambios de estado en la consola',
            'Para crear un Binding que persiste en el disco'
          ],
          correct: 1,
          explanation: 'Binding(get:set:) permite crear un Binding personalizado que transforma valores. Por ejemplo, convertir un Double a Int para usarlo con un Stepper: Binding(get: { Int(rating) }, set: { rating = Double($0) }). La función get lee el valor y set lo escribe.'
        },
        {
          question: '¿Para qué sirve .constant() en SwiftUI?',
          options: [
            'Crea un Binding inmutable que siempre devuelve el mismo valor, ideal para previsualizaciones y tests',
            'Hace que un @State no pueda modificarse',
            'Convierte un @Binding en @State',
            'Persiste el valor en UserDefaults'
          ],
          correct: 0,
          explanation: '.constant(valor) crea un Binding inmutable que siempre devuelve el mismo valor y descarta cualquier escritura. Es útil en previsualizaciones (#Preview) y tests donde necesitas un Binding pero no quieres estado real.'
        }
      ]
    }
  },

  {
    id: 'stateobject-observedobject',
    title: '@StateObject y @ObservedObject',
    icon: '🔵🟡',
    summary: '@StateObject crea y posee el ViewModel. @ObservedObject lo recibe de fuera. Basados en ObservableObject.',
    content: [
      {
        type: 'text',
        body: `<p>Para estado complejo que necesita un ViewModel (clase con lógica), SwiftUI usa el protocolo <code>ObservableObject</code> combinado con property wrappers.</p>
        <h4>ObservableObject</h4>
        <p>Protocolo que cualquier <code>class</code> puede adoptar. Las propiedades marcadas con <code>@Published</code> notifican a las Views cuando cambian.</p>
        <h4>@StateObject</h4>
        <ul>
          <li>La Vista <strong>crea y posee</strong> el objeto</li>
          <li>Persiste durante toda la vida de la Vista (no se recrea en redraws)</li>
          <li>Usa <code>@StateObject</code> cuando eres quien inicializa el ViewModel</li>
        </ul>
        <h4>@ObservedObject</h4>
        <ul>
          <li>La Vista <strong>recibe</strong> el objeto de fuera</li>
          <li>No gestiona el ciclo de vida — si la Vista se recrea, puede recibir un nuevo objeto</li>
          <li>Usa <code>@ObservedObject</code> cuando el padre pasa el ViewModel al hijo</li>
        </ul>
        <h4>Nota iOS 17+</h4>
        <p>Con la macro <code>@Observable</code>, ObservableObject queda obsoleto. Ver sección Senior.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// ViewModel: ObservableObject + @Published
class UserListViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var errorMessage: String? = nil

    private let repository: UserRepository

    init(repository: UserRepository = UserRepository()) {
        self.repository = repository
    }

    @MainActor
    func loadUsers() async {
        isLoading = true
        errorMessage = nil
        do {
            users = try await repository.fetchUsers()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

// Pantalla raíz — @StateObject (la Vista posee el ViewModel)
struct UserListScreen: View {
    @StateObject private var viewModel = UserListViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("Cargando...")
            } else if let error = viewModel.errorMessage {
                ErrorView(message: error, onRetry: {
                    Task { await viewModel.loadUsers() }
                })
            } else {
                UserList(users: viewModel.users, viewModel: viewModel)
            }
        }
        .task { await viewModel.loadUsers() }
    }
}

// Vista hija — @ObservedObject (recibe el ViewModel)
struct UserList: View {
    let users: [User]
    @ObservedObject var viewModel: UserListViewModel  // no crea, solo observa

    var body: some View {
        List(users) { user in
            UserRow(user: user) {
                Task { await viewModel.deleteUser(user) }
            }
        }
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿A qué protocolo debe conformar una clase para usarse con @StateObject?',
          options: [
            'Codable',
            'Identifiable',
            'ObservableObject',
            'Equatable'
          ],
          correct: 2,
          explanation: 'Para usar @StateObject o @ObservedObject, la clase debe conformar el protocolo ObservableObject. Las propiedades que notifican cambios se marcan con @Published. Así SwiftUI sabe cuándo reconstruir las vistas que observan ese objeto.'
        },
        {
          question: '¿Cuál es la diferencia clave entre @StateObject y @ObservedObject?',
          options: [
            '@StateObject crea y posee el objeto; @ObservedObject recibe el objeto desde el exterior',
            '@StateObject es para structs y @ObservedObject para classes',
            'No hay diferencia, son intercambiables',
            '@ObservedObject solo funciona en iOS 17+'
          ],
          correct: 0,
          explanation: '@StateObject lo usas cuando la Vista crea e inicializa el ViewModel. SwiftUI gestiona su ciclo de vida. @ObservedObject lo usas cuando el ViewModel viene de fuera (lo pasa el padre). Si la Vista con @ObservedObject se recrea, puede recibir un objeto nuevo o el mismo según el padre.'
        },
        {
          question: '¿Qué hace @Published en una propiedad de ObservableObject?',
          options: [
            'Hace la propiedad accesible desde cualquier archivo del proyecto',
            'Notifica automáticamente a las vistas observadoras cuando la propiedad cambia',
            'Publica la propiedad en la App Store',
            'Convierte la propiedad en una constante'
          ],
          correct: 1,
          explanation: '@Published envuelve la propiedad para que, cada vez que se modifica, emita una notificación a través del ObservableObject. SwiftUI escucha estas notificaciones y reconstruye las vistas que observan ese objeto. Sin @Published, los cambios no se reflejarían en la UI.'
        },
        {
          question: '¿Qué sucede si una Vista con @ObservedObject se recrea?',
          options: [
            'El objeto observado también se recrea automáticamente',
            'La Vista recibe el mismo objeto o uno nuevo dependiendo de lo que el padre pase',
            'La aplicación crashea',
            'El @ObservedObject se convierte automáticamente en @StateObject'
          ],
          correct: 1,
          explanation: 'A diferencia de @StateObject (que SwiftUI conserva en el heap), @ObservedObject no gestiona el ciclo de vida del objeto. Si la Vista se recrea, el padre debe pasar el objeto nuevamente. Por eso @StateObject se usa en el creador y @ObservedObject en los hijos.'
        }
      ]
    }
  },

  {
    id: 'environment-object',
    title: '@EnvironmentObject',
    icon: '🌐',
    summary: 'Estado inyectado en el árbol de vistas. Cualquier descendiente puede accederlo sin pasarlo por parámetro.',
    content: [
      {
        type: 'text',
        body: `<p><code>@EnvironmentObject</code> es la solución de SwiftUI para estado global compartido: lo inyectas en un nodo del árbol y todos los descendientes pueden accederlo sin que los intermedios lo conozcan.</p>
        <h4>Cuándo usarlo</h4>
        <ul>
          <li>Sesión de usuario (autenticación)</li>
          <li>Tema/configuración de la app</li>
          <li>Carrito de compras o estado de la app</li>
          <li>Cuando pasar el objeto por niveles intermedios sería prop drilling</li>
        </ul>
        <h4>Cuándo NO usarlo</h4>
        <ul>
          <li>Para estado local o de una sola pantalla → usa @State o @StateObject</li>
          <li>Para comunicación directa padre-hijo → usa @Binding o @ObservedObject</li>
          <li>Si abusas de @EnvironmentObject toda la app se acopla al mismo estado</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// Estado global: sesión de usuario
class UserSession: ObservableObject {
    @Published var currentUser: User? = nil
    @Published var isAuthenticated = false

    func login(user: User) {
        currentUser = user
        isAuthenticated = true
    }

    func logout() {
        currentUser = nil
        isAuthenticated = false
    }
}

// App — inyecta el objeto en la raíz
@main
struct MyApp: App {
    @StateObject private var session = UserSession()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(session) // inyecta para TODO el árbol
        }
    }
}

// Vista intermedia — no necesita conocer UserSession
struct ContentView: View {
    var body: some View {
        TabView {
            HomeTab()
            ProfileTab()
        }
    }
}

// Vista descendiente — accede al EnvironmentObject
struct ProfileTab: View {
    @EnvironmentObject var session: UserSession // ← acceso directo

    var body: some View {
        if session.isAuthenticated {
            VStack {
                Text("Hola, \\(session.currentUser?.name ?? "")")
                Button("Cerrar sesión") { session.logout() }
            }
        } else {
            LoginView()
        }
    }
}

// Tema/configuración
class AppSettings: ObservableObject {
    @Published var accentColor: Color = .blue
    @Published var fontSize: CGFloat = 16
    @AppStorage("darkMode") var darkMode = false
}

// Múltiples EnvironmentObjects se pueden inyectar
ContentView()
    .environmentObject(session)
    .environmentObject(AppSettings())`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cómo se inyecta un @EnvironmentObject en la jerarquía de vistas?',
          options: [
            'Pasándolo como parámetro en el inicializador de cada vista',
            'Usando el modifier .environmentObject() en una vista padre para que todos los descendientes puedan accederlo',
            'Declarándolo en el archivo AppDelegate',
            'Usando el modifier .inject() en la vista raíz'
          ],
          correct: 1,
          explanation: '.environmentObject() inyecta el objeto en el entorno (environment) de la vista actual. Todas las vistas descendientes pueden accederlo con @EnvironmentObject sin necesidad de que las vistas intermedias lo conozcan o lo pasen explícitamente.'
        },
        {
          question: '¿Cuándo es @EnvironmentObject la mejor opción frente a pasar datos por inicializadores?',
          options: [
            'Cuando varias vistas en distintas ramas del árbol necesitan el mismo objeto y pasarlo por cada nivel intermedio sería prop drilling excesivo',
            'Solo cuando hay una única vista que necesita el dato',
            'Siempre, es mejor que cualquier otra opción',
            'Nunca, pasar por inicializadores es siempre preferible'
          ],
          correct: 0,
          explanation: '@EnvironmentObject evita el prop drilling: pasar un objeto a través de múltiples niveles de vistas que no lo necesitan solo para que llegue a un descendiente lejano. Es ideal para sesión de usuario, tema de la app o carrito de compras.'
        },
        {
          question: '¿Cuándo NO es recomendable usar @EnvironmentObject?',
          options: [
            'Para estado global como la sesión del usuario o el tema de la app',
            'Para estado local de una sola pantalla (como qué tab está seleccionado)',
            'Para carrito de compras accesible desde varias pantallas',
            'Para configuración de la app'
          ],
          correct: 1,
          explanation: '@EnvironmentObject está diseñado para estado compartido globalmente. Usarlo para estado local de una pantalla añade acoplamiento innecesario. Para estado local se usa @State, y para comunicación directa padre-hijo se usa @Binding u @ObservedObject.'
        }
      ]
    }
  },

  {
    id: 'navigation-stack',
    title: 'NavigationStack',
    icon: '🗺️',
    summary: 'Navegación tipo push/pop moderna en SwiftUI. Soporta deep links y navegación programática con NavigationPath.',
    content: [
      {
        type: 'text',
        body: `<p><strong>NavigationStack</strong> (iOS 16+) es el reemplazo de <code>NavigationView</code>. Permite navegación programática completa y deep links tipados.</p>
        <h4>Conceptos</h4>
        <ul>
          <li><code>NavigationStack</code> — Contenedor del stack de navegación</li>
          <li><code>NavigationLink</code> — Elemento táctil que empuja una pantalla al stack</li>
          <li><code>navigationDestination(for:)</code> — Declara qué View mostrar para un tipo de dato</li>
          <li><code>NavigationPath</code> — El stack completo como valor. Permite push/pop programático.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// NavigationStack básico
struct ContentView: View {
    var body: some View {
        NavigationStack {
            List(users) { user in
                NavigationLink(value: user) { // value-based link
                    UserRow(user: user)
                }
            }
            .navigationTitle("Usuarios")
            .navigationDestination(for: User.self) { user in
                UserDetailView(user: user)
            }
            .navigationDestination(for: Int.self) { userId in
                // para deep links: push directamente con un ID
                UserDetailView(userId: userId)
            }
        }
    }
}

// Navegación programática con NavigationPath
struct RootView: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            HomeView(path: $path)
                .navigationDestination(for: User.self) { UserDetailView(user: $0) }
                .navigationDestination(for: String.self) { id in SearchView(id: id) }
        }
    }
}

struct HomeView: View {
    @Binding var path: NavigationPath

    var body: some View {
        VStack {
            Button("Ir a usuario 42") {
                path.append(User(id: 42, name: "Ana", email: "ana@test.com"))
            }
            Button("Ir a búsqueda") {
                path.append("query:swift")
            }
            Button("Volver al root") {
                path = NavigationPath() // limpia el stack
            }
        }
    }
}

// Toolbar items
.toolbar {
    ToolbarItem(placement: .navigationBarTrailing) {
        Button("Editar") { isEditing = true }
    }
    ToolbarItem(placement: .navigationBarLeading) {
        Button("Cancelar") { dismiss() }
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es el contenedor de navegación moderno en SwiftUI (iOS 16+)?',
          options: [
            'NavigationView',
            'NavigationStack',
            'UINavigationController',
            'NavigatorView'
          ],
          correct: 1,
          explanation: 'NavigationStack (iOS 16+) reemplaza a NavigationView. Proporciona navegación programática completa con NavigationPath, deep links tipados con navigationDestination(for:), y mejor gestión del stack de navegación.'
        },
        {
          question: '¿Cómo se declara la vista a mostrar cuando se navega con un valor de un tipo específico?',
          options: [
            'Con NavigationLink(destination:) directamente en el link',
            'Con el modifier navigationDestination(for:destination:) en el NavigationStack',
            'Con onNavigate(for:) en la vista raíz',
            'Con NavigationPath(route:)'
          ],
          correct: 1,
          explanation: 'navigationDestination(for: Tipo.self) { valor in ... } declara qué vista mostrar para un tipo de dato. Se combina con NavigationLink(value:) que pasa el valor. Esto desacopla el link de la vista destino, facilitando deep links y navegación programática.'
        },
        {
          question: '¿Para qué sirve NavigationPath en SwiftUI?',
          options: [
            'Para definir la animación de transición entre pantallas',
            'Para manejar el stack de navegación de forma programática: añadir, eliminar o limpiar rutas',
            'Para importar lógica de navegación desde UIKit',
            'Para crear enlaces profundos solo desde notificaciones push'
          ],
          correct: 1,
          explanation: 'NavigationPath representa el stack de navegación como un valor. Se puede modificar programáticamente: path.append(user) para navegar, path.removeLast() para volver atrás, o path = NavigationPath() para volver al root. Es clave para deep links y navegación condicional.'
        },
        {
          question: '¿Qué modifier se usa para añadir botones en la barra de navegación?',
          options: [
            '.navigationBarItems()',
            '.toolbar()',
            '.navButtons()',
            '.barButtons()'
          ],
          correct: 1,
          explanation: 'El modifier .toolbar() permite agregar ToolbarItems en diferentes posiciones: .navigationBarTrailing (derecha), .navigationBarLeading (izquierda), .bottomBar, etc. Reemplaza a .navigationBarItems() que está obsoleto desde iOS 16.'
        }
      ]
    }
  },

  {
    id: 'tabview',
    title: 'TabView',
    icon: '📑',
    summary: 'Navegación por tabs como en apps nativas de iOS. Cada tab tiene su propio NavigationStack.',
    content: [
      {
        type: 'text',
        body: `<p><code>TabView</code> implementa el patrón de tabs nativo de iOS, con la barra de tabs en la parte inferior. Cada tab es independiente y tiene su propio historial de navegación.</p>
        <h4>Buenas prácticas</h4>
        <ul>
          <li>Cada tab debe tener su propio <code>NavigationStack</code></li>
          <li>Usa <code>selection</code> para controlar la tab activa programáticamente</li>
          <li>Los tabs son para destinos principales de la app (no para flujos temporales)</li>
          <li>Máximo 5 tabs (más usa un "More" automático en iOS)</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// TabView con navegación por tab programática
struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Cada tab con su NavigationStack
            NavigationStack {
                HomeView()
                    .navigationTitle("Inicio")
            }
            .tabItem {
                Label("Inicio", systemImage: "house.fill")
            }
            .tag(0)

            NavigationStack {
                SearchView()
                    .navigationTitle("Buscar")
            }
            .tabItem {
                Label("Buscar", systemImage: "magnifyingglass")
            }
            .tag(1)

            NavigationStack {
                ProfileView()
                    .navigationTitle("Perfil")
            }
            .tabItem {
                Label("Perfil", systemImage: "person.fill")
            }
            .badge(3) // badge de notificaciones
            .tag(2)
        }
    }
}

// Navegar a una tab desde otra vista
struct HomeView: View {
    @Binding var selectedTab: Int  // recibido del padre

    var body: some View {
        Button("Ir a búsqueda") {
            selectedTab = 1
        }
    }
}

// TabView como Pager (onboarding)
struct OnboardingView: View {
    @State private var currentPage = 0

    var body: some View {
        TabView(selection: $currentPage) {
            ForEach(onboardingPages.indices, id: \\.self) { index in
                OnboardingPage(page: onboardingPages[index])
                    .tag(index)
            }
        }
        .tabViewStyle(.page) // estilo pager, oculta tab bar
        .indexViewStyle(.page(backgroundDisplayMode: .always))
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la estructura recomendada para NavigationStack dentro de TabView?',
          options: [
            'Un solo NavigationStack que envuelve todo el TabView',
            'Cada tab debe tener su propio NavigationStack independiente',
            'NavigationStack no es compatible con TabView',
            'Solo la primera tab necesita NavigationStack'
          ],
          correct: 1,
          explanation: 'Cada tab debe tener su propio NavigationStack para mantener historiales de navegación independientes. Así, al cambiar de tab y volver, cada una conserva su estado de navegación sin interferencias.'
        },
        {
          question: '¿Cómo se controla programáticamente qué tab está activa en TabView?',
          options: [
            'Con @State y TabView(selection: $selectedTab) combinado con .tag() en cada tab',
            'Llamando al método switchToTab() del TabView',
            'Usando una variable de entorno selectedTab',
            'No es posible cambiar de tab programáticamente'
          ],
          correct: 0,
          explanation: 'TabView(selection: $selectedTab) vincula una variable @State a la tab activa. Cada tab se marca con .tag(valor). Cambiar selectedTab desde cualquier vista cambia la tab activa. Es útil para navegar a una tab específica desde otra tab o desde una notificación.'
        },
        {
          question: '¿Cómo se añade un badge de notificación a un tab en TabView?',
          options: [
            'Con el modifier .badge() en el contenido del tab',
            'Con .notificationBadge() en el tabItem',
            'Los badges no están soportados en SwiftUI TabView',
            'Con badge(count:) en el propio TabView'
          ],
          correct: 0,
          explanation: 'El modifier .badge(número) se aplica al contenido del tab y muestra el badge en el tabItem. Por ejemplo: NavigationStack { List {...} }.badge(3) muestra un badge rojo con "3" en la barra de tabs. Es útil para notificaciones no leídas.'
        },
        {
          question: '¿Qué modifier convierte TabView en un carrusel tipo pager para onboarding?',
          options: [
            '.tabViewStyle(.carousel)',
            '.tabViewStyle(.page)',
            '.pagerStyle()',
            '.tabViewStyle(.scroll)'
          ],
          correct: 1,
          explanation: '.tabViewStyle(.page) convierte el TabView en un carrusel de páginas deslizables, ocultando la barra de tabs. Se combina con .indexViewStyle(.page(backgroundDisplayMode: .always)) para mostrar los indicadores de página. Es ideal para pantallas de onboarding.'
        }
      ]
    }
  },

  {
    id: 'list-foreach',
    title: 'List y ForEach',
    icon: '📋',
    summary: 'List para listas nativas de iOS con swipe actions. ForEach para iterar sobre colecciones en cualquier contenedor.',
    content: [
      {
        type: 'text',
        body: `<p><code>List</code> es el equivalente a <code>UITableView</code>/RecyclerView en SwiftUI: lazy, eficiente, con soporte nativo de swipe actions, secciones, edit mode y move. <code>ForEach</code> es un iterador que se puede usar dentro de cualquier contenedor (VStack, List, etc.).</p>
        <h4>Identifiable</h4>
        <p>Los items deben ser <code>Identifiable</code> (tener una propiedad <code>id</code>) o usar <code>id: \\.keyPath</code>. SwiftUI usa el id para animaciones y actualización eficiente.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `struct User: Identifiable {  // ✅ Identifiable
    let id: UUID = UUID()
    var name: String
}

struct UserListView: View {
    @State private var users = [
        User(name: "Ana"),
        User(name: "Carlos"),
        User(name: "María")
    ]

    var body: some View {
        List {
            // Secciones
            Section("Activos") {
                ForEach(users) { user in
                    HStack {
                        Image(systemName: "person.circle")
                        Text(user.name)
                    }
                    .swipeActions(edge: .trailing) { // swipe desde derecha
                        Button(role: .destructive) {
                            delete(user)
                        } label: {
                            Label("Eliminar", systemImage: "trash")
                        }
                    }
                    .swipeActions(edge: .leading) { // swipe desde izquierda
                        Button { favorite(user) } label: {
                            Label("Favorito", systemImage: "star.fill")
                        }
                        .tint(.yellow)
                    }
                }
                .onDelete { indexSet in // swipe estándar de delete
                    users.remove(atOffsets: indexSet)
                }
                .onMove { source, destination in // drag para reordenar
                    users.move(fromOffsets: source, toOffset: destination)
                }
            }

            Section("Estadísticas") {
                LabeledContent("Total", value: "\\(users.count)")
            }
        }
        .listStyle(.insetGrouped) // estilos: .plain, .grouped, .insetGrouped, .sidebar
        .toolbar { EditButton() } // activa el modo edición con delete/move
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué protocolo deben conformar los elementos para usarse con List y ForEach?',
          options: [
            'Codable',
            'Identifiable (tener una propiedad id única)',
            'Hashable',
            'Equatable'
          ],
          correct: 1,
          explanation: 'Los elementos deben ser Identifiable, es decir, tener una propiedad id única. SwiftUI usa el id para identificar cada elemento, animar cambios eficientemente y actualizar solo lo necesario. Alternativamente se puede usar id: \\.keyPath en ForEach para elementos sin Identifiable.'
        },
        {
          question: '¿Qué modifier añade acciones al deslizar una fila de List?',
          options: [
            '.onSwipe()',
            '.swipeActions(edge:)',
            '.contextMenu()',
            '.gesture(DragGesture())'
          ],
          correct: 1,
          explanation: '.swipeActions(edge:) añade botones que aparecen al deslizar la fila. .swipeActions(edge: .trailing) para acciones al deslizar a la izquierda (como eliminar), y .swipeActions(edge: .leading) para acciones al deslizar a la derecha (como marcar favorito con .tint()).'
        },
        {
          question: '¿Qué se necesita para habilitar el modo edición con reordenación en una List?',
          options: [
            'El modifier .onMove en el ForEach y un EditButton en el toolbar',
            'Los modifiers .dragEnabled() y .reorderable()',
            'El modo edición es automático para todas las List',
            'Los modifiers .editMode() y .onReorder()'
          ],
          correct: 0,
          explanation: 'Para reordenar elementos: añadir .onMove { source, destination en ... } al ForEach, y un EditButton() en el toolbar que activa/desactiva el modo edición. El usuario puede arrastrar los elementos para reordenarlos mientras el modo edición está activo.'
        },
        {
          question: '¿Qué estilos de lista están disponibles en SwiftUI?',
          options: [
            '.plain, .grouped, .insetGrouped, .sidebar',
            'Solo .plain',
            '.rounded y .square',
            'Solo .insetGrouped'
          ],
          correct: 0,
          explanation: 'SwiftUI ofrece varios estilos de lista: .plain (estilo básico sin decoración), .grouped (agrupado con fondo de sección), .insetGrouped (agrupado con bordes redondeados, el más común en iOS moderno) y .sidebar (para navegación lateral en iPad/macOS).'
        }
      ]
    }
  },

  {
    id: 'sheets-alerts',
    title: 'Sheets, Alerts y Dialogs',
    icon: '💬',
    summary: 'Presentación modal de vistas. .sheet(), .fullScreenCover(), .alert(), .confirmationDialog().',
    content: [
      {
        type: 'text',
        body: `<p>SwiftUI usa modifiers de presentación modal que se controlan con bindings booleanos o items opcionales.</p>
        <h4>Tipos de presentación</h4>
        <ul>
          <li><code>.sheet(isPresented:)</code> — Modal deslizable desde abajo</li>
          <li><code>.fullScreenCover(isPresented:)</code> — Modal pantalla completa</li>
          <li><code>.alert(isPresented:)</code> — Alerta nativa del sistema</li>
          <li><code>.confirmationDialog(_:isPresented:)</code> — Action sheet</li>
          <li><code>.popover(isPresented:)</code> — Popover (iPad, en iPhone es sheet)</li>
        </ul>
        <h4>Item-based vs Bool-based</h4>
        <p>Preferir el patrón con item opcional: <code>.sheet(item: $selectedUser)</code> — más seguro porque la presentación y el dato están vinculados.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `struct PresentationExamples: View {
    @State private var showSheet = false
    @State private var showFullScreen = false
    @State private var showAlert = false
    @State private var showConfirmation = false
    @State private var selectedUser: User? = nil // item-based

    var body: some View {
        List {
            Button("Abrir Sheet") { showSheet = true }
            Button("Pantalla completa") { showFullScreen = true }
            Button("Alerta") { showAlert = true }
            Button("Confirmación") { showConfirmation = true }
            Button("Sheet con item") { selectedUser = User(name: "Ana") }
        }

        // Sheet básico
        .sheet(isPresented: $showSheet) {
            SheetContent()
                .presentationDetents([.medium, .large]) // iOS 16: altura configurable
                .presentationDragIndicator(.visible)
        }

        // Full screen
        .fullScreenCover(isPresented: $showFullScreen) {
            FullScreenView(onDismiss: { showFullScreen = false })
        }

        // Alert con acciones
        .alert("¿Eliminar usuario?", isPresented: $showAlert) {
            Button("Eliminar", role: .destructive) { deleteUser() }
            Button("Cancelar", role: .cancel) { }
        } message: {
            Text("Esta acción no se puede deshacer.")
        }

        // Confirmation dialog (action sheet)
        .confirmationDialog("Opciones", isPresented: $showConfirmation, titleVisibility: .visible) {
            Button("Compartir") { share() }
            Button("Duplicar") { duplicate() }
            Button("Eliminar", role: .destructive) { delete() }
            Button("Cancelar", role: .cancel) { }
        }

        // Item-based sheet — más seguro
        .sheet(item: $selectedUser) { user in
            UserDetailSheet(user: user) // user es non-optional aquí
        }
    }
}

// Dismiss desde dentro del sheet
struct SheetContent: View {
    @Environment(\\.dismiss) var dismiss // environment value para dismissar

    var body: some View {
        VStack {
            Text("Soy un sheet")
            Button("Cerrar") { dismiss() }
        }
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia entre .sheet() y .fullScreenCover() en SwiftUI?',
          options: [
            '.sheet() presenta un modal deslizable con altura configurable; .fullScreenCover() cubre toda la pantalla',
            'No hay diferencia, son sinónimos',
            '.sheet() solo funciona en iPad y .fullScreenCover() en iPhone',
            '.sheet() está obsoleto desde iOS 16'
          ],
          correct: 0,
          explanation: '.sheet() muestra un modal que se desliza desde abajo y puede tener altura configurable con .presentationDetents() (iOS 16+). .fullScreenCover() cubre toda la pantalla sin dejar ver la vista anterior. Ambos se controlan con bindings booleanos o items opcionales.'
        },
        {
          question: '¿Cuál es la ventaja de usar presentación item-based (.sheet(item:)) sobre bool-based (.sheet(isPresented:))?',
          options: [
            'El dato y la presentación están vinculados: al asignar un item se presenta el modal, al descartarlo se limpia automáticamente. Es más seguro porque evita estados inconsistentes',
            'El item-based es más rápido en rendimiento',
            'El bool-based no funciona en iOS 16+',
            'No hay ventaja, ambos son equivalentes'
          ],
          correct: 0,
          explanation: 'Con .sheet(item: $selectedItem), la presentación está atada al dato opcional. Cuando selectedItem es non-nil, el sheet se muestra. Al descartarlo, SwiftUI limpia el item automáticamente. Esto evita estados donde el sheet está visible pero los datos no están sincronizados.'
        },
        {
          question: '¿Cómo se descarta un sheet desde dentro de su propio contenido?',
          options: [
            'Usando @Environment(\\.dismiss) para obtener la función dismiss() y llamarla',
            'Con self.dismiss() directamente',
            'Haciendo pop del NavigationStack',
            'Asignando false al binding de presentación manualmente'
          ],
          correct: 0,
          explanation: '@Environment(\\.dismiss) proporciona la función dismiss() que cierra la presentación actual (sheet, fullScreenCover, popover). Es la forma correcta y declarativa de cerrar un modal desde dentro. Antes de iOS 15 se usaban bindings o closures de callback.'
        },
        {
          question: '¿Qué modifier se usa para mostrar un action sheet en SwiftUI?',
          options: [
            '.actionSheet()',
            '.confirmationDialog()',
            '.menu()',
            '.popover()'
          ],
          correct: 1,
          explanation: '.confirmationDialog() es el reemplazo moderno de .actionSheet() (obsoleto). Muestra un menú de opciones al usuario con botones de distintos roles (destructive, cancel). En iPhone se muestra como action sheet desde abajo, en iPad como popover.'
        }
      ]
    }
  },

  {
    id: 'app-lifecycle',
    title: 'App Lifecycle',
    icon: '🔄',
    summary: '@main, App protocol y WindowGroup. ScenePhase para detectar estados. Equivale a Application + Activity en Android.',
    content: [
      {
        type: 'text',
        body: `<p>En SwiftUI, el punto de entrada de la app es una struct marcada con <code>@main</code> que conforma el protocolo <code>App</code>. Reemplaza a <code>AppDelegate</code> y <code>SceneDelegate</code> de UIKit.</p>
        <h4>Conceptos clave</h4>
        <ul>
          <li><code>@main</code> — Marca el punto de entrada. Solo puede haber uno.</li>
          <li><code>App</code> — Protocolo que requiere <code>var body: some Scene</code></li>
          <li><code>WindowGroup</code> — Scene que gestiona una ventana (la más común)</li>
          <li><code>ScenePhase</code> — Estado de la escena: <code>.active</code>, <code>.inactive</code>, <code>.background</code></li>
          <li><code>@AppStorage</code> — Property wrapper que persiste en UserDefaults</li>
          <li><code>@SceneStorage</code> — Persiste estado por escena (restauración de estado)</li>
        </ul>
        <h4>Comparación con Android</h4>
        <ul>
          <li><code>@main App</code> ≈ <code>Application</code> class</li>
          <li><code>WindowGroup</code> ≈ Activity con su layout</li>
          <li><code>.active</code> ≈ <code>onResume</code>, <code>.background</code> ≈ <code>onStop</code></li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// Punto de entrada de la app
@main
struct MyApp: App {
    // StateObject para el estado global
    @StateObject private var session = UserSession()
    @StateObject private var settings = AppSettings()

    // Detectar ScenePhase
    @Environment(\\.scenePhase) var scenePhase

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
                .environmentObject(settings)
        }
        .onChange(of: scenePhase) { oldPhase, newPhase in
            switch newPhase {
            case .active:
                print("App activa") // equivale a onResume
            case .inactive:
                print("App inactiva") // equivale a onPause
            case .background:
                print("App en background") // equivale a onStop
                saveState()
            @unknown default:
                break
            }
        }
    }
}

// RootView — decide qué mostrar según autenticación
struct RootView: View {
    @EnvironmentObject var session: UserSession

    var body: some View {
        if session.isAuthenticated {
            MainTabView()
        } else {
            LoginView()
        }
    }
}

// AppStorage — persiste automáticamente en UserDefaults
struct SettingsView: View {
    @AppStorage("notifications_enabled") private var notificationsEnabled = true
    @AppStorage("username") private var username = ""

    var body: some View {
        Form {
            Toggle("Notificaciones", isOn: $notificationsEnabled)
            TextField("Usuario", text: $username)
        }
    }
}

// SceneStorage — persiste por escena (restauración)
struct ArticleView: View {
    @SceneStorage("selected_article_id") private var articleId: Int?

    var body: some View {
        // articleId se restaura si el sistema mata y relanza la app
        Text("Artículo: \\(articleId ?? 0)")
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué marca el punto de entrada de una app SwiftUI?',
          options: [
            'El atributo @main en una struct que conforma el protocolo App',
            'La clase AppDelegate',
            'La clase SceneDelegate',
            'El atributo @UIApplicationMain'
          ],
          correct: 0,
          explanation: 'En SwiftUI, el punto de entrada es una struct marcada con @main que conforma el protocolo App. Esta struct reemplaza a AppDelegate y SceneDelegate de UIKit. Solo puede haber un @main en la app. Su body retorna una Scene, normalmente WindowGroup.'
        },
        {
          question: '¿Qué representa ScenePhase en SwiftUI?',
          options: [
            'El estado del ciclo de vida de la escena: .active, .inactive, .background',
            'La fase de compilación del proyecto Swift',
            'El estado de la animación actual de una vista',
            'La fase de renderizado de un frame'
          ],
          correct: 0,
          explanation: 'ScenePhase indica el ciclo de vida de la escena: .active (app visible y recibiendo eventos, similar a onResume en Android), .inactive (app visible pero sin recibir eventos, como al abrir el centro de control), .background (app minimizada, similar a onStop).'
        },
        {
          question: '¿Cuál es la diferencia entre @AppStorage y @SceneStorage?',
          options: [
            '@AppStorage persiste en UserDefaults (global para toda la app); @SceneStorage persiste por escena y se restaura automáticamente si el sistema relanza la app',
            'No hay diferencia, ambos persisten en el disco',
            '@AppStorage es para strings y @SceneStorage para números enteros',
            '@SceneStorage está obsoleto desde iOS 16'
          ],
          correct: 0,
          explanation: '@AppStorage es un wrapper sobre UserDefaults: persiste valores entre lanzamientos de la app de forma global. @SceneStorage persiste valores asociados a una escena específica y los restaura automáticamente si el sistema mata y relanza la app. SceneStorage es ideal para restaurar la posición de scroll.'
        },
        {
          question: '¿Qué Scene se usa más comúnmente en apps SwiftUI y qué representa?',
          options: [
            'DocumentGroup — para gestionar documentos',
            'WindowGroup — gestiona una o múltiples ventanas de la app, cada una con su propio estado y ciclo de vida',
            'Settings — para la pantalla de configuración del sistema',
            'MenuBarExtra — para apps en la barra de menú de macOS'
          ],
          correct: 1,
          explanation: 'WindowGroup es la Scene más común en SwiftUI. Representa una ventana que puede tener múltiples instancias en iPad y macOS. Cada instancia tiene su propio estado y ciclo de vida. SwiftUI gestiona la creación y destrucción de las ventanas automáticamente.'
        }
      ]
    }
  }
]
