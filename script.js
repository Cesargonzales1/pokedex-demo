// Configuración
const POKEMON_PER_PAGE = 20;
let currentPage = 1;
let allPokemon = [];
let filteredPokemon = [];

// Elementos del DOM
const pokemonContainer = document.getElementById('pokemonContainer');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const typeFilter = document.getElementById('typeFilter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');

// Traducciones de estadísticas
const statTranslations = {
    'hp': 'PS',
    'attack': 'Ataque',
    'defense': 'Defensa',
    'special-attack': 'At. Especial',
    'special-defense': 'Def. Especial',
    'speed': 'Velocidad'
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadPokemon();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    typeFilter.addEventListener('change', handleTypeFilter);
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

// Cargar Pokémon
async function loadPokemon() {
    showLoading(true);
    try {
        // Cargar los primeros 151 Pokémon (primera generación)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();

        // Obtener detalles de cada Pokémon
        const pokemonPromises = data.results.map(pokemon =>
            fetch(pokemon.url).then(res => res.json())
        );

        allPokemon = await Promise.all(pokemonPromises);
        filteredPokemon = [...allPokemon];

        displayPokemon();
    } catch (error) {
        console.error('Error al cargar Pokémon:', error);
        pokemonContainer.innerHTML = '<p style="color: white; text-align: center;">Error al cargar los Pokémon. Por favor, recarga la página.</p>';
    } finally {
        showLoading(false);
    }
}

// Mostrar/ocultar loading
function showLoading(show) {
    if (show) {
        loading.classList.add('active');
        pokemonContainer.style.display = 'none';
    } else {
        loading.classList.remove('active');
        pokemonContainer.style.display = 'grid';
    }
}

// Mostrar Pokémon
function displayPokemon() {
    const start = (currentPage - 1) * POKEMON_PER_PAGE;
    const end = start + POKEMON_PER_PAGE;
    const pokemonToShow = filteredPokemon.slice(start, end);

    pokemonContainer.innerHTML = '';

    if (pokemonToShow.length === 0) {
        pokemonContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No se encontraron Pokémon.</p>';
        return;
    }

    pokemonToShow.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        pokemonContainer.appendChild(card);
    });

    updatePagination();
}

// Crear tarjeta de Pokémon
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    const imageUrl = pokemon.sprites.other['official-artwork'].front_default ||
                     pokemon.sprites.front_default;

    const types = pokemon.types.map(type =>
        `<span class="type-badge type-${type.type.name}">${type.type.name}</span>`
    ).join('');

    card.innerHTML = `
        <img src="${imageUrl}" alt="${pokemon.name}">
        <p class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</p>
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <div class="pokemon-types">${types}</div>
        <button class="speech-btn" title="Pronunciar nombre">💬</button>
        <button class="sound-btn" title="Escuchar grito">🔊</button>
    `;

    // Evento para abrir detalles (excepto en botones)
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('sound-btn') && !e.target.classList.contains('speech-btn')) {
            showPokemonDetail(pokemon);
        }
    });

    // Evento para pronunciar nombre
    const speechBtn = card.querySelector('.speech-btn');
    speechBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speakPokemonName(pokemon);
    });

    // Evento para reproducir sonido
    const soundBtn = card.querySelector('.sound-btn');
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playPokemonSound(pokemon);
    });

    return card;
}

// Pronunciar nombre del Pokémon
function speakPokemonName(pokemon) {
    // Verificar si el navegador soporta Web Speech API
    if ('speechSynthesis' in window) {
        // Cancelar cualquier pronunciación anterior
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(pokemon.name);

        // Configurar el idioma y velocidad
        utterance.lang = 'en-US'; // Inglés
        utterance.rate = 0.9; // Velocidad normal
        utterance.pitch = 1; // Tono normal
        utterance.volume = 1; // Volumen al 100%

        window.speechSynthesis.speak(utterance);
    } else {
        console.log('Tu navegador no soporta síntesis de voz');
        alert('Tu navegador no soporta la función de pronunciación');
    }
}

// Reproducir sonido del Pokémon
function playPokemonSound(pokemon) {
    // La API de PokeAPI proporciona sonidos en pokemon.cries
    const soundUrl = pokemon.cries?.latest || pokemon.cries?.legacy;

    if (soundUrl) {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5; // Volumen al 50%
        audio.play().catch(error => {
            console.error('Error al reproducir sonido:', error);
        });
    } else {
        console.log('No hay sonido disponible para este Pokémon');
    }
}

