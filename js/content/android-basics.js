const androidBasics = [
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
    ]
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
    ]
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
    ]
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
