/* ZoroMart server-mode adapter. When hosted on Tomcat it uses the Java API;
   when opened directly as a static file it leaves the original visual demo intact. */
(() => {
  if (location.protocol === 'file:') return;
  const API = 'api/v1';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function api(path, method='GET', body) {
    const res = await fetch(`${API}${path}`, {method, credentials:'same-origin', headers:{'Content-Type':'application/json'}, ...(body === undefined ? {} : {body:JSON.stringify(body)})});
    const json = await res.json().catch(()=>({success:false,error:{message:'Server returned an unreadable response'}}));
    if (!res.ok || !json.success) throw new Error(json.error?.message || 'Request failed');
    return json.data;
  }
  function flash(message, bad=false) {
    let box = $('message') || $('serverMessage');
    if (!box) { box=document.createElement('div'); box.id='serverMessage'; box.style.cssText='position:fixed;z-index:99999;top:90px;right:20px;max-width:360px;padding:14px 18px;border-radius:10px;background:#171717;border:1px solid #d4af37;color:#fff';document.body.appendChild(box); }
    box.textContent=message; box.style.display='block'; box.style.color=bad?'#ff9999':'#f2d675';
  }
  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
  const signedIn = () => api('/auth/me').catch(()=>null);

  // Auth forms: use server sessions and bcrypt-backed accounts, not browser storage.
  document.addEventListener('submit', async event => {
    const form=event.target;
    if (form.id!=='loginForm' && form.id!=='signupForm') return;
    event.preventDefault(); event.stopImmediatePropagation();
    try {
      if (form.id==='loginForm') {
        const user=await api('/auth/login','POST',{email:$('email')?.value.trim(),password:$('password')?.value});
        const selected=$('role')?.value?.toUpperCase();
        if (selected && selected!=='AUTO' && selected!==user.role) { await api('/auth/logout','POST',{}); throw new Error(`This account is ${user.role}. Choose the matching role.`); }
        location.href=user.role==='ADMIN'?'admin-dashboard.html':user.role==='SELLER'?'seller-dashboard.html':'user-home.html';
      } else {
        if ($('confirmPassword') && $('password').value!==$('confirmPassword').value) throw new Error('Passwords do not match');
        const user=await api('/auth/register','POST',{name:$('name').value.trim(),email:$('email').value.trim(),password:$('password').value,role:$('role').value.toUpperCase()});
        flash('Account created. Please log in.'); setTimeout(()=>location.href='login.html',700);
      }
    } catch(e) { flash(e.message,true); }
  }, true);

  // Marketplace catalog.
  async function renderServerProducts() {
    const grid=$('grid'); if(!grid) return;
    try {
      const q=$('keyword')?.value || new URLSearchParams(location.search).get('search') || '';
      const cat=$('category')?.value || 'ALL';
      const data=await api('/products?q='+encodeURIComponent(q)+'&category='+encodeURIComponent(cat==='ALL'?'':cat));
      let items=data || []; const sort=$('sort')?.value;
      if(sort==='low') items.sort((a,b)=>Number(a.price)-Number(b.price)); if(sort==='high') items.sort((a,b)=>Number(b.price)-Number(a.price));
      grid.innerHTML=items.length?items.map(p=>`<article class="item"><div class="item-art">${p.imageUrl?`<img alt="${esc(p.name)}" src="${esc(p.imageUrl)}" style="width:100%;height:100%;object-fit:cover">`:'📦'}</div><div class="item-body"><small>${esc(p.category)} · ${Number(p.stockQty)} in stock</small><h3>${esc(p.name)}</h3><p>${esc(p.description)}<br>Seller: ${esc(p.sellerName)}</p><div class="item-price">${money(p.price)}</div><button class="gold-action" onclick="serverAddCart(${Number(p.id)})" ${Number(p.stockQty)<1?'disabled':''}>Add to Cart +</button> <button class="gold-action" style="background:#252525;color:#e7c95d;border:1px solid #8e7429" onclick="serverShowReviews(${Number(p.id)})">Reviews</button><div id="reviews-${Number(p.id)}" style="margin-top:8px"></div></div></article>`).join(''):'<div class="empty">No products listed yet. Sellers can add listings after signing in.</div>';
    } catch(e) { flash('Could not load server products: '+e.message,true); }
  }
  window.serverAddCart=async id=>{try{await api('/cart/items','POST',{productId:id,quantity:1});flash('Product added to your server cart.');}catch(e){flash(e.message,true);if(e.message.toLowerCase().includes('log in'))setTimeout(()=>location.href='login.html',800);}};
  window.serverShowReviews=async id=>{const box=$('reviews-'+id);if(!box)return;try{const reviews=await api('/products/'+id+'/reviews');box.innerHTML=reviews.length?reviews.map(r=>`<p style="font-size:12px;color:#ddd">${'★'.repeat(Number(r.rating))}${'☆'.repeat(5-Number(r.rating))} · ${esc(r.reviewer)} — ${esc(r.comment||'No comment')}</p>`).join(''):'<p style="font-size:12px;color:#999">No reviews yet.</p>';}catch(e){box.textContent='Reviews unavailable.';}};
  if($('grid')) { window.render=renderServerProducts; ['keyword','category','sort'].forEach(id=>$(id)?.addEventListener('input',renderServerProducts)); $('searchBtn')?.addEventListener('click',()=>{if($('searchInput'))$('keyword').value=$('searchInput').value;renderServerProducts();}); document.addEventListener('DOMContentLoaded',renderServerProducts); }

  // Cart: quantity changes, remove, totals, and checkout all persist through JDBC.
  async function renderServerCart(){const box=$('cartItems');if(!box)return;try{const items=await api('/cart/items');box.innerHTML=items.length?items.map(i=>`<div class="cart-item" style="display:flex;align-items:center;gap:16px;padding:18px 0;border-bottom:1px solid #333"><div style="font-size:30px">🛍️</div><div style="flex:1"><b>${esc(i.name)}</b><p style="color:#aaa">${money(i.price)} each · stock ${i.stockQty}</p><label>Qty <input type="number" min="1" max="${i.stockQty}" value="${i.quantity}" onchange="serverUpdateCart(${i.id},this.value)" style="width:70px;padding:8px;background:#111;color:#fff;border:1px solid #555"></label></div><b>${money(i.lineTotal)}</b><button onclick="serverRemoveCart(${i.id})" style="background:transparent;color:#f88;border:1px solid #733;padding:8px;border-radius:6px">Remove</button></div>`).join(''):'<p>Your server cart is empty. <a href="products.html">Browse products</a>.</p>';const subtotal=items.reduce((s,i)=>s+Number(i.lineTotal),0);if($('subtotal'))$('subtotal').textContent=money(subtotal);if($('total'))$('total').textContent=money(subtotal);if($('delivery'))$('delivery').textContent=money(0);if($('discount'))$('discount').textContent=money(0);}catch(e){box.innerHTML='<p>Please log in to view your saved cart. <a href="login.html">Log in</a></p>';}}
  window.serverUpdateCart=async(id,qty)=>{try{await api('/cart/items/'+id,'PUT',{quantity:Number(qty)});await renderServerCart();}catch(e){flash(e.message,true);}};
  window.serverRemoveCart=async id=>{try{await api('/cart/items/'+id,'DELETE');await renderServerCart();}catch(e){flash(e.message,true);}};
  if($('cartItems')) document.addEventListener('DOMContentLoaded',renderServerCart);

  // Mock-payment checkout. Server creates the order and decrements stock transactionally.
  window.placeOrder=async function(){try{const order=await api('/orders','POST',{});if($('checkoutPage'))$('checkoutPage').style.display='none';if($('successScreen'))$('successScreen').style.display='block';if($('successOrderId'))$('successOrderId').textContent=order.orderId;flash('Mock payment confirmed. Order saved.');}catch(e){flash(e.message,true);}};
  if($('summaryItems'))document.addEventListener('DOMContentLoaded',async()=>{try{const items=await api('/cart/items');$('summaryItems').innerHTML=items.map(i=>`<p style="display:flex;justify-content:space-between;gap:12px"><span>${esc(i.name)} × ${i.quantity}</span><b>${money(i.lineTotal)}</b></p>`).join('')||'<p>Your cart is empty.</p>';const total=items.reduce((s,i)=>s+Number(i.lineTotal),0);if($('subtotal'))$('subtotal').textContent=money(total);if($('total'))$('total').textContent=money(total);}catch(e){$('summaryItems').textContent='Please log in and add products to your cart.';}});

  // Buyer order history.
  window.loadOrders=async function(){const box=$('ordersContainer');if(!box)return;try{const orders=await api('/orders');if(!orders.length){box.innerHTML='<p>No orders yet. Start shopping to see your orders here.</p>';return;}const chunks=await Promise.all(orders.map(async o=>{let items=[];try{items=await api('/orders/'+o.id+'/items');}catch(_){}const review=o.status==='DELIVERED'?items.map(i=>`<form class="reviewForm" style="margin-top:12px;padding:12px;border:1px solid #333;border-radius:8px"><input type="hidden" name="orderId" value="${o.id}"><input type="hidden" name="productId" value="${i.productId}"><b>Review: ${esc(i.name)}</b> <select name="rating" required><option value="">Stars</option><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select><input name="comment" maxlength="1000" placeholder="Write a short review" style="padding:8px;background:#111;color:#fff;border:1px solid #444"><button class="gold-btn" type="submit">Submit review</button></form>`).join(''):'<p style="color:#aaa">Reviews become available after an order is marked Delivered.</p>';return `<article style="padding:20px;margin:14px 0;background:#141414;border:1px solid #333;border-radius:12px"><h3>Order #${o.id}</h3><p>Status: <b>${esc(o.status)}</b></p><p>Total: ${money(o.totalAmount)}</p><small>${esc(o.createdAt)}</small>${review}</article>`;}));box.innerHTML=chunks.join('');}catch(e){box.textContent='Please log in to view order history.';}};
  document.addEventListener('submit',async e=>{if(!e.target.classList.contains('reviewForm'))return;e.preventDefault();e.stopImmediatePropagation();const f=e.target;try{await api('/reviews','POST',{orderId:Number(f.elements.orderId.value),productId:Number(f.elements.productId.value),rating:Number(f.elements.rating.value),comment:f.elements.comment.value});flash('Review submitted.');f.innerHTML='<p>Thank you for your review!</p>';}catch(err){flash(err.message,true);}},true);
  if($('ordersContainer'))document.addEventListener('DOMContentLoaded',()=>window.loadOrders());

  // Seller Studio API-backed CRUD.
  if($('productForm') && $('listings')) {
    async function sellerRender(){try{const a=await api('/seller/products');$('listings').innerHTML=a.length?a.map(p=>`<div class="listing"><div><b>${esc(p.name)}</b><small>${esc(p.category)} · ${money(p.price)} · stock ${p.stockQty}</small></div><div><button class="btn" onclick="serverEditListing(${p.id})">Edit</button> <button class="del" onclick="serverDeleteListing(${p.id})">Delete</button></div></div>`).join(''):'<p>No listings yet.</p>';}catch(e){$('listings').textContent='Seller login required to manage listings.';}}
    document.addEventListener('submit',async e=>{if(e.target.id!=='productForm')return;e.preventDefault();e.stopImmediatePropagation();const payload={name:$('pname').value.trim(),description:$('pdesc').value.trim(),price:$('pprice').value,stockQty:Number($('pstock').value),category:$('pcat').value,imageUrl:$('pimage')?.value.trim()||''};try{if(window.editingServerId)await api('/products/'+window.editingServerId,'PUT',payload);else await api('/products','POST',payload);window.editingServerId=null;e.target.reset();await sellerRender();flash('Listing saved to database.');}catch(err){flash(err.message,true);}},true);
    window.serverEditListing=async id=>{try{const a=await api('/seller/products');const p=a.find(x=>Number(x.id)===Number(id));if(!p)return;window.editingServerId=id;$('pname').value=p.name;$('pdesc').value=p.description;$('pprice').value=p.price;$('pstock').value=p.stockQty;$('pcat').value=p.category;if($('pimage'))$('pimage').value=p.imageUrl||'';$('formTitle').textContent='Edit listing';window.scrollTo({top:0,behavior:'smooth'});}catch(e){flash(e.message,true);}};window.serverDeleteListing=async id=>{try{await api('/products/'+id,'DELETE');await sellerRender();}catch(e){flash(e.message,true);}};document.addEventListener('DOMContentLoaded',sellerRender);
  }

  // Admin data is fetched from database; no public admin signup is provided.
  if($('users') && $('products') && $('orders'))document.addEventListener('DOMContentLoaded',async()=>{try{const [users,products,orders]=await Promise.all([api('/admin/users'),api('/products'),api('/admin/orders')]);$('usersCount').textContent=users.length;$('productsCount').textContent=products.length;$('ordersCount').textContent=orders.length;$('users').innerHTML=users.map(u=>`<div class="rowdata"><span>${esc(u.name)} <small class="muted">${esc(u.email)}</small></span><b>${esc(u.role)}</b></div>`).join('')||'<p>No users.</p>';$('products').innerHTML=products.map(p=>`<div class="rowdata"><span>${esc(p.name)} <small class="muted">${esc(p.category)} · ${money(p.price)}</small></span><button onclick="serverAdminDelete(${p.id})">Remove</button></div>`).join('')||'<p>No listings.</p>';$('orders').innerHTML=orders.map(o=>`<div class="rowdata"><span>Order #${o.id} · ${esc(o.buyerName)}</span><b>${esc(o.status)} · ${money(o.totalAmount)}</b><select onchange="serverSetStatus(${o.id},this.value)"><option value="">Change status</option><option>CONFIRMED</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select></div>`).join('')||'<p>No orders.</p>';}catch(e){flash('Admin login required: '+e.message,true);}});
  window.serverAdminDelete=async id=>{try{await api('/products/'+id,'DELETE');location.reload();}catch(e){flash(e.message,true);}};
  window.serverSetStatus=async(id,status)=>{if(!status)return;try{await api('/admin/orders/'+id+'/status','PUT',{status});flash('Order status updated.');}catch(e){flash(e.message,true);}};

  // The floating FAQ widget sends questions to the server-side chatbot service.
  if ($('chatForm')) $('chatForm').onsubmit=async event=>{event.preventDefault();const input=$('chatInput');const log=$('chatLog');const question=input.value.trim();if(!question)return;const userLine=document.createElement('p');userLine.textContent='You: '+question;log.appendChild(userLine);input.value='';try{const result=await api('/chat','POST',{message:question});const answer=document.createElement('p');answer.textContent='Assistant: '+result.reply;log.appendChild(answer);}catch(e){const answer=document.createElement('p');answer.textContent='Assistant: I can help with products, cart, checkout, orders, sellers and reviews.';log.appendChild(answer);}log.scrollTop=log.scrollHeight;};

  if($('welcome'))document.addEventListener('DOMContentLoaded',async()=>{const user=await signedIn();if(user)$('welcome').textContent='Welcome, '+user.name;});
  document.addEventListener('click',async event=>{const a=event.target.closest('a');if(!a||!(/sign out|logout/i.test(a.textContent||'')))return;event.preventDefault();try{await api('/auth/logout','POST',{});}finally{location.href='login.html';}});

  // Seller order list if a dedicated container is added to the page.
  if($('sellerOrders'))document.addEventListener('DOMContentLoaded',async()=>{try{const orders=await api('/seller/orders');$('sellerOrders').innerHTML=orders.length?orders.map(o=>`<div class="listing"><div><b>Order #${o.id}</b><small>Buyer: ${esc(o.buyerName)} · ${esc(o.status)} · ${money(o.totalAmount)}</small></div></div>`).join(''):'<p>No incoming orders yet.</p>';}catch(e){$('sellerOrders').textContent='Seller login required.';}});
})();
