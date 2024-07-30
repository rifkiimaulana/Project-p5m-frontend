import React, { useEffect, useState } from "react";
import logo from "../../assets/IMG_Logo.png";
import Icon from "../part/Icon";

const Header = ({ displayName, roleName, listMenu = [] }) => {
  const [lastLogin, setLastLogin] = useState(""); // State untuk menyimpan waktu terakhir login
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State untuk mengontrol ketersediaan menu

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 600); // Misalkan ukuran 600px adalah batas mobile
    };

    checkScreenSize(); // Panggil fungsi saat komponen pertama kali dimuat

    window.addEventListener('resize', checkScreenSize); // Tambahkan event listener untuk memantau perubahan ukuran layar

    return () => {
      window.removeEventListener('resize', checkScreenSize); // Hapus event listener saat komponen tidak lagi digunakan
    };
  }, []);

  useEffect(() => {
    // Fungsi untuk mengatur waktu terakhir login
    const updateLastLogin = () => {
      const now = new Date();
      const formattedDate = `${now.getDate()} ${bulan(now.getMonth() + 1)} ${now.getFullYear()}, ${pad(now.getHours(), 2)}:${pad(now.getMinutes(), 2)} WIB`;
      setLastLogin(formattedDate);
    };

    updateLastLogin(); // Panggil fungsi saat komponen pertama kali dimuat

    // Set interval untuk mengupdate waktu terakhir login setiap menit
    const interval = setInterval(() => {
      updateLastLogin();
    }, 60000); // Update setiap 1 menit (60.000 milidetik)

    return () => {
      clearInterval(interval); // Hapus interval saat komponen tidak lagi digunakan
    };
  }, []);

  // Fungsi untuk memformat bulan menjadi teks
  const bulan = (month) => {
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return monthNames[month - 1];
  };

  // Fungsi untuk memformat angka menjadi dua digit dengan leading zero jika perlu
  const pad = (num, size) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  };

  // Toggle menu function
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top ${isMobile ? 'navbar-mobile' : 'navbar-desktop'}`}>
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img src={logo} alt="Logo AstraTech" style={{ height: "50px" }} />
        </a>

        {isMobile && (
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        )}

        <div className={`collapse navbar-collapse ${isMobile && isMenuOpen ? 'show' : ''}`}>
          <div className="ms-auto d-flex flex-column align-items-end">
            <span className="fw-bold mb-1">
              {displayName} ({roleName})
            </span>
            <span className="text-body-secondary" style={{ fontSize: ".7em" }}>
              Login terakhir: {lastLogin}
            </span>
          </div>
          <div className="my-auto ms-4 mt-2 d-flex align-items-center position-relative">
            <Icon name="envelope" style={{ fontSize: isMobile ? "2.5em" : "2em" }} />
            <span
              className="badge rounded-pill bg-danger ms-2"
              style={{
                fontSize: ".5em",
                lineHeight: "1.5",
                padding: ".2em 0.5em",
                position: "absolute",
                top: 0,
                left: "2em", // Mengatur jarak dari ikon envelope (disesuaikan sesuai kebutuhan)
              }}
            >
              0
            </span>
          </div>
          {isMobile && ( // Menampilkan list menu hanya pada perangkat mobile
            <ul className={`navbar-nav ${isMobile ? 'ms-auto' : 'me-auto'}`}>
              {listMenu && listMenu.length > 0 && listMenu.map((menu, index) => (
                <React.Fragment key={index}>
                  {menu.sub && menu.sub.length > 0 ? (
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href={menu.link === "#" ? "#" : menu.link}
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {menu.head}
                      </a>
                      <ul className="dropdown-menu">
                        {menu.sub.map((subMenu, subIndex) => (
                          <li key={subIndex}>
                            <a className="dropdown-item" href={subMenu.link}>{subMenu.title}</a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li className="nav-item">
                      <a className="nav-link" href={menu.link}>{menu.head}</a>
                    </li>
                  )}
                </React.Fragment>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
