const androidSenior = [
  {
    id: 'coroutines',
    title: 'Kotlin Coroutines',
    icon: '⚡',
    summary: 'Concurrencia ligera sin bloquear hilos. La base de todo el código asíncrono moderno en Android.',
    content: [
      {
        type: 'text',
        body: `<p>Las <strong>coroutines</strong> son funciones que pueden suspenderse y reanudarse sin bloquear el hilo. Kotlin las implementa como una abstracción sobre threads, siendo mucho más baratas (puedes tener miles de coroutines vs decenas de threads).</p>
        <h4>Conceptos fundamentales</h4>
        <ul>
          <li><strong>suspend function</strong> — Solo puede llamarse desde otra suspend function o coroutine. No bloquea el hilo, suspende la coroutine.</li>
          <li><strong>CoroutineScope</strong> — Define el ciclo de vida de las coroutines. Cuando se cancela el scope, todas sus coroutines se cancelan.</li>
          <li><strong>CoroutineContext</strong> — Dispatcher + Job + otros elementos del contexto.</li>
        </ul>
        <h4>Dispatchers</h4>
        <ul>
          <li><code>Dispatchers.Main</code> — UI thread. Para actualizar la UI.</li>
          <li><code>Dispatchers.IO</code> — Operaciones I/O (red, DB, ficheros). Pool optimizado para bloqueo.</li>
          <li><code>Dispatchers.Default</code> — CPU intensivo (sort, parsing). Mismo nº threads que CPUs.</li>
          <li><code>Dispatchers.Unconfined</code> — No cambia de thread. Evitar en producción.</li>
        </ul>
        <h4>launch vs async</h4>
        <ul>
          <li><code>launch { }</code> — Fire & forget. Retorna un <code>Job</code>.</li>
          <li><code>async { }</code> — Retorna un <code>Deferred&lt;T&gt;</code>. Llama <code>.await()</code> para obtener el valor.</li>
        </ul>
        <h4>Scopes en Android</h4>
        <ul>
          <li><code>viewModelScope</code> — Se cancela cuando el ViewModel se destruye</li>
          <li><code>lifecycleScope</code> — Se cancela cuando el lifecycle owner se destruye</li>
          <li><code>GlobalScope</code> — ❌ Evitar. No se cancela automáticamente.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// suspend function — puede suspenderse sin bloquear
suspend fun fetchUser(id: Int): User {
    return withContext(Dispatchers.IO) { // cambia al IO dispatcher
        api.getUser(id) // llamada de red
    }
} // al terminar, vuelve al dispatcher original

// launch: fire and forget
viewModelScope.launch {
    val user = fetchUser(42) // suspend, no bloquea el hilo
    _uiState.value = UserUiState.Success(user) // automáticamente en Main
}

// async: concurrencia paralela
viewModelScope.launch {
    val userDeferred = async { fetchUser(42) }
    val postsDeferred = async { fetchPosts(42) }

    val user = userDeferred.await()
    val posts = postsDeferred.await()
    // user y posts se han cargado en PARALELO
    _uiState.value = UserWithPosts(user, posts)
}

// withContext: cambiar dispatcher puntualmente
viewModelScope.launch {
    val result = withContext(Dispatchers.IO) {
        heavyJsonParsing(rawJson) // CPU intensivo en IO thread
    }
    updateUI(result) // vuelve a Main automáticamente
}`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Structured Concurrency: el parent espera a los children
viewModelScope.launch {
    // Si cualquier child lanza excepción no manejada,
    // cancela TODOS los siblings y propaga al parent

    val job = launch { task1() }
    launch { task2() }
    // El scope espera a que ambos terminen
}

// Job y cancelación
val job = viewModelScope.launch {
    repeat(1000) { i ->
        if (!isActive) return@launch // comprobar cancelación
        delay(100) // punto de suspensión, también comprueba cancelación
        println("Iteration $i")
    }
}
job.cancel() // cancela la coroutine

// Manejo de excepciones
viewModelScope.launch {
    try {
        val user = fetchUser(42)
    } catch (e: HttpException) {
        _error.value = "Error de red: \${e.code()}"
    } catch (e: CancellationException) {
        throw e // ¡SIEMPRE re-lanzar CancellationException!
    }
}

// SupervisorJob: un hijo fallando no cancela a los demás
val supervisorScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
supervisorScope.launch { task1() } // si falla, task2 sigue
supervisorScope.launch { task2() }`
      },
      {
        type: 'tip',
        body: '<strong>Regla crítica:</strong> Siempre re-lanza <code>CancellationException</code> en bloques catch. Si la capturas y no la relanzas, rompes la concurrencia estructurada y tu coroutine no responderá a cancelaciones.'
      }
    ]
  },

  {
    id: 'flow',
    title: 'Kotlin Flow',
    icon: '🌊',
    summary: 'Streams reactivos de datos con soporte de coroutines. StateFlow para UI state, SharedFlow para eventos.',
    content: [
      {
        type: 'text',
        body: `<p><strong>Flow</strong> es un stream de datos asíncrono basado en coroutines. A diferencia de las coroutines que retornan un único valor, Flow puede emitir múltiples valores en el tiempo.</p>
        <h4>Cold Flow vs Hot Flow</h4>
        <ul>
          <li><strong>Cold Flow</strong> — El código del productor se ejecuta por cada collector. Como un vídeo bajo demanda: cada espectador empieza desde el principio.</li>
          <li><strong>Hot Flow (StateFlow, SharedFlow)</strong> — El productor está activo independientemente de si hay collectors. Como una emisión en directo.</li>
        </ul>
        <h4>StateFlow</h4>
        <p>Siempre tiene un valor actual. Los nuevos collectors reciben el último valor inmediatamente. Perfecto para UI state.</p>
        <h4>SharedFlow</h4>
        <p>Puede configurarse con replay buffer. Perfecto para eventos one-shot (navegar, mostrar snackbar).</p>
        <h4>Operadores esenciales</h4>
        <ul>
          <li><code>map</code>, <code>filter</code>, <code>take</code>, <code>drop</code> — transformación básica</li>
          <li><code>combine</code> — combina últimos valores de N flows</li>
          <li><code>zip</code> — combina par a par (espera a ambos)</li>
          <li><code>flatMapLatest</code> — cancela el flow anterior al llegar nuevo valor</li>
          <li><code>debounce</code> — espera X ms de silencio antes de emitir (ideal para search)</li>
          <li><code>distinctUntilChanged</code> — filtra duplicados consecutivos</li>
          <li><code>catch</code> — manejo de errores en el stream</li>
          <li><code>onEach</code> — efectos secundarios sin transformar</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Cold Flow — producer run per collector
fun getProductsFlow(): Flow<List<Product>> = flow {
    while (true) {
        val products = api.fetchProducts() // llamada de red
        emit(products)
        delay(30_000) // actualiza cada 30s
    }
}

// Operadores
getProductsFlow()
    .map { list -> list.filter { it.inStock } }     // transforma
    .distinctUntilChanged()                          // no emite si no cambia
    .catch { e -> emit(emptyList()) }               // maneja errores
    .collect { products -> updateUI(products) }      // terminal operator

// combine: últimos valores de múltiples flows
combine(
    userFlow,
    productsFlow,
    filtersFlow
) { user, products, filters ->
    products.filter { filters.matches(it) && it.isForUser(user) }
}

// flatMapLatest: busqueda con debounce
searchQuery
    .debounce(300) // espera 300ms tras última pulsación
    .filter { it.length >= 2 }
    .flatMapLatest { query -> // cancela búsqueda anterior
        repository.search(query)
    }
    .collect { results -> showResults(results) }`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// StateFlow en ViewModel — el patrón más común
class SearchViewModel : ViewModel() {

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    // Derivado del query, usando stateIn para hacerlo hot
    val searchResults: StateFlow<List<Product>> = _query
        .debounce(300)
        .flatMapLatest { q ->
            if (q.isEmpty()) flowOf(emptyList())
            else repository.search(q)
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000), // deja de escuchar tras 5s sin collectors
            initialValue = emptyList()
        )

    fun onQueryChange(newQuery: String) {
        _query.value = newQuery
    }
}

// SharedFlow para eventos one-shot
class CheckoutViewModel : ViewModel() {
    private val _events = MutableSharedFlow<CheckoutEvent>()
    val events: SharedFlow<CheckoutEvent> = _events.asSharedFlow()

    fun onPurchase() = viewModelScope.launch {
        try {
            repository.purchase()
            _events.emit(CheckoutEvent.NavigateToSuccess)
        } catch (e: Exception) {
            _events.emit(CheckoutEvent.ShowError(e.message))
        }
    }
}

// En Fragment: collectar SharedFlow para eventos
viewLifecycleOwner.lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.events.collect { event ->
            when (event) {
                is CheckoutEvent.NavigateToSuccess -> navigate(R.id.successFragment)
                is CheckoutEvent.ShowError -> showSnackbar(event.message)
            }
        }
    }
}`
      }
    ]
  },

  {
    id: 'compose',
    title: 'Jetpack Compose',
    icon: '🎨',
    summary: 'UI declarativa en Kotlin. Sin XML. Recomposición reactiva cuando cambia el estado.',
    content: [
      {
        type: 'text',
        body: `<p><strong>Jetpack Compose</strong> es el toolkit moderno para construir UI en Android. En lugar de mutar Views existentes, describes cómo debería verse la UI según el estado actual y Compose se encarga de actualizar solo lo necesario.</p>
        <h4>Recomposición</h4>
        <p>Cuando el estado que lee un Composable cambia, Compose <strong>recompone</strong> (re-ejecuta) esa función. Es eficiente porque Compose saltan funciones cuyos inputs no han cambiado (<em>skippable</em>).</p>
        <h4>Estado en Compose</h4>
        <ul>
          <li><code>remember { }</code> — Recuerda el valor entre recomposiciones (no sobrevive a recreación de Activity)</li>
          <li><code>rememberSaveable { }</code> — Sobrevive a recreación de Activity y process death</li>
          <li><code>mutableStateOf()</code> — Valor observable que trigger recomposición</li>
        </ul>
        <h4>State hoisting</h4>
        <p>Mueve el estado al componente común más cercano. El hijo recibe el valor y una lambda para cambiarlo. Hace los composables reutilizables y testeables.</p>
        <h4>Side Effects</h4>
        <ul>
          <li><code>LaunchedEffect(key)</code> — Lanza una coroutine. Se reinicia cuando cambia la key.</li>
          <li><code>DisposableEffect(key)</code> — Para efectos con cleanup (añadir/quitar listeners).</li>
          <li><code>SideEffect { }</code> — Código no-Compose que se ejecuta tras cada recomposición exitosa.</li>
          <li><code>rememberCoroutineScope()</code> — Scope para lanzar coroutines desde callbacks (onClick, etc.).</li>
          <li><code>produceState</code> — Convierte fuentes no-Compose a State.</li>
          <li><code>derivedStateOf { }</code> — Estado derivado, se recalcula solo cuando cambian sus inputs.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Composable básico
@Composable
fun UserCard(user: User, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = user.name, style = MaterialTheme.typography.titleMedium)
            Text(text = user.email, style = MaterialTheme.typography.bodyMedium)
        }
    }
}

// State: remember + mutableStateOf
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Count: $count", style = MaterialTheme.typography.headlineMedium)
        Button(onClick = { count++ }) { Text("Incrementar") }
    }
}

// State hoisting: el padre gestiona el estado
@Composable
fun SearchScreen() {
    var query by rememberSaveable { mutableStateOf("") }
    SearchField(
        query = query,
        onQueryChange = { query = it } // lambda para mutar desde el hijo
    )
}

@Composable
fun SearchField(query: String, onQueryChange: (String) -> Unit) {
    OutlinedTextField(
        value = query,
        onValueChange = onQueryChange,
        label = { Text("Buscar") }
    )
}`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Conectar con ViewModel
@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when (uiState) {
        is UserUiState.Loading -> CircularProgressIndicator()
        is UserUiState.Success -> UserList(users = uiState.users)
        is UserUiState.Error -> ErrorView(
            message = uiState.message,
            onRetry = viewModel::retry
        )
    }
}

// LaunchedEffect: ejecutar código cuando el Composable entra en composición
@Composable
fun AutoScrollList(items: List<Item>) {
    val listState = rememberLazyListState()

    LaunchedEffect(items.size) { // se re-ejecuta cuando cambia items.size
        if (items.isNotEmpty()) {
            listState.animateScrollToItem(items.size - 1)
        }
    }

    LazyColumn(state = listState) {
        items(items) { item -> ItemRow(item) }
    }
}

// derivedStateOf: evitar recomposiciones innecesarias
@Composable
fun ProductList(products: List<Product>) {
    // Sin derivedStateOf, este bloque se ejecutaría en CADA recomposición
    // Con él, solo cuando firstVisibleItemIndex cambia su "show" resultado
    val listState = rememberLazyListState()
    val showScrollToTop by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 5 }
    }

    Box {
        LazyColumn(state = listState) { /* ... */ }
        if (showScrollToTop) ScrollToTopButton()
    }
}

// DisposableEffect: cleanup de listeners
@Composable
fun NetworkObserver(onConnectivityChange: (Boolean) -> Unit) {
    val context = LocalContext.current
    DisposableEffect(context) {
        val manager = context.getSystemService(ConnectivityManager::class.java)
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) = onConnectivityChange(true)
            override fun onLost(network: Network) = onConnectivityChange(false)
        }
        manager.registerDefaultNetworkCallback(callback)
        onDispose { manager.unregisterNetworkCallback(callback) } // cleanup
    }
}`
      },
      {
        type: 'tip',
        body: '<strong>Performance:</strong> Marca tus clases de datos con <code>@Stable</code> o <code>@Immutable</code> si Compose no puede inferirlo (clases de librerías externas). Esto permite a Compose saltarse recomposiciones cuando las instancias son iguales.'
      }
    ]
  },

  {
    id: 'architecture',
    title: 'Clean Architecture + MVVM/MVI',
    icon: '🏛️',
    summary: 'Capas bien separadas: Presentation, Domain, Data. El código de negocio no depende de Android.',
    content: [
      {
        type: 'text',
        body: `<p>La <strong>Clean Architecture</strong> organiza el código en capas concéntricas donde las dependencias apuntan siempre hacia adentro (hacia el dominio). El objetivo: código testeable, mantenible y agnóstico al framework.</p>
        <h4>Las 3 capas</h4>
        <ul>
          <li><strong>Data</strong> — Implementaciones concretas: Room, Retrofit, SharedPreferences, Repositorios. Conoce Android.</li>
          <li><strong>Domain</strong> — Lógica de negocio pura: UseCases, Entidades, interfaces de Repository. Kotlin puro, sin Android.</li>
          <li><strong>Presentation</strong> — ViewModel + UI (Compose/Views). Llama a UseCases, expone StateFlow/LiveData.</li>
        </ul>
        <h4>MVVM vs MVI</h4>
        <ul>
          <li><strong>MVVM</strong> — ViewModel tiene múltiples StateFlows (uno por cada pieza de estado). La UI observa y reacciona. Simple, flexible.</li>
          <li><strong>MVI</strong> — Un único UiState. La UI envía Intent/Action, el ViewModel lo reduce a un nuevo State. Flujo unidireccional estricto. Más predecible, mejor para UIs complejas.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// ── DOMAIN LAYER (Kotlin puro) ─────────────────────────────

