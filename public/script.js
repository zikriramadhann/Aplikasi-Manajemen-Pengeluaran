document.addEventListener("DOMContentLoaded", function () {
  // Mengambil elemen formulir pengeluaran dan daftar pengeluaran
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");

  // Menambahkan event listener untuk formulir pengeluaran, untuk menambah pengeluaran
  if (expenseForm) {
    expenseForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Mencegah pengiriman formulir default
      addExpense(); // Menambahkan pengeluaran
    });
  }

  // Menambahkan event listener untuk input filter harga, format input ketika diubah
  const filterHargaInput = document.getElementById("filter-harga");
  if (filterHargaInput) {
    filterHargaInput.addEventListener("input", function () {
      formatFilterHarga(this); // Format harga yang dimasukkan
    });
  }

  // Fungsi untuk memformat filter harga yang dimasukkan pengguna
  function formatFilterHarga(input) {
    let value = input.value.replace(/\D/g, ""); // Menghapus semua karakter selain angka
    if (value) {
      input.value = "Rp" + parseInt(value).toLocaleString("id-ID"); // Menambahkan format mata uang
    } else {
      input.value = "";
    }
  }

  // Fungsi untuk mengkapitalkan huruf pertama setiap kata (untuk Nama)
  function capitalizeFirstLetterPerWord(input) {
    input.value = input.value
      .split(" ") // Memisahkan string berdasarkan spasi
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Mengkapitalkan huruf pertama setiap kata
      .join(" "); // Menggabungkan kembali kata-kata dengan spasi
  }

  // Fungsi untuk mengkapitalkan huruf pertama saja (untuk Deskripsi)
  function capitalizeFirstLetterOnly(input) {
    if (input.value.length === 1) {
      input.value = input.value.charAt(0).toUpperCase();
    }
  }

  // Menambahkan event listener untuk input Nama
  const namaInput = document.getElementById("nama");
  if (namaInput) {
    namaInput.addEventListener("input", function () {
      capitalizeFirstLetterPerWord(this); // Mengkapitalkan huruf pertama setiap kata
    });
  }

  // Menambahkan event listener untuk input Deskripsi
  const deskripsiInput = document.getElementById("deskripsi");
  if (deskripsiInput) {
    deskripsiInput.addEventListener("input", function () {
      capitalizeFirstLetterOnly(this); // Mengkapitalkan huruf pertama saja
    });
  }

  // Menambahkan event listener untuk input harga di form pengeluaran
  const hargaInput = document.getElementById("harga");
  if (hargaInput) {
    hargaInput.addEventListener("input", function () {
      formatHarga(this); // Memformat input harga
    });
  }

  fetchPengeluaran(); // Memanggil fungsi untuk mengambil data pengeluaran

  // Menambahkan event listener untuk filter kategori dan harga
  document
    .getElementById("filter-kategori")
    .addEventListener("change", applyFilters); // Menerapkan filter kategori
  document
    .getElementById("filter-harga")
    .addEventListener("input", applyFilters); // Menerapkan filter harga

  // Fungsi untuk menambahkan pengeluaran
  function addExpense() {
    const tanggal = document.getElementById("tanggal").value;
    const kategori = document.getElementById("kategori").value;
    const nama = document.getElementById("nama").value;
    const hargaInput = document.getElementById("harga").value;

    const harga = parseFloat(hargaInput.replace(/[^0-9]/g, "")); // Mengonversi harga ke angka
    const deskripsi = document.getElementById("deskripsi").value;

    // Validasi input harga
    if (isNaN(harga) || harga <= 0) {
      alert("Harga tidak valid. Silakan masukkan angka yang benar.");
      return;
    }

    const data = {
      tanggal,
      kategori,
      nama,
      harga,
      deskripsi,
    };

    // Mengirimkan data pengeluaran ke server
    fetch("http://localhost:3000/api/pengeluaran", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Respons jaringan tidak ok");
        }
        return response.json();
      })
      .then(() => {
        alert("Pengeluaran berhasil ditambahkan!");
        expenseForm.reset(); // Reset formulir setelah berhasil menambahkan pengeluaran
        fetchPengeluaran(); // Memuat ulang daftar pengeluaran
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat menambahkan pengeluaran.");
      });
  }

  // Fungsi untuk memformat harga input di form
  function formatHarga(input) {
    let value = input.value.replace(/\D/g, ""); // Menghapus semua karakter selain angka
    input.value = value ? "Rp" + parseInt(value).toLocaleString("id-ID") : ""; // Menambahkan format mata uang
  }

  // Fungsi untuk mengambil data pengeluaran dari server
  function fetchPengeluaran() {
    fetch("http://localhost:3000/api/pengeluaran")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Respons jaringan tidak ok");
        }
        return response.json();
      })
      .then((data) => {
        renderPengeluaran(data); // Menampilkan pengeluaran yang diterima
        applyFilters(); // Menerapkan filter setelah data dimuat
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        expenseList.innerHTML =
          '<tr><td colspan="6">Gagal memuat data pengeluaran.</td></tr>';
      });
  }

  // Fungsi untuk merender daftar pengeluaran dalam tabel
  function renderPengeluaran(data) {
    expenseList.innerHTML = ""; // Mengosongkan tabel sebelum menambah data baru
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
        <td>${item.kategori}</td>
        <td>${item.nama}</td>
        <td>Rp${item.harga.toLocaleString("id-ID")}</td>
        <td>${item.deskripsi}</td>
        <td>
          <button onclick="deletePengeluaran('${item._id}')">Hapus</button>
        </td>
      `;
        expenseList.appendChild(row); // Menambahkan baris baru ke tabel
      });
    } else {
      expenseList.innerHTML =
        '<tr><td colspan="6">Tidak ada data pengeluaran.</td></tr>';
    }
  }

  // Fungsi untuk menerapkan filter berdasarkan kategori dan harga
  function applyFilters() {
    const filterKategori = document.getElementById("filter-kategori").value;
    const filterHargaInput = document.getElementById("filter-harga").value;
    const filterHarga =
      parseFloat(filterHargaInput.replace(/[^0-9]/g, "")) || Infinity;

    const rows = document.querySelectorAll("#expense-list tr");

    rows.forEach((row) => {
      const kategori = row.cells[1].textContent;
      const harga = parseFloat(row.cells[3].textContent.replace(/[^0-9]/g, ""));
      let showRow = true;

      if (filterKategori && kategori !== filterKategori) {
        showRow = false;
      }

      if (harga > filterHarga) {
        showRow = false;
      }

      row.style.display = showRow ? "" : "none";
    });
  }

  // Fungsi untuk menghapus pengeluaran berdasarkan ID
  window.deletePengeluaran = function (id) {
    if (confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) {
      fetch(`http://localhost:3000/api/pengeluaran/${id}`, {
        method: "DELETE",
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Gagal menghapus pengeluaran.");
        }
        alert("Pengeluaran berhasil dihapus!");
        fetchPengeluaran(); // Memuat ulang daftar pengeluaran setelah dihapus
      });
    }
  };
});

// Fungsi untuk mengurutkan tabel berdasarkan tanggal
function sortTable(order) {
  const rows = Array.from(document.querySelectorAll("#expense-list tr"));
  rows.sort((a, b) => {
    const dateA = new Date(
      a.cells[0].textContent.split("/").reverse().join("-")
    );
    const dateB = new Date(
      b.cells[0].textContent.split("/").reverse().join("-")
    );
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });

  const tbody = document.getElementById("expense-list");
  tbody.innerHTML = "";
  rows.forEach((row) => tbody.appendChild(row)); // Menambahkan kembali baris ke tabel sesuai urutan
}

// Fungsi untuk mengurutkan tabel berdasarkan harga
function sortPrice(order) {
  const table = document.getElementById("expense-table");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    const priceA = parseFloat(a.cells[3].textContent.replace(/[^0-9]/g, ""));
    const priceB = parseFloat(b.cells[3].textContent.replace(/[^0-9]/g, ""));
    return order === "asc" ? priceA - priceB : priceB - priceA;
  });

  rows.forEach((row) => tbody.appendChild(row)); // Menambahkan kembali baris ke tabel sesuai urutan
}
