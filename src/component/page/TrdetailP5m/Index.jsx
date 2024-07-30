import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import * as XLSX from 'xlsx';
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";


const cookie = Cookies.get("activeUser");

const userInfo = JSON.parse(decryptId(cookie));

const initialData = [];

const initialStudentData = {
  mhs_id: '',
  det_telat: 0,
  det_id_card: 0,
  det_nametag: 0,
  det_rambut: 0,
  det_sepatu: 0,
  total_jam_minus: 0,
};

export default function TrDetailP5mIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isToday, setIsToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Kelas] asc",
    status: "Aktif",
    selectedClass: "",
    startDate: new Date().toISOString().split('T')[0], // Set initial start date to today
    pageSize: PAGE_SIZE, // Tambahkan pageSize di state currentFilter
  });
  const [totalPages, setTotalPages] = useState(1); // State untuk jumlah halaman
  const [displayData, setDisplayData] = useState([]); // State untuk data yang akan ditampilkan

  const calculateTotalJamMinus = (student) => {
    let totalJamMinus = 0;

    if (student.det_telat) totalJamMinus += 2;
    if (student.det_id_card) totalJamMinus += 2;
    if (student.det_nametag) totalJamMinus += 2;
    if (student.det_rambut) totalJamMinus += 2;
    if (student.det_sepatu) totalJamMinus += 2;

    return totalJamMinus;
  };

  const searchQuery = useRef("");
  const [classList, setClassList] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [dataForSubmit, setDataForSubmit] = useState([]);

  useEffect(() => {
    const fetchClassList = async () => {
      try {

        const classData = await UseFetch(API_LINK + "MasterKelas/GetDataKelasCombo", { id: userInfo.nama });
        if (classData && classData !== "ERROR") {
          setClassList(classData);
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
      }
    };

    fetchClassList();
  }, []);

  useEffect(() => {
    console.log(studentData);
  }, [studentData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        // Fetch student data
        const response = await fetch( 
          "https://api.polytechnic.astra.ac.id:2906/api_dev/efcc359990d14328fda74beb65088ef9660ca17e/SIA/getListMahasiswa?id_konsentrasi=3"
        );
        const jsonData = await response.json();

        if (!jsonData || jsonData === "ERROR") {
          setIsError(true);
        } else {
          // Filter and format student data
          const filteredData = jsonData.filter(
            (item) => item.kelas === currentFilter.selectedClass
          );

          // Fetch riwayat data
          const riwayatResponse = await fetch(API_LINK + "TransaksiP5m/GetRiwayatP5m", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              p1: currentFilter.selectedClass,
              p2: currentFilter.startDate,
            }),
          });
          const riwayatData = await riwayatResponse.json();

          // Map riwayatData to the format required for 'dataForSubmit'
          const formattedData = riwayatData.map(item => ({
            p1: item.p5m_kelas,
            p2: item.det_created_date, // Adjust this to the correct property you need
            mhs_id: item.mhs_id,
            det_telat: item.det_telat === 'Checked' ? 1 : 0,
            det_id_card: item.det_id_card === 'Checked' ? 1 : 0,
            det_nametag: item.det_nametag === 'Checked' ? 1 : 0,
            det_rambut: item.det_rambut === 'Checked' ? 1 : 0,
            det_sepatu: item.det_sepatu === 'Checked' ? 1 : 0,
            total_jam_minus: item.det_total_jam_minus,
          }));

          setDataForSubmit(formattedData);

          // Update formattedData based on riwayatData
          const updatedFormattedData = filteredData.map((value) => {
            const riwayatItem = riwayatData.find((riwayat) => riwayat.mhs_id === value.nim);

            // Convert timestamp to readable date format
            const formattedDate = riwayatItem ? new Date(riwayatItem.det_created_date).toLocaleDateString() : "";
            
            // Function to create a disabled checkbox
            const createDisabledCheckbox = (isChecked) => (
              <input type="checkbox" checked={isChecked} disabled />
            );

            return {
              Nim: value.nim,
              Nama: value.nama,
              Kelas: value.kelas,
              Telat: createDisabledCheckbox(riwayatItem && riwayatItem.det_telat === "Checked"),
              Idcard: createDisabledCheckbox(riwayatItem && riwayatItem.det_id_card === "Checked"),
              Nametag: createDisabledCheckbox(riwayatItem && riwayatItem.det_nametag === "Checked"),
              Rambut: createDisabledCheckbox(riwayatItem && riwayatItem.det_rambut === "Checked"),
              Sepatu: createDisabledCheckbox(riwayatItem && riwayatItem.det_sepatu === "Checked"),
              'Jam Minus': riwayatItem ? riwayatItem.det_total_jam_minus : 0,
              Tanggal: formattedDate,
              Alignment: ["", "Left", "center", "center", "center", "center", "center", "center", "center", "center"],
            };
          });

          // Set total pages based on the filtered data
          setTotalPages(Math.ceil(updatedFormattedData.length / currentFilter.pageSize));

          // Set display data based on current page
          const startIndex = (currentFilter.page - 1) * currentFilter.pageSize;
          const endIndex = startIndex + currentFilter.pageSize;
          setDisplayData(updatedFormattedData.slice(startIndex, endIndex));

          setCurrentData(updatedFormattedData);
        }
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentFilter.selectedClass && currentFilter.startDate) {
      fetchData();
    }
  }, [currentFilter.selectedClass, currentFilter.startDate, currentFilter.page, currentFilter.pageSize]);

  const handleSetCurrentPage = (newCurrentPage) => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  };

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
          "Status data Kelas berhasil diubah menjadi " + response[0].Status,
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

  const handleSelectClass = async () => {
    if (!selectedClass) {
      console.error("Selected class is empty");
      return;
    }

    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      selectedClass,
    }));

    try {
      const response = await fetch(API_LINK + "TransaksiP5m/GetRiwayatP5m", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p1: selectedClass,
          p2: currentFilter.startDate,
        }),
      });

      const riwayatData = await response.json();

      if (riwayatData && riwayatData !== "ERROR") {
        // Handle riwayat data if needed
      } else {
        console.warn("No valid data received from API.");
      }
    } catch (error) {
      console.error("Error fetching riwayat data:", error);
    }
  };

  const handleExportToExcel = () => {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const worksheetData = currentData.map((item, index) => {
      let keterangan = [];

      if (!item.IDCARD && !item.NAMETAG && !item.TELAT && !item.RAMBUT && !item.SEPATU) {
        keterangan.push('Lainnya'); // Jika tidak ada yang tercentang, tambahkan 'Lainnya'
      } else {
        if (item.IDCARD) keterangan.push('ID Card');
        if (item.NAMETAG) keterangan.push('Nama Tag');
        if (item.TELAT) keterangan.push('Telat');
        if (item.RAMBUT) keterangan.push('Rambut');
        if (item.SEPATU) keterangan.push('Sepatu');
      }

      return {
        No: index + 1,
        NIM: item.Nim,
        Nama: item.Nama,
        Kelas: item.Kelas,
        Jenis: keterangan.length > 0 ? keterangan.join(',') : '', // Jika keterangan kosong, kosongkan kolom
        'Jumlah Jam': item['Jam Minus'],
        Tanggal: item.Tanggal,
      };
    });

    const header = ["No", "NIM", "Nama", "Kelas", "Jumlah Jam", "Jenis", "Tanggal"];
    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header });

    // Apply styles
    const wscols = [
      { wch: 5 },  // No
      { wch: 15 }, // NIM
      { wch: 25 }, // Nama
      { wch: 15 }, // Jenis
      { wch: 10 }, // Jumlah Jam
      { wch: 50 }, // Keterangan
      { wch: 15 }  // Tanggal
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

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Mahasiswa");

    // Write the workbook to a file
    XLSX.writeFile(workbook, `Student_Data_${selectedClass}.xlsx`);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  const today = new Date().toLocaleDateString('en-CA');
  const handleStartDateChange = (event) => {
    const selectedDate = event.target.value;
    const todayDate = new Date().toLocaleDateString('en-CA');
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      startDate: selectedDate,
    }));
    setIsToday(selectedDate === todayDate);
  };

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data kelas."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1 mr-2">
              <DropDown
                forInput="ddClasses"
                label="Pilih Kelas"
                type="none"
                arrData={[
                  { Value: "", Text: "Pilih Kelas" },
                  ...classList.map((item) => ({
                    Value: item.Kelas,
                    Text: item.Kelas,
                  })),
                ]}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                }}
                defaultValue=""
              />
            </div>
            <Button
              iconName="print"
              classType="success mt-3"
              label="Eksport Excel"
              onClick={handleExportToExcel}
            />
          </div>
          <div className="d-flex align-items-center">
            <div className="flex-grow-1 mr-2">
              <Input
                type="date"
                label="Tanggal Riwayat"
                value={currentFilter.startDate}
                onChange={handleStartDateChange}
                max={today}
              />
            </div>
            
            <Button
              iconName="search"
              classType="primary mt-3"
              title="Cari"
              onClick={handleSelectClass}
            />
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={displayData} // Menggunakan displayData untuk menampilkan data sesuai halaman
                onToggle={handleSetStatus}
                onDetail={onChangePage}
                onEdit={onChangePage}
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData.length} // Menggunakan length dari currentData
                navigation={handleSetCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
