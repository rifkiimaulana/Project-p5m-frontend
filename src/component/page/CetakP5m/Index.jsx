import { useEffect, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import * as XLSX from 'xlsx';

const initialData = [];

export default function CetakP5mIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [mahasiswaData, setMahasiswaData] = useState([]);
  const [totalData, setTotalData] = useState(0);

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: startDate,
    status: "Aktif",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        // Fetch data mahasiswa
        const responseMahasiswa = await fetch(
          "https://api.polytechnic.astra.ac.id:2906/api_dev/efcc359990d14328fda74beb65088ef9660ca17e/SIA/getListMahasiswa?id_konsentrasi=3"
        );
        const jsonDataMahasiswa = await responseMahasiswa.json();

        if (!jsonDataMahasiswa || jsonDataMahasiswa === "ERROR") {
          setIsError(true);
          setIsLoading(false);
          return;
        }

        setMahasiswaData(jsonDataMahasiswa);

        // Fetch riwayat data
        const riwayatResponse = await fetch(API_LINK + "TransaksiP5m/GetCetakP5m", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: startDate,
            endDate: endDate,
          }),
        });
        const riwayatData = await riwayatResponse.json();

        if (!riwayatData || riwayatData === "ERROR") {
          setIsError(true);
          setIsLoading(false);
          return;
        }

        // Process and update data
        const updatedFormattedData = riwayatData.map((value, index) => {
          const mahasiswa = jsonDataMahasiswa.find((m) => m.nim === value.mhs_id);
          const formattedDate = value.det_created_date ? new Date(value.det_created_date).toLocaleDateString() : "";
          return {
            No: index + 1,
            Nim: value.mhs_id,
            Nama: mahasiswa ? mahasiswa.nama : "", // Memastikan nama mahasiswa terambil dengan benar
            'Jam Minus': value.total_jam_minus,
            Alignment: ["center", "center", "left", "center", "center"],
          };
        });

        setCurrentData(updatedFormattedData);
        setTotalData(updatedFormattedData.length);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  const handleSetStatus = (id) => {
    setIsLoading(true);
    setIsError(false);

    UseFetch(API_LINK + "MasterKelas/SetStatusKelas", { idKel: id })
      .then((response) => {
        if (response === "ERROR" || !response || response.length === 0) {
          throw new Error("Error or empty response");
        }
        SweetAlert(
          "Sukses",
          `Status data Kelas berhasil diubah menjadi ${response[0].Status}`,
          "success"
        );
        handleSetCurrentPage(currentFilter.page);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSetCurrentPage = (newCurrentPage) => {
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  };

  const handleExportToExcel = () => {
    const worksheetData = currentData.map((item, index) => ({
      No: index + 1,
      NIM: item.Nim,
      Nama: item.Nama,
      'Jumlah Jam': item['Jam Minus'],
    }));

    const header = ["No", "NIM", "Nama", "Jumlah Jam"];
    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header });

    // Apply styles
    const wscols = [
      { wch: 5 },  // No
      { wch: 15 }, // NIM
      { wch: 30 }, // Nama
      { wch: 10 }, // Jumlah Jam
    ];

    worksheet['!cols'] = wscols;

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
        const cellAddress = { c: colNum, r: rowNum };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            font: { name: "Arial", sz: 10 },
            alignment: { vertical: "center", horizontal: "center" },
            border: {
              top: { style: "thin", color: { auto: 1 } },
              right: { style: "thin", color: { auto: 1 } },
              bottom: { style: "thin", color: { auto: 1 } },
              left: { style: "thin", color: { auto: 1 } }
            }
          };
          if (rowNum === 0) {
            worksheet[cellRef].s.fill = {
              fgColor: { rgb: "FFFF00" }
            };
          }
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Mahasiswa Melanggar");
    XLSX.writeFile(workbook, `Seluruh Data mahasiswa melanggar.xlsx`);
  };

  const handleSearch = () => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sort: searchFilterSort.current.value,
      status: searchFilterStatus.current.value,
    }));
  };

  const startIndex = (currentFilter.page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageData = currentData.slice(startIndex, endIndex);

  return (
    <div className="d-flex flex-column">
      {isError && (
        <div className="flex-fill">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal mengambil data kelas."
          />
        </div>
      )}
      <div className="row mb-4 align-items-center">
        <div className="col-md-5 mb-2 mb-md-0">
          <label className="mb-0">Tanggal Awal:</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            max={today}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-5 mb-2 mb-md-0">
          <label className="mb-0">Tanggal Akhir:</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            max={today}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end justify-content-end">
          <Button
            iconName="print"
            classType="success"
            label="Cetak Excel"
            onClick={handleExportToExcel}
          />
        </div>
      </div>
      <div className="mt-3">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="d-flex flex-column">
            <Table
              data={pageData}
              onToggle={handleSetStatus}
              onDetail={onChangePage}
              onEdit={onChangePage}
            />
            <Paging
              pageSize={PAGE_SIZE}
              pageCurrent={currentFilter.page}
              totalData={totalData}
              navigation={handleSetCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
