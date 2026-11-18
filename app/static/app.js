const grid=document.getElementById("items-grid");
const search=document.getElementById("search");
const category=document.getElementById("category");
const minPrice=document.getElementById("min-price");
const maxPrice=document.getElementById("max-price");
const sort=document.getElementById("sort");
let debounce;
function money(n){return "$"+Number(n).toLocaleString("en-US")}
async function loadStats(){
  const r=await fetch("/api/stats"); const s=await r.json();
  document.getElementById("stat-total").textContent=s.total;
  document.getElementById("stat-vehicles").textContent=s.vehicles;
  document.getElementById("stat-properties").textContent=s.properties;
  document.getElementById("stat-upgrades").textContent=s.upgrades;
}
async function loadItems(){
  const params=new URLSearchParams({q:search.value,category:category.value,sort:sort.value,min:minPrice.value,max:maxPrice.value});
  grid.innerHTML='<div class="loading">Updating catalogue...</div>';
  try{
    const response=await fetch("/api/items?"+params.toString());
    const data=await response.json();
    document.getElementById("result-count").textContent=`${data.total} results`;
    if(!data.items.length){grid.innerHTML='<div class="empty">No matching items. Try changing your filters.</div>';return}
    grid.innerHTML=data.items.map(item=>`
      <article class="item-card">
        <div class="card-top"><span class="category-tag">${escapeHtml(item.category.toUpperCase())}</span><span class="platform">${escapeHtml(item.platform)}</span></div>
        <h3>${escapeHtml(item.name)}</h3>
        <div class="subcat">${escapeHtml(item.subcategory)}</div>
        <div class="price">${escapeHtml(item.price_label || money(item.price))}</div>
        <div class="notes">${escapeHtml(item.notes || "")}</div>
        <a class="source" href="${safeUrl(item.source)}" target="_blank" rel="noopener noreferrer">VIEW SOURCE ↗</a>
      </article>`).join("");
  }catch(e){grid.innerHTML='<div class="empty">Could not load the catalogue. Check that the Flask server is running.</div>'}
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeUrl(value){try{const u=new URL(value);return ["http:","https:"].includes(u.protocol)?u.href:"#"}catch{return "#"}}
[search,category,minPrice,maxPrice,sort].forEach(el=>el.addEventListener(el===search?"input":"change",()=>{clearTimeout(debounce);debounce=setTimeout(loadItems,180)}));
document.getElementById("clear-filters").addEventListener("click",()=>{search.value="";category.value="All";minPrice.value="";maxPrice.value="";sort.value="name";loadItems()});
loadStats();loadItems();
