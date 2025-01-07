// Ambil elemen DOM
const chatHistory = document.getElementById("chat-history");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send-btn");

// Fokuskan kursor ke input pesan saat halaman dimuat
window.addEventListener("load", () => {
  messageInput.focus();
});

// Fungsi untuk menambahkan pesan ke riwayat chat
function addMessage(message, sender) {
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("message-wrapper", sender);

  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);
  messageElement.innerHTML = message;

  const icon = document.createElement("i");
  icon.classList.add("fas", sender === "user" ? "fa-user" : "fa-robot");

  messageElement.prepend(icon);
  messageWrapper.appendChild(messageElement);
  chatHistory.appendChild(messageWrapper);

  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Tambahkan event listener untuk tombol kirim
sendButton.addEventListener("click", () => {
  const userMessage = messageInput.value.trim();

  if (userMessage !== "") {
    addMessage(userMessage, "user");
    messageInput.value = "";
    handleBotResponse(userMessage);
  }
});

// Tambahkan event listener untuk tombol Enter di input pesan
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendButton.click();
  }
});

// Format pesan agar huruf pertama menjadi kapital
messageInput.addEventListener("input", () => {
  if (messageInput.value.length === 1) {
    messageInput.value = messageInput.value.charAt(0).toUpperCase();
  }
});

// Fungsi untuk menangani respons bot berdasarkan pesan pengguna
async function handleBotResponse(userMessage) {
  if (userMessage.toLowerCase().includes("tips")) {
    const tips = [
      "Buat anggaran bulanan yang realistis dan sesuai kebutuhan.",
      "Catat semua pemasukan dan pengeluaran untuk memantau keuangan.",
      "Prioritaskan kebutuhan pokok seperti makanan, tagihan, dan transportasi.",
      "Manfaatkan diskon atau promo saat berbelanja, tetapi hanya untuk barang yang diperlukan.",
      "Masak di rumah daripada makan di luar untuk menghemat biaya.",
      "Hindari kebiasaan belanja impulsif dengan memberi waktu berpikir sebelum membeli.",
      "Gunakan transportasi umum atau carpool untuk menghemat biaya perjalanan.",
      "Simpan sebagian pendapatan untuk dana darurat dan investasi.",
    ];

    const botMessage = `Berikut adalah tips hemat:<br><br>${tips
      .map((tip, index) => `${index + 1}. ${tip}`)
      .join("<br>")}`;
    addMessage(botMessage, "bot");
  } else if (userMessage.toLowerCase().includes("hallo")) {
    addMessage(
      "Hallo! 😊 Saya di sini untuk membantu Anda! Apakah ada yang bisa saya bantu hari ini?",
      "bot"
    );
  } else if (userMessage.toLowerCase().includes("laporan harian")) {
    const email = prompt("Masukkan email Anda untuk menerima laporan:");
    if (!email) {
      addMessage(
        "Email tidak dimasukkan. Permintaan laporan dibatalkan.",
        "bot"
      );
      return;
    }

    const response = await fetch(
      `http://localhost:3000/api/pengeluaran/laporan/harian?email=${email}`
    );
    if (response.ok) {
      addMessage(
        "Laporan harian Anda sedang diproses dan akan dikirim ke email Anda. Silakan periksa email Anda.",
        "bot"
      );
    } else {
      addMessage(
        "Gagal memproses laporan harian. Silakan coba lagi nanti.",
        "bot"
      );
    }
  } else if (userMessage.toLowerCase().includes("laporan mingguan")) {
    const email = prompt("Masukkan email Anda untuk menerima laporan:");
    if (!email) {
      addMessage(
        "Email tidak dimasukkan. Permintaan laporan dibatalkan.",
        "bot"
      );
      return;
    }

    const response = await fetch(
      `http://localhost:3000/api/pengeluaran/laporan/mingguan?email=${email}`
    );
    if (response.ok) {
      addMessage(
        "Laporan mingguan Anda sedang diproses dan akan dikirim ke email Anda. Silakan periksa email Anda.",
        "bot"
      );
    } else {
      addMessage(
        "Gagal memproses laporan mingguan. Silakan coba lagi nanti.",
        "bot"
      );
    }
  } else if (userMessage.toLowerCase().includes("laporan di bulan")) {
    const match = userMessage.match(/\d{1,2}\/\d{4}/); // Format MM/YYYY
    const email = prompt("Masukkan email Anda untuk menerima laporan:");
    if (!email) {
      addMessage(
        "Email tidak dimasukkan. Permintaan laporan dibatalkan.",
        "bot"
      );
      return;
    }

    if (match) {
      const [month, year] = match[0].split("/").map(Number);
      const response = await fetch(
        `http://localhost:3000/api/pengeluaran/laporan/bulanan?email=${email}&month=${month}&year=${year}`
      );
      if (response.ok) {
        addMessage(
          `Laporan bulanan untuk ${match[0]} sedang diproses dan akan dikirim ke email Anda. Silakan periksa email Anda.`,
          "bot"
        );
      } else {
        addMessage(
          "Gagal memproses laporan bulanan. Silakan coba lagi nanti.",
          "bot"
        );
      }
    } else {
      addMessage(
        "Format bulan dan tahun tidak valid. Silakan gunakan format MM/YYYY.",
        "bot"
      );
    }
  } else if (userMessage.toLowerCase().includes("pengeluaran mingguan")) {
    const summary = await fetchWeeklySummary();
    addMessage(
      `Pengeluaran mingguan Anda (dari ${summary.startDate} hingga ${
        summary.endDate
      }) adalah: Rp${summary.total.toLocaleString("id-ID")}.`,
      "bot"
    );
  } else if (userMessage.toLowerCase().includes("pengeluaran terkecil")) {
    const minExpense = await fetchMinExpense();
    addMessage(
      `Pengeluaran terkecil Anda adalah: ${
        minExpense.nama
      } sebesar Rp${minExpense.harga.toLocaleString("id-ID")}.`,
      "bot"
    );
  } else if (
    userMessage.toLowerCase().includes("berapa pengeluaran saya hari ini")
  ) {
    const dailySummary = await fetchDailySummary();
    addMessage(
      `Pengeluaran hari ini (${
        dailySummary.date
      }) adalah: Rp${dailySummary.total.toLocaleString("id-ID")}.`,
      "bot"
    );
  } else if (userMessage.toLowerCase().includes("pengeluaran saya di")) {
    const match = userMessage.match(/\d{1,2}\/\d{4}/);
    if (match) {
      const [month, year] = match[0].split("/").map(Number);
      const monthlySummary = await fetchMonthlySummary(month - 1, year);
      addMessage(
        `Pengeluaran total pada ${
          match[0]
        } adalah: Rp${monthlySummary.toLocaleString("id-ID")}.`,
        "bot"
      );
    } else {
      addMessage(
        "Format bulan dan tahun tidak valid. Silakan gunakan format MM/YYYY.",
        "bot"
      );
    }
  } else if (userMessage.toLowerCase().includes("pengeluaran terbesar")) {
    const maxExpense = await fetchMaxExpense();
    addMessage(
      `Pengeluaran terbesar Anda adalah: ${
        maxExpense.nama
      } sebesar Rp${maxExpense.harga.toLocaleString("id-ID")}.`,
      "bot"
    );
  } else {
    addMessage(
      "Maaf, saya belum mengerti pertanyaan Anda. Silakan coba pertanyaan lain yang lebih spesifik.",
      "bot"
    );
  }
}