// Entidad de dominio
data class User(val id: Int, val name: String, val email: String)

// Interface del repositorio (inversión de dependencias)
interface UserRepository {
    fun getUsers(): Flow<List<User>>
    suspend fun getUserById(id: Int): User
}

// UseCase: una responsabilidad, testeable en aislamiento
class GetUsersUseCase @Inject constructor(
    private val userRepository: UserRepository
) {
    operator fun invoke(): Flow<List<User>> =
        userRepository.getUsers()
            .map { list -> list.sortedBy { it.name } } // lógica de negocio aquí
}

// ── DATA LAYER ──────────────────────────────────────────────

class UserRepositoryImpl @Inject constructor(
    private val userDao: UserDao,         // Room
    private val userApi: UserApi,          // Retrofit
    private val userMapper: UserMapper     // mapea Entity→Domain
) : UserRepository {

    override fun getUsers(): Flow<List<User>> =
        userDao.getAllUsers()
            .map { entities -> entities.map(userMapper::toDomain) }

    override suspend fun getUserById(id: Int): User =
        withContext(Dispatchers.IO) {
            userApi.getUser(id).toDomain()
        }
}

// ── PRESENTATION LAYER ──────────────────────────────────────

@HiltViewModel
class UserViewModel @Inject constructor(
    private val getUsersUseCase: GetUsersUseCase
) : ViewModel() {

    val users: StateFlow<List<User>> = getUsersUseCase()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// MVI Pattern — Estado unidireccional

// UiState único y sellado
data class UsersUiState(
    val users: List<User> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val searchQuery: String = ""
)

// Intents/Actions que el usuario puede realizar
sealed class UsersIntent {
    object LoadUsers : UsersIntent()
    data class SearchUsers(val query: String) : UsersIntent()
    data class DeleteUser(val userId: Int) : UsersIntent()
}

@HiltViewModel
class UsersViewModel @Inject constructor(
    private val getUsersUseCase: GetUsersUseCase,
    private val deleteUserUseCase: DeleteUserUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(UsersUiState())
    val uiState: StateFlow<UsersUiState> = _uiState.asStateFlow()

    fun handleIntent(intent: UsersIntent) {
        when (intent) {
            is UsersIntent.LoadUsers -> loadUsers()
            is UsersIntent.SearchUsers -> onSearch(intent.query)
            is UsersIntent.DeleteUser -> deleteUser(intent.userId)
        }
    }

    private fun loadUsers() = viewModelScope.launch {
        _uiState.update { it.copy(isLoading = true, error = null) }
        getUsersUseCase()
            .catch { e -> _uiState.update { it.copy(isLoading = false, error = e.message) } }
            .collect { users -> _uiState.update { it.copy(users = users, isLoading = false) } }
    }
}`
      }
    ]
  },

  {
    id: 'hilt',
    title: 'Hilt (Inyección de Dependencias)',
    icon: '💉',
    summary: 'DI oficial para Android sobre Dagger. Reduce boilerplate con anotaciones y scopes predefinidos.',
    content: [
      {
        type: 'text',
        body: `<p><strong>Hilt</strong> es el framework de inyección de dependencias recomendado para Android. Construido sobre Dagger, elimina la necesidad de configurar los componentes y módulos manualmente.</p>
        <h4>Anotaciones esenciales</h4>
        <ul>
          <li><code>@HiltAndroidApp</code> — En la clase Application. Habilita Hilt.</li>
          <li><code>@AndroidEntryPoint</code> — En Activity, Fragment, Service, etc. que reciben inyección.</li>
          <li><code>@HiltViewModel</code> — En ViewModels inyectados por Hilt.</li>
          <li><code>@Inject constructor</code> — Le dice a Hilt cómo construir esta clase.</li>
          <li><code>@Module + @InstallIn</code> — Declara cómo proveer dependencias que no puedes anotar con @Inject (interfaces, Retrofit, Room).</li>
          <li><code>@Provides</code> — Método que crea la dependencia.</li>
          <li><code>@Binds</code> — Vincula una implementación a su interface (más eficiente que @Provides).</li>
        </ul>
        <h4>Scopes</h4>
        <ul>
          <li><code>@Singleton</code> — Una instancia por Application</li>
          <li><code>@ActivityScoped</code> — Una por Activity</li>
          <li><code>@FragmentScoped</code> — Una por Fragment</li>
          <li><code>@ViewModelScoped</code> — Una por ViewModel</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// 1. Application
@HiltAndroidApp
class MyApplication : Application()

// 2. Activity/Fragment
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    // Hilt inyecta aquí automáticamente
}

