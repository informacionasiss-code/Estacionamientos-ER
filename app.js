// Initialize Supabase client
const { createClient } = supabase;
let supabaseClient;
let currentPersonnelId = null;
let tempVehicles = []; // Temporary vehicle list for registration

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
    setupEventListeners();
    checkAdminSession();
    loadSavedRUT();
});

function initializeSupabase() {
    if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL_HERE') {
        console.error('⚠️ Supabase not configured');
        return;
    }

    supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('✅ Supabase initialized');
}

function setupEventListeners() {
    // Mobile search
    const searchBtn = document.getElementById('searchBtn');
    const rutInput = document.getElementById('rutInput');

    if (searchBtn) {
        searchBtn.addEventListener('click', searchPersonnel);
    }

    if (rutInput) {
        rutInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchPersonnel();
        });
        rutInput.addEventListener('input', formatRutInput);
    }

    // Admin login
    const loginBtn = document.getElementById('loginBtn');
    const adminPassword = document.getElementById('adminPassword');

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    if (adminPassword) {
        adminPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Register personnel
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', registerPersonnel);
    }

    // Add vehicle to temporary list
    const addVehicleToList = document.getElementById('addVehicleToList');
    if (addVehicleToList) {
        addVehicleToList.addEventListener('click', addVehicleToTempList);
    }

    // Vehicle input enter key
    const vehicleInput = document.getElementById('vehicleInput');
    if (vehicleInput) {
        vehicleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addVehicleToTempList();
            }
        });
    }

    // Add vehicle in modal
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', addVehicle);
    }

    // Format RUT inputs
    const newRutInput = document.getElementById('newRut');
    if (newRutInput) {
        newRutInput.addEventListener('input', formatRutInput);
    }
}

function formatRutInput(e) {
    let value = e.target.value.replace(/[^0-9kK]/g, '');

    if (value.length > 1) {
        const dv = value.slice(-1);
        const num = value.slice(0, -1);
        value = num + '-' + dv;
    }

    e.target.value = value.toUpperCase();
}

// ========================================
// MOBILE - Worker Search with localStorage
// ========================================

function loadSavedRUT() {
    const savedRUT = localStorage.getItem('lastSearchedRUT');
    if (savedRUT) {
        document.getElementById('rutInput').value = savedRUT;
        // Auto-search if RUT exists
        setTimeout(() => searchPersonnel(), 500);
    }
}

async function searchPersonnel() {
    const rutInput = document.getElementById('rutInput');
    const rut = rutInput.value.trim();

    if (!rut) {
        showToast('Por favor ingrese un RUT');
        return;
    }

    if (!supabaseClient) {
        showToast('Error: Base de datos no configurada');
        return;
    }

    try {
        const { data: personnel, error: personnelError } = await supabaseClient
            .from('personnel')
            .select('*')
            .eq('rut', rut)
            .single();

        if (personnelError || !personnel) {
            showNoResults();
            localStorage.removeItem('lastSearchedRUT');
            return;
        }

        // Save RUT to localStorage
        localStorage.setItem('lastSearchedRUT', rut);

        // Get vehicles
        const { data: vehicles } = await supabaseClient
            .from('vehicles')
            .select('*')
            .eq('personnel_id', personnel.id);

        displayCredentialCard(personnel, vehicles || []);

    } catch (error) {
        console.error('Search error:', error);
        showToast('Error al buscar personal');
    }
}

