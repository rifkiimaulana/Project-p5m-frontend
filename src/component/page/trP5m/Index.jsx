import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import Swal from 'sweetalert2'; // Pastikan SweetAlert diimport dengan benar
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Loading from "../../part/Loading";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";

const cookie = Cookies.get("activeUser");
const userInfo = JSON.parse(decryptId(cookie));
const initialData = [];
const dataFilterSort = [
  { Value: "[Kelas] asc", Text: "Kelas Pic [↑]" },
  { Value: "[Kelas] desc", Text: "Kelas Pic [↓]" },
];
const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function TrP5mIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Kelas] asc",
    status: "Aktif",
    selectedClass: "",
  });

  const searchQuery = useRef("");
  const searchFilterSort = useRef("[Kelas] asc");
  const searchFilterStatus = useRef("Aktif");
  const [classList, setClassList] = useState([]);
  const selectedClass = useRef("");
  const [studentData, setStudentData] = useState({});
  const [dataForSubmit, setDataForSubmit] = useState([]);
  //const [selectedClass, setSelectedClass] = useState("");

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
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const response = await fetch(
          "https://api.polytechnic.astra.ac.id:2906/api_dev/efcc359990d14328fda74beb65088ef9660ca17e/SIA/getListMahasiswa?id_konsentrasi=3"
        );
        const jsonData = await response.json();

        console.log("Fetched data:", jsonData);

        if (!jsonData || jsonData === "ERROR") {
          setIsError(true);
        } else {
          const filteredData = jsonData.filter(
            (item) => item.kelas === selectedClass.current
          );

          const formattedData = filteredData.map((value) => ({
            Nama: value.nama,
            Kelas: value.kelas,
            Telat: (
              <input
                type="checkbox"
                onChange={(e) => handleCheckboxChange(value.nim, 'det_telat', e.target.checked)}
              />
            ),
            Idcard: (
              <input
                type="checkbox"
                onChange={(e) => handleCheckboxChange(value.nim, 'det_id_card', e.target.checked)}
              />
            ),
            Nametag: (
              <input
                type="checkbox"
                onChange={(e) => handleCheckboxChange(value.nim, 'det_nametag', e.target.checked)}
              />
            ),
            Rambut: (
              <input
                type="checkbox"
                onChange={(e) => handleCheckboxChange(value.nim, 'det_rambut', e.target.checked)}
              />
            ),
            Sepatu: (
              <input
                type="checkbox"
                onChange={(e) => handleCheckboxChange(value.nim, 'det_sepatu', e.target.checked)}
              />
            ),
            Alignment: ["", "center", "center", "center", "center", "center", "center", "center"],
          }));

          setCurrentData(formattedData);
          const initialStudentData = {};
          formattedData.forEach((item) => {
            initialStudentData[item.nim] = {
              mhs_id: item.id,
              det_telat: false,
              det_id_card: false,
              det_nametag: false,
              det_rambut: false,
              det_sepatu: false,
            };
          });
          setStudentData(initialStudentData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedClass.current) {
      fetchData();
    }
  }, [selectedClass.current]);

  const handleCheckboxChange = (nim, field, checked) => {
    setDataForSubmit(prevData => {
      let newData = [...prevData];
      let totalJamMinus = 0;
      let existingIndex = newData.findIndex(item => item.mhs_id === nim);
  
      if (existingIndex !== -1) {
        newData = newData.map((item, index) => {
          if (index === existingIndex) {
            return { ...item, [field]: checked ? 1 : 0 };
          } else {
            return item;
          }
        });
  
        newData[existingIndex].total_jam_minus = 0;
        Object.keys(newData[existingIndex]).forEach(key => {
          if (key.includes('det_')) {
            totalJamMinus += newData[existingIndex][key] * 2;
          }
        });
        newData[existingIndex].total_jam_minus = totalJamMinus;
  
        return newData;
      } else {
        const newItem = {
          mhs_id: nim,
          det_telat: field === 'det_telat' ? (checked ? 1 : 0) : 0,
          det_id_card: field === 'det_id_card' ? (checked ? 1 : 0) : 0,
          det_nametag: field === 'det_nametag' ? (checked ? 1 : 0) : 0,
          det_rambut: field === 'det_rambut' ? (checked ? 1 : 0) : 0,
          det_sepatu: field === 'det_sepatu' ? (checked ? 1 : 0) : 0,
          total_jam_minus: checked ? 2 : 0,
        };
        return [...prevData, newItem];
      }
    });
  };
  

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
        Swal.fire(
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

  const handleConfirm = async () => {
    const confirmResult = await Swal.fire({
      title: "Yakin simpan data?",
      text: "Setelah disimpan, data tidak dapat diubah kembali.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
    });

    if (confirmResult.isConfirmed) {
      await handlesAdd();
    }
  };

  const handlesAdd = async () => {
    try {
      const p1 = selectedClass.current;
      const p2 = 1;
      const p13 = 1;
  
      // Filter hanya data yang memiliki setidaknya satu checkbox yang dicentang
      const dataForSubmitNew = dataForSubmit.filter(item =>
        item.det_telat === 1 || item.det_id_card === 1 || item.det_nametag === 1 ||
        item.det_rambut === 1 || item.det_sepatu === 1
      ).map(item => ({
        p1,
        p2,
        mhs_id: item.mhs_id,
        det_telat: item.det_telat,
        det_id_card: item.det_id_card,
        det_nametag: item.det_nametag,
        det_rambut: item.det_rambut,
        det_sepatu: item.det_sepatu,
        p9: eval(item.det_telat + item.det_id_card + item.det_nametag + item.det_rambut + item.det_sepatu) * 2,
        p13
      }));
  
      // Kirim data yang difilter ke API
      const response = await fetch(API_LINK + "TransaksiP5m/CreateP5m", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForSubmitNew)
      });
  
      if (response.ok) {
        Swal.fire("Sukses", "Data P5M berhasil disimpan", "success");
      } else {
        const errorData = await response.json();
        Swal.fire("Error", "Terjadi kesalahan saat menyimpan data P5M: " + errorData.message, "error");
      }
    } catch (error) {
      console.error("Error creating P5M data:", error);
      Swal.fire("Error", "Terjadi kesalahan saat menyimpan data P5M", "error");
    }
  };

  const handleReset = () => {
    // Reset dataForSubmit
    setDataForSubmit([]);
    
    // Reset currentData
    const resetData = currentData.map(item => ({
      ...item,
      Telat: (
        <input
          type="checkbox"
          checked={false}
          onChange={(e) => handleCheckboxChange(item.Nama, 'det_telat', e.target.checked)}
        />
      ),
      Idcard: (
        <input
          type="checkbox"
          checked={false}
          onChange={(e) => handleCheckboxChange(item.Nama, 'det_id_card', e.target.checked)}
        />
      ),
      Nametag: (
        <input
          type="checkbox"
          checked={false}
          onChange={(e) => handleCheckboxChange(item.Nama, 'det_nametag', e.target.checked)}
        />
      ),
      Rambut: (
        <input
          type="checkbox"
          checked={false}
          onChange={(e) => handleCheckboxChange(item.Nama, 'det_rambut', e.target.checked)}
        />
      ),
      Sepatu: (
        <input
          type="checkbox"
          checked={false}
          onChange={(e) => handleCheckboxChange(item.Nama, 'det_sepatu', e.target.checked)}
        />
      ),
      Alignment: ["", "center", "center", "center", "center", "center", "center", "center"],
    }));
  
    setCurrentData(resetData);
  };
  
  

  const handleSelectClass = async () => {
    // Tambahkan setState jika Anda ingin memaksa render ulang komponen setelah update selectedClass
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      selectedClass: selectedClass.current,
    }));
  };
  return (
    <>
      <div className="d-flex flex-column">
      <div>
          <h5>Total Mahasiswa: {currentData.length}</h5>
        </div>
        <div>
          <h5>Catatan : Data yang diberi tanda centang merupakan mahasiswa yang melakukan pelanggaran</h5>
        </div>
        <div className="flex-fill">
          <div className="input-group mt-3 align-items-center">
            <div className="flex-grow-1 mr-3">
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
                  selectedClass.current = e.target.value;
                  handleSelectClass();
                }}
                defaultValue=""
              />
            </div>
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                onToggle={handleSetStatus}
                onDetail={onChangePage}
                onEdit={onChangePage}
              />
            
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={1}
                navigation={handleSetCurrentPage}
              />
              <Button
                iconName="save"
                classType="success mt-3"
                label="Simpan"
                onClick={handleConfirm}
              />
              <Button
                iconName="save"
                classType="secondary mt-3"
                label="Reset"
                onClick={handleReset}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}