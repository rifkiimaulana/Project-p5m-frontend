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
  const selectedClass = useRef(""); // useRef to track selected class
  const [studentData, setStudentData] = useState({});
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
            Namtag: (
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
          // Initialize studentData state
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

  const handlesAddOld = async () => {
    try {
      for (let data of dataForSubmit) {
        const response = await fetch(API_LINK + "TransaksiP5m/CreateP5m", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p1: selectedClass.current,
            p2: 1, // Gantilah dengan variabel user yang sedang login
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

        const result = await response.json();

        if (result.hasil === "ERROR") {
          throw new Error("Error creating P5M data for mhs_id: " + data.mhs_id);
        }
      }

      SweetAlert("Sukses", "Data P5M berhasil disimpan", "success");
    } catch (error) {
      console.error("Error creating P5M data:", error);
      SweetAlert("Error", "Terjadi kesalahan saat menyimpan data P5M", "error");
    }
  };

  const handlesAdd = async () => {
    try {
      const p1 = selectedClass.current;
      const p2 = 1;
      const p13 = 1;

      const dataForSubmitNew = dataForSubmit.map(item => ({
          p1,
          p2,
          mhs_id: item.mhs_id,
          det_telat: item.det_telat,
          det_id_card: item.det_id_card,
          det_nametag: item.det_nametag,
          det_rambut: item.det_rambut,
          det_sepatu: item.det_sepatu,
          p9: eval(item.det_telat+item.det_id_card+item.det_nametag+item.det_rambut+item.det_sepatu)*2,
          p13
      }));

        const response = await fetch(API_LINK + "TransaksiP5m/CreateP5m", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataForSubmitNew) // Ensure data is a JSON string
        });

        if (response.ok) {
            SweetAlert("Sukses", "Data P5M berhasil disimpan", "success");
        } else {
            const errorData = await response.json();
            SweetAlert("Error", "Terjadi kesalahan saat menyimpan data P5M: " + errorData.message, "error");
        }
    } catch (error) {
        console.error("Error creating P5M data:", error);
        SweetAlert("Error", "Terjadi kesalahan saat menyimpan data P5M", "error");
    }
  };


  const handleSelectClass = async () => {
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      selectedClass: selectedClass.current,
    }));
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
              onClick={handlesAdd}
            />
          </div>
        )}
      </div>
    </div>
  </>
);
}