// 3. ViewModel
@HiltViewModel
class UserViewModel @Inject constructor(
    private val getUsersUseCase: GetUsersUseCase, // inyectado por Hilt
    savedStateHandle: SavedStateHandle              // también disponible
) : ViewModel()

// 4. Clase inyectable con @Inject constructor
class UserRepository @Inject constructor(
    private val userDao: UserDao,
    @ApplicationContext private val context: Context // qualifier predefinido
)

// 5. Módulo para dependencias externas
@Module
@InstallIn(SingletonComponent::class) // disponible en toda la app como Singleton
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient =
        OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor())
            .build()

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

    @Provides
    @Singleton
    fun provideUserApi(retrofit: Retrofit): UserApi =
        retrofit.create(UserApi::class.java)
}

// 6. Binds: interface → implementación (sin código de creación)
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    @Singleton
    abstract fun bindUserRepository(
        impl: UserRepositoryImpl // Hilt sabe cómo crearlo via @Inject constructor
    ): UserRepository            // vincula la interface
}`
      }
    ]
  },

  {
    id: 'reactive',
    title: 'Programación Reactiva',
    icon: '🔄',
    summary: 'Paradigma basado en streams de datos y propagación de cambios. Flow es la respuesta reactiva moderna de Android.',
    content: [
      {
        type: 'text',
        body: `<p>La <strong>programación reactiva</strong> trata los datos como streams que fluyen en el tiempo, y la lógica de la app como transformaciones sobre esos streams. La UI "reacciona" a los cambios de datos en lugar de pedirlos activamente (<em>pull</em> vs <em>push</em>).</p>
        <h4>Principios</h4>
        <ul>
          <li><strong>Declarativo</strong> — Describes qué hacer con los datos, no cuándo ni cómo obtenerlos</li>
          <li><strong>Composable</strong> — Combinas operadores simples para lógica compleja</li>
          <li><strong>Backpressure</strong> — Control de flujo cuando el productor es más rápido que el consumidor</li>
        </ul>
        <h4>Evolución en Android</h4>
        <ul>
          <li><strong>RxJava/RxAndroid</strong> — Popular hasta 2019. Potente pero curva de aprendizaje alta, manejo de threading manual.</li>
          <li><strong>LiveData</strong> — Simple, lifecycle-aware. Sin operadores potentes.</li>
          <li><strong>Kotlin Flow</strong> — ✅ Actual estándar. Integrado con coroutines. Operadores ricos. Cold/Hot. Cancellation automático.</li>
        </ul>
        <h4>Patrón reactivo completo</h4>
        <p>DB (Room) → Repository (Flow) → UseCase (operadores) → ViewModel (StateFlow) → UI (collectAsStateWithLifecycle)</p>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Patrón reactivo end-to-end

