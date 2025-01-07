const http = require("http");
const socketIo = require("socket.io");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const PDFDocument = require("pdfkit");
require("dotenv").config();

// Membuat instance aplikasi dan server
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Menghubungkan ke MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log("Koneksi ke MongoDB berhasil"))
  .catch((err) => console.error("Koneksi ke MongoDB gagal:", err));

// Rute pengeluaran
const pengeluaranRoutes = require("./routes/pengeluaran");
app.use("/api/pengeluaran", pengeluaranRoutes);

// Endpoint untuk menguji pembuatan PDF (Langkah 1)
app.get("/test-pdf", (req, res) => {
  const doc = new PDFDocument();
  const filename = "contoh-laporan.pdf";

  // Header untuk pengunduhan file PDF
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/pdf");

  // Menulis konten PDF
  doc.pipe(res);
  doc.fontSize(18).text("Laporan Pengeluaran", { align: "center" }).moveDown();
  doc.fontSize(12).text("Ini adalah contoh laporan pengeluaran.");
  doc.end(); // Menyelesaikan dokumen
});

// Folder sementara untuk file PDF
const tempFolder = "./temp";
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder); // Membuat folder jika belum ada
}

// Menjalankan server
server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
