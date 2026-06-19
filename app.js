// CONFIGURACIÓN DE TU BASE DE DATOS
const SUPABASE_URL = "https://TU_PROPIO_PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY_DE_SUPABASE";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ejecutar funciones al cargar la página
window.onload = function() {
    loadLikes();
    loadComments();
};

// --- FUNCIÓN COPIAR AL PORTAPAPELES ---
function copyScript() {
    const codeText = document.getElementById('scriptCode').innerText;
    navigator.clipboard.writeText(codeText);
    alert("¡Script copiado! Pégalo en tu Delta Executor.");
}

// --- LOGICA DE LIKES ---
async function loadLikes() {
    let { data, error } = await supabase.from('likes_table').select('count').eq('id', 1).single();
    if (data) {
        document.getElementById('likeCount').innerText = data.count;
    }
}

async function addLike() {
    let currentLikes = parseInt(document.getElementById('likeCount').innerText);
    let newLikes = currentLikes + 1;
    
    const { error } = await supabase.from('likes_table').update({ count: newLikes }).eq('id', 1);
    
    if (!error) {
        document.getElementById('likeCount').innerText = newLikes;
    } else {
        console.error("Error al actualizar likes:", error);
    }
}

// --- LÓGICA DE COMENTARIOS ---
async function loadComments() {
    let { data: comments, error } = await supabase
        .from('comments_table')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error al traer comentarios:", error);
        return;
    }

    const listContainer = document.getElementById('commentsList');
    listContainer.innerHTML = '';

    comments.forEach(c => {
        const card = document.createElement('div');
        card.className = 'comment-card';
        card.innerHTML = `
            <div class="comment-user"><i class="fa-solid fa-gamepad"></i> ${escapeHTML(c.username)}</div>
            <div class="comment-text">${escapeHTML(c.comment)}</div>
        `;
        listContainer.appendChild(card);
    });
}

async function submitComment() {
    const usernameInput = document.getElementById('username');
    const commentInput = document.getElementById('commentText');

    if (!usernameInput.value || !commentInput.value) {
        alert("¡Bro! Escribe tu Nick y un comentario primero.");
        return;
    }

    const { data, error } = await supabase
        .from('comments_table')
        .insert([
            { username: usernameInput.value, comment: commentInput.value }
        ]);

    if (!error) {
        usernameInput.value = '';
        commentInput.value = '';
        loadComments(); 
    } else {
        alert("Error de conexión con Supabase. Revisa las políticas.");
        console.error(error);
    }
}

// Sistema de seguridad anti-hackers (Anti-XSS)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
