/* =========================================================
 * Generator Nota — app.js
 *
 * Alur data:
 *   User mengisi form  →  event `input`  →  render()
 *   render() membaca semua field form, lalu menulis ulang
 *   isi preview #nota (kop toko, tabel item, total).
 * ========================================================= */

/* =========================================================
 * Util — helper singkat yang dipakai berulang
 * ========================================================= */

// Format angka ke "Rp 12.500" (locale Indonesia)
const rp = n => "Rp " + (n || 0).toLocaleString("id-ID");

// Shortcut document.getElementById
const $ = id => document.getElementById(id);

/* =========================================================
 * FORM — baris input barang
 * ========================================================= */

/**
 * Tambah satu baris input barang ke tabel form.
 * Setiap input di baris terhubung ke render() supaya preview
 * otomatis update saat user mengetik.
 */
function addRow(nama = "", qty = "", harga = "") {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="i-nama" placeholder="nama barang" value="${nama}"></td>
    <td class="c-qty"><input class="i-qty" type="number" min="0" placeholder="1" value="${qty}"></td>
    <td class="c-harga"><input class="i-harga" type="number" min="0" placeholder="0" value="${harga}"></td>
    <td class="c-del"><button type="button" class="btn-del" title="Hapus baris">&times;</button></td>
  `;

  // Setiap input di baris → trigger render
  tr.querySelectorAll("input").forEach(el => el.addEventListener("input", render));

  // Tombol hapus baris
  tr.querySelector(".btn-del").addEventListener("click", () => {
    tr.remove();
    render();
  });

  $("item-rows").appendChild(tr);
}

/* =========================================================
 * RENDER — tulis ulang preview nota dari isi form
 * ========================================================= */

function render() {
  renderKop();
  const subtotal = renderItems();
  renderTotal(subtotal);
}

// --- Bagian kop nota (nama toko, alamat, no, tanggal) ---
function renderKop() {
  $("n-toko").textContent   = $("f-toko").value || "NAMA TOKO";
  $("n-alamat").textContent = $("f-alamat").value;
  $("n-nomor").textContent  = $("f-nomor").value || "-";

  const d = $("f-tanggal").value;
  $("n-tanggal").textContent = d
    ? new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      })
    : "";
}

// --- Bagian daftar item; kembalikan subtotal ---
function renderItems() {
  const body = $("n-rows");
  body.innerHTML = "";

  let subtotal = 0;
  let no = 0;

  document.querySelectorAll("#item-rows tr").forEach(tr => {
    const nama  = tr.querySelector(".i-nama").value.trim();
    const qty   = parseFloat(tr.querySelector(".i-qty").value)   || 0;
    const harga = parseFloat(tr.querySelector(".i-harga").value) || 0;

    // Baris kosong → skip
    if (!nama && !qty && !harga) return;

    const jml = qty * harga;
    subtotal += jml;
    no++;

    body.insertAdjacentHTML("beforeend", `
      <tr>
        <td class="ctr">${no}</td>
        <td>${nama || "&nbsp;"}</td>
        <td class="ctr">${qty || ""}</td>
        <td class="num">${harga ? rp(harga) : ""}</td>
        <td class="num">${jml   ? rp(jml)   : ""}</td>
      </tr>
    `);
  });

  // Placeholder baris kosong biar layout tidak "melompat"
  if (no === 0) {
    body.innerHTML = `<tr><td class="ctr">1</td><td>&nbsp;</td><td></td><td></td><td></td></tr>`;
  }

  return subtotal;
}

// --- Bagian total (subtotal + diskon → TOTAL) ---
function renderTotal(subtotal) {
  const diskon = parseFloat($("f-diskon").value) || 0;
  const total  = Math.max(subtotal - diskon, 0);

  const foot = $("n-foot-rows");
  foot.innerHTML = "";

  // Baris subtotal & diskon hanya tampil kalau ada diskon
  if (diskon > 0) {
    foot.insertAdjacentHTML("beforeend", `
      <tr><td colspan="4" class="num">Subtotal</td><td class="num">${rp(subtotal)}</td></tr>
      <tr><td colspan="4" class="num">Diskon</td><td class="num">&minus; ${rp(diskon)}</td></tr>
    `);
  }

  foot.insertAdjacentHTML("beforeend", `
    <tr class="n-total"><td colspan="4" class="num">TOTAL</td><td class="num">${rp(total)}</td></tr>
  `);
}

/* =========================================================
 * EXPORT — simpan nota sebagai PNG
 * ========================================================= */

function downloadPNG() {
  html2canvas($("nota"), { scale: 3, backgroundColor: "#ffffff" }).then(cv => {
    const nm = ($("f-nomor").value || "nota").replace(/[^\w\-]+/g, "_");
    const a  = document.createElement("a");
    a.download = `nota_${nm}.png`;
    a.href     = cv.toDataURL("image/png");
    a.click();
  });
}

/* =========================================================
 * INIT — jalankan sekali saat halaman siap
 * ========================================================= */

// Set tanggal default = hari ini (format yyyy-mm-dd waktu lokal)
$("f-tanggal").value = new Date().toLocaleDateString("sv-SE");

// Semua field kop & info nota → trigger render saat berubah
["f-toko", "f-alamat", "f-nomor", "f-tanggal", "f-diskon"]
  .forEach(id => $(id).addEventListener("input", render));

// Tombol-tombol
$("btn-add-row").addEventListener("click", () => addRow());
$("btn-print").addEventListener("click", () => window.print());
$("btn-png").addEventListener("click", downloadPNG);

// Mulai dengan 3 baris kosong lalu render pertama
addRow();
addRow();
addRow();
render();