// Room emite Flow — la DB es la fuente de verdad
@Dao
interface ProductDao {
    @Query("SELECT * FROM products")
    fun observeAll(): Flow<List<ProductEntity>> // emite cada vez que cambia la tabla
}

// Repository: mapea y combina streams
class ProductRepository @Inject constructor(
    private val dao: ProductDao,
    private val api: ProductApi,
    private val prefs: UserPreferences
) {
    fun getProductsForUser(): Flow<List<Product>> =
        combine(
            dao.observeAll().map { it.map(::toDomain) },
            prefs.userRegion         // Flow<String>
        ) { products, region ->
            products.filter { it.availableIn(region) }
        }
}

// UseCase: lógica de negocio como transformaciones
class GetFilteredProductsUseCase @Inject constructor(
    private val repository: ProductRepository
) {
    operator fun invoke(
        minPrice: StateFlow<Double>,
        searchQuery: StateFlow<String>
    ): Flow<List<Product>> =
        repository.getProductsForUser()
            .combine(minPrice) { products, min -> products.filter { it.price >= min } }
            .combine(searchQuery.debounce(300)) { products, query ->
                if (query.isEmpty()) products
                else products.filter { it.name.contains(query, ignoreCase = true) }
            }
}

// ViewModel: convierte a StateFlow para la UI
@HiltViewModel
class ProductViewModel @Inject constructor(
    private val getFilteredProducts: GetFilteredProductsUseCase
) : ViewModel() {

    val minPrice = MutableStateFlow(0.0)
    val searchQuery = MutableStateFlow("")

    val products: StateFlow<List<Product>> =
        getFilteredProducts(minPrice, searchQuery)
            .catch { emit(emptyList()) }
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}`
      }
    ]
  },

  {
    id: 'testing',
    title: 'Testing en Android',
    icon: '🧪',
    summary: 'Unit tests con Mockk y Turbine, tests de integración con Room in-memory, UI tests con Compose.',
    content: [
      {
        type: 'text',
        body: `<p>Una estrategia de testing sólida en Android combina:</p>
        <ul>
          <li><strong>Unit Tests</strong> (~70%) — Kotlin puro, sin Android. Prueban ViewModels, UseCases, lógica. Rápidos.</li>
          <li><strong>Integration Tests</strong> (~20%) — Prueban la integración de capas (Room in-memory, repositorios reales).</li>
          <li><strong>UI Tests</strong> (~10%) — Prueban flujos de usuario completos. Lentos. Solo para flows críticos.</li>
        </ul>
        <h4>Librerías clave</h4>
        <ul>
          <li><code>JUnit4/5</code> — Framework base</li>
          <li><code>Mockk</code> — Mocking idiomático en Kotlin (mejor que Mockito)</li>
          <li><code>Turbine</code> — Testing de Flows (por Square)</li>
          <li><code>kotlinx-coroutines-test</code> — <code>runTest</code>, <code>TestCoroutineScheduler</code></li>
          <li><code>Hilt Testing</code> — <code>@HiltAndroidTest</code> para tests con DI</li>
          <li><code>Compose UI Testing</code> — <code>createComposeRule</code>, semantic actions</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Unit Test: ViewModel con coroutines y Flow

