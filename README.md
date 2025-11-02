# 🔴 Pokédex 🔵

Una Pokédex interactiva y moderna creada con HTML, CSS y JavaScript vanilla que utiliza la [PokéAPI](https://pokeapi.co/) para mostrar información detallada de los Pokémon de la primera generación.

## ✨ Características

- 📱 **Diseño Responsivo**: Se adapta perfectamente a cualquier tamaño de pantalla
- 🔍 **Búsqueda**: Busca Pokémon por nombre o número
- 🏷️ **Filtros**: Filtra Pokémon por tipo (Fuego, Agua, Planta, etc.)
- 📊 **Estadísticas Detalladas**: Visualiza las estadísticas base de cada Pokémon
- 🔊 **Sonidos de Pokémon**: Escucha el grito característico de cada Pokémon
- 💬 **Pronunciación de Nombres**: Escucha el nombre del Pokémon hablado en inglés
- 🎬 **Sprites Animados**: Visualiza GIFs animados oficiales de cada Pokémon
- 🔗 **Cadena de Evolución**: Visualiza la línea evolutiva completa con niveles
- 🎵 **Música de Fondo**: Música temática de Pokémon (YouTube embebido)
- 🚀 **Splash Screen**: Pantalla de carga animada con Pokébola
- 🎨 **Interfaz Moderna**: Diseño atractivo con gradientes y animaciones
- 📱 **PWA Ready**: Guárdalo como app en tu dispositivo con ícono personalizado
- 📖 **Información Completa**: Altura, peso, habilidades y descripción de cada Pokémon
- 🌍 **Multiidioma**: Descripciones en español

## 🚀 Cómo usar

### Opción 1: Abrir directamente en el navegador

1. Descarga o clona este repositorio
2. Abre el archivo `index.html` en tu navegador web favorito
3. ¡Listo! Ya puedes explorar el Pokédex

### Opción 2: Con un servidor local

```bash
# Si tienes Python instalado
python -m http.server 8000

# Si tienes Node.js instalado
npx http-server

# Si tienes PHP instalado
php -S localhost:8000
```

Luego abre tu navegador en `http://localhost:8000`

## 📖 Funcionalidades

### Búsqueda de Pokémon
- Escribe el nombre del Pokémon en el campo de búsqueda
- También puedes buscar por número (ej: "25" para Pikachu)
- Presiona Enter o haz clic en "Buscar"

### Filtrado por Tipo
- Usa el menú desplegable para filtrar por tipo de Pokémon
- Selecciona "Todos los tipos" para ver todos los Pokémon nuevamente

### Escuchar Sonidos y Pronunciación
- **Pronunciar nombre** 💬: Haz clic en el botón verde en la esquina superior izquierda para escuchar el nombre del Pokémon pronunciado en inglés
- **Grito del Pokémon** 🔊: Haz clic en el botón morado en la esquina superior derecha para escuchar el grito característico del Pokémon
- También puedes usar ambos botones desde el modal de detalles
- Los sonidos son los gritos oficiales de los Pokémon de la API
- La pronunciación usa la Web Speech API del navegador

### Ver Detalles
- Haz clic en cualquier tarjeta de Pokémon para ver información detallada
- La ventana modal mostrará:
  - **Galería de Imágenes**: Imagen oficial + Sprite animado (GIF)
  - Tipos
  - Altura y peso
  - Habilidades
  - Descripción
  - Estadísticas base con barras de progreso
  - **Cadena de Evolución**: Línea evolutiva completa con niveles requeridos
  - Botones para pronunciar el nombre y escuchar el grito del Pokémon

### Cadena de Evolución
- Visualiza la línea evolutiva completa del Pokémon
- Muestra el nivel requerido para cada evolución
- **Clickeable**: Haz clic en cualquier evolución para ver sus detalles
- Ejemplo: Bulbasaur → Ivysaur (Nv. 16) → Venusaur (Nv. 32)
- Si el Pokémon no evoluciona, se mostrará un mensaje indicándolo

### Navegación
- Usa los botones "Anterior" y "Siguiente" para navegar entre páginas
- Se muestran 20 Pokémon por página

### Música y Efectos
- **Splash Screen**: Al cargar la página verás una animación de Pokébola por 3 segundos
- **Música de Fondo**: La música comienza automáticamente al cargar
- **Control de Música**: Botón flotante rojo en la esquina inferior derecha
  - 🎵 = Música activada
  - 🔇 = Música silenciada
  - Haz clic para alternar on/off

### Guardar como App
- **En iOS**: Toca "Compartir" → "Agregar a pantalla de inicio"
- **En Android**: Toca el menú → "Agregar a pantalla de inicio"
- Verás el ícono de Pokébola en tu dispositivo
- Se abre como una app independiente con splash screen

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox y Grid
- **JavaScript (ES6+)**: Funcionalidad dinámica y llamadas a la API
- **PokéAPI**: Fuente de datos de los Pokémon

## 📁 Estructura del Proyecto

```
pokedex-demo/
│
├── index.html      # Estructura HTML principal
├── style.css       # Estilos y diseño
├── script.js       # Lógica y funcionalidad
└── README.md       # Este archivo
```

## 🎮 API Utilizada

Este proyecto utiliza la [PokéAPI](https://pokeapi.co/), una API RESTful gratuita con información detallada sobre Pokémon.

- Endpoint principal: `https://pokeapi.co/api/v2/pokemon`
- Datos incluidos: Sprites, estadísticas, tipos, habilidades, y más
- Sin necesidad de autenticación

## 🌟 Características Destacadas

### Diseño de Tarjetas
- Cada Pokémon se muestra en una tarjeta elegante
- Efecto hover con elevación 3D
- Badges de colores según el tipo de Pokémon

### Animaciones
- Loading spinner con diseño de Pokébola
- Transiciones suaves entre páginas
- Animación de aparición del modal

### Paleta de Colores por Tipo
- Cada tipo de Pokémon tiene su color característico
- Normal, Fuego, Agua, Planta, Eléctrico, Hielo, Lucha, Veneno, Tierra, Volador, Psíquico, Bicho, Roca, Fantasma, Dragón, Siniestro, Acero, Hada

## 📝 Notas

- Actualmente carga los primeros 151 Pokémon (Primera Generación)
- Requiere conexión a internet para obtener los datos
- Compatible con todos los navegadores modernos

## 🔮 Futuras Mejoras

- [ ] Agregar más generaciones de Pokémon
- [ ] Implementar sistema de favoritos
- [ ] Agregar comparador de Pokémon
- [ ] Modo oscuro/claro
- [ ] Información de evoluciones
- [ ] Sonidos de Pokémon

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo y personal.

## 🙏 Créditos

- Datos e imágenes de [PokéAPI](https://pokeapi.co/)
- Pokémon y todos los personajes relacionados son © Nintendo, Game Freak y Creatures Inc.

---

¡Diviértete explorando el mundo Pokémon! 🎮✨
