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
    ],
    quiz: {
      questions: [
        {
          question: '¿En qué método del ciclo de vida de un Fragment debes observar LiveData o recoger Flows?',
          options: [
            'onCreateView() — justo al inflar el layout',
            'onViewCreated() — cuando la jerarquía de vistas ya existe y viewLifecycleOwner está disponible',
            'onStart() — cuando el Fragment se vuelve visible',
            'onResume() — cuando el Fragment está en primer plano'
          ],
          correct: 1,
          explanation: 'onViewCreated() es el punto correcto porque la View ya está creada y viewLifecycleOwner está disponible. Observar en onCreateView() es arriesgado porque viewLifecycleOwner aún no está completamente inicializado. Observar en onStart()/onResume() causaría re-suscripciones innecesarias.'
        },
        {
          question: '¿Qué LifecycleOwner debes usar al observar LiveData en un Fragment y por qué?',
          code: `viewModel.data.observe(???) { result ->
    updateUI(result)
}`,
          options: [
            'this — el Fragment es el LifecycleOwner natural',
            'viewLifecycleOwner — para que el observer se elimine automáticamente cuando la View se destruya, evitando leaks',
            'activityLifecycleOwner — para compartir la observación con la Activity',
            'No se necesita LifecycleOwner en Fragments modernos'
          ],
          correct: 1,
          explanation: 'viewLifecycleOwner se destruye en onDestroyView(), eliminando los observers automáticamente. Si usas "this" (el Fragment), el observer sigue activo incluso después de que la View se destruya (el Fragment puede seguir vivo sin View), causando actualizaciones en Views inexistentes y posibles crashes.'
        },
        {
          question: '¿Qué diferencia hay entre onCreateView() y onViewCreated() en un Fragment?',
          options: [
            'onCreateView() inicializa el ViewModel; onViewCreated() infla el layout',
            'onCreateView() infla y retorna la View raíz; onViewCreated() configura las vistas ya infladas (bindings, listeners, observadores)',
            'Son intercambiables — puedes usar cualquiera para inicializar vistas',
            'onCreateView() se llama una vez; onViewCreated() se llama cada vez que el Fragment vuelve a primer plano'
          ],
          correct: 1,
          explanation: 'onCreateView() tiene una responsabilidad: inflar el layout y retornar la View raíz. onViewCreated() se ejecuta después, cuando la View ya está creada, y es donde debes configurar todo: binding de vistas, click listeners, observación de LiveData/Flow. Separar estas responsabilidades evita errores.'
        },
        {
          question: '¿Por qué se recomienda usar un ViewModel compartido (activityViewModels()) para la comunicación entre Fragments en lugar de interfaces?',
          options: [
            'Las interfaces no funcionan entre Fragments en Android',
            'Un ViewModel compartido sobrevive a cambios de configuración, no crea dependencias directas entre Fragments y mantiene el estado de forma centralizada',
            'activityViewModels() es más rápido que las interfaces en términos de rendimiento',
            'Las interfaces requieren permisos especiales en el Manifest'
          ],
          correct: 1,
          explanation: 'Con activityViewModels(), ambos Fragments acceden al mismo ViewModel en el ViewModelStore de la Activity. Esto permite compartir datos sin acoplamiento directo (los Fragments no se conocen), el estado sobrevive a rotaciones, y la lógica de comunicación está centralizada. Las interfaces crean dependencias directas y no manejan recreaciones de Activity.'
        }
      ]
    }
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
}"`
      }
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué tipo de Context debes usar en un Singleton que necesita acceder a SharedPreferences?',
          code: `object UserPreferences {
    lateinit var context: Context
    fun init(ctx: Context) {
        context = ctx.???
    }
}`,
          options: [
            'El Activity Context directamente — tiene acceso a todos los recursos',
            'applicationContext — vive mientras la app y no causa memory leaks al retenerse en un Singleton',
            'baseContext — es el Context más ligero disponible',
            'No se necesita Context para SharedPreferences — se accede directamente'
          ],
          correct: 1,
          explanation: 'En un Singleton, guardas una referencia que vive para siempre. Si guardas un Activity Context, la Activity nunca será garbage-collected → memory leak. applicationContext vive mientras la app y no está vinculado a ninguna Activity, por lo que es seguro retenerlo en Singletons.'
        },
        {
          question: '¿Por qué guardar un Activity Context en un Singleton causa un memory leak?',
          options: [
            'Porque el Singleton consume demasiada memoria al tener el Context',
            'Porque el Activity Context mantiene una referencia a la Activity completa — si el Singleton lo retiene, la Activity no puede ser garbage-collected aunque ya no sea visible',
            'Porque Android no permite guardar Contexts en objetos estáticos — lanza una excepción',
            'Solo causa leak si la Activity está en segundo plano, no si está destruida'
          ],
          correct: 1,
          explanation: 'Activity Context tiene una referencia fuerte a la Activity (views, resources, window). Si un Singleton (que vive para siempre) retiene ese Context, la Activity entera permanece en memoria aunque el usuario haya salido de ella. Esto acumula memoria usada innecesariamente hasta causar OOM. applicationContext no tiene referencia a la Activity, por eso es seguro.'
        },
        {
          question: '¿Para cuál de estas operaciones necesitas obligatoriamente un Activity Context y no sirve un Application Context?',
          options: [
            'Acceder a SharedPreferences',
            'Mostrar un Dialog con tema de la Activity',
            'Leer un archivo de la carpeta internal storage',
            'Iniciar un WorkManager task'
          ],
          correct: 1,
          explanation: 'Los Dialogs necesitan un Activity Context porque se decoran con el tema de la Activity actual y se adjuntan a su window. Con Application Context, el Dialog se mostraría sin tema o lanzaría una excepción. SharedPreferences, storage y WorkManager funcionan perfectamente con Application Context.'
        },
        {
          question: '¿Qué hace la anotación @ApplicationContext de Hilt al inyectar un Context?',
          code: `@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    fun getToken() = context.getSharedPreferences("auth", Context.MODE_PRIVATE)
}`,
          options: [
            'Inyecta automáticamente el Context de la Activity actual',
            'Crea un nuevo Context cada vez que se inyecta',
            'Garantiza que se inyecte el Application Context (no el de ninguna Activity), evitando leaks en objetos @Singleton',
            'Requiere que la clase implemente ApplicationContextAware'
          ],
          correct: 2,
          explanation: '@ApplicationContext indica a Hilt que debe inyectar el Context de la Aplicación, no el de la Activity. Esto es esencial en objetos @Singleton: si Hilt inyectara un Activity Context, el Singleton retendría la Activity para siempre. Con @ApplicationContext, el contexto vive mientras la app y el leak es imposible.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia fundamental entre un Explicit Intent y un Implicit Intent?',
          options: [
            'Explicit Intent requiere permisos en el Manifest; Implicit Intent no',
            'Explicit Intent especifica el componente destino exacto (clase); Implicit Intent describe una acción y el sistema busca quién puede manejarla',
            'Implicit Intent es más rápido porque no necesita resolver el componente',
            'No hay diferencia — ambos se resuelven de la misma forma'
          ],
          correct: 1,
          explanation: 'Explicit Intent: indicas exactamente qué Activity/Service lanzar (ej: Intent(this, DetailActivity::class.java)). Se usa para navegación interna. Implicit Intent: describes una acción (ACTION_VIEW, ACTION_SEND) y Android busca apps que la manejen. Se usa para abrir URLs, compartir contenido, etc.'
        },
        {
          question: '¿Por qué startActivityForResult() está obsoleto y qué lo reemplaza?',
          code: `// Obsoleto ❌
startActivityForResult(intent, REQUEST_CODE)

// Moderno ✅
private val launcher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
) { result -> ... }`,
          options: [
            'Porque no funciona con Fragments — registerForActivityResult() funciona en Activity y Fragment',
            'Porque registerForActivityResult() (Activity Result API) gestiona el ciclo de vida automáticamente, evita conflictos de REQUEST_CODE y es type-safe con contratos predefinidos',
            'Porque startActivityForResult() causaba memory leaks siempre',
            'Porque Google descontinuó todas las APIs basadas en Intents'
          ],
          correct: 1,
          explanation: 'startActivityForResult() tenía problemas: (1) el REQUEST_CODE era un int suelto propenso a conflictos, (2) no respetaba el ciclo de vida — el callback podía ejecutarse tras destruir el Fragment/Activity, (3) el resultado se procesaba en onActivityResult() centralizado. registerForActivityResult() registra el launcher antes de lanzar, respeta el lifecycle y ofrece contratos type-safe (GetContent, RequestPermission, etc.).'
        },
        {
          question: '¿Para qué sirve Intent.createChooser() al enviar un Implicit Intent?',
          options: [
            'Para crear una copia del Intent original y modificarla sin afectar el primero',
            'Para forzar que el Intent siempre se abra en Chrome',
            'Para mostrar un diálogo al usuario donde elija qué app quiere usar para manejar la acción, evitando que una app se establezca como predeterminada silenciosamente',
            'Para crear un Intent implícito a partir de uno explícito'
          ],
          correct: 2,
          explanation: 'Sin createChooser(), si el usuario selecciona "Siempre" en el diálogo de elección, las siguientes veces el Intent se enviará automáticamente a esa app sin preguntar. createChooser() siempre muestra el diálogo de selección, garantizando que el usuario elija cada vez. Es especialmente importante con intents de compartir (ACTION_SEND).'
        },
        {
          question: '¿Qué elementos definen un deep link en un Intent Filter del Manifest?',
          code: `<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="myapp" android:host="detail" />
</intent-filter>`,
          options: [
            'Solo requiere la acción ACTION_VIEW',
            'Acción VIEW + categoría BROWSABLE (para que funcione desde un navegador) + data con scheme y host',
            'Cualquier Intent Filter puede recibir deep links automáticamente',
            'Solo necesita el elemento <data> con el scheme'
          ],
          correct: 1,
          explanation: 'Para que un deep link funcione: ACTION_VIEW (indica que se quiere "ver" algo), categoría BROWSABLE (permite que un navegador web lance el intent), y <data> define el URI (scheme://host/path). Si falta BROWSABLE, un enlace web no podrá abrir tu app. URI: myapp://detail/42 coincidiría con este filter.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia entre un permiso normal y un permiso peligroso en Android?',
          options: [
            'Los permisos normales solo funcionan en la versión de release; los peligrosos también en debug',
            'Los permisos normales se conceden automáticamente al instalar la app; los peligrosos afectan la privacidad del usuario y deben solicitarse en runtime',
            'No hay diferencia — todos los permisos se solicitan igual',
            'Los permisos peligrosos requieren una cuenta de desarrollador de Google; los normales no'
          ],
          correct: 1,
          explanation: 'Permisos normales (INTERNET, VIBRATE, SET_WALLPAPER): no afectan la privacidad, se conceden automáticamente al instalar. Permisos peligrosos (CAMERA, LOCATION, READ_CONTACTS): acceden a datos sensibles del usuario, deben declararse en el Manifest Y solicitarse en runtime desde Android 6.0 (API 23).'
        },
        {
          question: '¿Qué significa android:exported="true" en un componente del Manifest y cuándo es obligatorio?',
          options: [
            'Que el componente se puede ejecutar en otro proceso — obligatorio en Services',
            'Que el componente puede ser lanzado por otras apps o por el sistema — obligatorio en API 31+ para componentes con intent-filter',
            'Que el componente se exporta como una librería AAR — obligatorio en todos los módulos',
            'Que el componente se puede eliminar por el sistema cuando hay poca memoria'
          ],
          correct: 1,
          explanation: 'android:exported="true" indica que otras apps (o el sistema) pueden iniciar este componente. En API 31+ (Android 12), es obligatorio especificarlo explícitamente para componentes con intent-filter para evitar que se expongan accidentalmente. La Activity launcher siempre lleva exported="true" porque el sistema la inicia.'
        },
        {
          question: '¿Cuándo se debe llamar a shouldShowRequestPermissionRationale()?',
          code: `private val requestPermission = registerForActivityResult(
    ActivityResultContracts.RequestPermission()
) { isGranted ->
    when {
        isGranted -> openCamera()
        shouldShowRequestPermissionRationale(Manifest.permission.CAMERA) ->
            showRationale()
        else -> showSettingsPrompt()
    }
}`,
          options: [
            'Siempre, antes de pedir cualquier permiso',
            'Cuando el usuario negó el permiso pero NO marcó "No volver a preguntar" — para mostrar una explicación antes de volver a solicitarlo',
            'Solo cuando el permiso fue concedido — para confirmar la decisión del usuario',
            'Solo la primera vez que se solicita un permiso'
          ],
          correct: 1,
          explanation: 'shouldShowRequestPermissionRationale() retorna true cuando el usuario negó el permiso pero aún no marcó "No volver a preguntar". Esto te permite mostrar un diálogo explicando por qué necesitas el permiso antes de volver a pedirlo. Si retorna false tras una denegación, el usuario marcó "No volver a preguntar" y debes enviarlo a Settings.'
        },
        {
          question: '¿Qué elementos debe contener un Intent Filter para que una Activity sea el launcher de la app?',
          options: [
            'Solo <action android:name="android.intent.action.MAIN" />',
            '<action android:name="android.intent.action.MAIN" /> + <category android:name="android.intent.category.LAUNCHER" />',
            '<action android:name="android.intent.action.LAUNCHER" /> + <category android:name="android.intent.category.DEFAULT" />',
            'Basta con declarar la Activity como primera en el Manifest'
          ],
          correct: 1,
          explanation: 'Para que una Activity sea el punto de entrada de la app (la que se lanza al tocar el icono), necesita ambos: ACTION.MAIN (indica que es el entry point) y CATEGORY.LAUNCHER (indica que debe aparecer en el launcher del sistema). Sin LAUNCHER, la Activity no tendría icono en el home del dispositivo.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Cuál es la diferencia entre value y postValue en MutableLiveData?',
          code: `private val _data = MutableLiveData<String>()

fun updateFromMainThread(text: String) {
    _data.value = text
}

fun updateFromIOThread(text: String) {
    _data.postValue = text // ¿Qué pasa aquí?
}`,
          options: [
            'value y postValue son idénticos — ambos actualizan el valor inmediatamente',
            'value establece el valor sincrónicamente (solo en main thread); postValue lo programa para el main thread y se ejecuta cuando el looper principal esté listo — seguro desde hilos IO',
            'postValue es más rápido que value porque no espera al main thread',
            'value funciona desde cualquier hilo; postValue solo funciona desde el main thread'
          ],
          correct: 1,
          explanation: 'value: asigna el valor y notifica a los observers inmediatamente — solo desde el main thread. Si lo llamas desde un hilo IO, lanza una excepción. postValue: programa la actualización en el main thread usando un Handler.post(). Es seguro desde cualquier hilo, pero la notificación a observers se retrasa hasta el siguiente ciclo del main looper.'
        },
        {
          question: '¿Por qué se expone LiveData (inmutable) desde el ViewModel en lugar de MutableLiveData?',
          code: `class MyViewModel : ViewModel() {
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users
}`,
          options: [
            'Porque LiveData consume menos memoria que MutableLiveData',
            'Porque MutableLiveData no puede ser observado por la UI',
            'Para encapsular la mutabilidad — solo el ViewModel puede modificar el valor (_users), la UI solo observa (users) sin poder alterarlo',
            'Porque LiveData soporta transformation operators y MutableLiveData no'
          ],
          correct: 2,
          explanation: 'Este patrón de backing property (_users privado mutable, users público inmutable) garantiza que solo el ViewModel pueda modificar el dato desde dentro. La UI solo puede llamar a observe() en users, nunca a setValue() o postValue(). Esto previene que la vista modifique el estado directamente, respetando la unidireccionalidad del flujo de datos en MVVM.'
        },
        {
          question: '¿Qué hace MediatorLiveData y en qué caso lo usarías?',
          options: [
            'MediatorLiveData es un LiveData que se actualiza automáticamente con Room',
            'MediatorLiveData permite observar múltiples fuentes de LiveData y reaccionar cuando cualquiera de ellas cambia, combinando sus resultados',
            'MediatorLiveData filtra los valores de un LiveData según una condición',
            'MediatorLiveData es un LiveData que puede mutar el valor de otro LiveData'
          ],
          correct: 1,
          explanation: 'MediatorLiveData observa uno o más LiveData sources con addSource(). Cuando cualquiera de las fuentes emite un valor, puedes combinar todos los valores y generar uno nuevo. Es útil cuando necesitas datos de múltiples fuentes (ej: lista de productos + filtro seleccionado) para producir un resultado combinado.'
        },
        {
          question: '¿Qué hace la función Transformations.map() en LiveData?',
          code: `val userNames: LiveData<List<String>> = users.map { users ->
    users.map { it.name }
}`,
          options: [
            'Ejecuta la transformación en un hilo IO para no bloquear el main thread',
            'Crea un nuevo LiveData que transforma cada valor emitido por el LiveData original aplicando la función lambda — se actualiza automáticamente cuando la fuente cambia',
            'Itera sobre todos los valores históricos del LiveData y los transforma',
            'Convierte un LiveData en un Flow aplicando la función de transformación'
          ],
          correct: 1,
          explanation: 'Transformations.map() toma un LiveData y una función lambda, y retorna un nuevo LiveData que aplica la transformación a cada valor emitido por la fuente. Es lifecycle-aware: si la fuente emite mientras ningún observer está activo, la transformación se pospone. Es útil para derivar datos (ej: formatear fechas, mapear entidades a modelos de UI).'
        },
        {
          question: '¿Por qué es importante usar viewLifecycleOwner al observar LiveData en un Fragment y no this?',
          options: [
            'Porque this se refiere al Activity y no al Fragment',
            'Porque viewLifecycleOwner garantiza que el observer se elimine cuando la View se destruye; con this el observer podría permanecer activo con una View destruida, causando crashes',
            'Porque viewLifecycleOwner activa la actualización automática de la UI',
            'No es importante — ambos LifecycleOwner funcionan igual en Fragments'
          ],
          correct: 1,
          explanation: 'El lifecycle del Fragment (this) y el de su View (viewLifecycleOwner) son diferentes. La View se destruye en onDestroyView() pero el Fragment puede seguir vivo (ej: en la pila de back). Si observas con this, el observer sigue activo tras onDestroyView(), intentando actualizar Views inexistentes. viewLifecycleOwner se destruye con la View, eliminando observers a tiempo.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué ventaja ofrece ListAdapter sobre un RecyclerView.Adapter tradicional?',
          code: `class UserAdapter : ListAdapter<User, UserAdapter.UserViewHolder>(UserDiffCallback())`,
          options: [
            'ListAdapter solo funciona con listas de un solo tipo de item',
            'ListAdapter incorpora DiffUtil en background thread, actualizando solo los items que cambian con animaciones automáticas al llamar submitList()',
            'ListAdapter es más rápido porque no usa ViewHolder',
            'ListAdapter no requiere LayoutManager'
          ],
          correct: 1,
          explanation: 'ListAdapter extiende RecyclerView.Adapter y utiliza DiffUtil en un hilo secundario para calcular las diferencias entre la lista anterior y la nueva. submitList() ejecuta la diff en background y solo los items que cambiaron se actualizan con animaciones, evitando llamar a notifyDataSetChanged() que refrescaría toda la lista innecesariamente.'
        },
        {
          question: '¿Qué tipos de LayoutManager ofrece RecyclerView y para qué se usa cada uno?',
          options: [
            'Solo LinearLayoutManager — los demás son librerías externas que hay que añadir',
            'LinearLayoutManager (lista vertical u horizontal), GridLayoutManager (cuadrícula regular), StaggeredGridLayoutManager (cuadrícula con items de diferente tamaño)',
            'GridLayoutManager, TableLayoutManager y FlexLayoutManager',
            'LinearLayoutManager, PagerLayoutManager y StaggeredGridLayoutManager'
          ],
          correct: 1,
          explanation: 'LinearLayoutManager organiza los items en una lista lineal (scroll vertical u horizontal). GridLayoutManager los dispone en una cuadrícula de filas y columnas con el mismo tamaño. StaggeredGridLayoutManager es similar a GridLayout pero permite que los items tengan diferentes alturas o anchos (mosaico irregular tipo Pinterest).'
        },
        {
          question: '¿Cuál es la función del ViewHolder en RecyclerView?',
          options: [
            'Almacenar los datos que se muestran en cada item de la lista',
            'Mantener una referencia a las vistas del layout de cada item, evitando llamadas costosas a findViewById() y permitiendo reciclar vistas eficientemente',
            'Gestionar el LayoutManager y la disposición de los items en pantalla',
            'Crear nuevas vistas cuando no hay ViewHolders disponibles para reciclar'
          ],
          correct: 1,
          explanation: 'El ViewHolder mantiene referencias a las vistas del layout del item (tvName, ivAvatar, etc.) mediante binding. onCreateViewHolder() crea el ViewHolder inflando el layout, y onBindViewHolder() lo reutiliza enlazando los datos del item actual. Reciclar ViewHolders (en lugar de crear Views nuevas) es la clave del rendimiento de RecyclerView.'
        },
        {
          question: '¿Qué hace exactamente adapter.submitList(nuevaLista) en un ListAdapter?',
          options: [
            'Reemplaza toda la lista en el hilo principal, congelando la UI hasta terminar',
            'Calcula las diferencias con DiffUtil en background y aplica solo los cambios necesarios (insertar, eliminar, actualizar items) con animaciones automáticas',
            'Es equivalente a llamar notifyDataSetChanged() — refresca toda la lista',
            'Lanza una excepción si la nueva lista tiene más de 100 elementos'
          ],
          correct: 1,
          explanation: 'submitList() delega a AsyncListDiffer el cálculo de diferencias entre la lista anterior y la nueva en un hilo background usando el DiffUtil.Callback. Al terminar, aplica los cambios con notifyItemRangeInserted, notifyItemChanged, etc., activando las animaciones automáticas de RecyclerView. Solo los items modificados se actualizan, mejorando el rendimiento.'
        }
      ]
    }
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
    ],
    quiz: {
      questions: [
        {
          question: '¿Qué es Safe Args y qué problema resuelve?',
          code: `val action = HomeFragmentDirections.actionHomeToDetail(userId = 42)
findNavController().navigate(action)

class DetailFragment : Fragment() {
    private val args: DetailFragmentArgs by navArgs()
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val userId = args.userId // Int, type-safe
    }
}`,
          options: [
            'Safe Args es una librería para animaciones entre Fragments',
            'Safe Args es un plugin de Gradle que genera clases tipadas (Directions y Args) para la navegación, eliminando errores de tipo al pasar argumentos entre destinos en compile-time',
            'Safe Args reemplaza el AndroidManifest para configurar la navegación',
            'Safe Args solo funciona con Navigation Compose, no con Fragments'
          ],
          correct: 1,
          explanation: 'Sin Safe Args, pasar argumentos requiere usar Bundle con keys String (putInt("userId", 42)), lo que es propenso a errores de tipeo y tipos incorrectos que solo se detectan en runtime. Safe Args genera las clases HomeFragmentDirections y DetailFragmentArgs con propiedades tipadas, garantizando en compile-time que los nombres, tipos y obligatoriedad de los argumentos sean correctos.'
        },
        {
          question: '¿Qué rol cumple NavHostFragment en el Navigation Component?',
          options: [
            'Define el XML del NavGraph con todos los destinos y acciones de navegación',
            'Es el contenedor que renderiza los destinos del NavGraph — reemplaza al FragmentManager para las transacciones entre Fragments',
            'Gestiona los argumentos de navegación de forma type-safe con Safe Args',
            'Configura el BottomNavigation automáticamente al vincularlo con NavController'
          ],
          correct: 1,
          explanation: 'NavHostFragment es el fragmento especial que contiene y orquesta los destinos definidos en el NavGraph. Se declara en el layout XML y se asocia a un NavGraph. Cuando navegas, NavHostFragment reemplaza internamente su contenido con el Fragment destino, manejando el back stack automáticamente — sin necesidad de usar FragmentManager manualmente.'
        },
        {
          question: '¿Qué diferencia hay entre navigateUp() y popBackStack() en NavController?',
          code: `// Opción A
findNavController().navigateUp()

// Opción B
findNavController().popBackStack()`,
          options: [
            'navigateUp() navega al destino padre según la jerarquía del NavGraph; popBackStack() simplemente elimina el destino actual de la pila — navigateUp() considera la jerarquía declarada, popBackStack() considera la pila de navegación',
            'Son completamente equivalentes — ambos hacen lo mismo',
            'navigateUp() solo funciona con BottomNavigation; popBackStack() funciona siempre',
            'navigateUp() requiere Safe Args; popBackStack() no'
          ],
          correct: 0,
          explanation: 'navigateUp() respeta la jerarquía definida en el NavGraph (relaciones parent entre destinos), ideal para el botón "Up" de la ActionBar. popBackStack() simplemente deshace la última transacción de navegación, ignorando la jerarquía del NavGraph. Usa navigateUp() para el comportamiento estándar de navegación Android y popBackStack() para lógica programática específica.'
        },
        {
          question: '¿Cómo se configura un BottomNavigation para que funcione con el Navigation Component?',
          code: `val navController = findNavController(R.id.nav_host_fragment)
binding.bottomNav.setupWithNavController(navController)`,
          options: [
            'Se asigna un NavGraph diferente a cada item del BottomNavigation manualmente',
            'Con setupWithNavController(), el BottomNavigation se sincroniza con el NavController: al seleccionar un item navega al destino y al navegar programáticamente se actualiza el item seleccionado',
            'BottomNavigation no es compatible con Navigation Component — requiere una librería externa',
            'setupWithNavController() solo funciona con menús XML, no con menús creados programáticamente'
          ],
          correct: 1,
          explanation: 'setupWithNavController() vincula el BottomNavigation con el NavController automáticamente. Cuando el usuario presiona un item, se llama a navigate() con el id del destino. Cuando se navega programáticamente (por deep link, botón back, etc.), el BottomNavigation resalta el item correcto. Esto evita gestionar manualmente las selecciones y el back stack.'
        }
      ]
    }
  }
]
