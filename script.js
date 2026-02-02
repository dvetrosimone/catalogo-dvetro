//alert("script cargado");

function abrirMenuLateral(){
  const menu = document.querySelector('.menu');
  const abriendo = !menu.classList.contains('menu-abierto');

  menu.classList.toggle('menu-abierto');

  if(abriendo){
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

/* === PRODUCTOS AGOTADOS === */
/*ahi dejo comentado como seleccionar por su codigo el producto agotado*/
const codigosAgotados = [
  /*'NF7664X24',
  'NF7664X24'*/
];
/* === FIN PRODUCTOS AGOTADOS === */

function marcarProductosAgotados(){
  document.querySelectorAll('.producto').forEach(prod=>{
    const codigoTxt = prod.querySelector('.codigo')?.textContent || '';

    codigosAgotados.forEach(cod=>{
      if(codigoTxt.includes(cod)){
        // marcar estado
        prod.classList.add('agotado');
        prod.setAttribute('data-tags','agotado');

        // desactivar botones
        prod.querySelectorAll('button').forEach(b=>{
          if(!b.classList.contains('flecha')){
            b.disabled = true;
            b.style.opacity = '0.5';
            b.style.cursor = 'not-allowed';
          }
        });
      }
    });
  });
}



let pedido={};

/* === CARRITO === */
function agregar(codigo,nombre,base,pack){
  pack=parseInt(pack);
  if(!pack) return alert("Elegí un pack");

  let ajuste=pack==2?.12:pack==4?.05:pack==12?-.04:pack==24?-.08:0;
  let precioPack=Math.round((base/6)*pack*(1+ajuste));
  let clave=codigo+"_x"+pack;

  if(!pedido[clave]){
    pedido[clave]={codigo,nombre,pack,precioPack,cantidad:0};
  }
  pedido[clave].cantidad++;
  render();
}

function render(){
  const lista = document.getElementById("lista");
  const barra = document.getElementById("barra");
  const resumen = document.getElementById("resumen");
  const totalEl = document.getElementById("total");

  lista.innerHTML = "";
  let total = 0, items = 0;

  for(let k in pedido){
    let p = pedido[k];
    let sub = p.precioPack * p.cantidad;
    total += sub;
    items += p.cantidad;

    lista.innerHTML += `
      <li>
        <strong>${p.nombre}</strong><br>
        Pack x${p.pack} · Cantidad ${p.cantidad}<br>
        Subtotal $${sub}
        <div class="controles">
          <button class="sumar" onclick="pedido['${k}'].cantidad++;render()">+</button>
          <button class="restar" onclick="pedido['${k}'].cantidad--;if(pedido['${k}'].cantidad<=0)delete pedido['${k}'];render()">−</button>
          <button class="borrar" onclick="delete pedido['${k}'];render()">🗑️</button>
        </div>
      </li>`;
  }

  if(total > 0){
    barra.style.display = "flex";

    // 👉 APLICAR DESCUENTO SI CORRESPONDE
    let totalFinal = total;

    if(descuentoActivo){
      totalFinal = Math.round(total * 0.95);
      resumen.textContent = `🛒 ${items} producto(s) — $${totalFinal} (5% OFF)`;
      totalEl.textContent = "Total con 5% OFF: $" + totalFinal;
    }else{
      resumen.textContent = `🛒 ${items} producto(s) — $${total}`;
      totalEl.textContent = "Total: $" + total;
    }

  }else{
    barra.style.display = "none";
    document.getElementById("carrito").classList.remove("abierto");
  }

  localStorage.setItem("pedidoDvetro", JSON.stringify(pedido));
}


function toggle(){
  const carrito = document.getElementById("carrito");
  const btnMenu = document.querySelector(".btn-menu");

  carrito.classList.toggle("abierto");

  if(carrito.classList.contains("abierto")){
    btnMenu.style.display = "none";
  }else{
    btnMenu.style.display = "inline-flex";
  }
}


function enviar(){
  if(!Object.keys(pedido).length) return alert("Pedido vacío");

  let nombre = document.getElementById("nombre").value;
  let calle = document.getElementById("calle").value;
  let numero = document.getElementById("numero").value;
  if(!nombre || !calle || !numero) return alert("Completá los datos");

  let msg = `- Pedido D’Vetro%0A- ${nombre}%0A%0A`;
  let total = 0;

  for(let k in pedido){
    let p = pedido[k];
    let sub = p.precioPack * p.cantidad;
    total += sub;

    let tipo =
      p.pack === "Unidad"
        ? "Unidad"
        : `Pack x${p.pack}`;

    msg += `- ${p.nombre}%0A`;
    msg += `  Código: ${p.codigo}%0A`;
    msg += `  ${tipo} · Cantidad: ${p.cantidad}%0A`;
    msg += `  $${sub}%0A%0A`;
  }

  // 👉 CALCULAR TOTAL FINAL (CLAVE)
  let totalFinal = total;

  if(descuentoActivo){
    totalFinal = Math.round(total * 0.95);
    msg += `- Descuento aplicado: 5% OFF%0A`;
    msg += `- Total con descuento: $${totalFinal}%0A`;
  }else{
    msg += `- Total: $${total}%0A`;
  }

  msg += `- Dirección: ${calle} ${numero}`;

  window.open("https://wa.me/59895770717?text=" + msg, "_blank");

  // 🧹 LIMPIAR CARRITO
  pedido = {};
  document.getElementById("lista").innerHTML = "";
  document.getElementById("total").innerHTML = "";

  // 🧼 LIMPIAR DATOS DE ENTREGA
  document.getElementById("nombre").value = "";
  document.getElementById("calle").value = "";
  document.getElementById("numero").value = "";

  // 🛒 RESET TEXTO DEL BOTÓN
  document.getElementById("resumen").innerText = "🛒 Mi pedido";

  // cerrar carrito
  toggle();
}

function cambiarFuente(tamaño){
  let valor = "18px";

  if(tamaño === "pequeña") valor = "16px";
  if(tamaño === "normal") valor = "18px";
  if(tamaño === "grande") valor = "24px";

  document.documentElement.style.fontSize = valor;
  localStorage.setItem("tamFuente", valor);
}


/* === GALERIA / ZOOM === */
function mover(b,d){
  let g=b.parentElement,q=g.querySelector(".galeria-track");
  let i=g.dataset.i||0;
  i=(+i+d+q.children.length)%q.children.length;
  g.dataset.i=i;
  q.style.transform=`translateX(-${i*100}%)`;
}

function zoom(s){
  zoomImg.src=s;
  zoomOverlay.style.display="flex";
}

function cerrarZoom(){zoomOverlay.style.display="none"}

function agregarUnidad(codigo, nombre, precioUnitario){
  const clave = codigo + "_unidad";

  if(!pedido[clave]){
    pedido[clave] = {
      codigo,
      nombre,
      pack: "Unidad",
      precioPack: precioUnitario,
      cantidad: 0
    };
  }

  pedido[clave].cantidad++;
  render();
}

function ocultarFlechasSiUnaImagen(){
  document.querySelectorAll(".galeria").forEach(galeria=>{
    const imgs = galeria.querySelectorAll(".galeria-track img");
    const flechas = galeria.querySelectorAll(".flecha");

    if(imgs.length <= 1){
      flechas.forEach(f => f.style.display = "none");
    }
  });
}

function actualizarPrecioUnidad(codigo, precioBase, pack){
  let ajuste = 0;

  if(pack === 1 || pack === 2) ajuste = 0.12;
  else if(pack === 4) ajuste = 0.05;
  else if(pack === 6) ajuste = 0;
  else if(pack === 12) ajuste = -0.04;
  else if(pack === 24) ajuste = -0.08;

  const precioUnidad = Math.round((precioBase / 6) * (1 + ajuste));

  const el = document.getElementById("precio-unidad-" + codigo);
  if(el){
    el.textContent = "$" + precioUnidad + " por unidad";
  }
}

/* === FILTRO POR CATEGORIA === */

function scrollAProductos(){
  const cont = document.getElementById("productos");
  if(cont){
    cont.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function filtrarCategoria(cat){
  document.querySelectorAll(".producto").forEach(p=>{
    p.style.display =
      (cat === "todos" || p.dataset.categoria === cat)
      ? "block" : "none";
  });

  scrollAProductos();
}

function filtrarSub(cat, sub){
  document.querySelectorAll(".producto").forEach(p=>{
    p.style.display =
      (p.dataset.categoria === cat && p.dataset.sub === sub)
      ? "block" : "none";
  });

  scrollAProductos();
}

function filtrarTag(tag){
  document.querySelectorAll(".producto").forEach(p=>{
    const tags = p.dataset.tags || "";
    p.style.display = tags.includes(tag) ? "block" : "none";
  });

  scrollAProductos();
}

/* === FAVORITOS === */
let favoritos = JSON.parse(localStorage.getItem('favoritosDvetro')) || [];

function toggleFavorito(btn){
  const prod = btn.closest('.producto');
  const codigoTxt = prod.querySelector('.codigo')?.textContent || '';
  const codigo = codigoTxt.replace('Código:','').trim();

  if(favoritos.includes(codigo)){
    favoritos = favoritos.filter(c => c !== codigo);
    btn.classList.remove('activo');
    btn.textContent = '🤍';
  }else{
    favoritos.push(codigo);
    btn.classList.add('activo');
    btn.textContent = '❤️';
  }

  localStorage.setItem('favoritosDvetro', JSON.stringify(favoritos));
  actualizarContadorFavoritos();

}

function filtrarFavoritos(){
  document.querySelectorAll('.producto').forEach(prod=>{
    const codigoTxt = prod.querySelector('.codigo')?.textContent || '';
    const codigo = codigoTxt.replace('Código:','').trim();

    prod.style.display = favoritos.includes(codigo)
      ? 'block'
      : 'none';
  });

  scrollAProductos();
}

function actualizarContadorFavoritos(){
  const cont = document.getElementById('contador-favoritos');
  const count = favoritos.length;

  if(count === 0){
    cont.style.display = 'none';
  }else{
    cont.style.display = 'block';
    document.getElementById('fav-count').textContent = count;
  }
}


/* ===============================
   CARGA DE PRODUCTOS DESDE JSON
================================ */

fetch("productos.json")
  .then(r => r.json())
  .then(data => {

    data.forEach(p => {

      // 👉 SI es producto de evento, va arriba
      if(p.tags && p.tags.includes("evento")){
        crearSliderEvento(p);     // 👈 IMAGEN CLICKEABLE
        crearProductoEvento(p);  // 👈 TARJETA
      }

      // 👉 TODOS van al catálogo normal
      crearProducto(p);
    });

    ocultarFlechasSiUnaImagen();
    marcarProductosAgotados();
    restaurarFavoritos();
     initSliderEvento();
  });


function crearProducto(p){
  const cont = document.getElementById("productos");
  const tags = (p.tags || []).join(" ");
  cont.insertAdjacentHTML("beforeend", `
    <div class="producto"
      data-categoria="${p.categoria}"
      data-sub="${p.subcategoria}"
      data-tags="${tags}">

      ${p.tags?.includes("destacado")
        ? `<span class="badge destacado">⭐ Destacado</span>`
        : ""}

      <button class="fav-btn" onclick="toggleFavorito(this)">🤍</button>

      ${crearGaleria(p.imagenes)}

      <h2>${p.nombre}</h2>
      <div class="codigo">Código: ${p.codigo}</div>

      ${p.tipoVenta === "pack"
        ? crearVentaPack(p)
        : crearVentaUnidad(p)}
      <details class="detalles">
        <summary>📐 Ver detalles</summary>
        <ul>
          ${p.detalles.map(d => `<li>${d}</li>`).join("")}
        </ul>
      </details>
      <button class="btn-wsp"
  onclick="compartirWhatsAppTexto(
    '${p.nombre}',
    '${p.codigo}',
    ${p.precioBase ?? 'null'},
    ${p.precioUnidad ?? 'null'},
    ${p.precio ?? 'null'}
  )">
  📲 Compartir datos
</button>
    </div>
  `);
}


function crearProductoEvento(p){
  const cont = document.getElementById("productos-evento");
  if(!cont) return;

  const tags = (p.tags || []).join(" ");

  cont.insertAdjacentHTML("beforeend", `
    <div class="producto"
      data-categoria="${p.categoria}"
      data-sub="${p.subcategoria}"
      data-tags="${tags}">

      <span class="badge oferta">💘 Evento</span>

      <button class="fav-btn" onclick="toggleFavorito(this)">🤍</button>

      ${crearGaleria(p.imagenes)}

      <h2>${p.nombre}</h2>
      <div class="codigo">Código: ${p.codigo}</div>

      ${p.tipoVenta === "pack"
        ? crearVentaPack(p)
        : crearVentaUnidad(p)}

      <details class="detalles">
        <summary>📐 Ver detalles</summary>
        <ul>
          ${p.detalles.map(d => `<li>${d}</li>`).join("")}
        </ul>
      </details>
      <button class="btn-wsp"
  onclick="compartirWhatsAppTexto(
    '${p.nombre}',
    '${p.codigo}',
    ${p.precioBase ?? 'null'},
    ${p.precioUnidad ?? 'null'},
    ${p.precio ?? 'null'}
  )">
  📲 Compartir datos
</button>
    </div>
  `);
}

function compartirWhatsAppTexto(nombre, codigo, precioBase, precioUnidad, precioDirecto){

  const precioFinal =
    precioBase ??
    precioUnidad ??
    precioDirecto ??
    null;

  const lineaPrecio = precioFinal
    ? `💲 Precio: $${precioFinal}\n\n`
    : "";

  const texto =
`✨ ${nombre}
🆔 Código: ${codigo}
${lineaPrecio}🎁 Si entrás a la página de D’Vetro y antes de comprar
ingresás un código especial, obtenés descuentos exclusivos.

Te comparto mi cupón de descuento [ DVETRO ]
Pegalo en el carrito y listo 💝

🌐 https://dvetrosimone.github.io/catalogo-dvetro/`;

  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
}


function crearGaleria(imgs){
  return `
    <div class="galeria">
      <button class="flecha izq" onclick="mover(this,-1)">‹</button>
      <div class="galeria-track">
        ${imgs.map(i =>
          `<img src="${i}" onclick="zoom('${i}')" loading="lazy">`
        ).join("")}
      </div>
      <button class="flecha der" onclick="mover(this,1)">›</button>
    </div>
  `;
}

function crearVentaPack(p){
  return `
    <select onchange="actualizarPrecioUnidad('${p.codigo}', ${p.precioBase}, parseInt(this.value) || 6)">
      <option value="">Elegí pack</option>
      ${p.packs.map(n => `<option value="${n}">x${n}</option>`).join("")}
    </select>

    <button onclick="agregar('${p.codigo}','${p.nombreCorto}',${p.precioBase}, this.previousElementSibling.value)">
      Agregar a mi pedido
    </button>

    <div class="precio" id="precio-unidad-${p.codigo}"></div>
  `;
}

function crearVentaUnidad(p){
  return `
    <button onclick="agregarUnidad('${p.codigo}','${p.nombreCorto}',${p.precioUnidad})">
      Agregar a mi pedido
    </button>

    <div class="precio">$${p.precioUnidad} por unidad</div>
  `;
}

function restaurarFavoritos(){
  document.querySelectorAll('.producto').forEach(prod=>{
    const codigo = prod.querySelector('.codigo')
      ?.textContent.replace('Código:','').trim();
    const btn = prod.querySelector('.fav-btn');

    if(favoritos.includes(codigo)){
      btn.classList.add('activo');
      btn.textContent = '❤️';
    }
  });
  actualizarContadorFavoritos();
}

function crearSliderEvento(p){
  const cont = document.getElementById("slider-evento");
  if(!cont) return;

  cont.insertAdjacentHTML("beforeend", `
    <div class="evento-item" onclick="irAProducto('${p.codigo}')">
      <img src="${p.imagenes[0]}" alt="${p.nombre}">
    </div>
  `);
}

function irAProducto(codigo){

  // 1️⃣ Cerrar menú si está abierto
  document.querySelector('.menu')?.classList.remove('menu-abierto');

  // 2️⃣ Mostrar todos los productos
  document.querySelectorAll('.producto').forEach(p => {
    p.style.display = 'block';
  });

  // 3️⃣ Buscar el producto
  const prod = [...document.querySelectorAll('.producto')]
    .find(p => p.querySelector('.codigo')?.textContent.includes(codigo));

  if(!prod) return;

  // 4️⃣ Scroll calculado (NO scrollIntoView)
  setTimeout(() => {
    const y =
      prod.getBoundingClientRect().top +
      window.pageYOffset -
      90; // 👈 margen por header fijo

    window.scrollTo({
      top: y,
      behavior: "smooth"
    });
  }, 200);
}



let descuentoActivo = localStorage.getItem("descuentoCodigo") === "true";
const CODIGO_VALIDO = "DVETRO";

document.getElementById("input-codigo")?.addEventListener("input", e => {
  e.target.value = e.target.value.toUpperCase();
});

function aplicarCodigo(){
  const input = document.getElementById("input-codigo");
  const mensaje = document.getElementById("mensaje-codigo");

  if(!input) return;

  const codigoIngresado = input.value.trim().toUpperCase();

  if(codigoIngresado === CODIGO_VALIDO){
    descuentoActivo = true;
    localStorage.setItem("descuentoCodigo", "true");

    mensaje.textContent = "🎉 Código aplicado: 5% OFF";
    mensaje.style.color = "#1e7f4f";

    render(); // recalcula total
  }else{
    mensaje.textContent = "❌ Código inválido";
    mensaje.style.color = "#a33";
  }

  actualizarTextoCupon();
}


function actualizarTextoCupon(){
  const texto = document.getElementById("texto-cupon");
  const input = document.getElementById("input-codigo");
  const boton = document.getElementById("btn-cupon");
  const mensaje = document.getElementById("mensaje-codigo");

  if(!texto) return;

  if(descuentoActivo){
    texto.textContent = "🎉 Tenés 5% OFF activo en tu compra";
    texto.style.color = "#1e7f4f";

    if(input) input.style.display = "none";
    if(boton) boton.style.display = "none";
    if(mensaje) mensaje.textContent = "";

  }else{
    texto.textContent = "🎁 Pedí tu cupón de descuento extra";
    texto.style.color = "#e63946";

    if(input) input.style.display = "block";
    if(boton) boton.style.display = "block";
  }
}

document.getElementById("input-buscar")?.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();

  document.querySelectorAll(".producto").forEach(prod => {
    const nombre = prod.querySelector("h2")?.textContent.toLowerCase() || "";
    const codigo = prod.querySelector(".codigo")?.textContent.toLowerCase() || "";

    const coincide =
      nombre.includes(texto) || codigo.includes(texto);

    prod.style.display = coincide ? "block" : "none";
  });
});

function initSliderEvento(){
  const slider = document.getElementById("slider-evento");
  const btnPrev = document.querySelector(".slider-btn.prev");
  const btnNext = document.querySelector(".slider-btn.next");

  if(!slider || !btnPrev || !btnNext) return;

  function paso(){
    const item = slider.querySelector(".evento-item");
    if(!item) return 0;

    const gap = parseInt(getComputedStyle(slider).gap) || 0;
    return item.offsetWidth + gap;
  }

  btnNext.onclick = () => {
    slider.scrollBy({ left: paso(), behavior: "smooth" });
  };

  btnPrev.onclick = () => {
    slider.scrollBy({ left: -paso(), behavior: "smooth" });
  };
}

/* === PERSISTENCIA === */
window.onload = () => {
  let data = localStorage.getItem("pedidoDvetro");
  if(data){
    pedido = JSON.parse(data);
    render();
  }

  ocultarFlechasSiUnaImagen(); // 👈 ESTO

// 👇 precio por unidad por defecto (x6)
  actualizarPrecioUnidad('NF7764X24', 490, 2);
  actualizarPrecioUnidad('NF7664X24', 580, 2);


  marcarProductosAgotados();
  

/* restaurar favoritos */
document.querySelectorAll('.producto').forEach(prod=>{
  const codigoTxt = prod.querySelector('.codigo')?.textContent || '';
  const codigo = codigoTxt.replace('Código:','').trim();
  const btn = prod.querySelector('.fav-btn');

  if(favoritos.includes(codigo) && btn){
    btn.classList.add('activo');
    btn.textContent = '❤️';
  }
});


if(descuentoActivo){
  const mensaje = document.getElementById("mensaje-codigo");
  if(mensaje){
    mensaje.textContent = "🎉 Código aplicado: 5% OFF";
    mensaje.style.color = "#1e7f4f";
  }
}

window.addEventListener("load", actualizarTextoCupon);

const fuenteGuardada = localStorage.getItem("tamFuente");
if(fuenteGuardada){
  document.documentElement.style.fontSize = fuenteGuardada;
}

};

document.querySelector(".menu-acciones button:nth-child(1)")
  ?.classList.add("activo");


function toggleMenu(btn){
  
}

/* === MENU ACORDEON LIMPIO === */
document.querySelectorAll('.menu details').forEach(detalle=>{
  detalle.addEventListener('toggle', ()=>{
    if(detalle.open){
      document.querySelectorAll('.menu details').forEach(otro=>{
        if(otro !== detalle){
          otro.removeAttribute('open');
        }
      });
    }
  });
});

/* === CERRAR MENU SOLO AL ELEGIR SUBFILTRO === */
document.querySelectorAll('.menu-content button, .menu-acciones button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.menu').classList.remove('menu-abierto');
  });
});

function cerrarMenu(){
  document.querySelector('.menu').classList.remove('menu-abierto');
}