function displayCredentialCard(personnel, vehicles) {
    const card = document.getElementById('credentialCard');
    const noResults = document.getElementById('noResults');

    noResults.classList.add('hidden');

    // Populate card
    document.getElementById('cardNombre').textContent = personnel.nombre;
    document.getElementById('cardCargo').textContent = personnel.cargo;
    document.getElementById('cardRut').textContent = personnel.rut;

    // Display date
    const date = new Date();
    document.getElementById('cardDate').textContent = date.toLocaleDateString('es-CL');

    // Display vehicles
    const ppuList = document.getElementById('cardPPU');
    ppuList.innerHTML = '';

    if (vehicles.length > 0) {
        vehicles.forEach(vehicle => {
            const plate = document.createElement('div');
            plate.className = 'vehicle-plate';
            plate.textContent = vehicle.ppu;
            ppuList.appendChild(plate);
        });
    } else {
        ppuList.innerHTML = '<span style="color: #94a3b8; font-size: 0.875rem;">Sin vehículos</span>';
    }

    // Display status
    const statusDiv = document.getElementById('cardEstado');
    const statusText = statusDiv.querySelector('.status-text');

    statusDiv.className = 'credential-status';
    if (personnel.estado === 'Autorizado') {
        statusDiv.classList.add('autorizado');
        statusText.textContent = '✓ AUTORIZADO';
    } else {
        statusDiv.classList.add('no-autorizado');
        statusText.textContent = '✗ NO AUTORIZADO';
    }

    card.classList.remove('hidden');
}

function showNoResults() {
    const card = document.getElementById('credentialCard');
    const noResults = document.getElementById('noResults');

    card.classList.add('hidden');
    noResults.classList.remove('hidden');
}

// ========================================
// DESKTOP - Admin Authentication
// ========================================

function checkAdminSession() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showAdminDashboard();
    }
}

function handleLogin() {
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput.value;
    const errorDiv = document.getElementById('loginError');

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        errorDiv.classList.add('hidden');
        showAdminDashboard();
    } else {
        errorDiv.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function handleLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('adminPassword').value = '';
}

function showAdminDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    loadPersonnelList();
}

// ========================================
// DESKTOP - Vehicle Management in Form
// ========================================

function addVehicleToTempList() {
    const input = document.getElementById('vehicleInput');
    const ppu = input.value.trim().toUpperCase();

    if (!ppu) {
        showToast('Ingrese una PPU válida');
        return;
    }

    if (ppu.length < 4) {
        showToast('PPU debe tener al menos 4 caracteres');
        return;
    }

    if (tempVehicles.includes(ppu)) {
        showToast('PPU ya agregada');
        return;
    }

    tempVehicles.push(ppu);
    input.value = '';
    renderTempVehicles();
}