@ExperimentalCoroutinesApi
class UserViewModelTest {

    // Sustituye Dispatchers.Main por un dispatcher de test
    @get:Rule val mainDispatcherRule = MainDispatcherRule()

    private val getUsersUseCase = mockk<GetUsersUseCase>()
    private lateinit var viewModel: UserViewModel

    @Before
    fun setup() {
        viewModel = UserViewModel(getUsersUseCase)
    }

    @Test
    fun \`when users loaded successfully, state is Success\`() = runTest {
        // Given
        val users = listOf(User(1, "Ana", "ana@test.com"))
        every { getUsersUseCase() } returns flowOf(users)

        // When (el ViewModel inicia la carga en init)
        // Then — usando Turbine para testear Flow
        viewModel.uiState.test {
            val state = awaitItem()
            assertThat(state.users).isEqualTo(users)
            assertThat(state.isLoading).isFalse()
            cancel()
        }
    }

    @Test
    fun \`when use case throws, state has error\`() = runTest {
        every { getUsersUseCase() } returns flow { throw Exception("Network error") }

        viewModel.uiState.test {
            val state = awaitItem()
            assertThat(state.error).isNotNull()
        }
    }
}

// MainDispatcherRule — boilerplate estándar
class MainDispatcherRule(
    val testDispatcher: TestCoroutineDispatcher = TestCoroutineDispatcher()
) : TestWatcher() {
    override fun starting(description: Description) =
        Dispatchers.setMain(testDispatcher)
    override fun finished(description: Description) =
        Dispatchers.resetMain()
}`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Integration Test: Room in-memory
@RunWith(AndroidJUnit4::class)
class UserDaoTest {

