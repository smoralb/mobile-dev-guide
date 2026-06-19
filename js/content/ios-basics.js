const iosBasics = [
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
]
