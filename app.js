// CONFIGURACIÓN DE TU BASE DE DATOS
const SUPABASE_URL = "https://mdlnqgfcmincjwuihciz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FzQ9SdRN4vVhklTGqkgZ5g_VcP0Mn6E";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ejecutar funciones al cargar la página de forma segura
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

// --- LOGICA DE LIKES (PROTEGIDA) ---
async function loadLikes() {
    try {
        let { data, error } = await supabase.from('likes_table').select('count').eq('id', 1).maybeSingle();
        if (data && data.count !== undefined) {
            document.getElementById('likeCount').innerText = data.count;
        } else {
            document.getElementById('likeCount').innerText = "0";
        }
    } catch (err) {
        console.error("Error controlado en likes:", err);
        document.getElementById('likeCount').innerText = "0";
    }
}

async function addLike() {
    try {
        let currentLikes = parseInt(document.getElementById('likeCount').innerText) || 0;
        let newLikes = currentLikes + 1;
        
        // Intenta actualizar el id: 1
        const { error } = await supabase.from('likes_table').update({ count: newLikes }).eq('id', 1);
        
        // Si la fila no existe (error), intentamos crearla por primera vez
        if (error) {
            await supabase.from('likes_table').insert([{ id: 1, count: newLikes }]);
        }
        
        document.getElementById('likeCount').innerText = newLikes;
    } catch (err) {
        console.error("Error al dar like:", err);
    }
}

// --- LÓGICA DE COMENTARIOS (PROTEGIDA) ---
async function loadComments() {
    try {
        let { data: comments, error } = await supabase
            .from('comments_table')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error en comentarios de Supabase:", error);
            return;
        }

        const listContainer = document.getElementById('commentsList');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        if (comments && comments.length > 0) {
            comments.forEach(c => {
                const card = document.createElement('div');
                card.className = 'comment-card';
                card.innerHTML = `
                    <div class="comment-user"><i class="fa-solid fa-gamepad"></i> ${escapeHTML(c.username || 'Gamer Anónimo')}</div>
                    <div class="comment-text">${escapeHTML(c.comment || '')}</div>
                `;
                listContainer.appendChild(card);
            });
        }
    } catch (err) {
        console.error("Error crítico cargando lista:", err);
    }
}

async function submitComment() {
    const usernameInput = document.getElementById('username');
    const commentInput = document.getElementById('commentText');

    if (!usernameInput || !commentInput || !usernameInput.value || !commentInput.value) {
        alert("¡Bro! Escribe tu Nick y un comentario primero.");
        return;
    }

    try {
        const { error } = await supabase
            .from('comments_table')
            .insert([
                { username: usernameInput.value, comment: commentInput.value }
            ]);

        if (!error) {
            usernameInput.value = '';
            commentInput.value = '';
            loadComments(); 
        } else {
            alert("No se pudo enviar. Verifica si creaste la tabla 'comments_table' en Supabase.");
        }
    } catch (err) {
        alert("Error de conexión.");
    }
}

// Anti-Hackers
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
