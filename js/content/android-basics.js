var androidBasics = [
  {
    id: 'activity',
    title: 'Activity & Lifecycle',
    icon: '🏃',
    summary: 'Punto de entrada visual de la app. Cada pantalla es (o contiene) una Activity.',
    content: [
      {
        type: 'text',
        body: `<p>Una <strong>Activity</strong> representa una pantalla con la que el usuario puede interactuar. Android la gestiona con un ciclo de vida bien definido que debes respetar para evitar memory leaks y crashes.</p>
        <h4>Métodos del ciclo de vida</h4>
        <ul>
          <li><code>onCreate()</code> — Inicialización: infla el layout, inicializa ViewModel, observa datos</li>
          <li><code>onStart()</code> — La Activity es visible (no necesariamente en primer plano)</li>
          <li><code>onResume()</code> — En primer plano, interactuable. Aquí va la lógica activa</li>
          <li><code>onPause()</code> — Pierde el foco (otra Activity encima). Guarda estado mínimo, rápido</li>
          <li><code>onStop()</code> — Ya no visible. Guarda estado persistente</li>
          <li><code>onDestroy()</code> — Activity destruida. Limpia recursos</li>
        </ul>
        <h4>Flujo típico</h4>
        <p>Apertura → <code>onCreate → onStart → onResume</code><br>
        Se va a 2º plano → <code>onPause → onStop</code><br>
        Vuelve → <code>onRestart → onStart → onResume</code><br>
        Se cierra → <code>onPause → onStop → onDestroy</code></p>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `class MainActivity : AppCompatActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // ✅ Aquí inicializa, nunca hagas trabajo pesado
        observeViewModel()
    }

    override fun onResume() {
        super.onResume()
        // ✅ Retoma sensores, animaciones, etc.
    }

    override fun onPause() {
        super.onPause()
        // ✅ Pausa lo que consume recursos (cámara, GPS)
    }

    override fun onDestroy() {
        super.onDestroy()
        // ✅ El ViewModel limpia solo con viewModelScope
    }
}`
      },
      {
        type: 'tip',
        body: '<strong>Regla de oro:</strong> No guardes referencias a la Activity dentro de objetos con un ciclo de vida más largo (singletons, ViewModels). Usa el contexto de Aplicación si necesitas un contexto duradero.'
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿En qué orden ocurren estos métodos del ciclo de vida cuando el usuario abre una Activity?',
          options: [
            'onStart() → onCreate() → onResume()',
            'onCreate() → onStart() → onResume()',
            'onResume() → onCreate() → onStart()',
            'onCreate() → onResume() → onStart()'
          ],
          correct: 1,
          explanation: 'El orden correcto al abrir una Activity es: onCreate() (se inicializa la Activity), onStart() (se vuelve visible al usuario), onResume() (la Activity está en primer plano e interactuando con el usuario). Este orden es fundamental y aparece en prácticamente todas las entrevistas Android.'
        },
        {
          question: '¿Qué método se llama cuando el usuario presiona el botón Home para ir a otra app?',
          options: [
            'onStop() — la Activity se detiene completamente',
            'onDestroy() — la Activity se destruye para liberar memoria',
            'onPause() → onStop() — la Activity pierde el foco y luego deja de ser visible',
            'onPause() solo — la Activity sigue siendo visible en background'
          ],
          correct: 2,
          explanation: 'Al presionar Home: onPause() (la Activity pierde el foco, otra app va a primer plano) → onStop() (la Activity ya no es visible). La Activity sigue en memoria pero no está activa. Si el sistema necesita memoria, puede llamar a onDestroy(). Al volver: onRestart() → onStart() → onResume().'
        },
        {
          question: '¿Qué sucede con el estado de una Activity al rotar la pantalla por defecto?',
          options: [
            'La Activity se pausa y se reanuda, manteniendo todo el estado en memoria',
            'La Activity se destruye (onDestroy) y se recrea (onCreate) — el estado en memoria se pierde salvo que se guarde',
            'Android congela la Activity durante la rotación y la descongela después',
            'La pantalla simplemente gira el contenido, sin recrear la Activity'
          ],
          correct: 1,
          explanation: 'Por defecto, rotar pantalla destruye y recrea la Activity (cambio de configuración). El estado en memoria se pierde. Soluciones: (1) ViewModel — sobrevive a recreaciones, (2) onSaveInstanceState/onRestoreInstanceState para datos pequeños, (3) android:configChanges en el Manifest para gestionar la rotación manualmente (no recomendado habitualmente).'
        },
        {
          question: '¿En qué método del ciclo de vida debes liberar recursos costosos para evitar memory leaks?',
          options: [
            'onPause() — es el primer método llamado al dejar la Activity',
            'onStop() — garantiza liberación cuando la Activity deja de ser visible',
            'onDestroy() — es el último método, garantiza la limpieza final',
            'Depende del recurso: listeners en onStop(), recursos de red en onDestroy()'
          ],
          correct: 2,
          explanation: 'La regla general: lo que inicializas en onCreate() lo liberas en onDestroy(). Lo que inicializas en onStart() lo liberas en onStop(). Lo que inicializas en onResume() lo liberas en onPause(). onDestroy() es el último punto garantizado — pero onStop() es más seguro para cosas importantes porque onDestroy() no siempre se llama.'
        },
        {
          question: '¿Por qué no debes realizar operaciones de red o de base de datos en el hilo principal (UI thread)?',
          options: [
            'Porque Android no tiene permisos para acceder a red desde el hilo principal',
            'Porque bloquear el hilo principal más de ~16ms causa ANR (App Not Responding) o frames perdidos — la UI se congela',
            'Porque Room y Retrofit no están diseñados para funcionar en el hilo principal',
            'Porque el hilo principal no tiene acceso a Internet sin permisos especiales'
          ],
          correct: 1,
          explanation: 'El hilo principal gestiona todos los eventos de UI: toques, dibujado de frames (cada ~16ms para 60fps). Si lo bloqueas con una operación de red que tarda 500ms, la UI se congela. Android detecta bloqueos > 5 segundos y muestra el diálogo ANR. Usa Coroutines con Dispatchers.IO para operaciones background y actualiza la UI solo desde el hilo principal.'
        }
      ]
    }
  },

  {
    id: 'fragment',
    title: 'Fragment & Lifecycle',
    icon: '🧩',
    summary: 'Módulo reutilizable de UI que vive dentro de una Activity. Tiene su propio lifecycle.',
    content: [
      {
        type: 'text',
        body: `<p>Un <strong>Fragment</strong> es una porción de UI reutilizable con su propio ciclo de vida, que siempre está hospedado en una Activity. Son la base de la navegación moderna en Android.</p>
        <h4>Lifecycle propio (tras la Activity)</h4>
        <ul>
          <li><code>onAttach()</code> — Se adjunta a la Activity</li>
          <li><code>onCreate()</code> — Inicialización sin UI</li>
          <li><code>onCreateView()</code> — Infla el layout → retorna la View</li>
          <li><code>onViewCreated()</code> — ✅ Aquí inicializa vistas, observa LiveData/Flow</li>
          <li><code>onStart() / onResume()</code> — Igual que Activity</li>
          <li><code>onPause() / onStop()</code> — Igual que Activity</li>
          <li><code>onDestroyView()</code> — La View se destruye (Fragment puede seguir vivo)</li>
          <li><code>onDestroy() / onDetach()</code> — Fragment destruido</li>
        </ul>
        <h4>Comunicación Fragment → Activity</h4>
        <p>Vía <strong>ViewModel compartido</strong> (recomendado) o mediante interfaces. Nunca llames directamente a métodos de la Activity.</p>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `class HomeFragment : Fragment(R.layout.fragment_home) {

    // ViewModel compartido con la Activity
    private val viewModel: MainViewModel by activityViewModels()
    // ViewModel propio del Fragment
    private val localVM: HomeViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // ✅ viewLifecycleOwner (no 'this') para evitar leaks con LiveData
        viewModel.uiState.observe(viewLifecycleOwner) { state ->
            updateUI(state)
        }

        // ✅ Con Flow usa viewLifecycleOwner.lifecycleScope
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                localVM.dataFlow.collect { data ->
                    renderData(data)
                }
            }
        }
    }
}`
      },
      {
        type: 'warning',
        body: '<strong>Trampa frecuente:</strong> Usar <code>this</code> como LifecycleOwner en <code>observe()</code> dentro de un Fragment puede causar que el observer siga activo después de que la View se destruya. Usa siempre <code>viewLifecycleOwner</code>.'
      }
    ]
  },

  {
    id: 'context',
    title: 'Context',
    icon: '🌍',
    summary: 'Puerta de acceso a recursos, sistema y servicios Android. Existe en dos sabores: Application y Activity.',
    content: [
      {
        type: 'text',
        body: `<p><strong>Context</strong> es una clase abstracta que proporciona acceso a los recursos de la aplicación y servicios del sistema (Strings, SharedPreferences, startActivity, etc.).</p>
        <h4>Tipos</h4>
        <ul>
          <li><strong>Application Context</strong> — Vive mientras vive la app. Seguro para usar en Singletons, Repositories, DI. <em>No tiene información de la UI actual.</em></li>
          <li><strong>Activity Context</strong> — Vive mientras vive la Activity. Necesario para inflar layouts, mostrar Dialogs, Toasts con tema.</li>
          <li><strong>Service / BroadcastReceiver Context</strong> — Similar a Application Context.</li>
        </ul>
        <h4>Cuándo usar cada uno</h4>
        <ul>
          <li>✅ Application Context → SharedPreferences, Room, Retrofit, WorkManager, file access</li>
          <li>✅ Activity Context → Dialog, Toast, LayoutInflater, startActivity</li>
          <li>❌ Nunca guardes Activity Context en un objeto que viva más que la Activity</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// ✅ Application Context en un Singleton (safe)
class AppDatabase(context: Context) {
    private val db = Room.databaseBuilder(
        context.applicationContext, // ← applicationContext, nunca el Activity
        MyDatabase::class.java,
        "app_db"
    ).build()
}

// ✅ Con Hilt, @ApplicationContext se inyecta automáticamente
@Singleton
class UserRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {
    fun getPrefs() = context.getSharedPreferences("prefs", Context.MODE_PRIVATE)
}

// ❌ Memory leak clásico
object BadSingleton {
    lateinit var context: Context // Si guardas Activity aquí → leak
}

// ✅ Correcto
object GoodSingleton {
    lateinit var context: Context
    fun init(appContext: Context) {
        context = appContext.applicationContext
    }
}`
      }
    ]
  },

  {
    id: 'intent',
    title: 'Intent & Intent Filters',
    icon: '📨',
    summary: 'Mensajería entre componentes Android. Explicit para destinos conocidos, Implicit para acciones del sistema.',
    content: [
      {
        type: 'text',
        body: `<p>Un <strong>Intent</strong> es un objeto de mensajería para solicitar una acción a otro componente (Activity, Service, BroadcastReceiver).</p>
        <h4>Tipos</h4>
        <ul>
          <li><strong>Explicit Intent</strong> — Especificas exactamente qué componente lanzar. Para navegar dentro de tu app.</li>
          <li><strong>Implicit Intent</strong> — Describes una acción y el sistema busca quien puede manejarla (abrir URL, compartir, llamar).</li>
        </ul>
        <h4>Pasar datos</h4>
        <p>Con <code>putExtra(key, value)</code>. Para objetos complejos usa <code>Parcelable</code> o (mejor) Navigation Component con Safe Args.</p>
        <h4>Recibir resultado</h4>
        <p><code>startActivityForResult</code> está obsoleto. Usa <strong>ActivityResultLauncher</strong> (Activity Result API).</p>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Explicit Intent
val intent = Intent(this, DetailActivity::class.java).apply {
    putExtra("userId", 42)
    putExtra("userName", "Ana")
}
startActivity(intent)

// Implicit Intent
val shareIntent = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "¡Mira esto!")
}
startActivity(Intent.createChooser(shareIntent, "Compartir con..."))

// Activity Result API (moderno)
private val pickImage = registerForActivityResult(
    ActivityResultContracts.GetContent()
) { uri: Uri? ->
    uri?.let { imageView.setImageURI(it) }
}

// Para pedir permisos
private val requestPermission = registerForActivityResult(
    ActivityResultContracts.RequestPermission()
) { isGranted ->
    if (isGranted) startCamera() else showDeniedMessage()
}

// Uso
pickImage.launch("image/*")
requestPermission.launch(Manifest.permission.CAMERA)`
      },
      {
        type: 'code',
        lang: 'xml',
        code: `<!-- Intent Filter en AndroidManifest.xml -->
<activity android:name=".MainActivity">
    <!-- Hace que esta Activity sea el launcher -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    <!-- Deep link: myapp://detail/42 -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="myapp" android:host="detail" />
    </intent-filter>
</activity>`
      }
    ]
  },

  {
    id: 'manifest',
    title: 'AndroidManifest & Permisos',
    icon: '📋',
    summary: 'Declaración de la app: componentes, permisos, configuración. Android lo lee antes de lanzar la app.',
    content: [
      {
        type: 'text',
        body: `<p>El <strong>AndroidManifest.xml</strong> es la tarjeta de presentación de tu app ante el sistema. Declara todos los componentes (Activities, Services, Receivers, Providers), permisos y configuraciones.</p>
        <h4>Tipos de permisos</h4>
        <ul>
          <li><strong>Normales</strong> — Se conceden automáticamente al instalar (INTERNET, VIBRATE). Solo declarar en Manifest.</li>
          <li><strong>Peligrosos</strong> — Afectan privacidad del usuario. Se deben pedir en runtime (CAMERA, LOCATION, READ_CONTACTS).</li>
          <li><strong>Firma</strong> — Solo para apps del mismo desarrollador.</li>
        </ul>
        <h4>Runtime permissions (Android 6+)</h4>
        <p>Siempre comprueba antes de usar, pide con <code>ActivityResultLauncher</code>, maneja el caso denegado.</p>`
      },
      {
        type: 'code',
        lang: 'xml',
        code: `<!-- AndroidManifest.xml estructura básica -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapp">

    <!-- Permisos normales (auto-granted) -->
    <uses-permission android:name="android.permission.INTERNET" />

    <!-- Permisos peligrosos (runtime request) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <application
        android:name=".MyApplication"
        android:theme="@style/AppTheme"
        android:label="@string/app_name">

        <activity
            android:name=".MainActivity"
            android:exported="true"> <!-- requerido en API 31+ -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service android:name=".MyService" android:exported="false"/>
    </application>
</manifest>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Flujo completo de runtime permission
class CameraFragment : Fragment() {

    private val requestCamera = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        when {
            isGranted -> openCamera()
            shouldShowRequestPermissionRationale(Manifest.permission.CAMERA) ->
                showRationale() // El usuario negó pero no marcó "no volver a preguntar"
            else ->
                showSettingsPrompt() // "No volver a preguntar" marcado → ir a Settings
        }
    }

    private fun checkAndRequestCamera() {
        when {
            ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED -> openCamera()
            else -> requestCamera.launch(Manifest.permission.CAMERA)
        }
    }
}`
      }
    ]
  },

  {
    id: 'viewmodel',
    title: 'ViewModel',
    icon: '🧠',
    summary: 'Supervive a rotaciones de pantalla. Contiene y gestiona el estado de la UI separado de la vista.',
    content: [
      {
        type: 'text',
        body: `<p>El <strong>ViewModel</strong> es la pieza central de la arquitectura MVVM en Android. Está diseñado para almacenar y gestionar datos relacionados con la UI de forma consciente del ciclo de vida.</p>
        <h4>Por qué existe</h4>
        <p>Cuando rotas la pantalla, la Activity se destruye y recrea. Sin ViewModel, perderías todos tus datos. El ViewModel sobrevive a la rotación, manteniendo el estado.</p>
        <h4>Características clave</h4>
        <ul>
          <li>Se crea una sola instancia por pantalla (o scope compartido)</li>
          <li>Tiene <code>viewModelScope</code>: un CoroutineScope que se cancela automáticamente cuando el ViewModel se destruye</li>
          <li>Nunca debe tener referencia al Context de Activity (usa Application Context si es necesario)</li>
          <li>Expone estado via <code>StateFlow</code> (recomendado) o <code>LiveData</code></li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {

    // Estado de UI expuesto como StateFlow inmutable
    private val _uiState = MutableStateFlow<UserUiState>(UserUiState.Loading)
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    init {
        loadUser()
    }

    private fun loadUser() {
        viewModelScope.launch { // Se cancela automáticamente al destruirse el ViewModel
            _uiState.value = UserUiState.Loading
            try {
                val user = userRepository.getUser()
                _uiState.value = UserUiState.Success(user)
            } catch (e: Exception) {
                _uiState.value = UserUiState.Error(e.message ?: "Error")
            }
        }
    }

    fun onRetry() = loadUser()
}

sealed class UserUiState {
    object Loading : UserUiState()
    data class Success(val user: User) : UserUiState()
    data class Error(val message: String) : UserUiState()
}`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// En la Activity/Fragment
class UserFragment : Fragment() {
    private val viewModel: UserViewModel by viewModels() // o activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    when (state) {
                        is UserUiState.Loading -> showLoading()
                        is UserUiState.Success -> showUser(state.user)
                        is UserUiState.Error -> showError(state.message)
                    }
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
          question: '¿Por qué el ViewModel sobrevive a la rotación de pantalla?',
          options: [
            'Android guarda el ViewModel en SharedPreferences automáticamente',
            'El ViewModel se almacena en un ViewModelStore que está vinculado al Activity, no al proceso de recreación — sobrevive a cambios de configuración',
            'El ViewModel usa onSaveInstanceState internamente para persistir el estado',
            'Los ViewModels son Singletons de la aplicación y nunca se destruyen'
          ],
          correct: 1,
          explanation: 'El ViewModel se almacena en un ViewModelStore, que sobrevive a cambios de configuración como la rotación (que destruye y recrea la Activity). El ViewModel solo se destruye cuando la Activity finaliza definitivamente (el usuario presiona atrás o llama finish()). Esto lo hace ideal para datos de UI que no deben perderse al rotar.'
        },
        {
          question: '¿Qué diferencia hay entre by viewModels() y by activityViewModels() en un Fragment?',
          options: [
            'viewModels() crea un ViewModel por pantalla; activityViewModels() crea un ViewModel por Fragment',
            'viewModels() crea un ViewModel scoped al Fragment; activityViewModels() crea un ViewModel scoped a la Activity — compartido entre todos los Fragments de esa Activity',
            'activityViewModels() es más rápido porque el ViewModel ya existe en la Activity',
            'No hay diferencia, son dos formas de escribir lo mismo'
          ],
          correct: 1,
          explanation: 'viewModels() — el ViewModel es único para ese Fragment y se destruye cuando el Fragment se destruye. activityViewModels() — el ViewModel está en el ViewModelStore de la Activity, compartido entre todos los Fragments. Usar activityViewModels() para compartir estado entre Fragments (ej: un carrito de compra compartido entre PagoFragment y ResumenFragment).'
        },
        {
          question: '¿Por qué debes usar viewModelScope.launch en lugar de GlobalScope.launch en un ViewModel?',
          options: [
            'viewModelScope.launch es más rápido que GlobalScope.launch',
            'viewModelScope se cancela automáticamente al destruirse el ViewModel, evitando coroutines huérfanas y memory leaks',
            'GlobalScope no puede acceder a los datos del ViewModel',
            'viewModelScope.launch ejecuta el código en el hilo principal automáticamente'
          ],
          correct: 1,
          explanation: 'viewModelScope está vinculado al ciclo de vida del ViewModel. Cuando el ViewModel se destruye (onCleared()), todas las coroutines lanzadas con viewModelScope se cancelan automáticamente. GlobalScope no tiene este mecanismo — las coroutines siguen ejecutándose aunque el ViewModel (y la pantalla) ya no existan, causando memory leaks y posibles crashes.'
        },
        {
          question: '¿Qué ventaja tiene StateFlow sobre LiveData para exponer el estado de UI?',
          options: [
            'StateFlow es compatible con Java, LiveData no',
            'LiveData es observable desde cualquier parte de la app sin necesidad de un lifecycle',
            'StateFlow es Kotlin-first, funciona en coroutines sin necesidad de extensions, permite operadores de Flow (map, filter, combine) y es testeable sin Android framework',
            'No hay ventaja real — son equivalentes en funcionalidad'
          ],
          correct: 2,
          explanation: 'StateFlow tiene varias ventajas sobre LiveData: (1) es Kotlin-first y funciona naturalmente con coroutines, (2) admite todos los operadores de Flow (map, filter, combine, debounce), (3) es testeable sin necesidad del Android framework (no requiere Looper), (4) puede usarse en capas de dominio sin importar Android. LiveData sigue siendo válido pero StateFlow es el estándar moderno.'
        },
        {
          question: '¿Cómo se debe observar un StateFlow en un Fragment para evitar problemas de lifecycle?',
          options: [
            'viewModel.uiState.observe(viewLifecycleOwner) — como se hace con LiveData',
            'lifecycleScope.launch { viewModel.uiState.collect { ... } } — colecta siempre',
            'viewLifecycleOwner.lifecycleScope.launch { repeatOnLifecycle(STARTED) { viewModel.uiState.collect { ... } } }',
            'viewModel.uiState.observeForever { ... } — sin restricciones de lifecycle'
          ],
          correct: 2,
          explanation: 'repeatOnLifecycle(STARTED) pausa la colección cuando el Fragment va a background (< STARTED) y la reanuda al volver. Sin esto, el flow sigue colectando aunque la UI no sea visible, desperdiciando recursos. viewLifecycleOwner garantiza que el scope se cancela cuando la vista del Fragment se destruye (no cuando el Fragment en sí, que puede existir más tiempo).'
        }
      ]
    }
  },

  {
    id: 'livedata',
    title: 'LiveData',
    icon: '📡',
    summary: 'Observable lifecycle-aware. Notifica observers solo cuando están activos. Predecesor de StateFlow.',
    content: [
      {
        type: 'text',
        body: `<p><strong>LiveData</strong> es un holder de datos observable que respeta el ciclo de vida. Solo actualiza observers que están en estado <code>STARTED</code> o <code>RESUMED</code>, evitando crashes y leaks automáticamente.</p>
        <h4>LiveData vs StateFlow</h4>
        <ul>
          <li><strong>LiveData</strong> — Legacy, pero estable. Siempre en el main thread. Automáticamente lifecycle-aware sin código extra.</li>
          <li><strong>StateFlow</strong> — Moderno (Kotlin). Funciona con coroutines. Más potente (operadores Flow). Recomendado para proyectos nuevos.</li>
        </ul>
        <h4>Tipos</h4>
        <ul>
          <li><code>MutableLiveData</code> — Mutable, interno al ViewModel</li>
          <li><code>LiveData</code> — Inmutable, expuesto a la UI</li>
          <li><code>MediatorLiveData</code> — Combina múltiples LiveData sources</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// En el ViewModel
class ProductViewModel : ViewModel() {

    private val _products = MutableLiveData<List<Product>>()
    val products: LiveData<List<Product>> = _products

    // Transformaciones
    val filteredProducts: LiveData<List<Product>> = products.map { list ->
        list.filter { it.inStock }
    }

    // MediatorLiveData: combinar dos fuentes
    val combinedData = MediatorLiveData<Pair<List<Product>, User?>>().apply {
        addSource(products) { value = Pair(it, currentUser.value) }
        addSource(currentUser) { value = Pair(products.value ?: emptyList(), it) }
    }

    fun loadProducts() {
        viewModelScope.launch {
            _products.value = repository.getProducts() // main thread: postValue() si es IO
            // Si estás en IO thread:
            // _products.postValue(repository.getProducts())
        }
    }
}

// En el Fragment
viewModel.products.observe(viewLifecycleOwner) { products ->
    adapter.submitList(products)
}`
      },
      {
        type: 'tip',
        body: '<strong>Migración a StateFlow:</strong> <code>LiveData</code> puede convertirse a <code>Flow</code> con <code>.asFlow()</code>, y un <code>Flow</code> a <code>LiveData</code> con <code>.asLiveData()</code>. Úsalo para migrar gradualmente.'
      }
    ]
  },

  {
    id: 'room',
    title: 'Room Database',
    icon: '🗄️',
    summary: 'Capa de abstracción sobre SQLite. Entities, DAOs y Database. Soporta coroutines y Flow nativamente.',
    content: [
      {
        type: 'text',
        body: `<p><strong>Room</strong> es la librería de persistencia local recomendada para Android. Genera código boilerplate de SQLite en tiempo de compilación y detecta errores de SQL en compile-time.</p>
        <h4>Los 3 componentes</h4>
        <ul>
          <li><strong>@Entity</strong> — Representa una tabla en la DB. Cada instancia es una fila.</li>
          <li><strong>@Dao</strong> — Data Access Object. Interface con los métodos de acceso a datos.</li>
          <li><strong>@Database</strong> — Punto de entrada. Singleton que conecta entities y DAOs.</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// 1. Entity — define la tabla
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "full_name") val name: String,
    val email: String,
    val createdAt: Long = System.currentTimeMillis()
)

// 2. DAO — métodos de acceso
@Dao
interface UserDao {
    @Query("SELECT * FROM users ORDER BY full_name ASC")
    fun getAllUsers(): Flow<List<UserEntity>> // Flow → emite al cambiar datos

    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getUserById(userId: Int): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Update
    suspend fun updateUser(user: UserEntity)

    @Delete
    suspend fun deleteUser(user: UserEntity)

    @Query("DELETE FROM users WHERE id = :userId")
    suspend fun deleteById(userId: Int)
}

// 3. Database — singleton
@Database(entities = [UserEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao

    companion object {
        @Volatile private var instance: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app_database"
                ).build().also { instance = it }
            }
    }
}`
      },
      {
        type: 'tip',
        body: '<strong>Con Hilt:</strong> Provee el <code>AppDatabase</code> y los DAOs como singletons con <code>@Provides</code>. El Repository recibe el DAO inyectado, manteniendo Room aislado de la capa de dominio.'
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuáles son los tres componentes principales de Room?',
          options: [
            '@Schema, @Table, @Column',
            '@Entity, @Dao, @Database',
            '@Model, @Repository, @Singleton',
            '@Table, @Query, @Database'
          ],
          correct: 1,
          explanation: '@Entity: define la tabla de la BD (una clase Kotlin = una tabla). @Dao (Data Access Object): define las operaciones (queries, inserts, deletes) como funciones Kotlin. @Database: la clase abstracta que extiende RoomDatabase y lista las entities y DAOs. Room genera el código SQL a partir de estas anotaciones.'
        },
        {
          question: '¿Por qué se recomienda que los métodos de DAO que retornan datos devuelvan Flow?',
          options: [
            'Flow es obligatorio en Room 2.5+ — los métodos suspend ya no están soportados',
            'Flow permite observar cambios en la base de datos en tiempo real — cuando se inserta o modifica un dato, los colectores reciben la actualización automáticamente',
            'Flow es más rápido que suspend para queries que devuelven muchos resultados',
            'Para compatibilidad con Retrofit — ambos usan Flow como tipo de retorno'
          ],
          correct: 1,
          explanation: 'Un DAO con @Query que retorna Flow<List<T>> se "suscribe" a la tabla. Cuando cualquier operación (INSERT, UPDATE, DELETE) modifica los datos de esa tabla, Room emite automáticamente una nueva lista actualizada al flow. La UI se actualiza en tiempo real sin necesidad de hacer polling. Para operaciones de escritura (INSERT, UPDATE, DELETE), se usa suspend.'
        },
        {
          question: '¿Por qué AppDatabase debe crearse como Singleton?',
          options: [
            'Room no permite crear múltiples instancias — lanza una excepción si lo intentas',
            'Crear múltiples instancias de AppDatabase puede causar corrupción de datos y cada instancia tiene su propio caché — desperdicio de memoria',
            'El Singleton es solo una convención de estilo, no tiene impacto técnico',
            'Android destruye automáticamente instancias duplicadas de AppDatabase'
          ],
          correct: 1,
          explanation: 'Room usa una conexión a la base de datos SQLite. Tener múltiples instancias de AppDatabase significa múltiples conexiones, lo que puede causar: (1) condiciones de carrera al escribir datos, (2) cachés de consultas desincronizados entre instancias, (3) consumo innecesario de memoria y recursos de sistema. Se usa el patrón Singleton (o @Singleton de Hilt) para garantizar una única instancia.'
        },
        {
          question: '¿Qué hace la anotación @PrimaryKey(autoGenerate = true)?',
          options: [
            'Crea un UUID aleatorio como clave primaria para cada fila',
            'Room genera automáticamente un ID entero único (auto-incremento) para cada fila insertada, similar a AUTOINCREMENT en SQL',
            'La clave primaria se genera a partir de las otras columnas de la entidad',
            'autoGenerate = true activa el modo de clave compuesta (composite key)'
          ],
          correct: 1,
          explanation: '@PrimaryKey(autoGenerate = true) en un campo Int o Long hace que SQLite asigne automáticamente el siguiente número entero disponible al insertar una fila nueva. Si insertas con id = 0, Room lo interpreta como "generar automáticamente". Útil cuando quieres IDs numéricos simples en lugar de UUIDs.'
        },
        {
          question: '¿Qué método de DAO permite insertar múltiples entidades a la vez de forma eficiente?',
          code: `@Dao
interface UserDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(users: List<User>)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertIfNotExists(user: User): Long
}`,
          options: [
            'Solo se puede insertar una entidad a la vez — hay que llamar insert() en un loop',
            '@Insert acepta tanto una entidad individual como una List o vararg — insertAll(list) inserta todas en una transacción',
            'Para múltiples inserts se necesita @Transaction y @Query con SQL INSERT INTO',
            'insertAll solo funciona con arrays, no con List<T>'
          ],
          correct: 1,
          explanation: '@Insert en Room acepta una entidad individual, una lista (List<T>) o vararg. Cuando pasas una lista, Room los inserta todos dentro de una única transacción SQLite — mucho más eficiente que hacer N inserts individuales. onConflict = REPLACE actualiza si ya existe; IGNORE mantiene el valor existente y retorna -1.'
        }
      ]
    }
  },

  {
    id: 'recyclerview',
    title: 'RecyclerView',
    icon: '♻️',
    summary: 'Lista eficiente que recicla vistas fuera de pantalla. Obligatorio para listas con muchos elementos.',
    content: [
      {
        type: 'text',
        body: `<p><strong>RecyclerView</strong> reutiliza las vistas que salen de pantalla para mostrar las nuevas, evitando crear/destruir Views constantemente. Es el componente de lista estándar en Android con Views (en Compose se usa LazyColumn).</p>
        <h4>Componentes clave</h4>
        <ul>
          <li><strong>Adapter</strong> — Crea y enlaza ViewHolders con datos</li>
          <li><strong>ViewHolder</strong> — Referencia a la View de un item</li>
          <li><strong>LayoutManager</strong> — LinearLayoutManager, GridLayoutManager, StaggeredGridLayoutManager</li>
          <li><strong>DiffUtil</strong> — Calcula diferencias entre listas para animaciones eficientes</li>
        </ul>
        <h4>ListAdapter (recomendado)</h4>
        <p>Extiende <code>RecyclerView.Adapter</code> con soporte automático de <code>DiffUtil</code> en background thread.</p>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Item layout: res/layout/item_user.xml

// ViewHolder + ListAdapter moderno
class UserAdapter(
    private val onItemClick: (User) -> Unit
) : ListAdapter<User, UserAdapter.UserViewHolder>(UserDiffCallback()) {

    inner class UserViewHolder(
        private val binding: ItemUserBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(user: User) {
            binding.apply {
                tvName.text = user.name
                tvEmail.text = user.email
                root.setOnClickListener { onItemClick(user) }
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserViewHolder {
        val binding = ItemUserBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return UserViewHolder(binding)
    }

    override fun onBindViewHolder(holder: UserViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
}

// DiffCallback: compara items para animaciones
class UserDiffCallback : DiffUtil.ItemCallback<User>() {
    override fun areItemsTheSame(oldItem: User, newItem: User) = oldItem.id == newItem.id
    override fun areContentsTheSame(oldItem: User, newItem: User) = oldItem == newItem
}

// Uso en Fragment
val adapter = UserAdapter { user -> navigateToDetail(user.id) }
binding.recyclerView.adapter = adapter
binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())

// Enviar nueva lista (DiffUtil calcula diferencias automáticamente)
viewModel.users.observe(viewLifecycleOwner) { users ->
    adapter.submitList(users)
}`
      }
    ]
  },

  {
    id: 'navigation',
    title: 'Navigation Component',
    icon: '🗺️',
    summary: 'Framework de navegación oficial. NavGraph, NavController y Safe Args para navegar entre destinos de forma segura.',
    content: [
      {
        type: 'text',
        body: `<p>El <strong>Navigation Component</strong> simplifica la navegación en apps Android: maneja el back stack, las transiciones, los deep links y los argumentos de forma type-safe con <strong>Safe Args</strong>.</p>
        <h4>Piezas clave</h4>
        <ul>
          <li><strong>NavGraph</strong> — XML que define destinos y acciones de navegación</li>
          <li><strong>NavHostFragment</strong> — Container donde se renderizan los destinos</li>
          <li><strong>NavController</strong> — Orquesta la navegación</li>
          <li><strong>Safe Args</strong> — Plugin Gradle que genera clases tipadas para pasar argumentos</li>
        </ul>`
      },
      {
        type: 'code',
        lang: 'xml',
        code: `<!-- res/navigation/nav_graph.xml -->
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    app:startDestination="@id/homeFragment">

    <fragment android:id="@+id/homeFragment" android:name=".HomeFragment">
        <action
            android:id="@+id/action_home_to_detail"
            app:destination="@id/detailFragment" />
    </fragment>

    <fragment android:id="@+id/detailFragment" android:name=".DetailFragment">
        <argument
            android:name="userId"
            app:argType="integer" />
    </fragment>
</navigation>`
      },
      {
        type: 'code',
        lang: 'kotlin',
        code: `// Navegar con Safe Args (type-safe)
val action = HomeFragmentDirections.actionHomeToDetail(userId = 42)
findNavController().navigate(action)

// Recibir argumentos en el destino
class DetailFragment : Fragment() {
    private val args: DetailFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val userId = args.userId // Int, type-safe
        viewModel.loadUser(userId)
    }
}

// Back navigation
findNavController().navigateUp()
findNavController().popBackStack()

// Bottom Navigation + NavController
val navController = findNavController(R.id.nav_host_fragment)
binding.bottomNav.setupWithNavController(navController)`
      }
    ]
  }
]
