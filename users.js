// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderUsers();
    
    // Sidebar Toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Auto-close sidebar on menu item click
    const sidebarItems = document.querySelectorAll('.sidebar li');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Close sidebar if on mobile
            if (window.innerWidth <= 768) {
                document.body.classList.remove('sidebar-collapsed');
            }
        });
    });

    // Event Listeners for Modals
    document.getElementById('add-user-btn').addEventListener('click', openAddModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
    });
    
    document.getElementById('user-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('avatar-input').addEventListener('change', handleAvatarPreview);
});

// --- DATA ACCESS ---
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [
        { id: 1, name: "Admin User", email: "admin@clearrisk.com", role: "admin", avatar: "" },
        { id: 2, name: "John Doe", email: "john@example.com", role: "user", avatar: "" }
    ];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
    renderUsers();
}

// --- CRUD LOGIC ---

function addUser(userData) {
    const users = getUsers();
    const newUser = {
        ...userData,
        id: Date.now()
    };
    users.push(newUser);
    saveUsers(users);
}

function editUser(id, updatedData) {
    const users = getUsers();
    const index = users.findIndex(u => u.id == id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedData };
        saveUsers(users);
    }
}

function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        const users = getUsers();
        const filtered = users.filter(u => u.id != id);
        saveUsers(filtered);
    }
}

// --- UI RENDERING ---

function renderUsers() {
    const users = getUsers();
    const listBody = document.getElementById('users-list');
    listBody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        const defaultEmoji = '👤';
        
        tr.innerHTML = `
            <td>
                <div class="user-table-avatar">
                    ${user.avatar ? `<img src="${user.avatar}" alt="Avatar">` : defaultEmoji}
                </div>
            </td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-label">${user.role}</span></td>
            <td>
                <button class="action-btn edit" onclick="openEditModal(${user.id})">✎</button>
                <button class="action-btn delete" onclick="deleteUser(${user.id})">🗑</button>
            </td>
        `;
        listBody.appendChild(tr);
    });
}

// --- MODAL LOGIC ---

let currentAvatarBase64 = "";

function openAddModal() {
    document.getElementById('modal-title').textContent = "Add New User";
    document.getElementById('user-id').value = "";
    document.getElementById('user-form').reset();
    document.getElementById('avatar-preview').innerHTML = '<span>👤</span>';
    document.getElementById('password-group').style.display = 'flex';
    currentAvatarBase64 = "";
    
    document.getElementById('modal-overlay').classList.add('show');
}

function openEditModal(id) {
    const users = getUsers();
    const user = users.find(u => u.id == id);
    if (!user) return;

    document.getElementById('modal-title').textContent = "Edit User";
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-role').value = user.role;
    document.getElementById('password-group').style.display = 'flex';
    document.getElementById('user-password').placeholder = "Leave blank to keep current";
    
    const preview = document.getElementById('avatar-preview');
    if (user.avatar) {
        preview.innerHTML = `<img src="${user.avatar}" alt="Preview">`;
        currentAvatarBase64 = user.avatar;
    } else {
        preview.innerHTML = `<span>👤</span>`;
        currentAvatarBase64 = "";
    }

    document.getElementById('modal-overlay').classList.add('show');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('show');
}

function handleAvatarPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentAvatarBase64 = event.target.result;
            document.getElementById('avatar-preview').innerHTML = `<img src="${currentAvatarBase64}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// --- SIDEBAR LOGIC ---

function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('user-id').value;
    const userData = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        role: document.getElementById('user-role').value,
        avatar: currentAvatarBase64
    };

    const password = document.getElementById('user-password').value;
    if (password) userData.password = password;

    if (id) {
        editUser(id, userData);
    } else {
        addUser(userData);
    }

    closeModal();
}