// Construir cadena de evolución
async function buildEvolutionChain(chain) {
    const evolutions = [];

    // Función recursiva para procesar la cadena
    async function processChain(chainLink) {
        if (!chainLink) return;

        const speciesName = chainLink.species.name;
        const speciesId = chainLink.species.url.split('/').filter(Boolean).pop();

        // Obtener datos del Pokémon para la imagen
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);
        const pokemonData = await pokemonResponse.json();
        const imageUrl = pokemonData.sprites.other['official-artwork'].front_default ||
                        pokemonData.sprites.front_default;

        evolutions.push({
            name: speciesName,
            id: speciesId,
            image: imageUrl,
            minLevel: chainLink.evolution_details[0]?.min_level || null
        });

        // Procesar solo la primera evolución (para simplicidad)
        if (chainLink.evolves_to.length > 0) {
            await processChain(chainLink.evolves_to[0]);
        }
    }

    await processChain(chain);

    // Construir HTML
    if (evolutions.length === 1) {
        return '<p class="no-evolution">Este Pokémon no evoluciona</p>';
    }

    return evolutions.map((evo, index) => {
        const isLast = index === evolutions.length - 1;
        const nextEvo = evolutions[index + 1];

        return `
            <div class="evolution-item">
                <div class="evolution-pokemon" data-pokemon-id="${evo.id}">
                    <img src="${evo.image}" alt="${evo.name}">
                    <p class="evolution-name">${evo.name}</p>
                    <p class="evolution-id">#${String(evo.id).padStart(3, '0')}</p>
                </div>
                ${!isLast ? `
                    <div class="evolution-arrow">
                        <span>→</span>
                        ${nextEvo.minLevel ? `<p class="evolution-level">Nv. ${nextEvo.minLevel}</p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Mostrar detalle del Pokémon
async function showPokemonDetail(pokemon) {
    const imageUrl = pokemon.sprites.other['official-artwork'].front_default ||
                     pokemon.sprites.front_default;

    // Obtener sprite animado (GIF)
    const animatedSprite = pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
                          pokemon.sprites.front_default;

    const types = pokemon.types.map(type =>
        `<span class="type-badge type-${type.type.name}">${type.type.name}</span>`
    ).join('');

    const stats = pokemon.stats.map(stat => `
        <div class="stat-row">
            <span class="stat-name">${statTranslations[stat.stat.name] || stat.stat.name}</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stat.base_stat / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${stat.base_stat}</span>
        </div>
    `).join('');

    // Obtener información de la especie
    try {
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();

        // Buscar descripción en español
        const description = speciesData.flavor_text_entries.find(
            entry => entry.language.name === 'es'
        )?.flavor_text.replace(/\f/g, ' ') || 'Descripción no disponible.';

        const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');

        // Obtener cadena de evolución
        const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionChainData = await evolutionChainResponse.json();
        const evolutionChainHTML = await buildEvolutionChain(evolutionChainData.chain);

        modalBody.innerHTML = `
            <div class="modal-pokemon-header">
                <div class="pokemon-image-gallery">
                    <div class="gallery-item">
                        <img src="${imageUrl}" alt="${pokemon.name}">
                        <p class="gallery-label">Oficial</p>
                    </div>
                    <div class="gallery-item">
                        <img src="${animatedSprite}" alt="${pokemon.name} animado" class="animated-sprite">
                        <p class="gallery-label">Animado</p>
                    </div>
                </div>
                <h2 class="modal-pokemon-name">${pokemon.name}</h2>
                <p class="modal-pokemon-id">#${String(pokemon.id).padStart(3, '0')}</p>
                <div class="pokemon-types">${types}</div>
                <div class="modal-buttons">
                    <button class="speech-btn-large" title="Pronunciar nombre">💬 Pronunciar Nombre</button>
                    <button class="sound-btn-large" title="Escuchar grito">🔊 Escuchar Grito</button>
                </div>
            </div>

            <div class="pokemon-info">
                <h3>Información</h3>
                <div class="info-row">
                    <span class="info-label">Altura:</span>
                    <span class="info-value">${pokemon.height / 10} m</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Peso:</span>
                    <span class="info-value">${pokemon.weight / 10} kg</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Habilidades:</span>
                    <span class="info-value">${abilities}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Descripción:</span>
                    <span class="info-value" style="text-transform: none;">${description}</span>
                </div>
            </div>

            <div class="pokemon-stats">
                <h3>Estadísticas Base</h3>
                ${stats}
            </div>

            <div class="pokemon-evolution">
                <h3>Cadena de Evolución</h3>
                <div class="evolution-chain">
                    ${evolutionChainHTML}
                </div>
            </div>
        `;

        // Agregar eventos a los botones del modal
        const modalSpeechBtn = modalBody.querySelector('.speech-btn-large');
        const modalSoundBtn = modalBody.querySelector('.sound-btn-large');

        modalSpeechBtn.addEventListener('click', () => speakPokemonName(pokemon));
        modalSoundBtn.addEventListener('click', () => playPokemonSound(pokemon));

        // Hacer clickeable las evoluciones
        const evolutionPokemons = modalBody.querySelectorAll('.evolution-pokemon');
        evolutionPokemons.forEach(evoElement => {
            evoElement.addEventListener('click', async () => {
                const pokemonId = evoElement.getAttribute('data-pokemon-id');
                const selectedPokemon = allPokemon.find(p => p.id == pokemonId);
                if (selectedPokemon) {
                    await showPokemonDetail(selectedPokemon);
                }
            });
        });

        modal.classList.add('active');
    } catch (error) {
        console.error('Error al cargar detalles:', error);
    }
}

// Buscar Pokémon
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        filteredPokemon = [...allPokemon];
    } else {
        filteredPokemon = allPokemon.filter(pokemon =>
            pokemon.name.includes(searchTerm) ||
            pokemon.id.toString() === searchTerm
        );
    }

    currentPage = 1;
    displayPokemon();
}

// Filtrar por tipo
function handleTypeFilter() {
    const selectedType = typeFilter.value;

    if (selectedType === '') {
        filteredPokemon = [...allPokemon];
    } else {
        filteredPokemon = allPokemon.filter(pokemon =>
            pokemon.types.some(type => type.type.name === selectedType)
        );
    }

    currentPage = 1;
    displayPokemon();
}

// Cambiar página
function changePage(direction) {
    currentPage += direction;
    displayPokemon();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Actualizar paginación
function updatePagination() {
    const totalPages = Math.ceil(filteredPokemon.length / POKEMON_PER_PAGE);

    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
}
