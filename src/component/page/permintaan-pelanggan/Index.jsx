import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import { formatDate } from "../../util/Formatting";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import SweetAlert from "../../util/SweetAlert";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "No. Registrasi Permintaan": null,
    "No. Permintaan Pelanggan": null,
    "Nama Pelanggan": null,
    "Tanggal Permintaan": null,
    "Estimasi Penawaran": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  {
    Value: "[Tanggal Buat] asc",
    Text: "No. Registrasi Permintaan [↑]",
  },
  {
    Value: "[Tanggal Buat] desc",
    Text: "No. Registrasi Permintaan [↓]",
  },
  {
    Value: "[No. Permintaan Pelanggan] asc",
    Text: "No. Permintaan Pelanggan [↑]",
  },
  {
    Value: "[No. Permintaan Pelanggan] desc",
    Text: "No. Permintaan Pelanggan [↓]",
  },
  { Value: "[Nama Pelanggan] asc", Text: "Nama Pelanggan [↑]" },
  { Value: "[Nama Pelanggan] desc", Text: "Nama Pelanggan [↓]" },
  { Value: "[Tanggal Permintaan] asc", Text: "Tanggal Permintaan [↑]" },
  { Value: "[Tanggal Permintaan] desc", Text: "Tanggal Permintaan [↓]" },
  { Value: "[Estimasi Penawaran] asc", Text: "Estimasi Penawaran [↑]" },
  { Value: "[Estimasi Penawaran] desc", Text: "Estimasi Penawaran [↓]" },
];

const dataFilterStatus = [
  { Value: "Draft", Text: "Draft" },
  { Value: "Menunggu Analisa", Text: "Menunggu Analisa" },
  { Value: "Belum Dibuat RAK", Text: "Belum Dibuat RAK" },
  { Value: "Belum Dibuat Penawaran", Text: "Belum Dibuat Penawaran" },
  { Value: "Sudah Dibuat Penawaran", Text: "Sudah Dibuat Penawaran" },
  { Value: "Batal", Text: "Batal" },
];

const dataKelas = [
  { Value: "Kelas A", Text: "Kelas A" },
  { Value: "Kelas B", Text: "Kelas B" },
  { Value: "Kelas C", Text: "Kelas C" },
];

