
---

## PANDUAN INTEGRASI GOOGLE FORM UNTUK PENDATAAN MASSAL ANGGOTA

Agar pengurus tidak perlu input data anggota satu-persatu secara manual, Anda dapat menggunakan **Google Form** yang terhubung langsung ke aplikasi melalui fitur Webhook otomatis.

### Langkah 1: Siapkan Environment Variable
Pastikan variabel `GFORM_WEBHOOK_SECRET` sudah terdefinisi di file `.env` server Anda:
```env
GFORM_WEBHOOK_SECRET="rahasia-tunas-harapan-2026"
```

### Langkah 2: Buat Google Form Pendataan Anggota
Buat form baru di Google Forms dengan pertanyaan/kolom berikut (pastikan tipe pertanyaan sesuai):
1. **Nama Lengkap** (Short answer)
2. **Email** (Short answer)
3. **Nomor WhatsApp** (Short answer)
4. **Jenis Kelamin** (Multiple choice: `L` atau `P`)
5. **Tempat Lahir** (Short answer)
6. **Tanggal Lahir** (Date, format YYYY-MM-DD atau standar GForm)
7. **RT** (Short answer)
8. **RW** (Short answer)
9. **Alamat** (Paragraph)
10. **Pendidikan Terakhir** (Short answer)
11. **Pekerjaan** (Short answer)

### Langkah 3: Pasang Google Apps Script Webhook
1. Di Google Form, klik ikon titik tiga di pojok kanan atas $\rightarrow$ **Apps Script**.
2. Hapus semua kode default dan masukkan kode berikut:

```javascript
function onSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  
  var data = {};
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var title = itemResponse.getItem().getTitle().toLowerCase();
    var answer = itemResponse.getResponse();
    
    if (title.indexOf("nama") !== -1) data.full_name = answer;
    else if (title.indexOf("email") !== -1) data.email = answer;
    else if (title.indexOf("whatsapp") !== -1 || title.indexOf("wa") !== -1) data.phone_wa = answer;
    else if (title.indexOf("kelamin") !== -1) data.gender = answer;
    else if (title.indexOf("tempat") !== -1) data.birth_place = answer;
    else if (title.indexOf("tanggal lahir") !== -1) data.birth_date = answer;
    else if (title.indexOf("rt") !== -1) data.rt = answer;
    else if (title.indexOf("rw") !== -1) data.rw = answer;
    else if (title.indexOf("alamat") !== -1) data.address = answer;
    else if (title.indexOf("pendidikan") !== -1) data.education = answer;
    else if (title.indexOf("pekerjaan") !== -1) data.occupation = answer;
  }
  
  data.secret_key = "rahasia-tunas-harapan-2026"; // Sesuaikan dengan GFORM_WEBHOOK_SECRET di .env
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(data),
    "muteHttpExceptions": true
  };
  
  // Ganti URL di bawah dengan URL deployment aplikasi Anda (misal: https://yourdomain.com/api/webhooks/gform-member-import)
  UrlFetchApp.fetch("https://tunas-harapan.id/api/webhooks/gform-member-import", options);
}
```

3. Simpan script (`Ctrl + S`).
4. Klik menu **Triggers** (ikon jam alarm di sidebar kiri) $\rightarrow$ **Add Trigger**.
5. Atur:
   - Choose which function to run: `onSubmit`
   - Select event source: `From form`
   - Select event type: `On form submit`
6. Klik **Save** dan berikan izin akses akun Google Anda.

### Selesai!
Setiap ada calon anggota yang mengisi Google Form, data akan otomatis masuk dan terdaftar di database aplikasi Karang Taruna "TUNAS HARAPAN" secara *realtime*. Password default akun baru adalah `kartunmaju` (atau sesuai `DEFAULT_PASSWORD` di `.env`).