function renderTempVehicles() {
    const container = document.getElementById('vehiclesList');
    container.innerHTML = '';

    tempVehicles.forEach((ppu, index) => {
        const chip = document.createElement('div');
        chip.className = 'vehicle-chip';
        chip.innerHTML = `
            <span>${ppu}</span>
            <button onclick="removeTempVehicle(${index})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        container.appendChild(chip);
    });
}

function removeTempVehicle(index) {
    tempVehicles.splice(index, 1);
    renderTempVehicles();
}

// ========================================
// DESKTOP - Personnel Registration
// ========================================

async function registerPersonnel() {
    const rut = document.getElementById('newRut').value.trim();
    const nombre = document.getElementById('newNombre').value.trim();
    const cargo = document.getElementById('newCargo').value.trim();
    const estado = document.getElementById('newEstado').value;

    if (!rut || !nombre || !cargo) {
        showToast('Complete todos los campos obligatorios');
        return;
    }

    if (!supabaseClient) {
        showToast('Error: Base de datos no configurada');
        return;
    }

    try {
        // Insert personnel
        const { data: personnel, error: personnelError } = await supabaseClient
            .from('personnel')
            .insert([{ rut, nombre, cargo, estado, photo_url: null }])
            .select()
            .single();

        if (personnelError) {
            if (personnelError.code === '23505') {
                showToast('Error: RUT ya registrado');
            } else {
                showToast('Error al registrar personal');
            }
            console.error('Insert error:', personnelError);
            return;
        }

        // Insert vehicles if any
        if (tempVehicles.length > 0) {
            const vehicleRecords = tempVehicles.map(ppu => ({
                personnel_id: personnel.id,
                ppu: ppu
            }));

            const { error: vehiclesError } = await supabaseClient
                .from('vehicles')
                .insert(vehicleRecords);

            if (vehiclesError) {
                console.error('Vehicles insert error:', vehiclesError);
                showToast('Personal registrado pero error al agregar vehículos');
            } else {
                showToast(`Personal y ${tempVehicles.length} vehículo(s) registrados`);
            }
        } else {
            showToast('Personal registrado exitosamente');
        }

        // Clear form
        document.getElementById('newRut').value = '';
        document.getElementById('newNombre').value = '';
        document.getElementById('newCargo').value = '';
        document.getElementById('newEstado').value = 'Autorizado';
        tempVehicles = [];
        renderTempVehicles();

        // Reload list
        loadPersonnelList();

    } catch (error) {
        console.error('Registration error:', error);
        showToast('Error al registrar personal');
    }
}

async function loadPersonnelList() {
    if (!supabaseClient) return;

    try {
        const { data: personnel, error } = await supabaseClient
            .from('personnel')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Load error:', error);
            return;
        }

        const listContainer = document.getElementById('personnelList');
        listContainer.innerHTML = '';

        if (!personnel || personnel.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #64748b; padding: 3rem; grid-column: 1/-1;">No hay personal registrado</p>';
            return;
        }

        for (const person of personnel) {
            const { data: vehicles } = await supabaseClient
                .from('vehicles')
                .select('*')
                .eq('personnel_id', person.id);

            const card = createPersonnelCard(person, vehicles || []);
            listContainer.appendChild(card);
        }

    } catch (error) {
        console.error('Load personnel error:', error);
    }
}

function createPersonnelCard(person, vehicles) {
    const card = document.createElement('div');
    card.className = 'personnel-card';

    const statusClass = person.estado === 'Autorizado' ? 'autorizado' : 'no-autorizado';
    const statusText = person.estado === 'Autorizado' ? '✓ AUTORIZADO' : '✗ NO AUTORIZADO';

    const vehicleTags = vehicles.map(v =>
        `<span class="vehicle-tag">${v.ppu}</span>`
    ).join('');

    card.innerHTML = `
        <div class="personnel-header">
            <div class="personnel-info">
                <h3>${person.nombre}</h3>
                <p>${person.cargo}</p>
            </div>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        
        <div class="personnel-details">
            <div class="detail-row">
                <span class="detail-label">RUT</span>
                <span class="detail-value">${person.rut}</span>
            </div>
        </div>
        
        <div class="personnel-vehicles">
            <h4>Vehículos (${vehicles.length})</h4>
            <div class="vehicle-tags">
                ${vehicleTags || '<span style="color: #94a3b8; font-size: 0.75rem;">Sin vehículos</span>'}
            </div>
        </div>
        
        <div class="personnel-actions">
            <button class="action-btn btn-vehicles" onclick="openVehicleModal('${person.id}', '${person.nombre}')">
                Vehículos
            </button>
            <button class="action-btn btn-toggle" onclick="toggleStatus('${person.id}', '${person.estado}')">
                Estado
            </button>
            <button class="action-btn btn-delete" onclick="deletePersonnel('${person.id}')">
                Eliminar
            </button>
        </div>
    `;

    return card;
}

async function toggleStatus(personnelId, currentStatus) {
    if (!supabaseClient) return;

    const newStatus = currentStatus === 'Autorizado' ? 'No Autorizado' : 'Autorizado';

    try {
        const { error } = await supabaseClient
            .from('personnel')
            .update({ estado: newStatus })
            .eq('id', personnelId);

        if (error) {
            console.error('Toggle error:', error);
            showToast('Error al cambiar estado');
            return;
        }

        showToast(`Estado: ${newStatus}`);
        loadPersonnelList();

    } catch (error) {
        console.error('Toggle status error:', error);
    }
}

async function deletePersonnel(personnelId) {
    if (!confirm('¿Eliminar este personal y todos sus vehículos?')) {
        return;
    }

    if (!supabaseClient) return;

    try {
        await supabaseClient
            .from('vehicles')
            .delete()
            .eq('personnel_id', personnelId);

        const { error } = await supabaseClient
            .from('personnel')
            .delete()
            .eq('id', personnelId);

        if (error) {
            console.error('Delete error:', error);
            showToast('Error al eliminar');
            return;
        }

        showToast('Personal eliminado');
        loadPersonnelList();

    } catch (error) {
        console.error('Delete error:', error);
    }
}

// ========================================
// DESKTOP - Vehicle Modal Management
// ========================================

function openVehicleModal(personnelId, personnelName) {
    currentPersonnelId = personnelId;

    document.getElementById('modalPersonName').textContent = personnelName;
    document.getElementById('newPPU').value = '';

    loadVehicles(personnelId);

    document.getElementById('vehicleModal').classList.remove('hidden');
}

function closeVehicleModal() {
    document.getElementById('vehicleModal').classList.add('hidden');
    currentPersonnelId = null;
}

async function loadVehicles(personnelId) {
    if (!supabaseClient) return;

    try {
        const { data: vehicles, error } = await supabaseClient
            .from('vehicles')
            .select('*')
            .eq('personnel_id', personnelId);

        if (error) {
            console.error('Load vehicles error:', error);
            return;
        }

        const listContainer = document.getElementById('vehicleList');
        listContainer.innerHTML = '';

        if (!vehicles || vehicles.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1.5rem;">Sin vehículos</p>';
            return;
        }

        vehicles.forEach(vehicle => {
            const item = document.createElement('div');
            item.className = 'vehicle-item';
            item.innerHTML = `
                <span class="vehicle-ppu">${vehicle.ppu}</span>
                <button class="vehicle-delete" onclick="deleteVehicle('${vehicle.id}')">Eliminar</button>
            `;
            listContainer.appendChild(item);
        });

    } catch (error) {
        console.error('Load vehicles error:', error);
    }
}

async function addVehicle() {
    const ppuInput = document.getElementById('newPPU');
    const ppu = ppuInput.value.trim().toUpperCase();

    if (!ppu) {
        showToast('Ingrese una PPU');
        return;
    }

    if (!supabaseClient || !currentPersonnelId) return;

    try {
        const { error } = await supabaseClient
            .from('vehicles')
            .insert([{ personnel_id: currentPersonnelId, ppu: ppu }]);

        if (error) {
            console.error('Add vehicle error:', error);
            showToast('Error al agregar vehículo');
            return;
        }

        showToast('Vehículo agregado');
        ppuInput.value = '';

        loadVehicles(currentPersonnelId);
        loadPersonnelList();

    } catch (error) {
        console.error('Add vehicle error:', error);
    }
}

async function deleteVehicle(vehicleId) {
    if (!confirm('¿Eliminar este vehículo?')) {
        return;
    }

    if (!supabaseClient) return;

    try {
        const { error } = await supabaseClient
            .from('vehicles')
            .delete()
            .eq('id', vehicleId);

        if (error) {
            console.error('Delete vehicle error:', error);
            showToast('Error al eliminar');
            return;
        }

        showToast('Vehículo eliminado');

        if (currentPersonnelId) {
            loadVehicles(currentPersonnelId);
        }
        loadPersonnelList();

    } catch (error) {
        console.error('Delete vehicle error:', error);
    }
}

// ========================================
// Utility Functions
// ========================================

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Make functions globally available
window.openVehicleModal = openVehicleModal;
window.closeVehicleModal = closeVehicleModal;
window.toggleStatus = toggleStatus;
window.deletePersonnel = deletePersonnel;
window.deleteVehicle = deleteVehicle;
window.removeTempVehicle = removeTempVehicle;
