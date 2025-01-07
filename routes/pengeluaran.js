const express = require("express");
const router = express.Router();
const Pengeluaran = require("../models/pengeluaran");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");

// Konfigurasi Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint untuk menambahkan pengeluaran
router.post("/", async (req, res) => {
  const pengeluaran = new Pengeluaran(req.body);
  try {
    await pengeluaran.save();
    res.status(201).send(pengeluaran);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Endpoint untuk mengambil semua data pengeluaran
router.get("/", async (req, res) => {
  try {
    const pengeluaran = await Pengeluaran.find();
    res.send(pengeluaran);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint untuk menghapus pengeluaran berdasarkan ID
router.delete("/:id", async (req, res) => {
  try {
    const pengeluaran = await Pengeluaran.findByIdAndDelete(req.params.id);
    if (!pengeluaran) {
      return res.status(404).send();
    }
    res.send(pengeluaran);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint untuk memperbarui pengeluaran berdasarkan ID
router.patch("/:id", async (req, res) => {
  try {
    const pengeluaran = await Pengeluaran.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!pengeluaran) {
      return res.status(404).send();
    }
    res.send(pengeluaran);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Fungsi untuk membuat dan menyimpan PDF
async function generatePDF(data, title, email, res) {
  const doc = new PDFDocument();
  const filename = `${title.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  const tempFilePath = `./temp/${filename}`;

  const writeStream = fs.createWriteStream(tempFilePath);
  doc.pipe(writeStream);

  // Header PDF
  doc.fontSize(18).text(title, { align: "center" }).moveDown();
  doc.fontSize(12).text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`);
  doc.moveDown();
  doc.fontSize(12).text("Daftar Pengeluaran:", { underline: true });

  // Konten PDF
  data.forEach((item, index) => {
    doc.text(
      `${index + 1}. Tanggal: ${new Date(item.tanggal).toLocaleDateString(
        "id-ID"
      )} | Kategori: ${item.kategori} | Nama: ${
        item.nama
      } | Harga: Rp${item.harga.toLocaleString("id-ID")} | Deskripsi: ${
        item.deskripsi
      }`
    );
    doc.moveDown(0.5);
  });

  // Footer
  doc.moveDown();
  doc.fontSize(10).text("Laporan ini dihasilkan secara otomatis oleh sistem.", {
    align: "center",
  });

  doc.end();

  // Tunggu proses penulisan selesai
  writeStream.on("finish", async () => {
    if (email) {
      // Kirim email dengan lampiran
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Laporan ${title}`,
        text: `Laporan ${title} Anda telah dilampirkan.`,
        attachments: [
          {
            filename,
            path: tempFilePath,
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        fs.unlinkSync(tempFilePath); // Hapus file sementara
        res
          .status(200)
          .send({ message: `Laporan ${title} berhasil dikirim ke ${email}.` });
      } catch (error) {
        console.error("Gagal mengirim email:", error);
        res.status(500).send({ message: "Gagal mengirim email." });
      }
    } else {
      // Kirim PDF langsung sebagai respons
      res.download(tempFilePath, filename, (err) => {
        if (!err) {
          fs.unlinkSync(tempFilePath); // Hapus file sementara
        }
      });
    }
  });

  writeStream.on("error", (err) => {
    console.error("Error saat menulis file PDF:", err);
    res.status(500).send("Gagal membuat PDF.");
  });
}

// Endpoint untuk laporan harian
router.get("/laporan/harian", async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const data = await Pengeluaran.find({
      tanggal: { $gte: startOfDay, $lte: endOfDay },
    });
    const email = req.query.email;
    generatePDF(data, "Laporan Harian", email, res);
  } catch (error) {
    res.status(500).send("Gagal memproses laporan harian.");
  }
});

// Endpoint untuk laporan mingguan
router.get("/laporan/mingguan", async (req, res) => {
  try {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const data = await Pengeluaran.find({
      tanggal: { $gte: oneWeekAgo, $lte: today },
    });
    const email = req.query.email;
    generatePDF(data, "Laporan Mingguan", email, res);
  } catch (error) {
    res.status(500).send("Gagal memproses laporan mingguan.");
  }
});

// Endpoint untuk laporan bulanan
router.get("/laporan/bulanan", async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res
        .status(400)
        .send({ message: "Parameter 'month' dan 'year' wajib diisi." });
    }
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const data = await Pengeluaran.find({
      tanggal: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const email = req.query.email;
    generatePDF(data, "Laporan Bulanan", email, res);
  } catch (error) {
    res.status(500).send("Gagal memproses laporan bulanan.");
  }
});

module.exports = router;
