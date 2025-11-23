// Responsive single-column mini social app logic
const feedEl = document.getElementById('feed');
const emptyEl = document.getElementById('empty');
const userNameEl = document.getElementById('user-name');

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

let posts = JSON.parse(localStorage.getItem('posts')||'[]');

function getUser(){
  return JSON.parse(localStorage.getItem('loggedInUser')||'null');
}

function requireAuth(){
  const user = getUser();
  if(!user){
    // If on login/signup pages, don't redirect
    if(!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('signup.html')){
      location.href = 'login.html';
      return;
    }
  } else {
    userNameEl.textContent = user.name.split(' ')[0];
  }
}
requireAuth();

document.getElementById('logout')?.addEventListener('click', ()=>{
  localStorage.removeItem('loggedInUser');
  location.href = 'login.html';
});

// render feed
function render(){
  const search = document.getElementById('search')?.value.toLowerCase() || '';
  const sort = document.getElementById('sort')?.value || 'latest';
  const filtered = posts.filter(p => p.text.toLowerCase().includes(search));
  if(sort==='latest') filtered.sort((a,b)=>b.created - a.created);
  if(sort==='oldest') filtered.sort((a,b)=>a.created - b.created);
  if(sort==='mostliked') filtered.sort((a,b)=>b.likes - a.likes);
  feedEl.innerHTML = '';
  if(filtered.length===0){ emptyEl.style.display = 'block'; } else { emptyEl.style.display = 'none'; }
  for(const p of filtered){
    const card = document.createElement('article');
    card.className = 'post-card bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow border border-white/30 fade-in';
    card.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-12 h-12 rounded-3xl bg-white/60 flex items-center justify-center border border-white/25">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A13 13 0 0112 15c2.5 0 4.8.6 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-slate-800">${escapeHtml(p.user)}</h3>
              <p class="text-xs text-slate-500">${new Date(p.created).toLocaleString()}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="like-btn text-lg" data-id="${p.id}" aria-label="Like post">❤</button>
              <span class="likes-count text-sm text-slate-600">${p.likes}</span>
              <button class="delete-btn text-sm text-red-500 ml-2" data-id="${p.id}" aria-label="Delete post">Delete</button>
            </div>
          </div>
          <p class="mt-3 text-slate-700 break-words">${escapeHtml(p.text)}</p>
          ${p.image ? `<img src="${p.image}" alt="post image" class="mt-3 post-image">` : ''}
        </div>
      </div>
    `;
    feedEl.appendChild(card);
  }
  // events
  document.querySelectorAll('.like-btn').forEach(btn=>{
    btn.onclick = (e)=>{
      const id = btn.dataset.id;
      toggleLike(id, btn);
    }
  });
  document.querySelectorAll('.delete-btn').forEach(btn=>{
    btn.onclick = (e)=>{
      const id = btn.dataset.id;
      if(confirm('Delete this post?')) deletePost(id);
    }
  });
}

function toggleLike(id, btn){
  const p = posts.find(x=>x.id===id);
  if(!p) return;
  if(p.liked){ p.liked=false; p.likes = Math.max(0,p.likes-1); btn.classList.remove('liked'); }
  else { p.liked=true; p.likes = (p.likes||0)+1; btn.classList.add('liked'); }
  saveAndRender();
}

function deletePost(id){
  posts = posts.filter(p=>p.id!==id);
  saveAndRender();
}

function saveAndRender(){
  localStorage.setItem('posts', JSON.stringify(posts));
  render();
}

// Popup handling
const openBtn = document.getElementById("open-popup");
const overlay = document.getElementById("popup-overlay");
const popupBox = document.getElementById("popup-box");
const closeBtn = document.getElementById("close-popup");
const popupPostBtn = document.getElementById("popup-post-btn");

openBtn.onclick = () => {
  overlay.classList.remove("hidden");
  // small delay to trigger transition
  setTimeout(()=> {
    popupBox.classList.remove("scale-75","opacity-0");
    popupBox.classList.add("scale-100");
  }, 10);
  // focus textarea on mobile
  setTimeout(()=> document.getElementById('popup-text').focus(), 220);
};

closeBtn.onclick = closePopup;
overlay.onclick = (e)=> { if(e.target===overlay) closePopup(); };
function closePopup(){
  popupBox.classList.add("scale-75","opacity-0");
  popupBox.classList.remove("scale-100");
  setTimeout(()=> overlay.classList.add("hidden"), 180);
}

// Posting from popup
popupPostBtn.onclick = ()=>{
  const text = document.getElementById('popup-text').value.trim();
  const image = document.getElementById('popup-img').value.trim();
  if(!text && !image){ alert('Write something or add an image!'); return; }
  const user = getUser();
  posts.unshift({
    id: uid(),
    user: user ? user.name : 'Guest',
    text,
    image: image||'',
    created: Date.now(),
    likes: 0,
    liked: false
  });
  document.getElementById('popup-text').value = '';
  document.getElementById('popup-img').value = '';
  saveAndRender();
  closePopup();
};

// Search & sort
document.getElementById('search')?.addEventListener('input', render);
document.getElementById('sort')?.addEventListener('change', render);

render();

// helper
function escapeHtml(unsafe){
  if(!unsafe) return '';
  return unsafe.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
