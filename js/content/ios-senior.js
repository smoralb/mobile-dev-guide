var iosSenior = [
  {
    id: 'observable',
    title: '@Observable (iOS 17+)',
    icon: '🔭',
    summary: 'Macro de Swift 5.9 que reemplaza ObservableObject + @Published. Más simple, más eficiente.',
    content: [
      {
        type: 'text',
        body: `<p><code>@Observable</code> (iOS 17+, Swift 5.9) es la nueva forma de crear ViewModels observables. Reemplaza el patrón <code>ObservableObject + @Published</code> con una macro más sencilla y un sistema de observación más eficiente que actualiza solo las Views que realmente leen cada propiedad.</p>
        <h4>Ventajas sobre ObservableObject</h4>
        <ul>
          <li>Menos código: sin <code>@Published</code> en cada propiedad</li>
          <li>Más eficiente: SwiftUI rastrea exactamente qué propiedad lee cada View, evitando actualizaciones innecesarias</li>
          <li>Sin <code>@StateObject/@ObservedObject</code>: basta con <code>@State</code> para crear el objeto, y simplemente una variable para observarlo</li>
        </ul>
        <h4>@Bindable</h4>
        <p>Para crear <code>Binding</code>s de propiedades de un <code>@Observable</code>, usa <code>@Bindable</code>.</p>
        <h4>Retrocompatibilidad</h4>
        <p>Si necesitas soportar iOS 16 o anterior, sigue usando <code>ObservableObject + @Published</code>. Puedes usar ambos patrones en la misma app.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `import Observation

// ── Antes (iOS 15/16): ObservableObject ──────────────────
class OldViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var searchQuery = ""
}
// En View: @StateObject private var vm = OldViewModel()

// ── Ahora (iOS 17+): @Observable ─────────────────────────
@Observable
class UserViewModel {
    var users: [User] = []        // sin @Published
    var isLoading = false
    var searchQuery = ""
    // private(set) sigue funcionando
    private(set) var lastUpdated: Date? = nil

    private let repository: UserRepository

    init(repository: UserRepository = UserRepositoryImpl()) {
        self.repository = repository
    }

    @MainActor
    func loadUsers() async {
        isLoading = true
        defer { isLoading = false }
        do {
            users = try await repository.fetchUsers()
            lastUpdated = Date()
        } catch {
            print("Error: \\(error)")
        }
    }
}

// En Views: solo @State para crear, nada para observar
struct UserListView: View {
    @State private var viewModel = UserViewModel() // crea y posee

    var body: some View {
        List(viewModel.users) { user in UserRow(user: user) }
            .task { await viewModel.loadUsers() }
    }
}

// Si lo recibes como parámetro, simplemente úsalo
struct UserDetailView: View {
    var viewModel: UserViewModel // sin wrapper — SwiftUI detecta qué propiedades usas

    var body: some View {
        Text(viewModel.users.first?.name ?? "")
    }
}

// @Bindable para Bindings
struct SearchView: View {
    @Bindable var viewModel: UserViewModel // permite $viewModel.searchQuery

    var body: some View {
        TextField("Buscar", text: $viewModel.searchQuery)
    }
}`
      },
      {
        type: 'tip',
        body: '<strong>Eficiencia:</strong> Con <code>ObservableObject</code>, si cambia cualquier <code>@Published</code>, se actualizan <em>todas</em> las Views que usen ese objeto. Con <code>@Observable</code>, solo se actualiza la View que realmente leyó la propiedad que cambió.'
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la principal ventaja de @Observable sobre ObservableObject + @Published?',
          options: [
            '@Observable permite usar herencia múltiple en ViewModels',
            'Fine-grained tracking: solo se re-renderiza la View que leyó la propiedad que cambió, no todas las que observan el objeto',
            '@Observable es compatible con iOS 13+ mientras que ObservableObject requiere iOS 15+',
            '@Observable elimina la necesidad de usar cualquier property wrapper en las Views'
          ],
          correct: 1,
          explanation: 'Con ObservableObject, si cualquier @Published cambia, TODAS las Views que observan ese objeto se re-renderizan. Con @Observable, SwiftUI rastrea qué propiedades lee cada View y solo re-renderiza aquellas que acceden a la propiedad modificada. Esto reduce drásticamente los renders innecesarios.'
        },
        {
          question: '¿Qué property wrapper usas para crear un Binding a una propiedad de un @Observable?',
          options: [
            '@Binding',
            '@ObservedObject',
            '@Bindable',
            '@Observable'
          ],
          correct: 2,
          explanation: '@Bindable es el wrapper necesario para crear Bindings ($viewModel.propiedad) de propiedades de un @Observable. Sin @Bindable, no puedes usar la sintaxis $ para crear Bindings hacia TextField, Toggle, etc. Es el reemplazo de @Binding cuando el origen es un @Observable.'
        },
        {
          question: '¿Cómo declaras el ViewModel en una View que lo crea y posee con @Observable?',
          options: [
            '@StateObject private var vm = MyViewModel()',
            '@ObservedObject private var vm = MyViewModel()',
            '@State private var vm = MyViewModel()',
            '@EnvironmentObject private var vm = MyViewModel()'
          ],
          correct: 2,
          explanation: 'Con @Observable (iOS 17+), usas @State para crear y poseer el ViewModel, reemplazando @StateObject. Si solo lo recibes como parámetro, basta con declararlo como var sin wrapper — SwiftUI detecta automáticamente qué propiedades lees. Para Bindings, usarías @Bindable.'
        },
        {
          question: '¿Qué ocurre si una View recibe un @Observable como parámetro sin property wrapper?',
          code: `struct DetailView: View {
    var viewModel: DetailViewModel // sin wrapper
    
    var body: some View {
        Text(viewModel.title)
    }
}`,
          options: [
            'Error de compilación — falta @ObservedObject o @StateObject',
            'SwiftUI rastrea automáticamente qué propiedades lee la View y solo la re-renderiza cuando esas propiedades cambian',
            'La View nunca se actualiza porque no hay observation',
            'Solo funciona si viewModel es @MainActor'
          ],
          correct: 1,
          explanation: 'Esta es una de las ventajas clave de @Observable: no necesitas ningún property wrapper cuando solo observas el objeto. SwiftUI intercepta el acceso a viewModel.title y registra esa dependencia automáticamente. Si title cambia, DetailView se re-renderiza. Si cambia otra propiedad que DetailView no lee, no se re-renderiza.'
        }
      ]
    }
  },

  {
    id: 'async-await',
    title: 'async/await y Swift Concurrency',
    icon: '⚡',
    summary: 'Concurrencia moderna en Swift. async/await es a Swift lo que coroutines son a Kotlin.',
    content: [
      {
        type: 'text',
        body: `<p>Swift Concurrency (iOS 15+) introduce <code>async/await</code>, Actors y structured concurrency — conceptos muy similares a las Kotlin Coroutines que ya conoces.</p>
        <h4>Comparación directa con Kotlin</h4>
        <ul>
          <li><code>suspend fun</code> ↔ <code>func ... async</code></li>
          <li><code>withContext(Dispatchers.IO)</code> ↔ No necesitas cambiar dispatcher; Swift lo gestiona</li>
          <li><code>launch { }</code> ↔ <code>Task { }</code></li>
          <li><code>async { }.await()</code> ↔ <code>async let x = ...; let value = try await x</code></li>
          <li><code>viewModelScope</code> ↔ <code>.task { }</code> modifier o <code>Task</code> en el ViewModel</li>
        </ul>
        <h4>Throws + async</h4>
        <p>En Swift, las funciones asíncronas que pueden fallar son <code>async throws</code>. Se llaman con <code>try await</code>.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// Función async — equivale a suspend fun en Kotlin
func fetchUser(id: Int) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\\(id)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// Llamar desde código async
func loadProfile() async {
    do {
        let user = try await fetchUser(id: 42) // espera sin bloquear
        updateUI(user)
    } catch {
        handleError(error)
    }
}

// async let: concurrencia paralela (equivale a async/await en Kotlin)
func loadDashboard() async throws {
    async let user = fetchUser(id: 42)          // arranca inmediatamente
    async let posts = fetchPosts(userId: 42)    // arranca en paralelo
    async let stats = fetchStats(userId: 42)    // también en paralelo

    // Espera a los tres y los desestructura
    let (loadedUser, loadedPosts, loadedStats) = try await (user, posts, stats)
    renderDashboard(user: loadedUser, posts: loadedPosts, stats: loadedStats)
}

// withCheckedContinuation — envolver APIs de callback legacy
func fetchUserLegacy(id: Int) async throws -> User {
    try await withCheckedThrowingContinuation { continuation in
        oldAPI.getUser(id: id) { result in
            switch result {
            case .success(let user): continuation.resume(returning: user)
            case .failure(let error): continuation.resume(throwing: error)
            }
        }
    }
}

// @MainActor: garantiza ejecución en main thread
@MainActor
func updateUI(user: User) {
    // Siempre en main thread, safe para actualizar UI
    nameLabel = user.name
}`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// En SwiftUI: .task modifier (equivale a LaunchedEffect en Compose)
struct UserView: View {
    @State private var user: User? = nil
    let userId: Int

    var body: some View {
        Group {
            if let user = user {
                UserDetail(user: user)
            } else {
                ProgressView()
            }
        }
        .task(id: userId) { // se re-ejecuta cuando userId cambia; se cancela al desaparecer
            user = try? await fetchUser(id: userId)
        }
    }
}

// En ViewModel: Task para lanzar trabajo async desde código síncrono
@Observable
class ProductViewModel {
    var products: [Product] = []
    private var loadTask: Task<Void, Never>?

    func load() {
        loadTask?.cancel() // cancela la carga anterior
        loadTask = Task { @MainActor in
            products = (try? await repository.fetchProducts()) ?? []
        }
    }

    deinit {
        loadTask?.cancel() // limpia al destruirse el ViewModel
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia principal entre async/await en Swift y en Kotlin Coroutines?',
          options: [
            'Swift async/await es más rápido porque usa GCD por debajo',
            'Son conceptualmente equivalentes (función suspendida, sin bloquear el thread), pero en Swift la concurrencia es parte del sistema de tipos — el compilador verifica el aislamiento de actores',
            'Kotlin async/await solo funciona en Android; Swift async/await también en macOS y Linux',
            'No hay diferencia — ambos compilan a exactamente el mismo bytecode'
          ],
          correct: 1,
          explanation: 'Conceptualmente son muy similares: funciones que pueden suspenderse sin bloquear el thread. La diferencia clave: Swift tiene el sistema de tipos de concurrencia estructurado (Swift Concurrency) con @Sendable, actors y verificación en compilación de data races. Kotlin tiene structured concurrency con coroutine scopes. Ambos resuelven el mismo problema de forma elegante.'
        },
        {
          question: '¿Qué hace withCheckedThrowingContinuation y cuándo se usa?',
          options: [
            'Verifica que una continuación no lanza excepciones en tiempo de ejecución',
            'Envuelve código basado en callbacks (APIs antiguas) en una función async — permite usar await con APIs que usan completion handlers',
            'Ejecuta una tarea en background con manejo de errores automático',
            'Es el equivalente Swift de async let para operaciones paralelas'
          ],
          correct: 1,
          explanation: 'withCheckedThrowingContinuation permite hacer el bridge entre el mundo callback (APIs antiguas de iOS, terceras partes) y async/await. El bloque recibe una continuación — llamas continuation.resume(returning:) para éxito o continuation.resume(throwing:) para error. La función async queda suspendida hasta que llames resume. Essential para migrar APIs legacy a async/await.'
        },
        {
          question: '¿Qué garantía da @MainActor en una función o clase?',
          options: [
            '@MainActor hace que la función sea más rápida al ejecutarse en el hilo principal optimizado',
            '@MainActor garantiza que el código se ejecuta en el main thread — el compilador verifica en tiempo de compilación que no se accede desde otro actor sin await',
            '@MainActor es equivalente a DispatchQueue.main.async en GCD',
            '@MainActor solo aplica a clases que heredan de ObservableObject'
          ],
          correct: 1,
          explanation: '@MainActor es un actor especial de Swift que representa el hilo principal. Marcar una clase o función con @MainActor garantiza (verificado por el compilador) que todo su código se ejecuta en el main thread. Las actualizaciones de UI en SwiftUI/UIKit deben estar en @MainActor. El compilador previene accesos erróneos desde otros actores sin await.'
        },
        {
          question: '¿Cómo se cancela una Task en Swift Concurrency?',
          options: [
            'task.stop() — método estándar para cancelar una Task inmediatamente',
            'El sistema cancela automáticamente todas las Tasks al cerrar la app',
            'Llamando task.cancel() y verificando Task.isCancelled dentro de la Task para responder a la cancelación de forma cooperativa',
            'Las Tasks no pueden cancelarse — se deben crear con timeouts para que expiren'
          ],
          correct: 2,
          explanation: 'La cancelación en Swift Concurrency es cooperativa: task.cancel() marca la Task como cancelada, pero el código dentro debe verificar Task.isCancelled o usar Task.checkCancellation() para responder. Las operaciones de red async y sleep de Swift ya verifican la cancelación automáticamente y lanzan CancellationError. Similar al modelo de Kotlin Coroutines.'
        },
        {
          question: '¿Para qué sirve async let en Swift?',
          options: [
            'Define una variable que se inicializa de forma perezosa (lazy) de forma asíncrona',
            'Lanza múltiples operaciones asíncronas en paralelo y permite await en cada una cuando se necesita el resultado',
            'Es el equivalente de @State pero para propiedades asíncronas',
            'async let es una sintaxis alternativa a Task { } sin diferencias funcionales'
          ],
          correct: 1,
          explanation: 'async let lanza múltiples tareas asíncronas en paralelo (structured concurrency). Sin async let: await fetchUser() + await fetchPosts() = secuencial. Con async let: async let user = fetchUser(); async let posts = fetchPosts(); let (u, p) = await (user, posts) — paralelo. Similar a async { } en Kotlin Coroutines con .await() al final.'
        },
        {
          question: '¿Cómo cancela automáticamente una Task en SwiftUI cuando la vista desaparece?',
          options: [
            'SwiftUI no puede cancelar Tasks — hay que hacerlo manualmente en onDisappear',
            'El modifier .task { } lanza una Task que se cancela automáticamente cuando la vista desaparece o cuando cambian sus dependencias',
            'Usando .onDisappear { Task.cancel() } — el único método oficial',
            'La cancelación automática solo funciona con @MainActor Tasks'
          ],
          correct: 1,
          explanation: '.task { } es el equivalente SwiftUI de LaunchedEffect en Compose. Lanza una Task al aparecer la vista y la cancela automáticamente al desaparecer. También puede recibir un valor de dependencia (.task(id: userId)) — si el valor cambia, cancela la Task anterior y lanza una nueva. Elimina la necesidad de onAppear/onDisappear manual para operaciones async.'
        }
      ]
    }
  },

  {
    id: 'task-taskgroup',
    title: 'Task y TaskGroup',
    icon: '🔀',
    summary: 'Concurrencia estructurada en Swift. Task para una coroutine, TaskGroup para trabajo paralelo dinámico.',
    content: [
      {
        type: 'text',
        body: `<p>Swift Concurrency es <strong>estructurada</strong>: las tareas tienen un alcance definido y se cancelan automáticamente cuando ese alcance termina. Esto previene fugas y garantiza limpieza.</p>
        <h4>Task</h4>
        <ul>
          <li><code>Task { }</code> — Concurrencia no-estructurada. Lanzar trabajo async desde código síncrono.</li>
          <li><code>Task(priority: .background) { }</code> — Con prioridad específica.</li>
          <li><code>Task.cancel()</code> — Solicita cancelación. <code>Task.isCancelled</code> para comprobar.</li>
          <li><code>try Task.checkCancellation()</code> — Lanza si fue cancelada.</li>
        </ul>
        <h4>TaskGroup</h4>
        <ul>
          <li><code>withTaskGroup(of:)</code> — Ejecuta tasks en paralelo y recoge resultados.</li>
          <li><code>withThrowingTaskGroup(of:)</code> — Versión que puede lanzar errores.</li>
          <li>Structured: si el grupo se cancela, todos los children se cancelan.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// Task — lanzar trabajo async desde contexto síncrono
class DataLoader {
    private var loadingTask: Task<Void, Never>?

    func startLoading() {
        loadingTask = Task {
            await loadData()
        }
    }

    func cancel() {
        loadingTask?.cancel()
    }

    private func loadData() async {
        var page = 0
        while !Task.isCancelled {
            await fetchPage(page)
            page += 1
            try? await Task.sleep(for: .seconds(5))
        }
    }
}

// withTaskGroup — paralelizar N tareas del mismo tipo
func fetchAllImages(ids: [Int]) async -> [Int: UIImage] {
    await withTaskGroup(of: (Int, UIImage?).self) { group in
        for id in ids {
            group.addTask { // cada una corre en paralelo
                let image = try? await downloadImage(id: id)
                return (id, image)
            }
        }
        // Recoge resultados en el orden que terminen
        var results: [Int: UIImage] = [:]
        for await (id, image) in group {
            if let image = image {
                results[id] = image
            }
        }
        return results
    }
}

// withThrowingTaskGroup — si cualquier task falla, cancela las demás
func loadRequiredData() async throws -> (User, [Post], Stats) {
    try await withThrowingTaskGroup(of: Never.self) { group in
        async let user = fetchUser(id: 42)
        async let posts = fetchPosts(userId: 42)
        async let stats = fetchStats(userId: 42)
        return try await (user, posts, stats)
    }
}

// Prioridades de Task
Task(priority: .userInitiated) { /* responde a acción del usuario */ }
Task(priority: .background) { /* trabajo en background */ }
Task(priority: .utility) { /* descarga, importación */ }`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué son los Actors en Swift y qué problema resuelven?',
          options: [
            'Son clases Swift optimizadas para operaciones de red con GCD',
            'Son tipos de referencia que el compilador garantiza que solo un thread accede a la vez — eliminan data races en tiempo de compilación',
            'Son protocolos que definen el comportamiento de objetos concurrentes',
            'Son equivalentes a los DispatchQueue serial en GCD pero con sintaxis Swift'
          ],
          correct: 1,
          explanation: 'Un Actor en Swift es un tipo de referencia (como class) con una garantía: el compilador asegura que solo un thread accede a sus propiedades y métodos a la vez. Elimina data races sin necesidad de locks manuales. El acceso a propiedades de un Actor desde fuera requiere await, señalando que puede suspenderse mientras espera el turno de acceso.'
        },
        {
          question: '¿Qué hace nonisolated en un método de un Actor?',
          options: [
            'Permite que el método sea llamado desde fuera del Actor sin await',
            'Marca el método como thread-safe y no-suspendible — no accede a estado del Actor, por lo que puede llamarse desde cualquier contexto sin necesitar await',
            'nonisolated desactiva la protección de datos del Actor para ese método',
            'Permite que el método acceda a datos de otros Actors directamente'
          ],
          correct: 1,
          explanation: 'nonisolated declara que ese método no accede a ningún estado del Actor — puede tener propiedades let inmutables o llamar solo a funciones globales. Al no necesitar el aislamiento del Actor, puede llamarse sin await desde cualquier contexto. Útil para conformar a protocolos que requieren métodos síncronos (Hashable, CustomStringConvertible).'
        },
        {
          question: '¿Cuándo usar withTaskGroup vs múltiples async let?',
          options: [
            'Son equivalentes — withTaskGroup solo es necesario cuando el número de tasks supera 5',
            'async let para un número fijo de tareas paralelas conocido en compilación; withTaskGroup cuando el número de tareas es dinámico (iterar sobre una lista de IDs)',
            'withTaskGroup tiene mejor rendimiento que async let en todos los casos',
            'async let no puede manejar errores; withTaskGroup sí — esa es la única diferencia'
          ],
          correct: 1,
          explanation: 'async let: excelente cuando sabes en compilación cuántas operaciones paralelas lanzas (async let user = ...; async let posts = ...). withTaskGroup: cuando el número de tareas depende de datos en runtime (ej: descargar imágenes para N items de una lista). TaskGroup las gestiona dinámicamente con group.addTask { } y for await result in group { }.'
        },
        {
          question: '¿Cómo se accede al estado de un Actor desde @MainActor?',
          options: [
            'Directamente — @MainActor tiene acceso privilegiado a todos los Actors',
            'Con await — el acceso a propiedades y métodos de otro Actor siempre requiere await desde cualquier contexto diferente',
            'Con Task.detached — para cambiar al contexto del Actor',
            'Los Actors no pueden compartir datos con @MainActor directamente'
          ],
          correct: 1,
          explanation: 'Cualquier acceso a un Actor desde un contexto diferente (incluido @MainActor) requiere await. El await señala que el código puede suspenderse brevemente esperando su turno para acceder al Actor. Si el Actor está ocupado, la coroutine se suspende sin bloquear el thread. Esto es lo que hace los Actors seguros — la serialización es automática y verificada por el compilador.'
        },
        {
          question: '¿Cuál es la diferencia entre Task { } y Task.detached { }?',
          options: [
            'Task.detached es más rápido porque no hereda el contexto del padre',
            'Task { } hereda el actor/contexto de la tarea que lo crea; Task.detached { } comienza completamente independiente sin heredar ningún contexto ni actor',
            'Task.detached no puede ser cancelada mientras que Task { } sí',
            'Son equivalentes — Task.detached es el nombre antiguo de Task { }'
          ],
          correct: 1,
          explanation: 'Task { } hereda el actor actual (si estás en @MainActor, el Task también corre en @MainActor). Task.detached { } no hereda nada — comienza sin actor, en un thread arbitrario. Útil cuando necesitas ejecutar trabajo genuinamente en background desde un contexto de @MainActor sin ejecutarlo en el main thread. Usar con cuidado: Task.detached no propaga cancelación del padre.'
        }
      ]
    }
  },

  {
    id: 'actors',
    title: 'Actors y @MainActor',
    icon: '🔒',
    summary: 'Tipos de referencia thread-safe. Actors protegen su estado con aislamiento. @MainActor garantiza el main thread.',
    content: [
      {
        type: 'text',
        body: `<p>Los <strong>Actors</strong> son tipos de referencia que garantizan acceso seguro a su estado interno desde múltiples concurrencias. Solo una tarea puede ejecutar código del actor a la vez.</p>
        <h4>Cómo funciona</h4>
        <ul>
          <li>Acceder a propiedades/métodos de un actor desde fuera requiere <code>await</code></li>
          <li>El compilador garantiza que no haya data races</li>
          <li><code>nonisolated</code> — Marca métodos que no necesitan el aislamiento del actor</li>
        </ul>
        <h4>@MainActor</h4>
        <p>Es un actor especial que representa el main thread. Marcar una clase/función con <code>@MainActor</code> garantiza que todo su código corra en el main thread — perfecto para ViewModels y UI updates.</p>
        <h4>Comparación con Kotlin</h4>
        <ul>
          <li>Actor en Swift ≈ <code>Mutex</code> + <code>withContext(Dispatchers.IO)</code> en Kotlin</li>
          <li><code>@MainActor</code> ≈ <code>withContext(Dispatchers.Main)</code></li>
          <li>La diferencia: Swift lo garantiza en compile-time</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// Actor — protege su estado de accesos concurrentes
actor ImageCache {
    private var cache: [URL: UIImage] = [:]

    func image(for url: URL) -> UIImage? {
        cache[url]
    }

    func store(_ image: UIImage, for url: URL) {
        cache[url] = image
    }

    func clear() {
        cache.removeAll()
    }

    // nonisolated: no accede al estado del actor
    nonisolated func cacheDirectory() -> URL {
        FileManager.default.temporaryDirectory
    }
}

// Usar el actor — requiere await desde fuera
let cache = ImageCache()

Task {
    // await para cada acceso al actor
    if let cached = await cache.image(for: url) {
        showImage(cached)
    } else {
        let image = try await downloadImage(from: url)
        await cache.store(image, for: url)
        showImage(image)
    }

    // nonisolated: sin await
    let dir = cache.cacheDirectory() // no necesita await
}

// @MainActor — ejecuta siempre en main thread
@MainActor
class UserViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false

    // Todo este código corre en main thread automáticamente
    func loadUsers() async {
        isLoading = true
        // Llamar código que no es @MainActor
        let loaded = await Task.detached(priority: .background) {
            try? await self.repository.fetchUsers() // background thread
        }.value
        users = loaded ?? []
        isLoading = false
    }
}

// Suspender el aislamiento temporal
@MainActor
class DownloadManager {
    func downloadAndProcess(url: URL) async throws -> ProcessedData {
        let rawData = try await URLSession.shared.data(from: url).0 // no bloquea el main thread (URLSession es seguro)
        // Para trabajo CPU-intensivo, salir del main thread:
        return await Task.detached(priority: .userInitiated) {
            processData(rawData) // background
        }.value
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué garantía proporciona un Actor en Swift sobre el acceso a sus propiedades?',
          options: [
            'Las propiedades del Actor son inmutables — no pueden cambiarse tras la inicialización',
            'El compilador garantiza que solo un contexto accede al Actor a la vez — protección automática contra data races sin locks manuales',
            'El Actor ejecuta todas sus operaciones en un thread dedicado de alta prioridad',
            'Las propiedades del Actor son copiadas (value semantics) en cada acceso externo'
          ],
          correct: 1,
          explanation: 'Un Actor tiene aislamiento de datos: el compilador garantiza que su estado interno solo es accesible por un contexto (coroutine) a la vez. Desde fuera, el acceso requiere await — el caller se suspende si el Actor está ocupado. Elimina la necesidad de DispatchQueue, locks, NSLock o cualquier mecanismo manual de sincronización.'
        },
        {
          question: '¿Qué error de compilación provoca este código?',
          code: `actor BankAccount {
    var balance: Double = 0.0

    func deposit(_ amount: Double) {
        balance += amount
    }
}

let account = BankAccount()
print(account.balance) // ← error de compilación`,
          options: [
            'balance no puede ser Double en un Actor, debe ser Int',
            'Actor property \'balance\' must be accessed with await cuando se accede desde fuera del Actor',
            'print() no puede llamarse con propiedades de Actor',
            'No hay error — este código compila correctamente'
          ],
          correct: 1,
          explanation: 'Acceder a account.balance desde fuera del Actor sin await es un error de compilación en Swift 5.5+. El compilador fuerza await account.balance para señalar que el acceso puede suspenderse. Dentro del Actor, el acceso es directo (sin await). Esta verificación en tiempo de compilación es lo que hace los Actors seguros por construcción.'
        },
        {
          question: '¿Para qué se usa @MainActor en un ViewModel de SwiftUI?',
          options: [
            'Para hacer que el ViewModel sea un Singleton accesible desde cualquier View',
            'Para garantizar que todas las actualizaciones de @Published y @Observable se publican en el main thread, donde SwiftUI las procesa para actualizar la UI',
            '@MainActor es obligatorio en todos los ViewModels de SwiftUI',
            'Para permitir que el ViewModel sea serializable con Codable'
          ],
          correct: 1,
          explanation: '@MainActor en el ViewModel garantiza que todas sus propiedades y métodos se ejecutan en el main thread. SwiftUI requiere que las actualizaciones de estado (@Published, @Observable) ocurran en el main thread. Con @MainActor, el compilador verifica esto. Desde un Actor de background puedes llamar await viewModel.updateUI() — se cambia automáticamente al main thread.'
        },
        {
          question: '¿Cómo hacer trabajo CPU-intensive desde un contexto @MainActor sin bloquear la UI?',
          options: [
            'Usar DispatchQueue.global().async { } dentro del @MainActor context',
            'Task.detached(priority: .userInitiated) { /* CPU work */ } — lanza una tarea no-aislada que no hereda @MainActor',
            'No es posible — @MainActor siempre bloquea el main thread para trabajo CPU',
            'await withCheckedContinuation { Thread(target: cpuWork).start() }'
          ],
          correct: 1,
          explanation: 'Task.detached { } no hereda el actor actual — se ejecuta en un thread arbitrario del pool de Swift Concurrency. Para trabajo CPU-intensive desde @MainActor: Task.detached(priority: .userInitiated) { let result = await heavyCPUWork(); await MainActor.run { self.result = result } }. Alternativa: await withTaskExecutorPreference(.globalConcurrent) { } en Swift 6.'
        },
        {
          question: '¿En qué se diferencia un Actor de una clase con DispatchQueue serial en GCD?',
          options: [
            'Los Actors son más rápidos porque evitan el overhead de DispatchQueue',
            'Los Actors tienen verificación en tiempo de compilación de aislamiento de datos; DispatchQueue serial es solo una convención runtime — el compilador no detecta accesos incorrectos',
            'Los Actors son value types; DispatchQueue es reference type',
            'DispatchQueue serial permite acceso concurrente a lecturas; Actor no'
          ],
          correct: 1,
          explanation: 'La diferencia crítica: con DispatchQueue serial, el compilador no detecta accesos al estado protegido desde el thread equivocado — es responsabilidad del programador. Con Actors, el compilador verifica en tiempo de compilación que toda propiedad del Actor solo se accede desde su contexto. Errores que con GCD serían bugs en producción, con Actors son errores de compilación.'
        }
      ]
    }
  },

  {
    id: 'combine',
    title: 'Combine Framework',
    icon: '🔗',
    summary: 'Framework reactivo de Apple. Publishers, Subscribers y Operators. El RxSwift oficial.',
    content: [
      {
        type: 'text',
        body: `<p><strong>Combine</strong> (iOS 13+) es el framework reactivo de Apple. Funciona con streams de valores (Publishers) que se transforman con operadores y se consumen con Subscribers. Es el equivalente a RxSwift/RxKotlin.</p>
        <h4>Conceptos clave</h4>
        <ul>
          <li><strong>Publisher</strong> — Emite valores a lo largo del tiempo. Puede emitir un completion (o error).</li>
          <li><strong>Subscriber</strong> — Consume los valores del Publisher.</li>
          <li><strong>Operator</strong> — Transforma los valores entre Publisher y Subscriber.</li>
          <li><strong>AnyCancellable</strong> — Token de suscripción. Cuando se desaloca, cancela la suscripción.</li>
        </ul>
        <h4>Combine vs async/await</h4>
        <ul>
          <li><strong>Combine:</strong> Ideal para streams continuos (@Published, NotificationCenter, URLSession) y cuando necesitas operadores como debounce, throttle, combineLatest.</li>
          <li><strong>async/await:</strong> Ideal para operaciones puntuales (una petición de red, una lectura de fichero).</li>
          <li>En proyectos nuevos iOS 17+: usa async/await + @Observable como base y Combine solo donde los operadores aporten valor.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `import Combine

// ── Publishers básicos ──────────────────────────────────
// Just: emite un valor y completa
let publisher = Just(42)
    .map { $0 * 2 }
    .sink { print($0) } // output: 84

// @Published como Publisher
class SearchViewModel: ObservableObject {
    @Published var query = ""
    @Published var results: [Product] = []
    private var cancellables = Set<AnyCancellable>() // ← guarda las suscripciones

    init() {
        // El patrón de búsqueda reactiva
        $query                           // Publisher<String, Never>
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .removeDuplicates()
            .filter { $0.count >= 2 }
            .flatMap { [weak self] query -> AnyPublisher<[Product], Never> in
                guard let self = self else { return Just([]).eraseToAnyPublisher() }
                return self.search(query: query)
            }
            .receive(on: DispatchQueue.main)
            .assign(to: &$results)       // ← assign to @Published property
    }

    private func search(query: String) -> AnyPublisher<[Product], Never> {
        URLSession.shared.dataTaskPublisher(for: buildURL(query: query))
            .map(\\.data)
            .decode(type: [Product].self, decoder: JSONDecoder())
            .replaceError(with: [])      // manejo de errores: reemplaza con vacío
            .eraseToAnyPublisher()
    }
}

// ── Operadores comunes ──────────────────────────────────
publishers.combineLatest(otherPublisher) { a, b in
    "\\(a) + \\(b)"
}

publishers.merge(with: anotherPublisher)

publisher
    .throttle(for: .seconds(1), scheduler: DispatchQueue.main, latest: true)
    .catch { _ in Just("fallback") }
    .retry(3)

// ── Sink vs Assign ──────────────────────────────────────
// sink: closure con valor y completion
publisher
    .sink(
        receiveCompletion: { completion in
            if case .failure(let error) = completion { handle(error) }
        },
        receiveValue: { value in process(value) }
    )
    .store(in: &cancellables) // ← guardar para que no se cancele inmediatamente

// assign: asignar directamente a una propiedad
publisher
    .assign(to: \\.name, on: self)
    .store(in: &cancellables)`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué es AnyCancellable y por qué debes guardarlo?',
          options: [
            'Es el tipo de retorno de todos los Publishers en Combine',
            'Es el token de suscripción — si no lo guardas en una variable, la suscripción se cancela inmediatamente al salir del ámbito',
            'Es un operador que cancela automáticamente un Publisher cuando hay un error',
            'Es el mecanismo para cancelar otros Publishers desde dentro de un operador'
          ],
          correct: 1,
          explanation: 'AnyCancellable es el token devuelto por .sink y .assign. Si no lo guardas (ej: .store(in: &cancellables)), se desaloca al salir del ámbito y la suscripción se cancela inmediatamente. Es un error común: el Publisher no emite valores porque la suscripción murió al instante.'
        },
        {
          question: '¿Cuál es la diferencia entre sink y assign?',
          options: [
            'sink es para Publishers síncronos; assign para asíncronos',
            'sink recibe un closure con el valor emitido; assign asigna directamente el valor a una propiedad de un objeto usando KeyPath',
            'sink gestiona automáticamente el ciclo de vida; assign requiere limpieza manual',
            'No hay diferencia — son alias del mismo método'
          ],
          correct: 1,
          explanation: 'sink(completion:indexPath:valueIndexPath:) te da un closure donde procesas cada valor. assign(to:on:) asigna directamente cada valor emitido a una propiedad vía KeyPath — sin closure. assign es más conciso pero sink es más flexible (lógica custom, side effects, logging). Ambos devuelven AnyCancellable que debes guardar.'
        },
        {
          question: '¿Qué hace .debounce(for:scheduler:) en un Publisher?',
          options: [
            'Limita la frecuencia de emisión a un máximo de valores por segundo',
            'Espera un tiempo sin nuevas emisiones antes de propagar el último valor — ideal para búsqueda reactiva donde no quieres una petición por cada tecla',
            'Reemite el último valor periódicamente mientras no lleguen valores nuevos',
            'Descarta valores duplicados consecutivos'
          ],
          correct: 1,
          explanation: 'debounce espera un intervalo de silencio (sin nuevos valores) antes de emitir el último valor recibido. Es esencial para búsqueda reactiva: el usuario escribe "Swift" → solo se hace la petición tras 300ms sin pulsaciones. Se combina con .removeDuplicates() para evitar peticiones idénticas.'
        },
        {
          question: '¿Cuándo usarías Combine en lugar de async/await en un proyecto iOS 17+?',
          options: [
            'Nunca — async/await reemplaza completamente Combine',
            'Para streams continuos de valores donde necesitas operadores como debounce, combineLatest, removeDuplicates o throttle',
            'Solo para compatibilidad con APIs de UIKit que no soportan async/await',
            'Combine es más rápido que async/await en todas las operaciones de red'
          ],
          correct: 1,
          explanation: 'async/await es ideal para operaciones puntuales (una petición, una lectura). Combine brilla con streams continuos: @Published como Publisher, búsqueda reactiva con debounce, combinar múltiples fuentes con combineLatest, throttle de eventos. En iOS 17+: usa async/await como base y Combine solo donde los operadores reactivos aporten valor real.'
        },
        {
          question: '¿Qué hace replaceError(with:) en este pipeline?',
          code: `URLSession.shared.dataTaskPublisher(for: url)
    .map(\\.data)
    .decode(type: [Product].self, decoder: JSONDecoder())
    .replaceError(with: [])`,
          options: [
            'Reintenta la petición hasta 3 veces y si falla devuelve []',
            'Captura cualquier error upstream y lo reemplaza con un valor por defecto [], convirtiendo el Failure a Never — el suscriptor nunca recibe un error',
            'Elimina los valores que no se pueden decodificar y los reemplaza por arrays vacíos',
            'Registra el error en consola y continúa el pipeline con []'
          ],
          correct: 1,
          explanation: 'replaceError(with:) captura cualquier error del Publisher upstream (error de red, error de decodificación) y lo reemplaza con el valor proporcionado. Esto cambia el tipo de error del Publisher a Never, lo que significa que el suscriptor nunca recibirá un completion con error. Es una forma simple de manejo de errores para casos donde prefieres un valor por defecto.'
        }
      ]
    }
  },

  {
    id: 'swiftdata',
    title: 'SwiftData',
    icon: '💾',
    summary: 'Persistencia nativa de Apple para SwiftUI (iOS 17+). Reemplaza Core Data con macros y @Query.',
    content: [
      {
        type: 'text',
        body: `<p><strong>SwiftData</strong> (iOS 17+) es el ORM moderno de Apple que reemplaza Core Data con una API declarativa y sintaxis de Swift nativa. Es el equivalente a Room en Android.</p>
        <h4>Componentes</h4>
        <ul>
          <li><code>@Model</code> — Macro que convierte una class en un modelo persistido (equivale a <code>@Entity</code> en Room)</li>
          <li><code>@Query</code> — Property wrapper en Views para fetch automático (se actualiza al cambiar datos)</li>
          <li><code>ModelContainer</code> — Punto de entrada a la base de datos (equivale a <code>@Database</code> en Room)</li>
          <li><code>ModelContext</code> — Sesión de trabajo: insert, delete, save (equivale al DAO)</li>
        </ul>
        <h4>Comparación Room vs SwiftData</h4>
        <ul>
          <li><code>@Entity</code> ↔ <code>@Model</code></li>
          <li><code>@Dao</code> ↔ <code>ModelContext</code></li>
          <li><code>@Database</code> ↔ <code>ModelContainer</code></li>
          <li><code>Flow&lt;List&gt;</code> ↔ <code>@Query</code></li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `import SwiftData

// 1. @Model — define la tabla/modelo
@Model
class Task {
    var title: String
    var isCompleted: Bool
    var createdAt: Date
    var priority: Int

    // Relaciones
    var project: Project?
    @Relationship(deleteRule: .cascade) var subtasks: [Subtask] = []

    init(title: String, priority: Int = 0) {
        self.title = title
        self.isCompleted = false
        self.createdAt = Date()
        self.priority = priority
    }
}

@Model
class Project {
    var name: String
    @Relationship(deleteRule: .cascade, inverse: \\Task.project) var tasks: [Task] = []

    init(name: String) { self.name = name }
}

// 2. ModelContainer — en el App entry point
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Task.self, Project.self]) // configura la DB
    }
}

// 3. @Query en Views — fetch reactivo
struct TaskListView: View {
    @Query(
        filter: #Predicate<Task> { !$0.isCompleted }, // filtro con Predicate
        sort: \\Task.createdAt,
        order: .reverse
    ) private var tasks: [Task] // se actualiza automáticamente al cambiar la DB

    @Environment(\\.modelContext) private var context // para insert/delete/save

    var body: some View {
        List {
            ForEach(tasks) { task in
                TaskRow(task: task)
                    .swipeActions {
                        Button(role: .destructive) { context.delete(task) } label: {
                            Label("Borrar", systemImage: "trash")
                        }
                    }
            }
        }
        .toolbar {
            Button("Añadir") { addTask() }
        }
    }

    private func addTask() {
        let task = Task(title: "Nueva tarea")
        context.insert(task)       // inserta en la DB
        try? context.save()        // persiste (opcional: auto-save disponible)
    }
}

// 4. Consultas avanzadas con #Predicate
@Query(filter: #Predicate<Task> {
    $0.priority > 1 && !$0.isCompleted
}) var urgentTasks: [Task]`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es el equivalente en SwiftData de @Entity y @Dao de Room?',
          options: [
            '@Entity y @DAO en SwiftData',
            '@Model y ModelContext',
            '@Table y @Repository',
            '@Schema y ModelContainer'
          ],
          correct: 1,
          explanation: '@Model es la macro que convierte una class en un modelo persistido (equivale a @Entity en Room). ModelContext es la sesión de trabajo para insert, delete, save y fetch (equivale al DAO). ModelContainer equivale a @Database y @Query equivale a Flow<List> en Room.'
        },
        {
          question: '¿Para qué sirve @Relationship(deleteRule: .cascade) en SwiftData?',
          options: [
            'Define una relación muchos-a-muchos entre modelos sin regla de borrado',
            'Establece que cuando el modelo padre se elimine, sus modelos hijos relacionados también se eliminen automáticamente en cascada',
            'Garantiza que la relación sea lazy-loaded para mejorar rendimiento',
            'Marca la relación como inmutable — los hijos no pueden modificarse independientemente'
          ],
          correct: 1,
          explanation: '@Relationship(deleteRule: .cascade) indica a SwiftData que los modelos hijos deben eliminarse cuando el padre se borra. Sin .cascade, los hijos quedarían huérfanos o el borrado del padre fallaría si hay relaciones obligatorias. Similar a ON DELETE CASCADE en SQL. Otras reglas: .deny (impide el borrado), .nullify (deja la referencia a nil).'
        },
        {
          question: '¿Qué hace @Query en una View de SwiftUI con SwiftData?',
          options: [
            'Ejecuta una consulta SQL raw y devuelve el resultado como array',
            'Es un property wrapper que hace fetch automático de modelos, se re-ejecuta cuando los datos cambian y actualiza la View reactivamente — similar a collectAsState() en Compose con Flow',
            '@Query es equivalente a @State pero para tipos Model',
            'Permite consultar datos de forma síncrona bloqueando el thread hasta obtener el resultado'
          ],
          correct: 1,
          explanation: '@Query hace fetch reactivo de modelos SwiftData: la View se actualiza automáticamente cuando los datos cambian (insert, delete, update). Se configura con #Predicate para filtros y sort para ordenación. Es similar a Flow<List> + collectAsState() en Android/Room — observas datos que se actualizan solos.'
        },
        {
          question: '¿Qué genera #Predicate en SwiftData?',
          code: `@Query(filter: #Predicate<Task> {
    $0.priority > 1 && !$0.isCompleted
}) var urgentTasks: [Task]`,
          options: [
            'Una closure de Swift que se ejecuta sobre el array de Tasks en memoria',
            'Un predicado type-safe que SwiftData traduce a SQL/Core Data para ejecutarse eficientemente en la base de datos — no carga todos los objetos en memoria',
            'Un filtro que solo funciona en el main thread por restricciones de SwiftUI',
            'Una macro que genera código de fetch request de Core Data automáticamente'
          ],
          correct: 1,
          explanation: '#Predicate{T} genera un Predicate<T> type-safe que SwiftData traduce a la consulta equivalente en la capa de persistencia (Core Data/SQLite). El filtrado ocurre en la base de datos, no en memoria — es mucho más eficiente que cargar todos los objetos y filtrar en Swift. La sintaxis es type-safe: el compilador verifica tipos de propiedades.'
        }
      ]
    }
  },

  {
    id: 'architecture-ios',
    title: 'Arquitectura: MVVM y TCA',
    icon: '🏛️',
    summary: 'MVVM con @Observable para la mayoría de casos. TCA (The Composable Architecture) para apps complejas.',
    content: [
      {
        type: 'text',
        body: `<p>Como en Android, en iOS la elección de arquitectura afecta la testeabilidad, mantenibilidad y escalabilidad de la app.</p>
        <h4>MVVM en SwiftUI (iOS 17+)</h4>
        <ul>
          <li><strong>Model</strong> — Structs de datos, sin lógica de UI</li>
          <li><strong>ViewModel</strong> — Clase <code>@Observable</code>. Contiene lógica de negocio, llama a servicios, expone estado.</li>
          <li><strong>View</strong> — Struct SwiftUI. Solo presenta datos, delega acciones al ViewModel.</li>
        </ul>
        <h4>TCA (The Composable Architecture)</h4>
        <p>Framework de Pointfree. Inspirado en Redux/Elm. Arquitectura unidireccional estricta con State, Action, Reducer y Store. Similar al patrón MVI que ya conoces de Android.</p>
        <ul>
          <li><strong>State</strong> — Struct inmutable con todo el estado de la feature</li>
          <li><strong>Action</strong> — Enum con todas las acciones posibles</li>
          <li><strong>Reducer</strong> — Función pura: (State, Action) → (State, Effect)</li>
          <li><strong>Store</strong> — Mantiene el State y despacha Actions</li>
        </ul>
        <h4>¿Cuándo usar TCA?</h4>
        <p>Apps complejas con mucho estado compartido, necesidad de testing exhaustivo de lógica, o equipo que ya usa TCA. Para la mayoría de proyectos, MVVM + @Observable es suficiente.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// ── MVVM con @Observable (iOS 17+) ─────────────────────

// Service/Repository — lógica de acceso a datos
protocol UserService {
    func fetchUsers() async throws -> [User]
    func deleteUser(id: UUID) async throws
}

// ViewModel
@Observable
@MainActor
class UserListViewModel {
    var users: [User] = []
    var isLoading = false
    var error: String? = nil

    private let userService: UserService

    init(userService: UserService = UserServiceImpl()) {
        self.userService = userService
    }

    func loadUsers() async {
        isLoading = true
        error = nil
        do {
            users = try await userService.fetchUsers()
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func deleteUser(_ user: User) async {
        do {
            try await userService.deleteUser(id: user.id)
            users.removeAll { $0.id == user.id }
        } catch {
            self.error = error.localizedDescription
        }
    }
}

// View — solo presentación
struct UserListView: View {
    @State private var viewModel = UserListViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading { ProgressView() }
            else { list }
        }
        .task { await viewModel.loadUsers() }
        .alert("Error", isPresented: Binding(
            get: { viewModel.error != nil },
            set: { if !$0 { viewModel.error = nil } }
        )) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
    }

    var list: some View {
        List(viewModel.users) { user in
            UserRow(user: user)
                .swipeActions {
                    Button(role: .destructive) {
                        Task { await viewModel.deleteUser(user) }
                    } label: { Label("Borrar", systemImage: "trash") }
                }
        }
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia principal entre MVVM con @Observable y el patrón MVI?',
          options: [
            'MVVM solo funciona con SwiftUI; MVI es para UIKit',
            'MVVM puede tener múltiples propiedades observables independientes; MVI usa un único State inmutable con toda la información de la pantalla y Actions que lo transforman',
            'MVI es más antiguo y está siendo reemplazado por MVVM con @Observable en iOS 17+',
            'Solo hay diferencias de nomenclatura, son arquitecturas equivalentes'
          ],
          correct: 1,
          explanation: 'MVVM: el ViewModel expone propiedades @Observable individuales (isLoading, users, error). MVI: un único State struct con todo lo necesario, Actions del usuario transforman el estado via un reducer. MVI (popularizado por TCA en iOS) ofrece estado predecible y facilita el testing — dado Action + State inicial → State resultante esperado.'
        },
        {
          question: '¿Qué ventaja aporta @Observable de iOS 17 respecto a ObservableObject?',
          options: [
            '@Observable permite herencia múltiple, que ObservableObject no permite',
            '@Observable usa fine-grained tracking — solo las Views que usan una propiedad específica se actualizan cuando esa propiedad cambia, reduciendo renders innecesarios',
            '@Observable es compatible con UIKit; ObservableObject solo con SwiftUI',
            '@Observable es más rápido porque usa el runtime de Objective-C directamente'
          ],
          correct: 1,
          explanation: 'Con ObservableObject + @Published: cualquier cambio en cualquier propiedad @Published notifica a todos los observers. Con @Observable: Swift rastrea exactamente qué propiedades lee cada View — solo esa View se re-renderiza cuando esa propiedad cambia. Menos renders innecesarios = mejor rendimiento, especialmente en listas con muchos items.'
        },
        {
          question: '¿Cómo se aplica el Principio de Responsabilidad Única (SRP) en el patrón MVVM de iOS?',
          options: [
            'El ViewModel es el único responsable de todo — lógica de negocio, datos y navegación',
            'View: solo presentación visual. ViewModel: lógica de presentación y estado. Service/Repository: acceso a datos y lógica de negocio',
            'SRP no aplica a MVVM — el patrón ya divide las responsabilidades por definición',
            'La View y el ViewModel deben estar en el mismo fichero para cohesión'
          ],
          correct: 1,
          explanation: 'En MVVM bien aplicado (SRP): View muestra datos y captura input del usuario — no toma decisiones. ViewModel transforma datos para la presentación, gestiona el estado de UI (isLoading, error) y delega lógica de negocio a Services/UseCases. Service/Repository: acceso a datos, lógica de negocio pura (sin SwiftUI). Cada capa es testeable independientemente.'
        },
        {
          question: '¿Cuándo considerarías usar TCA (The Composable Architecture) en lugar de MVVM simple?',
          options: [
            'Siempre — TCA es superior a MVVM en todos los casos de uso',
            'Cuando la app tiene estado compartido complejo entre muchas pantallas, side effects difíciles de gestionar, o necesita testing exhaustivo de estado + efectos de forma determinista',
            'TCA es solo para apps con más de 100 pantallas — no tiene sentido en apps pequeñas o medianas',
            'Cuando el equipo ya usa Redux en web — TCA es la versión iOS de Redux'
          ],
          correct: 1,
          explanation: 'TCA brilla en: (1) estado global complejo compartido entre múltiples features, (2) side effects (red, notificaciones) que necesitan testing preciso, (3) navegación programática compleja. Overhead: curva de aprendizaje alta, más boilerplate que MVVM simple. Para apps medianas con MVVM bien organizado y @Observable, TCA puede ser over-engineering.'
        },
        {
          question: '¿Por qué el ViewModel en iOS debe ser @MainActor?',
          options: [
            'SwiftUI exige que los ViewModels sean @MainActor para poder usar @State dentro de ellos',
            'Las propiedades observadas por SwiftUI deben actualizarse en el main thread — @MainActor garantiza esto en tiempo de compilación sin necesidad de DispatchQueue.main.async manual',
            '@MainActor mejora el rendimiento del ViewModel al usar el thread principal optimizado',
            'Solo es necesario si el ViewModel usa async/await — sin async, @MainActor no hace nada'
          ],
          correct: 1,
          explanation: 'SwiftUI actualiza la UI en el main thread. Si el ViewModel actualiza propiedades @Observable desde un background thread, puede causar crashes o comportamiento inesperado. @MainActor garantiza (compilador) que todo el código del ViewModel corre en el main thread. Para trabajo background: Task.detached { let data = await fetch(); await MainActor.run { self.data = data } }.'
        },
        {
          question: '¿Qué patrón de repositorio se recomienda en Clean Architecture iOS?',
          options: [
            'El ViewModel accede directamente a la API — simplifica la arquitectura',
            'Protocolo de repositorio en la capa Domain; implementación concreta en la capa Data — el ViewModel depende del protocolo, no de la implementación',
            'El repositorio es un Singleton global accesible desde cualquier parte',
            'No existe capa de repositorio en iOS — SwiftData hace innecesario el patrón'
          ],
          correct: 1,
          explanation: 'Mismo principio que en Android: protocolo UserRepository en Domain, implementación UserRepositoryImpl en Data. El ViewModel recibe UserRepository (protocolo) — no sabe si los datos vienen de URLSession, CoreData, SwiftData o caché. En tests, inyectas un MockUserRepository. SwiftData no elimina la necesidad del patrón — la implementación usaría SwiftData internamente.'
        }
      ]
    }
  },

  {
    id: 'viewmodifier-viewbuilder',
    title: 'Custom ViewModifier y ViewBuilder',
    icon: '🔧',
    summary: 'ViewModifier para encapsular estilos reutilizables. @ViewBuilder para funciones que retornan vistas condicionales.',
    content: [
      {
        type: 'text',
        body: `<p>Dos herramientas fundamentales para construir APIs de SwiftUI expresivas y reutilizables.</p>
        <h4>ViewModifier</h4>
        <p>Encapsula un conjunto de modificadores en un tipo reutilizable. Ideal para estilos de diseño de tu design system.</p>
        <h4>@ViewBuilder</h4>
        <p>Permite que una función/computed property retorne diferentes tipos de View según condiciones (como el body de cualquier View). Sin él, solo podrías retornar un tipo concreto.</p>
        <h4>@resultBuilder</h4>
        <p>La tecnología subyacente de <code>@ViewBuilder</code>. Permite DSLs en Swift. SwiftUI está construido enteramente sobre result builders.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// Custom ViewModifier
struct PrimaryButtonStyle: ViewModifier {
    let isLoading: Bool

    func body(content: Content) -> some View {
        content
            .font(.headline)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(isLoading ? Color.gray : Color.blue)
            .cornerRadius(12)
            .opacity(isLoading ? 0.7 : 1)
            .overlay {
                if isLoading {
                    ProgressView().tint(.white)
                }
            }
    }
}

// Extension para uso limpio
extension View {
    func primaryButtonStyle(isLoading: Bool = false) -> some View {
        modifier(PrimaryButtonStyle(isLoading: isLoading))
    }
}

// Uso
Button("Iniciar sesión") { login() }
    .primaryButtonStyle(isLoading: isLoading)

// ── @ViewBuilder ──────────────────────────────────────

// Sin @ViewBuilder no puedes tener if/else en funciones que retornan View
@ViewBuilder
func statusBadge(for status: UserStatus) -> some View {
    switch status {
    case .active:
        HStack {
            Circle().fill(.green).frame(width: 8, height: 8)
            Text("Activo").foregroundStyle(.green)
        }
    case .inactive:
        Text("Inactivo").foregroundStyle(.secondary)
    case .banned:
        Label("Bloqueado", systemImage: "xmark.shield")
            .foregroundStyle(.red)
    }
}

// Contenedores genéricos con @ViewBuilder
struct Card<Header: View, Content: View>: View {
    @ViewBuilder let header: () -> Header
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header()
                .padding()
                .background(.gray.opacity(0.1))
            content()
                .padding()
        }
        .background(.background)
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

// Uso del contenedor genérico
Card {
    Text("Usuarios").font(.headline)
} content: {
    ForEach(users) { UserRow(user: $0) }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Por qué es buena práctica crear una extensión de View al definir un ViewModifier?',
          options: [
            'Porque el ViewModifier no funciona sin la extensión',
            'Para permitir un uso más limpio y expresivo: .primaryButtonStyle() en lugar de .modifier(PrimaryButtonStyle())',
            'Porque Swift no soporta la función .modifier() directamente',
            'Para mejorar el rendimiento de la compilación de SwiftUI'
          ],
          correct: 1,
          explanation: 'Crear una extensión extension View { func primaryButtonStyle(...) -> some View { modifier(PrimaryButtonStyle(...)) } } te permite usar .primaryButtonStyle() como un modifier más del sistema — mucho más limpio que .modifier(PrimaryButtonStyle()). Sigues la misma convención que .bold(), .font(), .padding() que Apple define con ViewModifier + extensión.'
        },
        {
          question: '¿Qué problema resuelve @ViewBuilder en una función que retorna View?',
          options: [
            'Hace que la View se re-renderice más rápido al compilar el body en tiempo de compilación',
            'Permite usar if/else y switch dentro de la función para retornar diferentes tipos de View sin que el compilador rechace la firma por tipo de retorno ambiguo',
            '@ViewBuilder permite que una función retorne múltiples Views simultáneamente como un array',
            'Es obligatorio en todas las funciones que retornan some View en SwiftUI'
          ],
          correct: 1,
          explanation: 'Sin @ViewBuilder, una función func badge(for status:) -> some View no puede retornar Text en un caso y HStack en otro — el compilador exige un tipo concreto de retorno. @ViewBuilder (un @resultBuilder) transforma los if/switch en TupleView o _ConditionalContent, permitiendo retornar tipos diferentes en cada rama. Es lo que permite el body de cualquier View usar if/switch.'
        },
        {
          question: '¿Qué es @resultBuilder y cómo se relaciona con @ViewBuilder?',
          options: [
            '@resultBuilder es un protocolo que @ViewBuilder implementa para definir layouts',
            '@resultBuilder es la tecnología subyacente — @ViewBuilder es simplemente un @resultBuilder especializado en construir árboles de Views mediante transformación de DSL',
            '@resultBuilder es un mecanismo de caching de Views; @ViewBuilder es su implementación para listas',
            'Son conceptos independientes — @resultBuilder se usa en Concurrencia y @ViewBuilder en UI'
          ],
          correct: 1,
          explanation: '@resultBuilder es la tecnología de Swift que permite crear DSLs (Domain Specific Languages). Transforma bloques de código (if, for, switch) en valores compuestos. @ViewBuilder es un @resultBuilder específico de SwiftUI que transforma el código del body en un árbol de Views. SwiftUI está construido enteramente sobre result builders — no solo @ViewBuilder.'
        },
        {
          question: '¿Qué ventaja tiene un contenedor genérico con @ViewBuilder closures?',
          code: `struct Card<Header: View, Content: View>: View {
    @ViewBuilder let header: () -> Header
    @ViewBuilder let content: () -> Content
}`,
          options: [
            'Permite usar Core Data dentro del contenedor',
            'El contenedor acepta cualquier tipo de View en sus slots (header, content) sin sacrificar el tipado estático — el compilador conoce los tipos reales para optimización',
            'Oculta los tipos internos de View para reducir el tamaño del binario',
            'Es la única forma de pasar Views como parámetros en SwiftUI'
          ],
          correct: 1,
          explanation: 'Los genéricos <Header: View, Content: View> permiten que el contenedor Card acepte cualquier tipo de View sin perder tipado estático — el compilador conoce los tipos concretos y puede optimizar. @ViewBuilder en los closures permite if/switch dentro de cada slot. Este patrón es el que usa VStack { }, HStack { }, y todos los contenedores de SwiftUI.'
        }
      ]
    }
  },

  {
    id: 'preferencekey-geometryreader',
    title: 'PreferenceKey y GeometryReader',
    icon: '📏',
    summary: 'GeometryReader para dimensiones y posición. PreferenceKey para comunicación de hijo a padre.',
    content: [
      {
        type: 'text',
        body: `<p>Dos herramientas para casos donde el sistema de layout estándar no es suficiente.</p>
        <h4>GeometryReader</h4>
        <p>Proporciona el tamaño y la posición de su contenedor. Úsalo con moderación — puede complicar el layout y causar ciclos. Preferir <code>.containerRelativeFrame</code> o <code>.frame(in:)</code> en iOS 17+.</p>
        <h4>PreferenceKey</h4>
        <p>Mecanismo para que Views hijas comuniquen valores a sus ancestros. Flujo inverso al de los modifiers (que van de padre a hijo). Casos de uso: sticky headers, medir alturas de hijos, tab bar personalizada.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `// GeometryReader — conocer tamaño del contenedor
struct AdaptiveCard: View {
    var body: some View {
        GeometryReader { proxy in
            let width = proxy.size.width
            let isWide = width > 400

            HStack {
                if isWide {
                    // Layout horizontal para pantallas anchas
                    thumbnailView
                    detailView
                } else {
                    // Layout vertical para pantallas estrechas
                    VStack {
                        thumbnailView
                        detailView
                    }
                }
            }
        }
        .frame(height: 200) // siempre da un frame cuando uses GeometryReader
    }
}

// Posición en coordenadas globales
struct PositionTracker: View {
    @State private var position: CGPoint = .zero

    var body: some View {
        Circle()
            .frame(width: 50, height: 50)
            .background(
                GeometryReader { proxy in
                    Color.clear.onAppear {
                        position = proxy.frame(in: .global).origin
                    }
                }
            )
    }
}

// ── PreferenceKey — hijo comunica al padre ─────────

// 1. Define la PreferenceKey
struct HeightPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue()) // toma la altura máxima
    }
}