    private lateinit var database: AppDatabase
    private lateinit var userDao: UserDao

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        userDao = database.userDao()
    }

    @After
    fun closeDb() = database.close()

    @Test
    fun insertAndGetUser() = runTest {
        val user = UserEntity(name = "Ana", email = "ana@test.com")
        userDao.insertUser(user)
        val result = userDao.getUserById(1)
        assertThat(result?.name).isEqualTo("Ana")
    }
}

// UI Test con Compose
class UserScreenTest {
    @get:Rule val composeRule = createComposeRule()

    @Test
    fun \`user list shows all users\`() {
        val users = listOf(User(1, "Ana", "ana@test.com"))

        composeRule.setContent {
            UserScreen(uiState = UserUiState.Success(users))
        }

        composeRule.onNodeWithText("Ana").assertIsDisplayed()
        composeRule.onNodeWithText("ana@test.com").assertIsDisplayed()
    }

    @Test
    fun \`clicking user navigates to detail\`() {
        var clickedUser: User? = null
        composeRule.setContent {
            UserCard(user = User(1, "Ana", "ana@test.com"), onClick = { clickedUser = it })
        }

        composeRule.onNodeWithText("Ana").performClick()
        assertThat(clickedUser?.name).isEqualTo("Ana")
    }
}`
      }
    ]
  },

  {
    id: 'kotlin-advanced',
    title: 'Kotlin Avanzado',
    icon: '🔮',
    summary: 'Sealed classes, inline, delegación, extension functions, scope functions y más.',
    content: [
      {
        type: 'text',
        body: `<p>Dominar las features avanzadas de Kotlin te permite escribir código más expresivo, seguro y eficiente. Son fundamentales para el desarrollo Android senior.</p>
        <h4>Sealed classes / interfaces</h4>
        <p>Jerarquía cerrada de tipos. El compilador sabe todos los subtipos en tiempo de compilación → <code>when</code> exhaustivo.</p>
        <h4>Scope functions</h4>
        <ul>
          <li><code>let</code> — Objeto como <code>it</code>. Retorna el resultado de la lambda. Ideal para null-checks.</li>
          <li><code>run</code> — Objeto como <code>this</code>. Retorna el resultado. Inicialización + cálculo.</li>
          <li><code>apply</code> — Objeto como <code>this</code>. Retorna el objeto. Configuración del objeto.</li>
          <li><code>also</code> — Objeto como <code>it</code>. Retorna el objeto. Efectos secundarios.</li>
          <li><code>with</code> — No es extension. Objeto como <code>this</code>. Para múltiples operaciones sobre el mismo objeto.</li>
        </ul>
        <h4>Delegación de propiedades</h4>
        <p>Delega el getter/setter a otro objeto con la keyword <code>by</code>.</p>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Sealed class — estado exhaustivo
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Throwable) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

// when es exhaustivo — el compilador verifica todos los casos
fun handleResult(result: Result<User>) = when (result) {
    is Result.Success -> showUser(result.data) // smart cast automático
    is Result.Error -> showError(result.exception.message)
    is Result.Loading -> showLoading()
    // No hace falta 'else' — el compilador sabe que están todos los casos
}

// Inline functions — evitan el overhead de lambdas en hot paths
inline fun <reified T> Context.getSystemService(): T =
    getSystemService(T::class.java)

// Uso: sin cast manual
val manager: ClipboardManager = context.getSystemService()

// Delegación: lazy — inicializa solo cuando se accede por primera vez
val heavyObject: HeavyClass by lazy {
    HeavyClass() // se crea la primera vez que se accede a 'heavyObject'
}

// Delegación: observable — ejecuta callback en cada asignación
var name: String by Delegates.observable("inicial") { prop, old, new ->
    println("$prop cambió de $old a $new")
}

// Delegación: by map — útil para SavedStateHandle
class SearchViewModel(handle: SavedStateHandle) : ViewModel() {
    var query: String by handle // persiste automáticamente
}

// Extension functions: añaden método a clases existentes sin herencia
fun String.toTitleCase(): String =
    split(" ").joinToString(" ") { word ->
        word.lowercase().replaceFirstChar { it.uppercase() }
    }

fun View.visible() { visibility = View.VISIBLE }
fun View.gone() { visibility = View.GONE }

// Scope functions en la práctica
val intent = Intent(context, DetailActivity::class.java).apply {
    putExtra("id", user.id)      // this = intent
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
}

user?.let { u ->                  // it = user (solo si no es null)
    repository.save(u)
}

val length = user?.run {          // this = user, retorna el resultado
    name.length + email.length
} ?: 0`
      }
    ]
  },

  {
    id: 'performance',
    title: 'Performance & Memory',
    icon: '🚀',
    summary: 'Memory leaks, LaakCanary, Baseline Profiles, optimización de Compose y App startup.',
    content: [
      {
        type: 'text',
        body: `<p>El rendimiento no es una feature a añadir al final — hay que diseñarlo desde el principio. Los problemas más comunes en Android senior son memory leaks, recomposiciones innecesarias en Compose y app startup lento.</p>
        <h4>Memory Leaks — causas frecuentes</h4>
        <ul>
          <li>Guardar Activity/Fragment context en un Singleton o ViewModel</li>
          <li>Listeners que no se eliminan en <code>onDestroy</code>/<code>onDestroyView</code></li>
          <li>Coroutines sin scope correcto (GlobalScope, o scope que no se cancela)</li>
          <li>Static references a Views</li>
          <li>Inner classes no-estáticas en Activities</li>
        </ul>
        <h4>Compose Performance</h4>
        <ul>
          <li>Usa <code>key()</code> en LazyColumn para items con estado</li>
          <li><code>derivedStateOf</code> para cálculos derivados de estado</li>
          <li>Mueve lambdas a variables para evitar recomposiciones de children</li>
          <li>Haz tus data classes <code>@Stable</code> o <code>@Immutable</code></li>
          <li>Usa el Layout Inspector de Android Studio para ver recomposiciones</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// LeakCanary — añadir solo en debug
dependencies {
    debugImplementation("com.squareup.leakcanary:leakcanary-android:2.x")
}
// No requiere código adicional — se auto-instala en debug builds

// ──── Compose Performance ─────────────────────────────

// ❌ Lambda creada en cada recomposición → children se recomponen
@Composable
fun ProductList(viewModel: ProductViewModel) {
    val products by viewModel.products.collectAsStateWithLifecycle()
    LazyColumn {
        items(products) { product ->
            ProductItem(
                product = product,
                onClick = { viewModel.onProductClick(product) } // nueva lambda cada vez
            )
        }
    }
}

// ✅ Lambda estable → Compose puede saltarse recomposiciones
@Composable
fun ProductList(viewModel: ProductViewModel) {
    val products by viewModel.products.collectAsStateWithLifecycle()
    val onProductClick = remember<(Product) -> Unit> {
        { product -> viewModel.onProductClick(product) }
    }
    LazyColumn {
        items(products, key = { it.id }) { product -> // key para identidad
            ProductItem(product = product, onClick = onProductClick)
        }
    }
}

// @Stable para clases que Compose no puede verificar automáticamente
@Stable
data class UiProduct(val id: Int, val name: String, val price: Double)

// ──── Baseline Profiles ──────────────────────────────
// Genera en app/src/main/baseline-prof.txt para pre-compilar clases críticas
// Mejora cold start hasta un 40%
// Herramienta: Macrobenchmark library

// ──── App Startup ────────────────────────────────────
// Aplaza inicializaciones no críticas
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Solo lo mínimo aquí
        initCrashlytics() // crítico

        // El resto, en background
        applicationScope.launch(Dispatchers.IO) {
            initAnalytics()    // puede esperar
            prefetchImages()   // puede esperar
        }
    }
}`
      },
      {
        type: 'tip',
        body: '<strong>Profiler:</strong> Android Studio tiene un Memory Profiler integrado que muestra heap dumps y detecta leaks en tiempo real. Úsalo junto con LeakCanary: LeakCanary para notificaciones automáticas, Profiler para análisis detallado.'
      }
    ]
  }
]
