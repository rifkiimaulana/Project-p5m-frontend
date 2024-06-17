import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import * as XLSX from 'xlsx';

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
    startDate: " ",
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
        const classData = await UseFetch(API_LINK + "MasterKelas/GetDataKelasCombo");
        if (classData && classData !== "ERROR") {
          setClassList(classData);
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
      }
    };

    fetchClassList();

  }, []);

  const handleCheckboxChange = (nim, field, checked) => {
    setDataForSubmit(prevData => {
      let newData = [...prevData];
      let totalJamMinus = 0;
      let existingIndex = newData.findIndex(item => item.mhs_id === nim);
  
      if (existingIndex !== -1) {
        // Existing item found, update the field
        console.log('exist');
        newData[existingIndex] = {
          ...newData[existingIndex],
          [field]: checked ? 1 : 0
        };

        // Recalculate total_jam_minus
        totalJamMinus = Object.keys(newData[existingIndex])
          .filter(key => key.startsWith('det_'))
          .reduce((sum, key) => sum + newData[existingIndex][key] * 2, 0);

        newData[existingIndex].total_jam_minus = totalJamMinus;
      } else {
        const p1 = selectedClass;
        const p2 = 1; // Replace with your actual value 
        const p13 = 1;

        // Add new student data
        const newItem = {
          p1,
          p2,
          mhs_id: nim,
          det_telat: field === 'det_telat' ? (checked ? 1 : 0) : 0,
          det_id_card: field === 'det_id_card' ? (checked ? 1 : 0) : 0,
          det_nametag: field === 'det_nametag' ? (checked ? 1 : 0) : 0,
          det_rambut: field === 'det_rambut' ? (checked ? 1 : 0) : 0,
          det_sepatu: field === 'det_sepatu' ? (checked ? 1 : 0) : 0,
          p13
        };
        
        newData.push(newItem);
      }

      setDataForSubmit(newData);
  
      return newData;
    });
  };  

  useEffect(() => {
    console.log(studentData);
  }, [studentData])

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

            return {
              Nim: value.nim,
              Nama: value.nama,
              Kelas: value.kelas,
              Telat: (
                <input
                  type="checkbox"
                  checked={riwayatItem && riwayatItem.det_telat === "Checked"}
                  onChange={(e) => handleCheckboxChange(value.nim, "det_telat", e.target.checked)}
                />
              ),
              Idcard: (
                <input
                  type="checkbox"
                  checked={riwayatItem && riwayatItem.det_id_card === "Checked"}
                  onChange={(e) => handleCheckboxChange(value.nim, "det_id_card", e.target.checked)}
                />
              ),
              Nametag: (
                <input
                  type="checkbox"
                  checked={riwayatItem && riwayatItem.det_nametag === "Checked"}
                  onChange={(e) => handleCheckboxChange(value.nim, "det_nametag", e.target.checked)}
                />
              ),
              Rambut: (
                <input
                  type="checkbox"
                  checked={riwayatItem && riwayatItem.det_rambut === "Checked"}
                  onChange={(e) => handleCheckboxChange(value.nim, "det_rambut", e.target.checked)}
                />
              ),
              Sepatu: (
                <input
                  type="checkbox"
                  checked={riwayatItem && riwayatItem.det_sepatu === "Checked"}
                  onChange={(e) => handleCheckboxChange(value.nim, "det_sepatu", e.target.checked)}
                />
              ),
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

    // Tidak perlu melakukan slice, karena sudah di-handle di useEffect fetchData
    // setCurrentData(currentData); // Tidak
    // Tidak perlu melakukan slice, karena sudah di-handle di useEffect fetchData
    // setCurrentData(currentData); // Tidak perlu melakukan perubahan apapun

    // fetchData() akan dijalankan secara otomatis saat currentFilter.page berubah
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

  const handlesAdd = async () => {
    try {
        // Calculate p9 for each item in dataForSubmit
        const updatedDataForSubmit = dataForSubmit.map(item => {
            const det_telat = item.det_telat === 1 ? 1 : 0;
            const det_id_card = item.det_id_card === 1 ? 1 : 0;
            const det_nametag = item.det_nametag === 1 ? 1 : 0;
            const det_rambut = item.det_rambut === 1 ? 1 : 0;
            const det_sepatu = item.det_sepatu === 1 ? 1 : 0;

            const p9 = (det_telat + det_id_card + det_nametag + det_rambut + det_sepatu) * 2;

            return {
                ...item,
                p9
            };
        });

        console.log(updatedDataForSubmit); // Check if p9 is correctly calculated

        const response = await fetch(API_LINK + "TransaksiP5m/EditP5m", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedDataForSubmit) // Send updatedDataForSubmit to API
        });

        if (response.ok) {
            SweetAlert("Sukses", "Data P5M berhasil disimpan", "success");
        } else {
            const errorData = await response.json();
            SweetAlert("Error", "Terjadi kesalahan saat menyimpan data P5M: " + errorData.message, "error");
        }
    } catch (error) {
        console.error("Error editing P5M data:", error);
        SweetAlert("Error", "Terjadi kesalahan saat menyimpan data P5M", "error");
    }
  };

  const handlesAddOld = async () => {
  try {
    for (let [nim, data] of Object.entries(studentData)) {
      console.log(data);
      console.log(selectedClass);

      // Check if the student already has a P5M record
      const existingRecordResponse = await fetch(API_LINK + "TransaksiP5m/CheckP5mExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mhs_id: data.mhs_id,
          p5m_kelas: selectedClass,
          p5m_tanggal: currentFilter.startDate,
        }),
      });
      const existingRecord = await existingRecordResponse.json();

      let response;
      if (existingRecord.exists) {
        // Update existing record
        response = await fetch(API_LINK + "TransaksiP5m/UpdateP5m", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p5m_id: existingRecord.p5m_id,
            det_telat: data.det_telat,
            det_id_card: data.det_id_card,
            det_nametag: data.det_nametag,
            det_rambut: data.det_rambut,
            det_sepatu: data.det_sepatu,
            totalJamMinus: data.total_jam_minus,
            det_modif_by: 1, // Update with the actual user ID or identifier
            det_modif_date: new Date().toISOString(),
          }),
        });
      } else {
        // Create new record
        response = await fetch(API_LINK + "TransaksiP5m/CreateP5m", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p1: selectedClass,
            p2: 1,
            mhs_id: data.mhs_id,
            det_telat: data.det_telat,
            det_id_card: data.det_id_card,
            det_nametag: data.det_nametag,
            det_rambut: data.det_rambut,
            det_sepatu: data.det_sepatu,
            totalJamMinus: data.total_jam_minus,
            p13: 1,
          }),
        });
      }

      const result = await response.json();

      if (result.hasil === "ERROR") {
        throw new Error("Error creating or updating P5M data for mhs_id: " + data.mhs_id);
      }
    }

    SweetAlert("Sukses", "Data P5M berhasil diubah", "success");
  } catch (error) {
    console.error("Error creating or updating P5M data:", error);
    SweetAlert("Error", "Terjadi kesalahan saat menyimpan data P5M", "error");
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
              label="Cetak Excel"
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
              <Button
                  iconName="save"
                  classType="success mt-3"
                  label="Ubah"
                  onClick={handlesAdd}
                />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