// 2. El hijo reporta su altura
struct MeasuredView: View {
    var body: some View {
        Text("Mídeme")
            .padding()
            .background(
                GeometryReader { proxy in
                    Color.clear.preference(
                        key: HeightPreferenceKey.self,
                        value: proxy.size.height
                    )
                }
            )
    }
}

// 3. El padre recibe el valor
struct ParentView: View {
    @State private var childHeight: CGFloat = 0

    var body: some View {
        VStack {
            MeasuredView()
            Text("Altura del hijo: \\(childHeight, specifier: "%.0f")pt")
        }
        .onPreferenceChange(HeightPreferenceKey.self) { height in
            childHeight = height
        }
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué proporciona GeometryReader y para qué se usa principalmente?',
          options: [
            'Proporciona el tamaño y posición del contenedor donde se encuentra, permitiendo layouts adaptativos basados en el espacio disponible',
            'Reemplaza completamente a VStack y HStack en iOS 17+ para layouts complejos',
            'Es un property wrapper que observa cambios en el frame de la View',
            'Conecta automáticamente datos entre Views padre e hijo sin necesidad de @Binding'
          ],
          correct: 0,
          explanation: 'GeometryReader expone un GeometryProxy con size y frame del contenedor. Se usa para layouts que necesitan adaptarse al espacio disponible (ej: landscape vs portrait, diferentes tamaños de pantalla). Sin embargo, para casos simples, iOS 17+ ofrece .containerRelativeFrame como alternativa más ligera que evita los problemas de layout que GeometryReader puede causar, como ciclos de layout o tamaños inesperados.'
        },
        {
          question: '¿Qué función tiene el método reduce en un PreferenceKey?',
          code: `struct HeightPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}`,
          options: [
            'Fusiona los valores de múltiples hijos que reportan la misma PreferenceKey, combinándolos según la lógica definida (aquí, la altura máxima)',
            'Reduce el número de renders al cachear el último valor enviado',
            'Compara el nuevo valor con el anterior y solo notifica si hay cambios significativos',
            'Redimensiona el contenedor padre para ajustarse al valor más grande recibido'
          ],
          correct: 0,
          explanation: 'reduce(value:nextValue:) es el método que PreferenceKey usa para combinar valores cuando múltiples hijos reportan la misma clave. SwiftUI llama a reduce por cada valor recibido, permitiendo combinar todos en uno solo. En el ejemplo, se usa max() para obtener la altura máxima entre todos los hijos. defaultValue es el valor inicial antes de recibir cualquier preferencia, y reduce debe manejar correctamente la acumulación.'
        },
        {
          question: '¿Cómo logra PreferenceKey la comunicación de hijo a padre en SwiftUI?',
          options: [
            'El hijo inyecta un objeto en el Environment y el padre lo recibe mediante @Environment',
            'El hijo usa .preference(key:value:) para enviar datos y el padre los recibe con .onPreferenceChange',
            'El padre pasa un Closure al hijo y el hijo lo ejecuta con los datos',
            'SwiftUI no permite comunicación directa de hijo a padre sin @Binding'
          ],
          correct: 1,
          explanation: 'PreferenceKey es el mecanismo oficial para comunicación hijo→padre en SwiftUI: el hijo llama a .preference(key: HeightPreferenceKey.self, value: altura) y el padre escucha con .onPreferenceChange(HeightPreferenceKey.self) { value in ... }. Esto permite que hijos reporten sus dimensiones o posiciones a ancestros, útil para sticky headers, tab bars personalizadas o medir alturas dinámicas.'
        },
        {
          question: '¿Qué alternativa introdujo iOS 17+ para reemplazar GeometryReader en casos simples de layout responsivo?',
          options: [
            'AdaptiveLayout — un contenedor que ajusta automáticamente la disposición de sus hijos',
            '.containerRelativeFrame — un modifier que divide el espacio disponible en partes iguales sin necesidad de GeometryReader',
            'FlexibleFrame — un PropertyWrapper para definir tamaños flexibles',
            'iOS 17 eliminó GeometryReader y solo permite .containerRelativeFrame'
          ],
          correct: 1,
          explanation: '.containerRelativeFrame(_:count:span:spacing:) es un modifier de iOS 17+ que permite layouts responsivos sin GeometryReader. Ejemplo: .containerRelativeFrame(.horizontal, count: 3, span: 2, spacing: 8) hace que la View ocupe 2 de 3 columnas del contenedor. Es más ligero, evita los problemas de ciclos de GeometryReader, y es suficiente para la mayoría de casos de layout adaptativo.'
        }
      ]
    }
  },

  {
    id: 'animation',
    title: 'Animación y Transitions',
    icon: '✨',
    summary: 'withAnimation para animaciones implícitas, .animation() para explícitas, .transition() para entradas y salidas.',
    content: [
      {
        type: 'text',
        body: `<p>SwiftUI tiene un sistema de animación potente e integrado. Las animaciones son simplemente la interpolación de valores de estado a lo largo del tiempo.</p>
        <h4>Tipos de animación</h4>
        <ul>
          <li><strong>Implícita</strong> — <code>withAnimation { estado = nuevo }</code> anima todos los cambios dentro del bloque.</li>
          <li><strong>Explícita</strong> — <code>.animation(.spring(), value: valorObservado)</code> anima solo cuando ese valor cambia.</li>
        </ul>
        <h4>Curves/Timing</h4>
        <ul>
          <li><code>.easeInOut</code>, <code>.easeIn</code>, <code>.easeOut</code>, <code>.linear</code></li>
          <li><code>.spring()</code>, <code>.spring(duration:bounce:)</code> — iOS 17+</li>
          <li><code>.bouncy</code>, <code>.smooth</code> — iOS 17+ presets</li>
        </ul>
        <h4>Transitions</h4>
        <p>Definen cómo aparece/desaparece una View del árbol. Se combinan con <code>.combined(with:)</code> y se asimetrían con <code>.asymmetric(insertion:removal:)</code>.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `struct AnimationExamples: View {
    @State private var isExpanded = false
    @State private var scale = 1.0
    @State private var rotation = 0.0
    @State private var showBadge = false

    var body: some View {
        VStack(spacing: 30) {

            // withAnimation — implícita
            Button("Toggle") {
                withAnimation(.spring(duration: 0.4, bounce: 0.3)) {
                    isExpanded.toggle()
                }
            }

            if isExpanded {
                RoundedRectangle(cornerRadius: 12)
                    .fill(.blue)
                    .frame(height: 100)
                    .transition(.asymmetric(
                        insertion: .scale.combined(with: .opacity),
                        removal: .slide
                    ))
            }

            // .animation() — explícita (solo anima cuando 'scale' cambia)
            Circle()
                .fill(.orange)
                .frame(width: 80, height: 80)
                .scaleEffect(scale)
                .animation(.bouncy, value: scale)
                .onTapGesture { scale = scale == 1 ? 1.5 : 1 }

            // Rotación continua
            Image(systemName: "gear")
                .font(.largeTitle)
                .rotationEffect(.degrees(rotation))
                .animation(.linear(duration: 2).repeatForever(autoreverses: false), value: rotation)
                .onAppear { rotation = 360 }

            // matchedGeometryEffect — la animación más espectacular
            ZStack {
                if !isExpanded {
                    Circle()
                        .fill(.purple)
                        .frame(width: 50, height: 50)
                        .matchedGeometryEffect(id: "hero", in: heroNamespace)
                }
                if isExpanded {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.purple)
                        .frame(height: 200)
                        .matchedGeometryEffect(id: "hero", in: heroNamespace)
                }
            }
        }
        .padding()
    }

    @Namespace private var heroNamespace
}

// Animatable: animar propiedades personalizadas
struct ProgressArc: Shape, Animatable {
    var progress: Double // 0.0 - 1.0
    var animatableData: Double { // qué propiedad animar
        get { progress }
        set { progress = newValue }
    }

    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.addArc(center: CGPoint(x: rect.midX, y: rect.midY),
                    radius: rect.width / 2,
                    startAngle: .degrees(-90),
                    endAngle: .degrees(-90 + 360 * progress),
                    clockwise: false)
        return path
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia entre withAnimation { } y .animation(value:) { } en SwiftUI?',
          options: [
            'Son equivalentes — ambos producen el mismo resultado y se usan indistintamente',
            'withAnimation { } anima todos los cambios de estado dentro del bloque; .animation(.spring(), value:) anima el modifier solo cuando esa variable específica cambia',
            'withAnimation solo funciona en iOS 16+; .animation(value:) en iOS 15+',
            'withAnimation es para animaciones explícitas de Views; .animation(value:) es para animaciones implícitas'
          ],
          correct: 1,
          explanation: 'withAnimation { state = newValue } es animación implícita: todos los cambios de estado dentro del bloque se animan automáticamente en la siguiente renderización. .animation(.spring(), value: scale) es explícita: anima el modifier (scaleEffect, opacity, etc.) únicamente cuando el valor observado especificado en value: cambia. withAnimation es mejor para animar múltiples propiedades simultáneamente; .animation(value:) para animar efectos visuales ligados a un valor concreto.'
        },
        {
          question: '¿Qué se necesita para crear una animación "hero" (shared element transition) con matchedGeometryEffect?',
          options: [
            '.matchedGeometryEffect(id:in:) y un @Namespace — ambas Views comparten el mismo id y namespace, y SwiftUI interpola automáticamente posición, tamaño y forma',
            '.heroTransition(id:in:) y un HeroNamespace — son modifiers dedicados de iOS 17+',
            '.sharedElement(id:namespace:) y un @SharedNamespace',
            'No hay soporte nativo — debes implementarlo manualmente con GeometryReader y animaciones personalizadas'
          ],
          correct: 0,
          explanation: 'matchedGeometryEffect(id: "hero", in: heroNamespace) permite transiciones compartidas entre dos Views que representan el mismo elemento conceptual. Con @Namespace var heroNamespace, declaras un espacio de nombres. Cuando una View aparece y otra desaparece (usando if/else), SwiftUI interpola automáticamente posición, tamaño, forma y otros parámetros visuales, creando una transición fluida. Es la versión SwiftUI de las shared element transitions de Android.'
        },
        {
          question: '¿Para qué sirve .asymmetric(insertion:removal:) en las transiciones?',
          code: `.transition(.asymmetric(
    insertion: .scale.combined(with: .opacity),
    removal: .slide
))`,
          options: [
            'Define animaciones diferentes para la entrada y la salida de una View, permitiendo que aparezca escalando con opacidad y desaparezca deslizándose',
            'Hace que la transición sea asíncrona para mejorar el rendimiento en animaciones complejas',
            'Permite que la animación solo se ejecute en dispositivos con pantallas ProMotion',
            'Combina dos transiciones asimétricas en una sola animación simétrica'
          ],
          correct: 0,
          explanation: '.asymmetric(insertion:removal:) permite personalizar la transición de entrada (cuando la View aparece) y la de salida (cuando desaparece) de forma independiente. En el ejemplo: insertion usa scale + opacity, removal usa slide. Sin .asymmetric, la misma transición se aplica en ambas direcciones. .combined(with:) permite combinar múltiples transiciones en una sola (como scale y opacity simultáneamente).'
        },
        {
          question: '¿Qué protocolo permite animar propiedades personalizadas en una Shape?',
          code: `struct ProgressArc: Shape, ________ {
    var progress: Double
    var animatableData: Double {
        get { progress }
        set { progress = newValue }
    }
}`,
          options: [
            'AnimatableShape',
            'Animatable',
            'ProgressAnimatable',
            'AnimatedShape'
          ],
          correct: 1,
          explanation: 'El protocolo Animatable requiere implementar animatableData: el tipo de dato que SwiftUI interpolará durante la animación. Cuando progress cambia de 0.0 a 1.0 dentro de withAnimation, SwiftUI llama repetidamente animatableData con valores intermedios (0.0, 0.1, 0.2... 1.0) y redibuja la Shape en cada paso. Esto permite animar cualquier propiedad, no solo las predefinidas como scaleEffect u opacity.'
        },
        {
          question: '¿Cuál es la ventaja de los presets .bouncy y .smooth introducidos en iOS 17+?',
          options: [
            'Son presets de animación spring con valores por defecto optimizados: .bouncy para animaciones con rebote natural y .smooth para transiciones suaves sin rebote',
            'Son más rápidos que los presets anteriores porque usan animaciones basadas en GPU',
            '.bouncy y .smooth solo funcionan en dispositivos con iOS 17+ y reemplazan completamente a .spring() y .easeInOut',
            'No hay diferencia con .spring() — son solo alias para mantener consistencia de nombres'
          ],
          correct: 0,
          explanation: 'iOS 17+ introdujo .bouncy, .smooth y .snappy como presets que encapsulan valores de spring animation optimizados. .bouncy tiene un rebote marcado (bounce ≈ 0.3) ideal para animaciones llamativas. .smooth no tiene rebote, para transiciones elegantes. .snappy es rápida con poco rebote. Internamente son .spring(duration:bounce:) con valores predefinidos. Cada uno elimina la necesidad de ajustar manualmente duración y bounce.'
        }
      ]
    }
  },

  {
    id: 'testing-ios',
    title: 'Testing en iOS',
    icon: '🧪',
    summary: 'XCTest clásico, Swift Testing moderno con @Test y #expect, y UI Testing con XCUITest.',
    content: [
      {
        type: 'text',
        body: `<p>iOS tiene dos frameworks de testing: <strong>XCTest</strong> (el clásico) y el nuevo <strong>Swift Testing</strong> (iOS 17+, Xcode 16+) que usa macros modernas.</p>
        <h4>Swift Testing vs XCTest</h4>
        <ul>
          <li><code>@Test</code> — Marca una función como test (sin necesidad de heredar de XCTestCase)</li>
          <li><code>@Suite</code> — Agrupa tests relacionados</li>
          <li><code>#expect(condition)</code> — Reemplaza XCTAssert*. Más legible, mejor mensajes de error.</li>
          <li><code>#require(optional)</code> — Desenvuelve optional o falla el test</li>
          <li>Soporta <code>async/throws</code> nativamente en las funciones de test</li>
          <li>Tests en paralelo por defecto</li>
        </ul>
        <h4>Testing de ViewModels con async/await</h4>
        <p>Con Swift Concurrency, testear código async es natural: las funciones de test pueden ser <code>async throws</code> directamente.</p>`
      },
      {
        type: 'code',
        lang: 'swift',
        code: `import Testing
import XCTest

// ── Swift Testing (moderno, iOS 17+) ─────────────────────

@Suite("UserViewModel Tests")
struct UserViewModelTests {

    // Mock del servicio
    actor MockUserService: UserService {
        var users: [User] = [User(name: "Ana"), User(name: "Carlos")]
        var shouldFail = false

        func fetchUsers() async throws -> [User] {
            if shouldFail { throw URLError(.notConnectedToInternet) }
            return users
        }

        func deleteUser(id: UUID) async throws {
            users.removeAll { $0.id == id }
        }
    }

    @Test("Load users successfully")
    @MainActor
    func testLoadUsers() async throws {
        let service = MockUserService()
        let viewModel = UserListViewModel(userService: service)

        await viewModel.loadUsers()

        #expect(viewModel.users.count == 2)
        #expect(viewModel.isLoading == false)
        #expect(viewModel.error == nil)
    }

    @Test("Handle network error")
    @MainActor
    func testNetworkError() async throws {
        let service = MockUserService()
        await service.setShouldFail(true)  // actor: await necesario
        let viewModel = UserListViewModel(userService: service)

        await viewModel.loadUsers()

        #expect(viewModel.error != nil)
        #expect(viewModel.users.isEmpty)
    }

    @Test("Delete user removes from list")
    @MainActor
    func testDeleteUser() async throws {
        let service = MockUserService()
        let viewModel = UserListViewModel(userService: service)
        await viewModel.loadUsers()

        let userToDelete = try #require(viewModel.users.first) // falla si es nil

        await viewModel.deleteUser(userToDelete)

        #expect(!viewModel.users.contains { $0.id == userToDelete.id })
    }

    // Tests parametrizados
    @Test("Search filters correctly", arguments: [
        ("Ana", 1),
        ("a", 2), // matches Ana y Carlos
        ("xyz", 0)
    ])
    func testSearch(query: String, expectedCount: Int) async {
        let viewModel = SearchViewModel()
        viewModel.query = query
        try? await Task.sleep(for: .milliseconds(400)) // espera debounce
        #expect(viewModel.results.count == expectedCount)
    }
}

// ── XCTest (compatible iOS 13+) ──────────────────────────

class UserViewModelXCTest: XCTestCase {

    @MainActor
    func testLoadUsersLegacy() async throws {
        let service = MockUserService()
        let viewModel = UserListViewModel(userService: service)

        await viewModel.loadUsers()

        XCTAssertEqual(viewModel.users.count, 2)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }
}

// ── UI Testing con XCUITest ──────────────────────────────

class UserListUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launchArguments = ["--uitesting"] // flag para usar mocks en la app
        app.launch()
    }

    func testUserListDisplayed() {
        // Navegar a la lista
        app.tabBars.buttons["Usuarios"].tap()

        // Verificar que se muestran usuarios
        XCTAssertTrue(app.staticTexts["Ana"].exists)
        XCTAssertTrue(app.staticTexts["Carlos"].exists)
    }

    func testDeleteUser() {
        app.tabBars.buttons["Usuarios"].tap()
        let cell = app.cells.element(boundBy: 0)
        cell.swipeLeft()
        app.buttons["Eliminar"].tap()
        XCTAssertFalse(app.cells.element(boundBy: 0).staticTexts["Ana"].exists)
    }
}`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la principal ventaja de Swift Testing (iOS 17+) sobre XCTest clásico?',
          options: [
            'Swift Testing es 10x más rápido que XCTest al ejecutar tests en GPU',
            'Swift Testing usa macros (@Test, @Suite) sin necesidad de heredar de XCTestCase, tiene #expect/#require más legibles, y soporta async/throws nativamente',
            'Swift Testing solo funciona con SwiftUI; XCTest funciona con UIKit y SwiftUI',
            'Swift Testing es un wrapper de XCTest con una sintaxis más moderna, pero funcionalmente equivalente'
          ],
          correct: 1,
          explanation: 'Swift Testing (iOS 17+, Xcode 16+) es un framework independiente de XCTest. Ventajas: @Test/@Suite macros (sin herencia), #expect(condición) con mensajes de error automáticos más claros que XCTAssert*, #require(optional) que falla limpiamente si es nil, soporte nativo de async/throws en funciones de test, ejecución paralela por defecto, y tests parametrizados con arguments:. No es un wrapper — es un framework nuevo diseñado para el Swift moderno.'
        },
        {
          question: '¿Qué hace #require en Swift Testing y en qué se diferencia de #expect?',
          options: [
            'Son equivalentes — ambos verifican condiciones y fallan si no se cumplen',
            '#expect verifica una condición y continúa si falla (fail); #require desempaqueta un optional o falla el test inmediatamente, interrumpiendo la ejecución',
            '#require solo funciona con valores booleanos; #expect funciona con cualquier tipo',
            '#require es para setUp de tests; #expect para las aserciones principales'
          ],
          correct: 1,
          explanation: '#expect(condición) registra un fallo si la condición es false pero CONTINÚA la ejecución del test — útil para múltiples verificaciones en un mismo test. #require(optional) desempaqueta el valor o FALLA EL TEST INMEDIATAMENTE — útil para valores que deben existir para que el resto del test tenga sentido (ej: desempaquetar un elemento antes de interactuar con él). #require asegura que no se ejecuten más líneas si el requisito no se cumple.'
        },
        {
          question: '¿Cómo se define un test parametrizado en Swift Testing?',
          code: `@Test("Search filters", arguments: [
    ("Ana", 1),
    ("a", 2),
    ("xyz", 0)
])
func testSearch(query: String, expectedCount: Int) async {
    let vm = SearchViewModel()
    vm.query = query
    try? await Task.sleep(for: .milliseconds(400))
    #expect(vm.results.count == expectedCount)
}`,
          options: [
            'Se usa un bucle for dentro de @Test para iterar sobre los argumentos manualmente',
            'Se pasa un array de tuplas al parámetro arguments: de @Test y el framework ejecuta automáticamente el test una vez por cada juego de argumentos, reportando resultados individuales',
            'Los tests parametrizados solo existen en XCTest con @parametrizedTest',
            'Se usa @ParametrizedTest en lugar de @Test y se pasa un DataProvider como en XCTest'
          ],
          correct: 1,
          explanation: 'Swift Testing soporta tests parametrizados con arguments: en @Test. El framework ejecuta el test una vez por cada conjunto de valores en el array, reportando cada ejecución individualmente en los resultados. Es ideal para probar múltiples casos de entrada/salida sin duplicar código. Cada combinación aparece como un test independiente en Xcode, facilitando identificar cuál falla.'
        },
        {
          question: '¿Por qué es recomendable usar un Actor para los Mocks en Swift Testing?',
          options: [
            'Los Actors son más rápidos que las clases para tests de rendimiento',
            'Para garantizar que el mock sea thread-safe cuando se accede desde múltiples tests en paralelo — Swift Testing ejecuta tests en paralelo por defecto',
            'Swift Testing exige que todos los Mocks sean Actors — no acepta clases ni structs',
            'Los Actors simplifican la sintaxis de los Mocks eliminando la necesidad de protocolos'
          ],
          correct: 1,
          explanation: 'Swift Testing ejecuta tests en paralelo por defecto. Si los Mocks son clases con estado mutable, pueden ocurrir data races cuando múltiples tests acceden al mismo mock simultáneamente. Usar un Actor para el Mock garantiza (en tiempo de compilación) que el acceso a su estado interno es thread-safe. Además, el uso de await para acceder al Actor en los tests hace explícita la sincronización — no hay riesgos de condiciones de carrera.'
        },
        {
          question: '¿Para qué se usa app.launchArguments = ["--uitesting"] en XCUITest?',
          options: [
            'Para configurar tiempo de espera de lanzamiento en tests de UI lentos',
            'Para pasar un flag a la app que permita cambiar la configuración (ej: usar Mocks en lugar del API real, resetear estado) durante el test de UI',
            'Para habilitar logging detallado en los tests de UI',
            'Para especificar qué dispositivos soportan los tests de UI'
          ],
          correct: 1,
          explanation: 'XCUIApplication.launchArguments permite pasar argumentos de lanzamiento a la app durante el test de UI. La app puede leer estos argumentos en tiempo de ejecución (ProcessInfo.processInfo.arguments.contains("--uitesting")) y cambiar su comportamiento: usar repositorios mock, resetear datos, deshabilitar animaciones, etc. Es la forma estándar de configurar la app para tests de UI sin modificar el código de producción.'
        }
      ]
    }
  }
]
