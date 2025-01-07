// Mengimpor library mongoose untuk mengatur skema dan model MongoDB
const mongoose = require("mongoose");

// Membuat skema pengeluaran untuk menyimpan data pengeluaran ke dalam database
const pengeluaranSchema = new mongoose.Schema({
  tanggal: {
    type: Date, // Menentukan bahwa kolom ini bertipe tanggal
    required: true, // Kolom ini wajib diisi
  },
  kategori: {
    type: String, // Menentukan bahwa kolom ini bertipe string
    required: true, // Kolom ini wajib diisi
  },
  nama: {
    type: String, // Menentukan bahwa kolom ini bertipe string
    required: true, // Kolom ini wajib diisi
  },
  harga: {
    type: Number, // Menentukan bahwa kolom ini bertipe angka
    required: true, // Kolom ini wajib diisi
  },
  deskripsi: {
    type: String, // Menentukan bahwa kolom ini bertipe string
    required: true, // Kolom ini wajib diisi
  },
});

// Mengekspor model 'Pengeluaran' berdasarkan skema yang telah dibuat
module.exports = mongoose.model("Pengeluaran", pengeluaranSchema);
