export default function NotFound() {
  return (
    <div className="container">
      <div className="text-center">
        <h1 className="display-1 text-danger mt-5 mb-3">404</h1>
        <h2 className="display-5">Halaman Tidak Ditemukan</h2>
        <p className="lead">
          Maaf, halaman yang Anda cari tidak ditemukan atau terdapat kendala
          koneksi ke server.
        </p>
        <a href="/" className="btn btn-primary mt-3">
          Kembali ke Halaman Utama
        </a>
      </div>
    </div>
  );
}
