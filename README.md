# Good Night 🌙

**Good Night** es una aplicación web innovadora que utiliza inteligencia artificial para interpretar tus sueños y ayudarte a mejorar tus hábitos de sueño. Con un diseño elegante en tonos morados y una interfaz intuitiva, Good Night te permite registrar tus sueños mediante audio o texto, obtener interpretaciones detalladas y gestionar tus rutinas de sueño.

## ✨ Características Principales

### 🎤 Grabación de Sueños
- **Grabación de audio**: Registra tus sueños hablando directamente a la aplicación
- **Entrada de texto**: Escribe tus sueños manualmente como alternativa
- **Interfaz intuitiva**: Botón de grabación con indicadores visuales y temporizador

### 🧠 Interpretación con IA
- **Análisis psicológico**: Interpretación profunda del significado de tus sueños
- **Simbolismo**: Explicación de los símbolos presentes en tus sueños
- **Patrones emocionales**: Análisis del estado emocional reflejado en tus sueños
- **Recomendaciones personalizadas**: Consejos basados en la interpretación

### 📊 Métricas de Sueño
- **Horas de sueño**: Registro de hora de acostarse y despertar
- **Calidad del sueño**: Sistema de calificación con estrellas (1-5)
- **Interrupciones**: Contador y notas sobre interrupciones del sueño
- **Cálculo automático**: Duración total del sueño calculada automáticamente

### ✅ Gestión de Tareas
- **Rutinas pre-sueño**: Tareas para realizar antes de dormir
- **Rutinas post-sueño**: Tareas para realizar al despertar
- **Sistema de completado**: Marca tareas como completadas
- **Gestión completa**: Agregar, editar y eliminar tareas

### 📚 Historial de Sueños
- **Archivo completo**: Todos tus sueños e interpretaciones guardados
- **Búsqueda avanzada**: Busca por texto, fecha o categoría
- **Filtros múltiples**: Filtra por fecha, categoría y términos específicos
- **Vista detallada**: Accede a interpretaciones completas anteriores

## 🚀 Cómo Usar

### Instalación
1. Descarga o clona este repositorio
2. Abre el archivo `index.html` en tu navegador web
3. ¡Listo! No requiere instalación adicional

### Configuración Inicial
1. **API de OpenAI (Opcional)**: Para obtener interpretaciones avanzadas con IA:
   - Obtén una API key gratuita en [OpenAI](https://platform.openai.com/api-keys)
   - La aplicación te pedirá la API key la primera vez que uses la interpretación
   - Sin API key, la aplicación usará interpretaciones locales básicas

### Registrar un Sueño
1. Ve a la sección **"Sueños"**
2. **Opción 1 - Audio**:
   - Presiona el botón del micrófono
   - Permite el acceso al micrófono cuando se solicite
   - Habla describiendo tu sueño
   - Presiona nuevamente para detener la grabación
3. **Opción 2 - Texto**:
   - Escribe tu sueño en el área de texto
4. Presiona **"Interpretar Sueño"**
5. Revisa la interpretación generada
6. Presiona **"Guardar Interpretación"** para almacenarla

### Registrar Métricas de Sueño
1. Ve a la sección **"Métricas"**
2. Ingresa tu hora de acostarse y despertar
3. Califica la calidad de tu sueño (1-5 estrellas)
4. Registra el número de interrupciones y notas adicionales
5. Presiona **"Guardar Métricas del Día"**

### Gestionar Tareas de Sueño
1. Ve a la sección **"Tareas"**
2. **Tareas antes de dormir**:
   - Escribe una nueva tarea en el campo correspondiente
   - Presiona el botón "+" o Enter para agregarla
3. **Tareas al despertar**:
   - Mismo proceso para tareas matutinas
4. **Completar tareas**:
   - Haz clic en el checkbox para marcar como completada
   - Usa el botón de basura para eliminar tareas

### Explorar el Historial
1. Ve a la sección **"Historial"**
2. Usa los filtros para buscar sueños específicos:
   - **Fecha**: Filtra por fecha específica
   - **Categoría**: Filtra por tipo de sueño
   - **Búsqueda**: Busca por palabras clave
3. Haz clic en cualquier sueño para ver los detalles completos

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y moderna
- **CSS3**: Diseño responsive con tema morado y efectos visuales
- **JavaScript ES6+**: Lógica de aplicación modular y moderna
- **Web Audio API**: Grabación de audio nativa del navegador
- **OpenAI API**: Interpretación avanzada de sueños (opcional)
- **LocalStorage**: Almacenamiento local de todos los datos

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

### Características por Navegador
- **Grabación de audio**: Requiere navegadores modernos con soporte para MediaRecorder API
- **Almacenamiento local**: Todos los navegadores modernos
- **Diseño responsive**: Optimizado para móviles y desktop

## 🔒 Privacidad y Seguridad

- **Datos locales**: Todos tus sueños y métricas se almacenan localmente en tu navegador
- **Sin registro**: No requiere crear cuenta ni proporcionar información personal
- **API opcional**: La integración con OpenAI es completamente opcional
- **Control total**: Puedes exportar o eliminar todos tus datos en cualquier momento

## 🎨 Personalización

### Tema de Colores
La aplicación utiliza un hermoso tema morado con:
- Gradientes suaves y modernos
- Efectos de transparencia y blur
- Animaciones fluidas
- Diseño minimalista y elegante

### Responsive Design
- Adaptación automática a diferentes tamaños de pantalla
- Interfaz optimizada para móviles
- Navegación táctil amigable

## 🔧 Desarrollo

### Estructura del Proyecto
```
good_night/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── js/
│   ├── app.js         # Controlador principal
│   ├── audio.js       # Servicio de grabación de audio
│   ├── ai.js          # Servicio de IA para interpretación
│   └── storage.js     # Servicio de almacenamiento local
└── README.md          # Este archivo
```

### Arquitectura
- **Modular**: Cada funcionalidad en su propio módulo
- **Orientada a servicios**: Separación clara de responsabilidades
- **Event-driven**: Manejo de eventos centralizado
- **Responsive**: Diseño que se adapta a cualquier dispositivo

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar Good Night:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa que tu navegador sea compatible
2. Verifica que hayas permitido el acceso al micrófono
3. Asegúrate de tener una conexión a internet para las interpretaciones con IA
4. Revisa la consola del navegador para errores técnicos

## 🌟 Características Futuras

- [ ] Análisis de patrones de sueño a largo plazo
- [ ] Exportación de datos en diferentes formatos
- [ ] Integración con dispositivos wearables
- [ ] Modo oscuro/claro
- [ ] Notificaciones y recordatorios
- [ ] Compartir interpretaciones (opcional)
- [ ] Análisis de tendencias emocionales

---

**Good Night** - *Descubre el significado de tus sueños y mejora tu descanso* 🌙✨