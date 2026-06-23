var androidSenior = [
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia principal entre launch y async?',
          options: [
            'launch retorna Job y no devuelve valor; async retorna Deferred<T> y permite obtener el resultado con .await()',
            'launch es para operaciones IO; async es para operaciones CPU-bound',
            'async se cancela automáticamente con el scope; launch requiere cancelación manual',
            'No hay diferencia funcional, son intercambiables'
          ],
          correct: 0,
          explanation: 'launch es fire-and-forget: retorna un Job y no produce valor. async crea una coroutine que retorna un Deferred<T> — el valor se obtiene llamando a .await(), que suspende hasta que el resultado esté listo. Usa async cuando necesites el resultado de operaciones paralelas.'
        },
        {
          question: '¿Qué resultado produce este código?',
          code: `val result = coroutineScope {
    val a = async { 10 }
    val b = async { 20 }
    a.await() + b.await()
}
println(result)`,
          options: ['30', 'Error de compilación', '0', 'Depende del dispatcher usado'],
          correct: 0,
          explanation: 'Las dos coroutines async se lanzan en paralelo dentro del coroutineScope. a.await() + b.await() espera ambos resultados y suma 10 + 20 = 30. coroutineScope garantiza que ambas terminan antes de retornar.'
        },
        {
          question: '¿Qué dispatcher debes usar para llamadas de red y operaciones de base de datos?',
          options: [
            'Dispatchers.Main — para asegurar thread-safety de la UI',
            'Dispatchers.Default — tiene el mayor número de threads disponibles',
            'Dispatchers.IO — está optimizado para operaciones bloqueantes de I/O',
            'Dispatchers.Unconfined — no tiene overhead de cambio de contexto'
          ],
          correct: 2,
          explanation: 'Dispatchers.IO tiene un pool de threads grande (~64) optimizado para operaciones bloqueantes como red y BD. Dispatchers.Default es para CPU-intensive (nº threads = nº CPUs). Dispatchers.Main es solo para actualizar la UI y debe ser liberado rápidamente.'
        },
        {
          question: '¿Qué problema tiene este código?',
          code: `try {
    val data = withContext(Dispatchers.IO) { api.fetch() }
} catch (e: CancellationException) {
    Log.d("TAG", "Cancelado — ignorando")
    // Sin re-lanzar
}`,
          options: [
            'withContext no puede lanzar CancellationException',
            'Se captura CancellationException sin relanzarla, rompiendo la concurrencia estructurada',
            'Log.d no está disponible dentro de coroutines',
            'El código es correcto, no hay problema'
          ],
          correct: 1,
          explanation: 'CancellationException es el mecanismo de cancelación de Kotlin Coroutines. Si la capturas y no la relanzas (throw e), la coroutine cree que no fue cancelada y sigue ejecutándose — rompiendo la concurrencia estructurada. Regla: nunca capturar CancellationException sin relanzarla, o usar catch (e: Exception) y verificar manualmente.'
        },
        {
          question: '¿Qué sucede con viewModelScope.launch cuando el usuario cierra la pantalla?',
          options: [
            'La coroutine continúa hasta terminar para no perder datos',
            'La coroutine se pausa hasta que el usuario vuelve a la pantalla',
            'La coroutine se cancela automáticamente cuando el ViewModel llama a onCleared()',
            'Depende del Dispatcher que se esté usando'
          ],
          correct: 2,
          explanation: 'viewModelScope está vinculado al ciclo de vida del ViewModel. Cuando el ViewModel se destruye (onCleared()), el scope se cancela y todas sus coroutines hijas se cancelan automáticamente. Esto evita memory leaks y operaciones innecesarias en background.'
        },
        {
          question: '¿Qué diferencia hay entre Job y SupervisorJob como parent scope?',
          options: [
            'Job es más rápido; SupervisorJob tiene más overhead de gestión',
            'Con SupervisorJob, el fallo de un hijo no cancela a los demás hijos del scope',
            'SupervisorJob solo funciona con async, no con launch',
            'No hay diferencia práctica en aplicaciones Android'
          ],
          correct: 1,
          explanation: 'Con un Job estándar, si cualquier hijo falla, el padre y todos los hermanos se cancelan. Con SupervisorJob, cada hijo es independiente: un fallo no afecta a los demás. Útil cuando tienes tareas paralelas donde quieres que unas fallen sin cancelar las otras (ej: carga de imágenes independientes).'
        },
        {
          question: '¿Qué problema tiene usar GlobalScope en un ViewModel?',
          code: `class MyViewModel : ViewModel() {
    fun loadData() {
        GlobalScope.launch {
            val data = repository.fetch()
            _state.value = data
        }
    }
}`,
          options: [
            'GlobalScope no puede acceder a repository',
            'GlobalScope.launch siempre corre en el hilo equivocado',
            'La coroutine no se cancela al destruirse el ViewModel — memory leak y posible crash al actualizar estado destruido',
            'GlobalScope requiere permisos especiales de Android'
          ],
          correct: 2,
          explanation: 'GlobalScope tiene el ciclo de vida de toda la aplicación. Si el usuario sale de la pantalla y el ViewModel se destruye, la coroutine sigue ejecutándose. Al terminar, intenta actualizar _state.value en un ViewModel ya destruido — potencial crash o comportamiento inesperado. Siempre usa viewModelScope.'
        },
        {
          question: '¿Qué garantiza la concurrencia estructurada (structured concurrency)?',
          options: [
            'Que las coroutines se ejecuten en orden estricto, una tras otra',
            'El scope padre no termina hasta que todos sus hijos terminan, y propaga cancelaciones y excepciones hacia arriba',
            'Que solo corra una coroutine a la vez por scope para evitar race conditions',
            'Que las coroutines no puedan fallar silenciosamente sin avisar'
          ],
          correct: 1,
          explanation: 'La concurrencia estructurada garantiza tres cosas: (1) el scope padre no completa hasta que todos sus hijos completan, (2) si el padre se cancela, todos los hijos se cancelan, (3) si un hijo falla con excepción, el error se propaga al padre. Esto hace el código asíncrono predecible y sin leaks de coroutines huérfanas.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia principal entre un Cold Flow y un Hot Flow?',
          options: [
            'Cold Flow es más eficiente en memoria que Hot Flow',
            'Cold Flow empieza a emitir solo cuando se colecta (un colector activa la fuente); Hot Flow emite independientemente de los colectores',
            'Hot Flow puede emitir objetos complejos; Cold Flow solo tipos primitivos',
            'Cold Flow usa coroutines internamente; Hot Flow usa threads del sistema'
          ],
          correct: 1,
          explanation: 'Cold Flow: cada colector crea su propia ejecución independiente (como una función que se llama por cada suscriptor). Hot Flow: emite independientemente, múltiples colectores reciben los mismos valores. StateFlow y SharedFlow son hot; flowOf(), flow{} son cold.'
        },
        {
          question: '¿Cuándo debes usar StateFlow en lugar de SharedFlow para exponer estado de UI?',
          options: [
            'Cuando quieres enviar eventos de navegación one-shot (navegar, mostrar snackbar)',
            'Cuando el estado siempre debe tener un valor actual y nuevos colectores deben recibirlo inmediatamente',
            'Cuando necesitas que múltiples ViewModels compartan el mismo flow',
            'SharedFlow es siempre preferible a StateFlow en arquitecturas MVVM'
          ],
          correct: 1,
          explanation: 'StateFlow siempre tiene un valor actual y nuevos colectores reciben ese valor inmediatamente. Perfecto para UI state. SharedFlow no tiene valor inicial y puede configurar replay — ideal para eventos one-shot (navegación, snackbars) que no deben re-emitirse al rotar pantalla.'
        },
        {
          question: '¿Qué se imprime al ejecutar este código?',
          code: `flowOf(1, 2, 3, 4, 5)
    .filter { it % 2 == 0 }
    .map { it * 10 }
    .collect { println(it) }`,
          options: ['10, 20, 30, 40, 50', '20, 40', '2, 4', '1, 3, 5'],
          correct: 1,
          explanation: 'filter { it % 2 == 0 } deja pasar solo los pares: 2 y 4. Luego map { it * 10 } los multiplica por 10: 20 y 40. Los flows procesan cada elemento de forma secuencial por los operadores, no en lote.'
        },
        {
          question: '¿Qué hace el operador flatMapLatest?',
          options: [
            'Combina los últimos valores de múltiples flows en una tupla',
            'Cuando el flow fuente emite un nuevo valor, cancela la colección anterior y lanza una nueva con ese valor',
            'Aplana un Flow<List<T>> emitiendo cada elemento de la lista individualmente',
            'Filtra los valores duplicados consecutivos del flow'
          ],
          correct: 1,
          explanation: 'flatMapLatest es esencial para búsquedas. Cuando llega un nuevo valor, cancela automáticamente la coroutine del valor anterior y empieza una nueva. Sin él, búsquedas antiguas podrían sobrescribir resultados más recientes al llegar de forma desordenada.'
        },
        {
          question: '¿Qué problema puede causar este código en un Fragment?',
          code: `override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    lifecycleScope.launch {
        viewModel.uiState.collect { updateUI(it) }
    }
}`,
          options: [
            'collect() no puede llamarse directamente desde lifecycleScope',
            'El flow sigue colectándose cuando el Fragment va a background, actualizando UI no visible y desperdiciando recursos',
            'lifecycleScope se cancela demasiado pronto al rotar pantalla',
            'No hay ningún problema, este código es correcto'
          ],
          correct: 1,
          explanation: 'lifecycleScope se cancela al destruir el Fragment (onDestroy), pero no al ir a background. El flow continúa colectando en background. Solución correcta: repeatOnLifecycle(Lifecycle.State.STARTED) para pausar la colección cuando el Fragment no es visible y reanudarla al volver.'
        },
        {
          question: '¿Qué significa SharingStarted.WhileSubscribed(5000) en un stateIn?',
          options: [
            'El flow emite durante máximo 5000 milisegundos y luego para',
            'Pausa el upstream cuando no hay suscriptores; lo reanuda si vuelven; espera 5000ms antes de cancelar upstream — sobrevive rotaciones de pantalla',
            'El flow mantiene un buffer de 5000 elementos sin procesar',
            'Cada suscriptor recibe los últimos 5000 valores emitidos como replay'
          ],
          correct: 1,
          explanation: 'WhileSubscribed(5000) optimiza el consumo: el upstream (Room, API) solo corre cuando hay colectores activos. El timeout de 5000ms evita parar y reanudar el upstream durante rotaciones (que tardan ~1-2s). Cuando no hay suscriptores por más de 5s, el upstream se cancela para liberar recursos.'
        },
        {
          question: '¿Para qué sirve debounce(300) en un buscador?',
          code: `val results = searchQuery
    .debounce(300)
    .distinctUntilChanged()
    .flatMapLatest { repository.search(it) }`,
          options: [
            'Limita las búsquedas a máximo 300 por segundo',
            'Espera 300ms de inactividad tras la última tecla antes de emitir — evita llamadas de red por cada carácter escrito',
            'Retrasa el inicio de todas las búsquedas exactamente 300ms',
            'debounce(300) no es un operador estándar de Kotlin Flow'
          ],
          correct: 1,
          explanation: 'debounce(300) espera 300ms de inactividad: si el usuario sigue escribiendo, reinicia el temporizador. Solo emite cuando el usuario ha parado 300ms. Combinado con distinctUntilChanged (evita búsquedas duplicadas) y flatMapLatest (cancela búsquedas obsoletas), es el patrón ideal para search en tiempo real.'
        },
        {
          question: '¿Qué hace combine() en este código de filtros?',
          code: `combine(priceFilter, categoryFilter) { price, category ->
    filterProducts(price, category)
}.collect { products -> updateList(products) }`,
          options: [
            'Espera a que ambos flows completen y solo entonces combina sus últimos valores',
            'Emite cada vez que cualquiera de los dos flows emite un nuevo valor, usando el último valor conocido del otro',
            'Solo emite cuando ambos flows emiten exactamente en el mismo instante',
            'Combina los dos flows en uno concatenando sus emisiones en orden'
          ],
          correct: 1,
          explanation: 'combine() emite cada vez que cualquier flow fuente emite un nuevo valor, usando el último valor conocido de los demás. Si el usuario cambia el precio O la categoría, se recalculan los productos filtrados automáticamente. Ideal para filtros de UI compuestos donde cualquier cambio debe actualizar los resultados.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué provoca una recomposición en Jetpack Compose?',
          options: [
            'Cualquier cambio en el código fuente del Composable',
            'Cuando cambia el valor de un State que se lee dentro del Composable durante la composición',
            'Cada vez que el Activity llama a onResume()',
            'Cuando el sistema recoge basura (GC) en la JVM'
          ],
          correct: 1,
          explanation: 'Compose rastrea qué States (State<T>) lee cada Composable durante la composición. Solo cuando alguno de esos states cambia se programa una recomposición. Si el Composable no lee ningún State (ej: muestra texto estático), nunca se recompone aunque otros parts del árbol sí lo hagan.'
        },
        {
          question: '¿Cuándo debes usar rememberSaveable en lugar de remember?',
          options: [
            'Siempre que el estado sea un objeto complejo (data class) en lugar de primitivos',
            'Cuando quieres que el estado sobreviva a rotaciones de pantalla y a que el proceso sea matado por el sistema',
            'remember es siempre preferible porque tiene menos overhead',
            'rememberSaveable solo funciona con tipos primitivos y String'
          ],
          correct: 1,
          explanation: 'remember sobrevive a recomposiciones pero se pierde en rotaciones de pantalla. rememberSaveable persiste el estado usando el mecanismo Bundle de Android, sobreviviendo a rotaciones y a que el sistema mate el proceso. Úsalo para estado de UI como texto de campo, posición de scroll, tabs seleccionados.'
        },
        {
          question: '¿Por qué este código puede causar recomposiciones innecesarias?',
          code: `@Composable
fun UserList(viewModel: UserViewModel) {
    val users by viewModel.users.collectAsStateWithLifecycle()
    LazyColumn {
        items(users) { user ->
            UserItem(user, onClick = { viewModel.onUserClick(user) })
        }
    }
}`,
          options: [
            'collectAsStateWithLifecycle genera recomposiciones extra en background',
            'La lambda onClick = { viewModel.onUserClick(user) } se crea nueva en cada recomposición, causando que UserItem se recomponga aunque el usuario no haya cambiado',
            'LazyColumn no admite lambdas directamente como parámetros',
            'El código es óptimo para Compose, no hay problema de rendimiento'
          ],
          correct: 1,
          explanation: 'Cada recomposición de UserList crea una nueva instancia de la lambda onClick para cada item. Compose detecta que el parámetro onClick de UserItem cambió (nueva referencia) y lo recompone innecesariamente. Solución: val onClick = remember { { user: User -> viewModel.onUserClick(user) } }'
        },
        {
          question: '¿Cuál es la diferencia entre LaunchedEffect y SideEffect en Compose?',
          options: [
            'LaunchedEffect corre en background thread; SideEffect corre en el hilo de composición',
            'LaunchedEffect lanza una coroutine y se cancela/reinicia cuando cambian sus keys; SideEffect ejecuta código no-suspend tras cada recomposición exitosa',
            'SideEffect es para efectos de red; LaunchedEffect para operaciones de UI',
            'Son equivalentes, la diferencia es solo de sintaxis y estilo'
          ],
          correct: 1,
          explanation: 'LaunchedEffect: abre una coroutine que se cancela y relanza cuando cambian sus keys. Para efectos que necesitan suspend (animaciones, analíticas async). SideEffect: código síncronico que corre tras cada recomposición exitosa. Para sincronizar estado Compose con código no-Compose (ej: actualizar un callback externo, un analytics SDK).'
        },
        {
          question: '¿Para qué sirve derivedStateOf?',
          code: `val listState = rememberLazyListState()
val showButton by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 5 }
}`,
          options: [
            'Para crear un State que se deriva de un Flow del ViewModel',
            'Para cachear cálculos derivados de State — solo se recalcula cuando cambia el State fuente, no en cada recomposición',
            'Para compartir State entre varios Composables en distintas ramas del árbol',
            'Para persistir State calculado durante la rotación de pantalla'
          ],
          correct: 1,
          explanation: 'derivedStateOf evita recomposiciones innecesarias para cálculos derivados. Sin él, showButton se recalcularía en cada evento de scroll (que puede ser 60fps). Con derivedStateOf, solo cuando el resultado del cálculo cambia (de true a false o viceversa) se notifica a los Composables que leen showButton.'
        },
        {
          question: '¿Qué ventaja aporta anotar tus data classes con @Stable o @Immutable en Compose?',
          options: [
            'Permite que la clase sea serializable automáticamente para navegación',
            'Le indica al compilador de Compose que puede saltarse recomposiciones si la instancia no ha cambiado, mejorando el rendimiento',
            'Hace que la clase sea thread-safe y accesible desde múltiples coroutines',
            'Permite usar la clase como key en LazyColumn sin implementar equals()'
          ],
          correct: 1,
          explanation: 'Compose solo puede saltarse recomposiciones de Composables cuyos parámetros son @Stable o @Immutable. Para data classes Kotlin con propiedades val primitivas, Compose infiere estabilidad automáticamente. Para clases de librerías externas o con propiedades var, debes anotarlas manualmente para que Compose las trate como estables.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuáles son las tres capas de Clean Architecture y cómo dependen entre sí?',
          options: [
            'UI → ViewModel → Repository (dependencia en cascada hacia abajo)',
            'Presentation → Domain → Data, donde las capas externas dependen de las internas, nunca al revés',
            'Data → Business Logic → UI, donde todo depende de la capa de datos',
            'Network → Cache → UI, siguiendo el flujo de los datos en la app'
          ],
          correct: 1,
          explanation: 'Clean Architecture: Presentation (UI, ViewModel) depende de Domain (UseCases, interfaces de repositorio). Domain no depende de nada externo — es Kotlin puro. Data (Room, Retrofit, implementaciones) depende de Domain. La regla: las dependencias siempre apuntan hacia adentro (hacia Domain). Domain nunca importa clases de Android ni de la capa Data.'
        },
        {
          question: '¿Cuál es la principal diferencia entre MVVM y MVI?',
          options: [
            'MVVM usa Kotlin; MVI fue diseñado originalmente para Java',
            'MVVM puede tener múltiples StateFlows para distintas partes del UI; MVI tiene un único UiState inmutable con todo lo que necesita la pantalla',
            'MVI es un patrón obsoleto que está siendo reemplazado por MVVM',
            'MVVM es para apps pequeñas; MVI solo escala en apps grandes'
          ],
          correct: 1,
          explanation: 'MVVM típicamente tiene varios StateFlows (isLoading, error, data). MVI usa un único UiState sealed/data class con todo lo necesario para la UI. MVI añade Intents (acciones del usuario) que pasan por un reducer. Ventaja de MVI: estado predecible, sin inconsistencias entre múltiples flows, fácil de testear (dado Intent → esperas UiState exacto).'
        },
        {
          question: '¿Qué regla deben cumplir los UseCases en Clean Architecture?',
          options: [
            'Un UseCase puede llamar libremente a múltiples repositorios y otros UseCases',
            'Cada UseCase representa exactamente una acción de negocio y no depende de Android ni de fuentes de datos concretas',
            'Los UseCases deben ser clases abstractas para ser testeables con herencia',
            'Los UseCases solo pueden retornar Flow, nunca valores síncronos'
          ],
          correct: 1,
          explanation: 'Un UseCase encapsula una sola regla de negocio (ej: GetUserWithPostsUseCase). No debe importar clases de Android (Context, ViewModel), ni saber si los datos vienen de red o BD local. Depende solo de interfaces de repositorio definidas en Domain. Esto los hace 100% testeables con Kotlin puro, sin mocks de Android.'
        },
        {
          question: '¿Cómo aplica el Principio de Inversión de Dependencias (DIP) en Clean Architecture?',
          options: [
            'La capa Data importa clases de la capa Domain directamente para usarlas',
            'Domain define interfaces de repositorio; Data las implementa; Presentation usa las interfaces, nunca las implementaciones concretas',
            'Todas las capas dependen de una capa Core compartida con utilidades',
            'DIP no aplica en arquitecturas móviles, es un concepto de backend'
          ],
          correct: 1,
          explanation: 'DIP aplicado: Domain define "interface UserRepository" (abstracción). Data implementa "class UserRepositoryImpl : UserRepository". ViewModel recibe UserRepository (no UserRepositoryImpl) por inyección con Hilt. Domain no importa nada de la capa Data — la dependencia va de afuera hacia adentro, haciendo el dominio totalmente portátil.'
        },
        {
          question: '¿Por qué existe el patrón de mapeo entre capas (Entity → DomainModel → UiModel)?',
          options: [
            'Por rendimiento — los mapeos son más rápidos que usar la misma clase en todas las capas',
            'Para aislar las capas: cambios en el schema de BD no afectan la UI, y cambios en la UI no afectan el modelo de dominio',
            'Kotlin exige tipos distintos en cada capa para resolver genéricos correctamente',
            'Es una convención estética sin impacto real en mantenibilidad'
          ],
          correct: 1,
          explanation: 'La entidad DB tiene anotaciones técnicas (@Entity, @ColumnInfo). El modelo de dominio es Kotlin puro (sin anotaciones). El UiModel puede tener campos calculados para la UI (formattedPrice, displayName). Si cambia el schema de Room, solo cambia la capa Data y su mapeador. ViewModel y UI no se tocan.'
        },
        {
          question: '¿Qué problema resuelve el UiState único de MVI vs múltiples StateFlows independientes?',
          code: `data class CheckoutUiState(
    val isLoading: Boolean = false,
    val items: List<Item> = emptyList(),
    val total: Double = 0.0,
    val error: String? = null
)`,
          options: [
            'El UiState único consume menos memoria que múltiples StateFlows separados',
            'Evita estados inconsistentes: isLoading y error no pueden ser ambos verdaderos al mismo tiempo si el reducer es correcto',
            'El UiState único hace que Compose se recomponga menos veces',
            'MVI compila más rápido que MVVM en proyectos grandes'
          ],
          correct: 1,
          explanation: 'Con múltiples StateFlows separados (isLoading, error, data), la UI puede recibir dos updates en milisegundos distintos y mostrar un estado inconsistente (isLoading=false pero data todavía vacío). Con UiState único, el update es atómico: la UI siempre ve un estado coherente. Además, solo hay un objeto que verificar en tests.'
        },
        {
          question: '¿Cuál es el propósito del Repository pattern en la capa Data?',
          options: [
            'Hacer las queries de Room más rápidas mediante un caché en memoria',
            'Abstraer la fuente de datos (red, BD local, caché) tras una interfaz — el caller no sabe de dónde vienen los datos',
            'Gestionar la autenticación y los tokens de sesión de usuario',
            'Serializar y deserializar JSON automáticamente sin Retrofit'
          ],
          correct: 1,
          explanation: 'El Repository es el único lugar que sabe si los datos vienen de la API, de Room o de un caché en memoria. El ViewModel llama a repository.getUser(id) sin saber si hay red o si se sirve desde BD local. Esto permite cambiar la estrategia de datos (online-first, offline-first) sin tocar ViewModel ni UseCases.'
        },
        {
          question: '¿Qué elemento de MVI transforma el estado actual + un Intent en el nuevo estado?',
          options: [
            'ViewModel — mediante funciones públicas que actualizan el estado',
            'El Reducer — función pura (currentState, intent) → newState',
            'El Repository — que persiste el estado entre sesiones',
            'El UseCase — que contiene la lógica de negocio de la transformación'
          ],
          correct: 1,
          explanation: 'El Reducer es una función pura: dado el estado actual y un Intent (acción del usuario), produce el nuevo estado. Por ser pura (sin efectos secundarios), es trivialmente testeable: dado un estado y un intent, siempre produce el mismo resultado. Los efectos secundarios (llamadas de red) se manejan por separado con side effects o commands.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuándo usar @Provides vs @Inject constructor?',
          options: [
            '@Provides para clases propias; @Inject constructor para clases de librerías externas',
            '@Inject constructor cuando controlas la clase y puedes anotarla; @Provides en un @Module cuando es una librería externa, interfaz o requiere configuración especial con Builder',
            'Son completamente intercambiables, es solo una cuestión de preferencia de estilo',
            '@Provides tiene mejor rendimiento; @Inject constructor es el modo legacy'
          ],
          correct: 1,
          explanation: '@Inject constructor: anotas directamente el constructor de tu clase. Hilt sabe cómo crearla. Para tus propias clases. @Provides: necesario cuando la clase no es tuya (Retrofit, OkHttp), cuando es una interfaz, o cuando necesitas configuración especial. Se declara como función en un @Module.'
        },
        {
          question: '¿Qué diferencia hay entre @Singleton y @ViewModelScoped?',
          options: [
            '@Singleton es para la aplicación entera; @ViewModelScoped crea una instancia nueva por ViewModel que la solicita',
            'No hay diferencia práctica, solo semántica en el nombre',
            '@ViewModelScoped dura más que @Singleton en apps de larga duración',
            '@Singleton requiere @HiltAndroidApp; @ViewModelScoped no necesita nada especial'
          ],
          correct: 0,
          explanation: '@Singleton: una instancia durante toda la vida de la app. @ViewModelScoped: una instancia por ViewModel — cuando el ViewModel se destruye, el objeto también. Útil para objetos que deben ser únicos por sesión de pantalla pero no necesariamente globales (ej: un SearchRepository específico de esa pantalla).'
        },
        {
          question: '¿Para qué sirve @Binds y por qué el módulo debe ser abstract?',
          code: `@Module @InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds @Singleton
    abstract fun bindUserRepository(
        impl: UserRepositoryImpl
    ): UserRepository
}`,
          options: [
            '@Binds crea automáticamente la implementación de la interfaz UserRepository',
            '@Binds vincula una interfaz con su implementación concreta — cuando alguien pida UserRepository, Hilt proveerá UserRepositoryImpl. El módulo es abstract porque Hilt genera la implementación',
            '@Binds serializa el repositorio para persistencia entre sesiones',
            '@Binds es @Provides pero con un nombre distinto para funciones abstractas'
          ],
          correct: 1,
          explanation: '@Binds vincula una interfaz con su implementación de forma eficiente (Hilt genera menos código que @Provides). La condición: la implementación (UserRepositoryImpl) debe poder crearse por Hilt — tiene @Inject constructor. El módulo debe ser abstract porque no hay lógica de creación: Hilt genera la implementación del binding.'
        },
        {
          question: '¿Qué hace @HiltViewModel?',
          options: [
            'Hace que el ViewModel sea un Singleton accesible desde cualquier parte de la app',
            'Permite que Hilt inyecte dependencias en el constructor del ViewModel sin necesidad de ViewModelFactory',
            'Reemplaza ViewModel completamente con una clase generada por Hilt',
            'Limita el scope del ViewModel al Fragment donde se usa'
          ],
          correct: 1,
          explanation: '@HiltViewModel permite declarar dependencias en el constructor del ViewModel, y Hilt se encarga de inyectarlas. Sin @HiltViewModel, necesitarías un ViewModelFactory personalizado. También permite inyectar SavedStateHandle automáticamente en el constructor para persistir estado de UI.'
        },
        {
          question: '¿Cuál es la anotación obligatoria en la Application class para que Hilt funcione?',
          options: ['@HiltApplication', '@HiltAndroidApp', '@EnableHilt', '@HiltComponent'],
          correct: 1,
          explanation: '@HiltAndroidApp en tu clase Application es el punto de entrada de Hilt. Genera el componente Hilt raíz (SingletonComponent) y activa el procesamiento de anotaciones en toda la aplicación. Sin esta anotación, Hilt no funcionará aunque configures todos los módulos correctamente.'
        },
        {
          question: '¿Cómo se obtiene un ViewModel con dependencias Hilt en un Fragment con @AndroidEntryPoint?',
          options: [
            'UserViewModel(repository) — creándolo directamente con el constructor',
            'ViewModelProvider(this).get(UserViewModel::class.java) — modo estándar de Android',
            'val viewModel: UserViewModel by viewModels() — Hilt resuelve las dependencias automáticamente',
            'Hilt.getViewModel(this, UserViewModel::class) — método de la API de Hilt'
          ],
          correct: 2,
          explanation: 'Con @HiltViewModel en el ViewModel y @AndroidEntryPoint en el Fragment, el delegate by viewModels() funciona directamente. Hilt intercepta la creación del ViewModel e inyecta automáticamente todas las dependencias de su constructor. En Compose se usa hiltViewModel() del artefacto hilt-navigation-compose.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la proporción recomendada en la pirámide de testing?',
          options: [
            '10% unit, 20% integration, 70% UI — más cobertura visual',
            '70% unit tests, 20% integration tests, 10% UI/E2E tests',
            '33% de cada tipo para máximo equilibrio',
            'Solo unit tests y UI tests — los de integración son redundantes'
          ],
          correct: 1,
          explanation: 'La pirámide de testing: unit tests son rápidos, baratos y específicos (~70%). Integration tests verifican la colaboración de componentes (~20%). UI/E2E tests son lentos, frágiles y caros — solo para flujos críticos (~10%). Más tests unitarios = feedback más rápido y cobertura más granular.'
        },
        {
          question: '¿Para qué sirve la librería Turbine en los tests de Kotlin Flow?',
          options: [
            'Para mockear repositorios y ViewModels en tests de integración',
            'Para testear flows de forma declarativa: awaitItem() espera la siguiente emisión, awaitComplete() el final del flow, awaitError() una excepción',
            'Para ejecutar animaciones de Compose en tests con tiempo real',
            'Para generar datos de prueba aleatorios (test fixtures) automáticamente'
          ],
          correct: 1,
          explanation: 'Turbine simplifica el testing de flows. Sin Turbine, necesitas coroutines complejas para colectar y verificar emisiones. Con Turbine: viewModel.state.test { assertEquals(Loading, awaitItem()); assertEquals(Success(data), awaitItem()) }. Ideal para testear ViewModels que exponen StateFlow.'
        },
        {
          question: '¿Por qué MockK se prefiere sobre Mockito en proyectos Kotlin?',
          options: [
            'MockK tiene mejor integración con Gradle y es más rápido de compilar',
            'MockK está diseñado para Kotlin: soporta clases final, suspend functions, extension functions y companion objects nativamente sin configuración extra',
            'Mockito no puede funcionar en proyectos Android con minSdk < 26',
            'MockK genera menos código compilado que Mockito'
          ],
          correct: 1,
          explanation: 'Mockito fue diseñado para Java y tiene problemas con clases final (que Kotlin crea por defecto). MockK está hecho para Kotlin: soporta clases final, suspend functions, funciones de extensión, objetos singleton y companion objects sin plugins adicionales. Es el estándar de facto en proyectos Kotlin modernos.'
        },
        {
          question: '¿Por qué se necesita TestDispatcher en tests de coroutines?',
          options: [
            'Para que los tests corran más rápido usando múltiples threads en paralelo',
            'Para controlar el tiempo virtual — las coroutines se ejecutan de forma determinista sin race conditions en el test',
            'Para evitar que las coroutines se cancelen automáticamente durante los tests',
            'TestDispatcher solo es necesario para tests de UI con Compose Testing'
          ],
          correct: 1,
          explanation: 'En producción, las coroutines son asíncronas. En tests, necesitas control total. StandardTestDispatcher no avanza automáticamente — usas advanceUntilIdle() para ejecutar todo el trabajo pendiente. UnconfinedTestDispatcher ejecuta las coroutines inmediatamente. Ambos permiten tests deterministas sin timing issues.'
        },
        {
          question: '¿Cuál es la ventaja de Room.inMemoryDatabaseBuilder en tests?',
          options: [
            'La BD en memoria tiene mejor rendimiento que la BD en disco en producción',
            'La BD en memoria se crea limpia para cada test y se destruye al terminar — aislamiento total, tests reproducibles sin estado compartido',
            'Permite testear las migraciones de schema de Room automáticamente',
            'inMemoryDatabaseBuilder evita la necesidad de AndroidJUnit4 y anotaciones'
          ],
          correct: 1,
          explanation: 'La BD in-memory se crea vacía (@Before setup) y desaparece al terminar el test. No hay estado compartido entre tests, son 100% reproducibles y no dependen del estado del dispositivo. Puedes verificar queries SQL reales de Room sin mocks — tests de integración reales a velocidad de tests unitarios.'
        },
        {
          question: '¿Qué verifica este test de Compose?',
          code: `composeTestRule.setContent {
    UserList(users = listOf(User("Ana"), User("Bob")))
}
composeTestRule.onNodeWithText("Ana").assertIsDisplayed()`,
          options: [
            'Verifica que el ViewModel carga los usuarios correctamente desde el repositorio',
            'Verifica que el Composable renderiza los usuarios en pantalla — test de presentación aislado de ViewModel y repositorio',
            'Verifica la navegación al hacer click en un usuario de la lista',
            'El test tiene un error: setContent necesita un ViewModel, no datos directos'
          ],
          correct: 1,
          explanation: 'Es un test unitario de Compose: se pasa data directamente al Composable (sin ViewModel, sin repositorio) y se verifica que se renderiza correctamente. onNodeWithText("Ana").assertIsDisplayed() falla si el texto no está visible. Esta separación hace el test rápido, determinista y sin dependencias externas.'
        },
        {
          question: '¿Cuándo debes mockear dependencias vs usar implementaciones reales en tests?',
          options: [
            'Siempre mockear todo — máximo aislamiento garantiza la calidad del test',
            'Mockear lo que no controlas o es lento/inestable (APIs de red, servicios externos); usar implementaciones reales o in-memory para lo que puedes controlar fácilmente',
            'Nunca mockear — las implementaciones reales dan más confianza en los resultados',
            'Mockear solo en unit tests; usar siempre implementaciones reales en integration tests'
          ],
          correct: 1,
          explanation: 'Regla: mockea lo que no controlas o lo que es lento/inestable. Usa implementaciones reales cuando puedes (Room in-memory, fakes in-memory de repositorios). Demasiados mocks crean tests que pasan aunque el código real esté roto. Test doubles (fake, stub) son preferibles a mocks cuando son simples de implementar.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la ventaja de sealed class sobre enum class?',
          options: [
            'sealed class compila más rápido que enum class en proyectos grandes',
            'Las subclases de sealed class pueden tener propiedades distintas y ser data classes; enum solo tiene instancias únicas con las mismas propiedades para todas',
            'sealed class es thread-safe automáticamente; enum no lo es',
            'No hay diferencia práctica, solo es una cuestión de preferencia de estilo'
          ],
          correct: 1,
          explanation: 'enum class: cada variante es una sola instancia, pueden tener propiedades pero las mismas para todas. sealed class: cada subclase puede ser distinta (data class Success<T>, object Loading, data class Error(val msg)). Ambas garantizan exhaustividad en when. sealed se usa para estados con datos variables por variante.'
        },
        {
          question: '¿Qué permite la keyword reified en una función inline?',
          code: `inline fun <reified T> Context.getSystemService(): T =
    getSystemService(T::class.java)`,
          options: [
            'Hace que T sea nullable y seguro de llamar en cualquier contexto',
            'Permite acceder al tipo real de T en tiempo de ejecución, que normalmente se borra por type erasure de la JVM',
            'Marca la función como thread-safe para acceso concurrente',
            'reified es equivalente a @JvmStatic en el contexto de genéricos'
          ],
          correct: 1,
          explanation: 'Por type erasure de la JVM, los genéricos se borran en runtime (T es Object). inline + reified le pide al compilador que copie el tipo real en cada llamada, haciendo disponible T::class en runtime. Sin reified, tendrías que pasar Class<T> manualmente como parámetro adicional.'
        },
        {
          question: '¿Qué hace by lazy { } para una propiedad?',
          options: [
            'La propiedad se inicializa en un thread background automáticamente al arrancar la app',
            'La propiedad se inicializa solo la primera vez que se accede, y el resultado se cachea para accesos futuros',
            'La propiedad puede cambiar de valor en cualquier momento sin notificaciones',
            'by lazy es equivalente a lateinit var pero para propiedades val'
          ],
          correct: 1,
          explanation: 'by lazy { } crea una propiedad de delegación: el lambda solo se ejecuta la primera vez que se accede, y el resultado se cachea. Accesos posteriores devuelven el valor cacheado directamente. Por defecto es thread-safe (synchronized). Ideal para inicializaciones costosas que no siempre se necesitan (ej: parseo de datos, creación de objetos complejos).'
        },
        {
          question: '¿Cuál scope function es correcta en cada caso?',
          code: `// Configurar objeto tras crearlo:
val intent = Intent()._____ { putExtra("id", 1); addFlags(0) }

// Operar si no es null, retornar resultado transformado:
val name = user?._____{ "${it.firstName} ${it.lastName}" }`,
          options: [
            'apply, let',
            'run, also',
            'with, map',
            'also, run'
          ],
          correct: 0,
          explanation: 'apply: configura un objeto (this = objeto, retorna el objeto). Ideal para builders y configuración. let: ejecuta un bloque con el objeto como it, retorna el resultado del bloque. Con ?.let{} protege de null y transforma. Regla mnemotécnica: apply para mutación, let para transformación/null-check.'
        },
        {
          question: '¿Cuál es la limitación fundamental de las extension functions en Kotlin?',
          options: [
            'No pueden ser funciones suspendibles (suspend)',
            'Se resuelven en tiempo de compilación y no pueden acceder a miembros privados de la clase — si existe un método con la misma firma, la función de la clase tiene prioridad',
            'Solo pueden extender clases del mismo módulo o librería',
            'Las extension functions no pueden tener parámetros genéricos'
          ],
          correct: 1,
          explanation: 'Las extension functions se compilan como funciones estáticas que reciben el objeto como primer parámetro. No modifican realmente la clase: (1) no pueden acceder a miembros private/protected, (2) si la clase tiene un método con el mismo nombre y firma, el método de la clase siempre tiene prioridad sobre la extensión, (3) no participan en el polimorfismo.'
        },
        {
          question: '¿Cuándo usar data class vs class regular en Kotlin?',
          options: [
            'data class siempre — genera equals/hashCode automáticamente, mejora la calidad del código',
            'data class para objetos que representan datos con igualdad por valor (DTOs, estados, entidades); class regular cuando la identidad por referencia es importante o tiene herencia compleja',
            'class regular para objetos mutables; data class exclusivamente para inmutables',
            'data class en capa de datos; class regular en capa de presentación — convención arquitectónica'
          ],
          correct: 1,
          explanation: 'data class genera equals (por valor de propiedades), hashCode, toString, copy y componentN. Ideal para DTOs, estados de UI, entidades de dominio. class regular: cuando la identidad es lo importante (dos objetos con mismos datos son distintos), cuando tiene herencia compleja, o cuando no quieres que copy() sea parte de la API pública.'
        },
        {
          question: '¿Qué ventaja tiene delegar propiedades en SavedStateHandle con by?',
          code: `class SearchViewModel(handle: SavedStateHandle) : ViewModel() {
    var searchQuery: String by handle
    var selectedTab: Int by handle
}`,
          options: [
            'El handle persiste las propiedades automáticamente en SharedPreferences',
            'Las propiedades se almacenan en SavedStateHandle — sobreviven cuando el sistema mata el proceso en background y se restauran al volver',
            'La delegación por SavedStateHandle hace las propiedades thread-safe automáticamente',
            'Evita el boilerplate de Parcelable en los argumentos de Navigation Component'
          ],
          correct: 1,
          explanation: 'by SavedStateHandle delega el getter/setter al handle. Cuando el sistema mata el proceso para recuperar memoria (el usuario pone la app en background), SavedStateHandle persiste sus valores en el Bundle del sistema. Al volver, las propiedades tienen sus valores anteriores — sin código extra de onSaveInstanceState/onRestoreInstanceState.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál de estas situaciones causa un memory leak en Android?',
          options: [
            'Usar viewModelScope para lanzar coroutines de operaciones de red',
            'Guardar una referencia a Activity Context en un objeto Singleton que vive toda la aplicación',
            'Usar Room con Flow para observar cambios en la base de datos',
            'Crear múltiples instancias de ViewModel para la misma pantalla'
          ],
          correct: 1,
          explanation: 'Un Singleton vive durante toda la app. Si guarda una referencia a Activity (ciclo de vida más corto), la Activity no puede ser liberada por el GC aunque el usuario la haya cerrado. El Singleton la mantiene "viva". Siempre usa Application Context en Singletons. Para UI, usa WeakReference o evita guardar el contexto.'
        },
        {
          question: '¿Por qué este Composable puede causar recomposiciones innecesarias?',
          code: `@Composable
fun ProductList(vm: ProductViewModel) {
    val products by vm.products.collectAsStateWithLifecycle()
    LazyColumn {
        items(products) { product ->
            ProductItem(product, onClick = { vm.onSelect(product) })
        }
    }
}`,
          options: [
            'collectAsStateWithLifecycle no es compatible con LazyColumn',
            'La lambda onClick = { vm.onSelect(product) } se crea nueva en cada recomposición, causando que ProductItem se recomponga aunque product no haya cambiado',
            'vm.onSelect(product) no puede llamarse directamente desde Compose',
            'El código es perfectamente óptimo para Compose, no hay problema'
          ],
          correct: 1,
          explanation: 'En cada recomposición de ProductList, se crean nuevas instancias de la lambda onClick para cada item. Compose detecta que el parámetro onClick de ProductItem cambió (nueva referencia) y lo recompone. Solución: val onClick = remember { { p: Product -> vm.onSelect(p) } } o usar key() y @Stable en Product.'
        },
        {
          question: '¿Para qué sirve la anotación @Stable en una clase de datos en Compose?',
          options: [
            'Garantiza thread-safety del objeto para acceso desde múltiples coroutines',
            'Le indica al compilador de Compose que la clase es estable — sus propiedades públicas solo cambian con notificación, permitiendo saltarse recomposiciones si la instancia no cambió',
            'Marca la clase como serializable para navegación con Safe Args',
            '@Stable es equivalente a @Immutable pero permite propiedades mutables con val'
          ],
          correct: 1,
          explanation: 'Compose necesita saber si puede confiar en que un objeto no cambiará sin notificarle. @Stable indica: (1) equals() es estable, (2) si las propiedades cambian, se notifica a Compose. Con esto, Compose puede saltarse la recomposición de Composables cuyos parámetros @Stable no han cambiado. @Immutable es más fuerte: propiedades nunca cambian tras la creación.'
        },
        {
          question: '¿Cómo detecta LeakCanary un memory leak?',
          options: [
            'Compara el uso total de memoria antes y después de cada operación de navegación',
            'Usa WeakReferences y el GC: cuando un objeto debería ser recolectado pero sigue en memoria, genera un heap dump y analiza el árbol de referencias',
            'Monitoriza todas las llamadas a System.gc() e intercepta los objetos no liberados',
            'LeakCanary solo detecta leaks en Activities, no en Fragments ni en ViewModels'
          ],
          correct: 1,
          explanation: 'LeakCanary: cuando un objeto debe destruirse (ej: onDestroy de Activity), crea una WeakReference. Fuerza un GC. Si la WeakReference sigue apuntando al objeto (no fue recolectado), hay un leak. Genera un heap dump y analiza el árbol de referencias para encontrar exactamente qué objeto retiene la referencia y por qué.'
        },
        {
          question: '¿Para qué sirve la función key() en LazyColumn?',
          code: `LazyColumn {
    items(users, key = { user -> user.id }) { user ->
        UserCard(user, Modifier.animateItemPlacement())
    }
}`,
          options: [
            'key() es obligatorio para que LazyColumn renderice los items correctamente',
            'Identifica cada item de forma estable — Compose reutiliza el estado del item correcto al reordenar, insertar o eliminar, y habilita animaciones de reordenamiento',
            'key() agrupa items con el mismo id en secciones colapsables',
            'Mejora el rendimiento de scroll porque evita medir los items dos veces'
          ],
          correct: 1,
          explanation: 'Sin key(), Compose identifica items por posición. Insertar un item al principio hace que Compose crea que todos cambiaron. Con key(), Compose sabe que user.id=5 sigue siendo el mismo item aunque haya cambiado de posición. Esto preserva el estado interno de cada item y hace que animateItemPlacement() funcione correctamente.'
        },
        {
          question: '¿Qué son los Baseline Profiles y qué mejoran?',
          options: [
            'Ficheros de configuración de ProGuard/R8 para optimizar el tamaño del APK',
            'Reglas que le dicen a ART qué clases y métodos precompilar antes de la primera ejecución — mejoran el cold start y la fluidez del primer uso hasta un 40%',
            'Ficheros que almacenan el estado del usuario para restaurarlo tras un crash de la app',
            'Configuración de Gradle para paralelizar la compilación y reducir build times'
          ],
          correct: 1,
          explanation: 'ART normalmente compila bytecode a código máquina durante la primera ejecución (JIT). Los Baseline Profiles le dicen a ART qué código precompilar (AOT) antes del primer uso. Resultado: cold start significativamente más rápido y sin picos de jank (janky frames) en las primeras interacciones del usuario.'
        }
      ]
    }
  },

  {
    id: 'solid-principles',
    title: 'Principios SOLID en Kotlin',
    icon: '🔷',
    summary: 'Los cinco principios de diseño OOP que hacen el código mantenible, extensible y testeable. Pregunta garantizada en entrevistas Senior.',
    content: [
      {
        type: 'text',
        body: `<p>SOLID son cinco principios de diseño orientado a objetos formulados por Robert C. Martin ("Uncle Bob"). Dominarlos es indispensable para un puesto Senior — aparecen en prácticamente todas las entrevistas técnicas.</p>
        <h4>S — Single Responsibility Principle (SRP)</h4>
        <p>Una clase debe tener <strong>una sola razón para cambiar</strong>. Si una clase maneja autenticación Y envío de emails, un cambio en el sistema de emails afecta la clase de autenticación.</p>
        <h4>O — Open/Closed Principle (OCP)</h4>
        <p>El código debe estar <strong>abierto para extensión, cerrado para modificación</strong>. Añadir un nuevo tipo de pago no debe requerir modificar la clase de pagos existente.</p>
        <h4>L — Liskov Substitution Principle (LSP)</h4>
        <p>Los subtipos deben poder <strong>sustituir a sus tipos base sin alterar el comportamiento correcto</strong>. Si Square extiende Rectangle pero cambia el comportamiento de setWidth, viola LSP.</p>
        <h4>I — Interface Segregation Principle (ISP)</h4>
        <p>Los clientes <strong>no deben depender de interfaces que no usan</strong>. Una interfaz grande con métodos que no todas las implementaciones necesitan debe separarse en interfaces pequeñas.</p>
        <h4>D — Dependency Inversion Principle (DIP)</h4>
        <p>Depende de <strong>abstracciones, no de implementaciones</strong>. El ViewModel debe recibir una interfaz Repository, no una clase concreta. Hilt implementa DIP automáticamente.</p>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// ═══ SRP — Single Responsibility ═══════════════════
// ❌ Mal: una clase con tres responsabilidades
class UserManager {
    fun authenticate(email: String, pwd: String): Boolean { ... }
    fun saveToDatabase(user: User) { ... }
    fun sendWelcomeEmail(user: User) { ... }
}

// ✅ Bien: cada clase tiene UNA responsabilidad
class AuthService { fun authenticate(email: String, pwd: String): Boolean { ... } }
class UserRepository { fun save(user: User) { ... } }
class EmailService { fun sendWelcome(user: User) { ... } }

// ═══ OCP — Open/Closed ══════════════════════════════
// ❌ Mal: hay que modificar la clase para cada nuevo tipo de pago
class PaymentProcessor {
    fun process(type: String, amount: Double) {
        when (type) {
            "CARD" -> processCard(amount)
            "CRYPTO" -> processCrypto(amount)
            // Añadir PayPal → modificar esta clase ❌
        }
    }
}

// ✅ Bien: extensible sin tocar código existente
interface PaymentMethod { fun process(amount: Double) }
class CardPayment : PaymentMethod { override fun process(amount: Double) { ... } }
class CryptoPayment : PaymentMethod { override fun process(amount: Double) { ... } }
// Añadir PayPalPayment : PaymentMethod — sin tocar PaymentProcessor ✅

// ═══ LSP — Liskov Substitution ══════════════════════
// ❌ Mal: Square viola LSP
open class Rectangle {
    open var width = 0; open var height = 0
    fun area() = width * height
}
class Square : Rectangle() {
    override var width: Int = 0
        set(value) { field = value; super.height = value } // rompe expectativas
}
// val r: Rectangle = Square(); r.width = 5; r.height = 10 → area() = 100, no 50 ❌

// ✅ Bien: abstracción común en lugar de herencia inapropiada
interface Shape { fun area(): Int }
data class Rect(val w: Int, val h: Int) : Shape { override fun area() = w * h }
data class Sq(val side: Int) : Shape { override fun area() = side * side }

// ═══ ISP — Interface Segregation ════════════════════
// ❌ Mal: interfaz "gorda" — Robot no puede eat() ni sleep()
interface Worker { fun work(); fun eat(); fun sleep() }

// ✅ Bien: interfaces pequeñas y específicas
interface Workable { fun work() }
interface Feedable { fun eat() }
class HumanWorker : Workable, Feedable { override fun work() {} override fun eat() {} }
class RobotWorker : Workable { override fun work() {} } // solo lo que puede

// ═══ DIP — Dependency Inversion ═════════════════════
// ❌ Mal: acoplado a implementación concreta
class UserViewModel : ViewModel() {
    private val repo = UserRepositoryImpl() // ❌ difícil de testear
}

// ✅ Bien: depende de abstracción, Hilt inyecta la concreción
class UserViewModel @Inject constructor(
    private val repo: UserRepository // interfaz — Hilt provee la implementación ✅
) : ViewModel()`
      },
      {
        type: 'tip',
        body: '<strong>En entrevistas:</strong> Cuando te pregunten por SOLID, da siempre un ejemplo de código Android. La conexión más potente: DIP + Hilt (inyección de interfaces), OCP + strategy pattern (nuevos tipos de pago/notificación sin modificar clases existentes), SRP + Clean Architecture (separación en capas).'
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué dice el Principio de Responsabilidad Única (SRP)?',
          options: [
            'Una clase debe tener un único método público para simplificar su API',
            'Una clase debe tener una sola razón para cambiar — encapsula una única responsabilidad',
            'Cada función del código debe tener una sola llamada de retorno',
            'Cada módulo de la app debe tener un único ViewModel asociado'
          ],
          correct: 1,
          explanation: 'SRP: "Una clase debe tener una sola razón para cambiar". Si UserManager maneja autenticación Y envío de emails, cambios en el sistema de emails obligan a tocar (y re-testear) la clase de autenticación. Separar responsabilidades hace el código más mantenible, testeable y fácil de entender.'
        },
        {
          question: '¿Qué principio viola este código?',
          code: `class PaymentProcessor {
    fun process(type: String, amount: Double) {
        when (type) {
            "CARD" -> processCard(amount)
            "CRYPTO" -> processCrypto(amount)
            // Cada nuevo tipo requiere modificar aquí
        }
    }
}`,
          options: [
            'SRP — PaymentProcessor tiene demasiados métodos privados',
            'OCP — para añadir un nuevo método de pago hay que modificar la clase existente',
            'DIP — PaymentProcessor depende de implementaciones concretas',
            'ISP — la interfaz es demasiado amplia'
          ],
          correct: 1,
          explanation: 'OCP (Open/Closed): el código debe estar abierto para extensión pero cerrado para modificación. Cada nuevo tipo de pago requiere modificar PaymentProcessor — violando OCP. Solución: interface PaymentMethod { fun process(amount) }. Cada nuevo tipo es una nueva clase que la implementa, sin tocar el procesador existente.'
        },
        {
          question: '¿Cuál es el problema clásico de LSP con Square extends Rectangle?',
          options: [
            'Square ocupa más memoria que Rectangle al heredar todas sus propiedades',
            'Si Square.setWidth() también cambia la altura, el comportamiento esperado de Rectangle se rompe — el subtipo no puede sustituir al base sin alterar el programa',
            'Kotlin no permite heredar de clases con propiedades abiertas (open)',
            'LSP solo aplica a clases abstractas, no a clases concretas con herencia'
          ],
          correct: 1,
          explanation: 'val r: Rectangle = Square(); r.width = 5; r.height = 10 → esperamos area() = 50. Pero Square mantiene width == height, así que area() = 100. El subtipo (Square) no puede sustituir al tipo base (Rectangle) sin alterar el comportamiento. Solución: ambos implementan interface Shape { fun area() } sin herencia.'
        },
        {
          question: '¿Qué principio viola una interfaz con métodos que algunas clases dejan vacíos o lanzan UnsupportedOperationException?',
          options: [
            'SRP — la interfaz tiene demasiadas responsabilidades en un mismo contrato',
            'OCP — la interfaz no es extensible para nuevas implementaciones',
            'ISP — los clientes dependen de métodos que no usan, forzando implementaciones vacías',
            'DIP — las clases dependen de la interfaz concreta en lugar de la abstracción'
          ],
          correct: 2,
          explanation: 'ISP: "ningún cliente debe ser forzado a depender de métodos que no usa". Si RobotWorker implementa Worker con eat() y sleep() vacíos, la interfaz es demasiado grande. Solución: interfaces pequeñas (Workable, Feedable, Restable) que cada clase implementa solo según sus capacidades reales.'
        },
        {
          question: '¿Cómo implementa Hilt el Principio de Inversión de Dependencias?',
          options: [
            'Hilt genera automáticamente las interfaces para cada clase de repositorio',
            'El ViewModel declara dependencias de interfaces en su constructor; Hilt inyecta las implementaciones concretas — el ViewModel nunca conoce qué implementación recibe',
            'Hilt invierte el orden de inicialización de las dependencias en el grafo',
            'DIP en Hilt significa que las dependencias se crean de forma perezosa (lazy)'
          ],
          correct: 1,
          explanation: 'DIP: "depende de abstracciones, no de implementaciones". Con Hilt: el ViewModel declara UserRepository (interfaz) en su constructor, nunca UserRepositoryImpl. Hilt, configurado con @Binds en un @Module, sabe qué implementación concreta inyectar. El ViewModel no sabe si los datos vienen de red o BD local.'
        },
        {
          question: '¿Cuál principio SOLID se vulnera cuando un ViewModel instancia directamente sus dependencias?',
          code: `class OrderViewModel : ViewModel() {
    private val repo = OrderRepositoryImpl(
        api = RetrofitClient.orderApi,
        db = AppDatabase.getInstance()
    )
}`,
          options: [
            'SRP — el ViewModel hace demasiadas cosas al instanciar sus dependencias',
            'OCP — el ViewModel no puede extenderse con nuevas fuentes de datos',
            'DIP — el ViewModel depende de implementaciones concretas, imposibilitando testear con mocks',
            'ISP — OrderRepositoryImpl implementa demasiados métodos de interfaz'
          ],
          correct: 2,
          explanation: 'DIP violado: el ViewModel conoce e instancia la implementación concreta. Consecuencias: (1) imposible inyectar mocks en tests unitarios, (2) para cambiar la fuente de datos hay que modificar el ViewModel, (3) el ViewModel está acoplado a la capa de datos. Solución: inyectar OrderRepository (interfaz) via Hilt.'
        },
        {
          question: '¿Qué principio está directamente relacionado con añadir nuevas features (plugins, nuevos tipos) sin tocar código existente?',
          options: [
            'SRP — porque cada clase nueva tiene su propia responsabilidad',
            'OCP — abierto para extensión (nuevas clases/implementaciones), cerrado para modificación del código existente',
            'LSP — porque los nuevos subtipos pueden sustituir a los existentes',
            'DIP — porque las nuevas features dependen de abstracciones'
          ],
          correct: 1,
          explanation: 'OCP es el principio que habilita la extensibilidad. Técnicas: interfaces/abstract classes (nuevas implementaciones sin tocar existentes), Strategy pattern, Decorator. En Android: añadir un nuevo tipo de notificación implementando NotificationStrategy — sin tocar NotificationManager. El código abierto (open for extension) acepta nuevos comportamientos sin cambiar.'
        },
        {
          question: '¿Cuáles principios SOLID son los más críticos en el día a día de Android Senior?',
          options: [
            'LSP e ISP — porque Kotlin usa herencia e interfaces constantemente',
            'DIP y SRP — DIP permite testear (mocks), SRP hace el código mantenible. OCP, LSP e ISP surgen naturalmente del buen diseño',
            'OCP y ISP — porque definen cómo diseñar las interfaces de los módulos',
            'Todos son igualmente críticos y deben aplicarse simultáneamente siempre'
          ],
          correct: 1,
          explanation: 'En la práctica: DIP (inyección de dependencias via Hilt) + SRP (clases pequeñas y enfocadas) son el foundation — sin ellos no puedes testear ni mantener el código. OCP aplica naturalmente cuando diseñas con interfaces (Strategy, Observer). ISP surge cuando las interfaces crecen. LSP se asegura cuando eliges composición sobre herencia.'
        }
      ]
    }
  },

  {
    id: 'design-patterns',
    title: 'Patrones de Diseño para Mobile',
    icon: '🧩',
    summary: 'Repository, Observer, Factory, Builder, Strategy y Singleton — con ejemplos Android/Kotlin y cuándo (no) usarlos.',
    content: [
      {
        type: 'text',
        body: `<p>Los patrones de diseño son soluciones probadas a problemas recurrentes de software. En entrevistas Senior te preguntarán cuáles usas, cuándo y por qué. Conocer el nombre sin el contexto de uso no convence.</p>
        <h4>Creacionales — Cómo crear objetos</h4>
        <ul>
          <li><strong>Singleton</strong> — una sola instancia. Usado para Application, base de datos, cliente HTTP. Riesgo: estado global, difícil de testear.</li>
          <li><strong>Factory / Abstract Factory</strong> — crea objetos sin exponer la lógica de creación. Útil cuando el tipo concreto se decide en runtime.</li>
          <li><strong>Builder</strong> — construye objetos complejos paso a paso. Kotlin lo facilita con named parameters y default values.</li>
        </ul>
        <h4>Estructurales — Cómo organizar objetos</h4>
        <ul>
          <li><strong>Repository</strong> — abstrae la fuente de datos (red, BD, caché) tras una interfaz uniforme.</li>
          <li><strong>Decorator</strong> — añade comportamiento a un objeto sin modificar su clase. OkHttp Interceptors son decorators.</li>
          <li><strong>Adapter</strong> — convierte una interfaz en otra. RecyclerView.Adapter adapta datos a Views.</li>
        </ul>
        <h4>Comportamentales — Cómo colaboran los objetos</h4>
        <ul>
          <li><strong>Observer</strong> — notifica a suscriptores de cambios. La base de LiveData, Flow y Jetpack Compose.</li>
          <li><strong>Strategy</strong> — algoritmo intercambiable en runtime. Diferente estrategia de caché según conectividad.</li>
          <li><strong>Command</strong> — encapsula una acción como objeto. MVI Intents son commands.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// ═══ Repository Pattern ════════════════════════════
interface UserRepository {
    suspend fun getUser(id: Int): User
    fun observeUsers(): Flow<List<User>>
}

class UserRepositoryImpl(
    private val api: UserApi,
    private val dao: UserDao
) : UserRepository {
    override suspend fun getUser(id: Int): User {
        return try {
            val remote = api.getUser(id)
            dao.insert(remote.toEntity())
            remote
        } catch (e: IOException) {
            dao.getUser(id)?.toDomain() ?: throw e // offline fallback
        }
    }
    override fun observeUsers(): Flow<List<User>> = dao.observeAll().map { it.map { e -> e.toDomain() } }
}

// ═══ Factory Pattern ════════════════════════════════
interface Notification
data class PushNotification(val title: String) : Notification
data class EmailNotification(val subject: String) : Notification

object NotificationFactory {
    fun create(type: String, content: String): Notification = when (type) {
        "PUSH" -> PushNotification(content)
        "EMAIL" -> EmailNotification(content)
        else -> throw IllegalArgumentException("Unknown type: $type")
    }
}

// ═══ Builder Pattern (Kotlin style) ═════════════════
// Kotlin: named parameters + defaults eliminan el Builder clásico
data class ApiConfig(
    val baseUrl: String,
    val timeout: Long = 30_000,
    val retries: Int = 3,
    val cacheSize: Long = 10 * 1024 * 1024
)
val config = ApiConfig(baseUrl = "https://api.revolut.com", timeout = 60_000)

// ═══ Observer Pattern (Kotlin Flow) ═════════════════
// Flow es el patrón Observer moderno en Kotlin
class StockPriceViewModel @Inject constructor(
    private val repository: StockRepository
) : ViewModel() {
    // Observable — cualquier colector recibe actualizaciones
    val stockPrice: StateFlow<Double> = repository.observePrice("RVLT")
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
}

// ═══ Strategy Pattern ═══════════════════════════════
interface CacheStrategy {
    suspend fun <T> load(key: String, fetcher: suspend () -> T): T
}

class NetworkFirstStrategy(private val api: Api, private val cache: Cache) : CacheStrategy {
    override suspend fun <T> load(key: String, fetcher: suspend () -> T): T {
        return try { fetcher().also { cache.put(key, it) } }
        catch (e: IOException) { cache.get(key) ?: throw e }
    }
}

class CacheFirstStrategy(private val cache: Cache, private val api: Api) : CacheStrategy {
    override suspend fun <T> load(key: String, fetcher: suspend () -> T): T {
        return cache.get(key) ?: fetcher().also { cache.put(key, it) }
    }
}

// ═══ Decorator — OkHttp Interceptor ═════════════════
class AuthInterceptor(private val tokenProvider: TokenProvider) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer ${tokenProvider.getToken()}")
            .build()
        return chain.proceed(request)  // decora la request original
    }
}`
      },
      {
        type: 'tip',
        body: '<strong>En Kotlin:</strong> Muchos patrones clásicos de Java tienen implementación más simple en Kotlin. Singleton: <code>object</code>. Builder: named parameters con defaults. Observer: Flow/StateFlow. Conocer cuándo Kotlin ya resuelve el patrón de forma nativa demuestra madurez técnica.'
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué problema resuelve el Repository pattern y dónde vive en Clean Architecture?',
          options: [
            'Repository resuelve la caché automática de datos y vive en la capa Domain',
            'Repository abstrae la fuente de datos (red, BD, caché) tras una interfaz — la interfaz vive en Domain, la implementación en Data',
            'Repository gestiona la autenticación y vive en la capa de seguridad',
            'Repository es un patrón de UI para gestionar el estado de la pantalla'
          ],
          correct: 1,
          explanation: 'Repository: la interfaz se define en Domain (UserRepository), la implementación en Data (UserRepositoryImpl). El ViewModel llama repository.getUser() sin saber si los datos vienen de la API, Room o caché en memoria. Permite cambiar la estrategia de datos sin tocar la lógica de negocio.'
        },
        {
          question: '¿Qué patrón de diseño representan los Interceptors de OkHttp?',
          options: [
            'Factory — crean diferentes tipos de requests según la configuración',
            'Observer — observan las responses de la red y notifican cambios',
            'Decorator — añaden comportamiento (auth, logging, retry) a las requests sin modificar la clase base',
            'Strategy — deciden qué estrategia de red usar según la conectividad'
          ],
          correct: 2,
          explanation: 'Decorator: añade comportamiento a un objeto sin modificar su clase. Los Interceptors de OkHttp envuelven la request original, añadiendo headers de autenticación, logging o retry logic, y delegan la llamada real a chain.proceed(request). La request no sabe que está siendo decorada.'
        },
        {
          question: '¿Qué patrón de diseño implementan Flow y StateFlow en Kotlin?',
          options: [
            'Strategy — permiten elegir la estrategia de procesamiento de datos',
            'Observer — el productor emite valores, los consumidores (colectores) reciben notificaciones de cambios',
            'Factory — crean objetos de forma lazy cuando se necesitan',
            'Command — encapsulan operaciones como objetos que se ejecutan después'
          ],
          correct: 1,
          explanation: 'Observer/Reactive: Flow es la implementación moderna del patrón Observer en Kotlin. El productor (ViewModel) emite valores; los consumidores (UI) se suscriben y reciben actualizaciones. StateFlow es un Observable con estado actual siempre disponible. LiveData también sigue este patrón pero está ligado al lifecycle.'
        },
        {
          question: '¿Por qué Kotlin hace innecesario el patrón Builder clásico de Java en la mayoría de casos?',
          options: [
            'Kotlin tiene una anotación @Builder que lo genera automáticamente',
            'Los named parameters y los valores por defecto en constructores/funciones logran el mismo objetivo con menos boilerplate',
            'Kotlin no soporta el patrón Builder porque es un antipatrón',
            'El patrón Builder solo es útil en Java — en Kotlin se usa siempre data class'
          ],
          correct: 1,
          explanation: 'Java necesita Builder porque no tiene named parameters. En Kotlin: ApiConfig(baseUrl = "...", timeout = 60_000) usa named params y defaults — es más legible y seguro (tipo verificado) que el Builder clásico. El Builder Kotlin sí tiene sentido para APIs Java-interop o para configuraciones muy complejas con validación.'
        },
        {
          question: '¿Qué patrón representa el concepto de MVI Intents en una arquitectura móvil?',
          options: [
            'Observer — los intents observan cambios de estado en el ViewModel',
            'Strategy — cada intent representa una estrategia de procesamiento diferente',
            'Command — cada intent encapsula una acción del usuario como objeto que el ViewModel puede procesar',
            'Factory — los intents crean las instancias de UiState correspondientes'
          ],
          correct: 2,
          explanation: 'Command: encapsula una acción/solicitud como objeto. En MVI, cada Intent (LoadUsers, RefreshData, SelectUser) es un command que contiene toda la información necesaria para ejecutar la acción. El ViewModel puede encolarlos, re-ejecutarlos o deshacer acciones — ventajas del patrón Command.'
        },
        {
          question: '¿Cuándo usar Strategy pattern en una app Android?',
          options: [
            'Cuando quieres tener múltiples implementaciones de un algoritmo que son intercambiables en runtime',
            'Cuando necesitas crear objetos de diferentes tipos sin conocer el tipo exacto',
            'Cuando varios objetos deben ser notificados de cambios en otro objeto',
            'Strategy solo aplica a algoritmos de ordenación y búsqueda, no a apps móviles'
          ],
          correct: 0,
          explanation: 'Strategy: define una familia de algoritmos, encapsula cada uno e intercambialos. Ejemplo Android: CacheStrategy (NetworkFirst vs CacheFirst), NotificationStrategy (Push vs Email vs InApp), AuthStrategy (Biometric vs PIN vs Password). Permites cambiar el comportamiento en runtime sin if/when en el código que lo usa.'
        },
        {
          question: '¿Cuál es el riesgo del patrón Singleton y cómo se mitiga en Android con Hilt?',
          options: [
            'El Singleton consume demasiada memoria en dispositivos de gama baja',
            'Estado global compartido que dificulta el testing (no se puede aislar) y puede causar leaks. Hilt gestiona Singletons con @Singleton, que son mockeables en tests',
            'El Singleton no es thread-safe en la JVM y causa race conditions',
            'Los Singletons en Android son destruidos por el sistema cuando la app va a background'
          ],
          correct: 1,
          explanation: 'El Singleton tiene estado global que hace los tests difíciles (no puedes aislar el comportamiento) y puede retener referencias a Contexts causando leaks. Con Hilt @Singleton, el contenedor gestiona la única instancia; en tests, Hilt permite reemplazar el Singleton por un mock o fake via TestInstallIn, manteniendo las ventajas sin los riesgos del Singleton clásico.'
        }
      ]
    }
  },

  {
    id: 'security-android',
    title: 'Seguridad en Android (Fintech)',
    icon: '🔒',
    summary: 'Certificate pinning, EncryptedSharedPreferences, Android Keystore, ProGuard/R8 y OWASP Mobile Top 10. Crítico para Revolut.',
    content: [
      {
        type: 'text',
        body: `<p>La seguridad en una app fintech es crítica. Revolut maneja datos financieros sensibles, por lo que cualquier vulnerabilidad tiene consecuencias graves. Estos son los temas de seguridad más frecuentes en entrevistas para apps de banca y pagos.</p>
        <h4>Seguridad en datos en tránsito</h4>
        <ul>
          <li><strong>HTTPS</strong> — siempre, sin excepciones. Android bloquea tráfico HTTP en texto plano por defecto (Network Security Config).</li>
          <li><strong>Certificate Pinning</strong> — verifica que el certificado del servidor es exactamente el esperado, protegiendo contra ataques MITM (Man-in-the-Middle) incluso con certificados de CA válidos.</li>
          <li><strong>TLS 1.3</strong> — usar la versión más moderna, deshabilitar versiones antiguas.</li>
        </ul>
        <h4>Seguridad en datos en reposo</h4>
        <ul>
          <li><strong>EncryptedSharedPreferences</strong> — cifra claves y valores automáticamente usando AES-256-GCM.</li>
          <li><strong>Android Keystore</strong> — almacena claves criptográficas en hardware seguro (TEE/StrongBox). Las claves nunca salen del Keystore.</li>
          <li><strong>Room con SQLCipher</strong> — para cifrar bases de datos completas.</li>
        </ul>
        <h4>Autenticación y autorización</h4>
        <ul>
          <li><strong>BiometricPrompt</strong> — autenticación biométrica con fallback a credenciales del dispositivo.</li>
          <li><strong>Tokens seguros</strong> — nunca guardar tokens en SharedPreferences sin cifrar o en logs.</li>
        </ul>
        <h4>OWASP Mobile Top 10 (principales riesgos)</h4>
        <ul>
          <li>M1: Uso inadecuado de la plataforma (permisos innecesarios, backups inseguros)</li>
          <li>M2: Almacenamiento de datos inseguro (SharedPreferences sin cifrar, logs)</li>
          <li>M3: Comunicación insegura (HTTP, sin certificate pinning)</li>
          <li>M4: Autenticación insegura (PINs débiles, sin biometría)</li>
          <li>M9: Ingeniería inversa (sin ProGuard/R8, sin anti-debugging)</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// ═══ Certificate Pinning con OkHttp ════════════════
val certificatePinner = CertificatePinner.Builder()
    .add(
        "api.revolut.com",
        "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" // hash del certificado público
    )
    .build()

val okHttpClient = OkHttpClient.Builder()
    .certificatePinner(certificatePinner)
    .build()
// Si el servidor presenta un certificado diferente → SSLPeerUnverifiedException
// MITM attacks bloqueados aunque el atacante tenga una CA válida

// ═══ EncryptedSharedPreferences ═════════════════════
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

// Uso idéntico a SharedPreferences normales — cifrado transparente
securePrefs.edit { putString("auth_token", token) }
val token = securePrefs.getString("auth_token", null)

// ═══ Android Keystore — claves en hardware seguro ════
val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
keyGenerator.init(
    KeyGenParameterSpec.Builder("my_key_alias", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setUserAuthenticationRequired(true) // requiere biometría para acceder
        .setInvalidatedByBiometricEnrollment(true) // invalida si cambian huellas
        .build()
)
val secretKey = keyGenerator.generateKey()
// La clave NUNCA sale del hardware seguro (TEE/StrongBox)

// ═══ BiometricPrompt ════════════════════════════════
val biometricPrompt = BiometricPrompt(
    activity,
    ContextCompat.getMainExecutor(context),
    object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
            val cryptoObject = result.cryptoObject
            // Usar cryptoObject para cifrar/descifrar datos
        }
        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) { ... }
        override fun onAuthenticationFailed() { ... }
    }
)

val promptInfo = BiometricPrompt.PromptInfo.Builder()
    .setTitle("Confirma tu identidad")
    .setNegativeButtonText("Cancelar")
    .setAllowedAuthenticators(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)
    .build()

biometricPrompt.authenticate(promptInfo, BiometricPrompt.CryptoObject(cipher))

// ═══ ProGuard/R8 — ofuscación ════════════════════════
// build.gradle.kts
android {
    buildTypes {
        release {
            isMinifyEnabled = true     // activa R8/ProGuard
            isShrinkResources = true   // elimina recursos no usados
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

// proguard-rules.pro — mantener clases necesarias
-keep class com.revolut.api.** { *; }  // modelos de API (Gson/Moshi)
-keepattributes Signature             // genéricos para Gson`
      },
      {
        type: 'warning',
        body: 'Nunca almacenes tokens de autenticación, claves API o datos sensibles en SharedPreferences sin cifrar, en logs, en Bundle de Activities (visible en ADB) ni en código fuente. En producción, activa siempre R8/ProGuard y certificate pinning.'
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Para qué sirve el Certificate Pinning y qué ataque previene?',
          options: [
            'Acelera las conexiones HTTPS al precargar el certificado del servidor',
            'Verifica que el certificado del servidor es exactamente el esperado, previniendo ataques MITM incluso con CAs válidas comprometidas',
            'Previene que otras apps del dispositivo intercepten el tráfico de tu app',
            'Requiere que el usuario confirme el certificado al primer uso'
          ],
          correct: 1,
          explanation: 'Certificate pinning va más allá de HTTPS. HTTPS verifica que el certificado es de una CA de confianza. Pinning verifica que es EXACTAMENTE el certificado esperado. Si un atacante tiene acceso a una CA válida (o instala una en el dispositivo) y hace MITM, HTTPS no lo detecta. Certificate pinning sí lo detecta y lanza SSLPeerUnverifiedException.'
        },
        {
          question: '¿Cuál es la forma correcta de almacenar un token de autenticación en Android?',
          options: [
            'SharedPreferences normal — es privado a la app, nadie más puede acceder',
            'En una constante del código fuente — siempre disponible y sin overhead',
            'EncryptedSharedPreferences con AES-256-GCM — cifrado transparente respaldado por Android Keystore',
            'En la base de datos Room sin cifrar — Room ya tiene seguridad incorporada'
          ],
          correct: 2,
          explanation: 'SharedPreferences normal: un dispositivo rooteado puede leer los archivos. El código fuente es visible tras ingeniería inversa. Room sin cifrar: también accesible con root. EncryptedSharedPreferences usa AES-256-GCM para cifrar claves y valores, con la clave maestra almacenada en Android Keystore (hardware seguro en dispositivos modernos).'
        },
        {
          question: '¿Qué garantía ofrece Android Keystore que no ofrece guardar la clave en EncryptedSharedPreferences?',
          options: [
            'Android Keystore permite usar la clave en múltiples aplicaciones a la vez',
            'Las claves generadas en Keystore nunca salen del hardware seguro (TEE/StrongBox) — imposible extraerlas aunque el dispositivo esté rooteado',
            'Keystore cifra las claves con SHA-256, mientras EncryptedSharedPreferences usa MD5',
            'Android Keystore es más rápido porque usa aceleración hardware para el cifrado'
          ],
          correct: 1,
          explanation: 'Android Keystore almacena las claves criptográficas en el TEE (Trusted Execution Environment) o StrongBox (chip de seguridad dedicado). Las operaciones criptográficas se realizan dentro del hardware seguro — la clave nunca se expone en memoria de la aplicación. Incluso con root no puedes extraer la clave, solo puedes usarla (con autenticación de usuario si se configuró así).'
        },
        {
          question: '¿Qué hace isMinifyEnabled = true en el build.gradle.kts?',
          options: [
            'Activa la compresión de imágenes para reducir el tamaño del APK',
            'Activa R8/ProGuard: ofusca nombres de clases/métodos, elimina código no usado (tree shaking) y optimiza bytecode',
            'Minimiza el número de permisos que solicita la app al instalarse',
            'Activa la compresión del APK para descargas más rápidas desde Play Store'
          ],
          correct: 1,
          explanation: 'isMinifyEnabled = true activa R8 (el nuevo ProGuard integrado en Android). R8 hace tres cosas: (1) ofusca nombres (UserRepository → a.b), dificultando la ingeniería inversa; (2) elimina código muerto (tree shaking) reduciendo el tamaño del APK; (3) optimiza el bytecode. Siempre activado en release builds de producción.'
        },
        {
          question: '¿Qué vulnerabilidad de OWASP Mobile Top 10 comete este código?',
          code: `fun loginUser(username: String, password: String) {
    val prefs = getSharedPreferences("auth", MODE_PRIVATE)
    prefs.edit {
        putString("username", username)
        putString("password", password)  // guardado en texto plano
    }
    Log.d("Auth", "Login: user=$username pwd=$password")  // en logs
}`,
          options: [
            'M1: Uso inadecuado de la plataforma — permisos incorrectos',
            'M2: Almacenamiento de datos inseguro — credenciales en SharedPreferences sin cifrar y en logs',
            'M3: Comunicación insegura — no usa HTTPS',
            'M4: Autenticación insegura — no usa biometría'
          ],
          correct: 1,
          explanation: 'M2 (Insecure Data Storage): nunca almacenar contraseñas en texto plano, ni en SharedPreferences ni en logs. SharedPreferences accesible con root. Los logs son visibles en ADB (adb logcat) por cualquier app con permiso READ_LOGS. Solución: nunca guardar passwords (guardar solo el hash o token), usar EncryptedSharedPreferences, y nunca loguear datos sensibles.'
        },
        {
          question: '¿Qué opción de BiometricPrompt debes usar para máxima seguridad en una app de pagos?',
          options: [
            'BIOMETRIC_WEAK — acepta face unlock y huellas — máxima usabilidad',
            'BIOMETRIC_STRONG — requiere biometría clase 3 (huella, iris) vinculada a operación criptográfica',
            'DEVICE_CREDENTIAL — usa el PIN/patrón del dispositivo, más seguro que biometría',
            'No importa el nivel — cualquier biometría es igual de segura para pagos'
          ],
          correct: 1,
          explanation: 'BIOMETRIC_STRONG (Clase 3) requiere biometría con tasa de aceptación falsa < 1/50000 (ej: huella táctil) y permite usar un CryptoObject — la operación criptográfica solo se puede realizar si la biometría es exitosa. BIOMETRIC_WEAK (Clase 2, ej: face unlock simple) no permite CryptoObject. Para apps fintech, siempre usar BIOMETRIC_STRONG con CryptoObject.'
        }
      ]
    }
  },

  {
    id: 'modularization',
    title: 'Modularización y Multi-módulo',
    icon: '📦',
    summary: 'Feature modules, build time, encapsulación de código, Version Catalogs y dependency graph — arquitectura de proyectos Android a escala.',
    content: [
      {
        type: 'text',
        body: `<p>La modularización es clave en proyectos Android grandes. Revolut tiene cientos de features y múltiples squads — un monolito hace imposible el trabajo en paralelo y el build time crece exponencialmente.</p>
        <h4>¿Por qué modularizar?</h4>
        <ul>
          <li><strong>Build time</strong> — Gradle solo recompila los módulos que cambiaron y sus dependientes. En un monolito, un cambio en una clase puede recompilar todo el proyecto.</li>
          <li><strong>Encapsulación</strong> — <code>internal</code> en Kotlin solo es visible dentro del módulo. Fuerza APIs explícitas entre features.</li>
          <li><strong>Team scalability</strong> — diferentes equipos trabajan en módulos distintos con mínima fricción.</li>
          <li><strong>Testing</strong> — módulos más pequeños son más fáciles de testear de forma aislada.</li>
          <li><strong>Reusabilidad</strong> — módulos <code>:core:ui</code> o <code>:core:data</code> se comparten entre features.</li>
        </ul>
        <h4>Tipos de módulos</h4>
        <ul>
          <li><code>:app</code> — módulo principal, solo contiene el Application class y wiring de Hilt</li>
          <li><code>:feature:home</code>, <code>:feature:payments</code> — cada feature es un módulo independiente</li>
          <li><code>:core:ui</code> — componentes de UI compartidos (design system)</li>
          <li><code>:core:domain</code> — UseCases, interfaces de repositorio, entidades de negocio</li>
          <li><code>:core:data</code> — implementaciones de repositorios, Retrofit, Room</li>
          <li><code>:core:network</code>, <code>:core:database</code> — capas técnicas compartidas</li>
        </ul>
        <h4>Reglas de dependencias</h4>
        <ul>
          <li>Los módulos <code>:feature:X</code> dependen de <code>:core:domain</code> y <code>:core:ui</code></li>
          <li><strong>Los feature modules nunca se conocen entre sí</strong> — la navegación entre features va via interfaces o rutas de navegación</li>
          <li><code>:core:data</code> depende de <code>:core:domain</code> y <code>:core:network</code></li>
          <li><code>:app</code> es el único que puede depender de todos los módulos</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// ═══ Estructura de proyecto multi-módulo ═══════════
/*
app/
  :app                    ← Application, MainActivity, Hilt setup
feature/
  :feature:home           ← HomeFragment, HomeViewModel
  :feature:payments       ← PaymentsFragment, PaymentsViewModel
  :feature:profile        ← ProfileFragment, ProfileViewModel
core/
  :core:ui                ← Design system, shared Composables
  :core:domain            ← UseCases, interfaces, entidades
  :core:data              ← Repositorios, Retrofit, Room
  :core:network           ← OkHttp, API clients
  :core:database          ← Room, entities, DAOs
  :core:common            ← Extensions, utils compartidos
*/

// ═══ build.gradle.kts de un feature module ══════════
// feature/payments/build.gradle.kts
plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.revolut.payments"
}

dependencies {
    implementation(project(":core:domain"))
    implementation(project(":core:ui"))
    implementation(project(":core:common"))

    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.compose.navigation)
}

// ═══ Version Catalog — libs.versions.toml ════════════
// gradle/libs.versions.toml
[versions]
kotlin = "2.0.21"
hilt = "2.52"
compose-bom = "2024.12.01"

[libraries]
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-android-compiler", version.ref = "hilt" }
compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "compose-bom" }

[plugins]
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }

// ═══ Navegación entre features ═══════════════════════
// Los feature modules no se conocen — navegan via rutas
// :core:ui define las rutas
object AppRoutes {
    const val PAYMENTS = "payments"
    const val HOME = "home/{userId}"
    fun home(userId: String) = "home/$userId"
}

// :feature:home navega a payments sin depender del módulo payments
@Composable
fun HomeScreen(navController: NavController) {
    Button(onClick = { navController.navigate(AppRoutes.PAYMENTS) }) {
        Text("Ir a Pagos")
    }
}

// :app registra los destinos de todos los features
NavHost(navController, startDestination = AppRoutes.HOME) {
    homeGraph()     // extension function de :feature:home
    paymentsGraph() // extension function de :feature:payments
}`
      },
      {
        type: 'tip',
        body: '<strong>Convention plugins:</strong> En proyectos multi-módulo, cada build.gradle.kts tiene el mismo boilerplate. Los Convention Plugins extraen esa configuración común a plugins reutilizables en <code>build-logic/</code>. Ej: <code>revolut.android.feature</code> configura Compose, Hilt, namespace automáticamente. Reduce el build.gradle.kts de cada feature a 5-10 líneas.'
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la principal ventaja de build time que aporta la modularización?',
          options: [
            'Los módulos se compilan en paralelo automáticamente, dividiendo el tiempo total por el número de módulos',
            'Gradle solo recompila los módulos que cambiaron y sus dependientes — un cambio en :feature:home no recompila :feature:payments',
            'Los módulos usan incremental compilation que no está disponible en proyectos monolito',
            'Los módulos tienen binarios precacheados en el repositorio de artefactos'
          ],
          correct: 1,
          explanation: 'El principal beneficio de build time: el grafo de dependencias de Gradle permite compilar solo lo que cambió. En un monolito, un cambio en una clase puede invalidar la compilación de todo el proyecto. Con módulos, un cambio en :feature:payments solo recompila ese módulo y :app (si depende de él), no :feature:home ni :core:ui.'
        },
        {
          question: '¿Cómo se comunican dos feature modules entre sí sin crear dependencias directas?',
          options: [
            'Los feature modules pueden importarse entre sí directamente en Gradle',
            'Mediante interfaces definidas en :core:domain o rutas de navegación definidas en un módulo compartido — nunca con dependencias directas entre features',
            'Usando SharedViewModel que persiste en el :app module',
            'Con broadcast receivers del sistema Android para comunicación entre módulos'
          ],
          correct: 1,
          explanation: 'La regla crítica: los feature modules no se conocen entre sí. La comunicación es via abstracciones en módulos compartidos: rutas de navegación en :core:ui, interfaces de eventos en :core:domain, o deeplinks. Si :feature:home depende de :feature:payments, perdes el aislamiento y el beneficio de build time.'
        },
        {
          question: '¿Qué ventaja tiene la keyword internal en Kotlin para módulos?',
          options: [
            'internal hace que la clase sea invisible para el sistema de reflexión de Java',
            'internal solo es visible dentro del mismo módulo Gradle — fuerza APIs explícitas y evita que otros módulos usen implementaciones internas',
            'internal es un alias de private para compatibilidad con Java',
            'internal hace que la clase no sea incluida en el APK final por R8'
          ],
          correct: 1,
          explanation: 'internal en Kotlin = visible dentro del módulo Gradle, no fuera. Si UserRepositoryImpl es internal en :core:data, :feature:home no puede usarla — solo puede usar UserRepository (interfaz, definida como public en :core:domain). Esto fuerza que los módulos dependan de APIs explícitas, no de implementaciones internas.'
        },
        {
          question: '¿Qué son los Version Catalogs (libs.versions.toml) y qué problema resuelven?',
          options: [
            'Son un formato de documentación de las dependencias del proyecto',
            'Centralizan las versiones de todas las dependencias en un único fichero — evitar versiones conflictivas entre módulos y facilitar actualizaciones',
            'Son catálogos de librerías aprobadas por Google para uso en proyectos Android',
            'Son scripts que actualizan automáticamente las dependencias a la última versión'
          ],
          correct: 1,
          explanation: 'Sin Version Catalogs, cada módulo define sus versiones independientemente — pueden desincronizarse fácilmente. libs.versions.toml centraliza todas las versiones y referencias de librerías. Todos los módulos usan libs.hilt.android (referencia type-safe) en lugar de "com.google.dagger:hilt-android:2.52" duplicado en cada build.gradle.'
        },
        {
          question: '¿Qué módulo es el único que puede depender de todos los demás en un proyecto multi-módulo?',
          options: [
            ':core:domain — porque define las abstracciones que todos usan',
            ':core:data — porque tiene acceso a todos los datos',
            ':app — es el módulo de entrada que conecta todos los feature y core modules',
            'Todos los módulos pueden depender de cualquier otro módulo'
          ],
          correct: 2,
          explanation: ':app es el único módulo "consciente" de todos los demás. Registra el NavHost con todos los feature graphs, configura Hilt para toda la app, y es el punto de entrada. Los feature modules no deben conocerse entre sí — solo dependen de :core:domain y :core:ui. :core:domain no depende de ningún módulo propio.'
        },
        {
          question: '¿Qué son los Convention Plugins en un proyecto multi-módulo grande?',
          options: [
            'Plugins de Android Studio que ayudan a crear nuevos módulos con wizards',
            'Plugins Gradle en build-logic/ que extraen la configuración común de build.gradle.kts — reducen el boilerplate en cada módulo',
            'Convenciones de nomenclatura de módulos acordadas por el equipo',
            'Plugins de terceros que automatizan la detección de dependencias circulares'
          ],
          correct: 1,
          explanation: 'En proyectos con 20+ módulos, cada build.gradle.kts repite la misma configuración de Compose, Hilt, namespaces, lint rules, etc. Convention Plugins (ej: revolut.android.feature) encapsulan esa configuración en un plugin reutilizable. El build.gradle.kts de cada feature pasa de 80 líneas a 10, y cambios de configuración global se hacen en un solo lugar.'
        }
      ]
    }
  }
]