// Fungsi untuk menghitung ringkasan pengeluaran mingguan
async function fetchWeeklySummary() {
  try {
    const response = await fetch("http://localhost:3000/api/pengeluaran");
    const data = await response.json();

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7); // Mengatur tanggal untuk satu minggu yang lalu

    // Filter pengeluaran dalam satu minggu terakhir
    const weeklyExpenses = data.filter((expense) => {
      const expenseDate = new Date(expense.tanggal);
      return expenseDate >= oneWeekAgo && expenseDate <= today;
    });

    // Menghitung total pengeluaran mingguan
    const total = weeklyExpenses.reduce(
      (sum, expense) => sum + expense.harga,
      0
    );
    return {
      total,
      startDate: oneWeekAgo.toLocaleDateString("id-ID"),
      endDate: today.toLocaleDateString("id-ID"),
    };
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    return { total: 0, startDate: "-", endDate: "-" };
  }
}

// Fungsi untuk mendapatkan pengeluaran dengan harga terkecil
async function fetchMinExpense() {
  try {
    const response = await fetch("http://localhost:3000/api/pengeluaran");
    const data = await response.json();

    // Mencari pengeluaran dengan harga terkecil
    return data.reduce(
      (min, expense) => (expense.harga < min.harga ? expense : min),
      { harga: Infinity }
    );
  } catch (error) {
    console.error("Error fetching min expense:", error);
    return { nama: "Tidak ditemukan", harga: 0 };
  }
}

// Fungsi untuk mendapatkan pengeluaran dengan harga terbesar
async function fetchMaxExpense() {
  try {
    const response = await fetch("http://localhost:3000/api/pengeluaran");
    const data = await response.json();

    // Mencari pengeluaran dengan harga terbesar
    return data.reduce(
      (max, expense) => (expense.harga > max.harga ? expense : max),
      { harga: 0 }
    );
  } catch (error) {
    console.error("Error fetching max expense:", error);
    return { nama: "Tidak ditemukan", harga: 0 };
  }
}

// Fungsi untuk menghitung ringkasan pengeluaran harian
async function fetchDailySummary() {
  try {
    const response = await fetch("http://localhost:3000/api/pengeluaran");
    const data = await response.json();

    const today = new Date();

    // Filter pengeluaran pada hari ini
    const dailyExpenses = data.filter((expense) => {
      const expenseDate = new Date(expense.tanggal);
      return expenseDate.toDateString() === today.toDateString();
    });

    // Menghitung total pengeluaran harian
    const total = dailyExpenses.reduce(
      (sum, expense) => sum + expense.harga,
      0
    );
    return {
      total,
      date: today.toLocaleDateString("id-ID"),
    };
  } catch (error) {
    console.error("Error fetching daily summary:", error);
    return { total: 0, date: "-" };
  }
}

// Fungsi untuk menghitung ringkasan pengeluaran bulanan
async function fetchMonthlySummary(month, year) {
  try {
    const response = await fetch("http://localhost:3000/api/pengeluaran");
    const data = await response.json();

    // Filter pengeluaran berdasarkan bulan dan tahun
    const filteredExpenses = data.filter((expense) => {
      const expenseDate = new Date(expense.tanggal);
      return (
        expenseDate.getMonth() === month && expenseDate.getFullYear() === year
      );
    });

    // Menghitung total pengeluaran bulanan
    return filteredExpenses.reduce((sum, expense) => sum + expense.harga, 0);
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    return 0;
  }
}