export default function PermintaanPelangganIndex({ onChangePage }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Tanggal Buat] desc",
    status: "",
    role: role,
  });
  const [selectedClass, setSelectedClass] = useState("");
  const [studentData, setStudentData] = useState([]);

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();
  const classFilter = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: searchFilterStatus.current.value,
      };
    });
  }

  async function handleDelete(id) {
    const result = await SweetAlert(
      "Hapus Data Permintaan Pelanggan",
      "Apakah Anda yakin ingin menghapus data permintaan pelanggan ini?",
      "warning",
      "Ya, saya yakin!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      UseFetch(API_LINK + "PermintaanPelanggan/DeletePermintaanPelanggan", {
        idPermintaan: id,
      })
        .then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            SweetAlert(
              "Sukses",
              "Data permintaan pelanggan berhasil dihapus",
              "success"
            );
            handleSetCurrentPage(currentFilter.page);
          }
        })
        .then(() => setIsLoading(false));
    }
  }

  async function handleCancel(id) {
    const result = await SweetAlert(
      "Batalkan Permintaan Pelanggan",
      "Apakah Anda yakin ingin membatalkan permintaan pelanggan ini?",
      "warning",
      "Ya, saya yakin!",
      "textarea",
      "Tuliskan alasan batal disini..."
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      UseFetch(API_LINK + "PermintaanPelanggan/CancelPermintaanPelanggan", {
        idPermintaan: id,
        alasanBatal: "\n\nAlasan batal: " + result,
      })
        .then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            SweetAlert(
              "Sukses",
              "Permintaan pelanggan berhasil dibatalkan",
              "success"
            );
            handleSetCurrentPage(currentFilter.page);
          }
        })
        .then(() => setIsLoading(false));
    }
  }

  async function handleSent(id) {
    const result = await SweetAlert(
      "Kirim Permintaan Pelanggan ke bagian Engineering",
      "Nomor registrasi permintaan akan dibentuk dan data permintaan pelanggan ini tidak dapat diubah lagi. Apakah Anda yakin ingin mengirim data permintaan pelanggan ini ke bagian engineering untuk dilakukan analisa?",
      "info",
      "Ya, saya yakin!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      UseFetch(API_LINK + "PermintaanPelanggan/SentPermintaanPelanggan", {
        idPermintaan: id,
      })
        .then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            SweetAlert(
              "Sukses",
              "Data permintaan pelanggan berhasil dikirim",
              "success"
            );
            handleSetCurrentPage(currentFilter.page);
          }
        })
        .then(() => setIsLoading(false));
    }
  }

  async function handleFinal(id) {
    const result = await SweetAlert(
      "Selesaikan Analisa Permintaan Pelanggan",
      "Permintaan pelanggan ini akan dikirimkan kembali kepada bagian marketing untuk dilakukan penyusunan Rencana Anggaran Kerja (RAK) dan tidak dapat diubah lagi. Apakah Anda yakin ingin menyelesaikan analisa permintaan pelanggan ini?",
      "info",
      "Ya, saya yakin!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      UseFetch(API_LINK + "PermintaanPelanggan/FinalPermintaanPelanggan", {
        idPermintaan: id,
      })
        .then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            SweetAlert(
              "Sukses",
              "Data permintaan pelanggan berhasil diselesaikan",
              "success"
            );
            handleSetCurrentPage(currentFilter.page);
          }
        })
        .then(() => setIsLoading(false));
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "PermintaanPelanggan/GetDataPermintaanPelanggan",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Tanggal Permintaan": formatDate(value["Tanggal Permintaan"], true),
            "Estimasi Penawaran": formatDate(value["Estimasi Penawaran"], true),
            Aksi: [
              role === "ROL17" && !["Draft", "Batal"].includes(value["Status"])
                ? "Cancel"
                : "",
              ["Draft"].includes(value["Status"]) ? "Delete" : "",
              "Detail",
              ["Draft"].includes(value["Status"]) ||
              (role === "ROL50" &&
                ["Menunggu Analisa"].includes(value["Status"]))
                ? "Edit"
                : "",
              ["Draft"].includes(value["Status"]) ? "Sent" : "",
              role === "ROL50" && ["Menunggu Analisa"].includes(value["Status"])
                ? "Final"
                : "",
            ],
            Alignment: [
              "center",
              "center",
              "center",
              "left",
              "center",
              "center",
              "center",
              "center",
            ],
          }));
          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (selectedClass) {
        try {
          const data = await UseFetch(
            `${API_LINK}Student/GetStudentsByClass?class=${selectedClass}`
          );
          setStudentData(data);
        } catch {
          setIsError(true);
        }
      }
    };

    fetchStudentData();
  }, [selectedClass]);

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data permintaan pelanggan."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            {role === "ROL17" && (
              <Button
                iconName="add"
                classType="success"
                label="Tambah"
                onClick={() => onChangePage("add")}
              />
            )}
            <Input
              ref={searchQuery}
              forInput="pencarianPermintaanPelanggan"
              placeholder="Cari"
            />
            <Button
              iconName="search"
              classType="primary px-4"
              title="Cari"
              onClick={handleSearch}
            />
            <Filter>
              <DropDown
                ref={searchFilterSort}
                forInput="ddUrut"
                label="Urut Berdasarkan"
                type="none"
                arrData={dataFilterSort}
                defaultValue="[Tanggal Buat] desc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="semua"
                arrData={dataFilterStatus}
                defaultValue=""
              />
              <DropDown
                ref={classFilter}
                forInput="ddClass"
                label="Pilih Kelas"
                type="semua"
                arrData={dataKelas}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
            </Filter>
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                onDelete={handleDelete}
                onCancel={handleCancel}
                onDetail={onChangePage}
                onEdit={onChangePage}
                onSent={handleSent}
                onFinal={handleFinal}
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
            </div>
          )}
        </div>
        <div className="mt-3">
          <h3>Data Mahasiswa</h3>
          {studentData.length > 0 ? (
            studentData.map((student) => (
              <div key={student.id} className="student-data">
                <p>{student.name}</p>
                <div>
                  <label>
                    <input type="radio" name={`option-${student.id}`} value="Kuku" />
                    Kuku
                  </label>
                  <label>
                    <input type="radio" name={`option-${student.id}`} value="Rambut" />
                    Rambut
                  </label>
                  <label>
                    <input type="radio" name={`option-${student.id}`} value="Nametag" />
                    Nametag
                  </label>
                  <label>
                    <input type="radio" name={`option-${student.id}`} value="ID Card" />
                    ID Card
                  </label>
                  <label>
                    <input type="radio" name={`option-${student.id}`} value="Sepatu" />
                    Sepatu
                  </label>
                </div>
              </div>
            ))
          ) : (
            <p>Tidak ada data mahasiswa untuk kelas yang dipilih.</p>
          )}
        </div>
      </div>
    </>
  );
}
