import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Label from "../../part/Label";

export default function MasterKelasEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listPic, setListPic] = useState([]);

  const formDataRef = useRef({
    idKelas: "",
    idPic: "",
    nama: "",
  });

  const userSchema = object({
    idKelas: string(),
    nama: string().max(100, "Maksimum 100 karakter").required("Harus diisi"),
    idPic: string().required("Harus diisi"),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      setIsLoading(true);

      try {
        
        const kelasData = await UseFetch(API_LINK + "MasterKelas/GetDataKelasById", 
        { id: withID });
        const listPicData = await UseFetch(API_LINK + "MasterPic/GetListPic");

        if (listPicData === "ERROR" || kelasData === "ERROR") {
          throw new Error("Terjadi kesalahan saat mengambil data.");
        }

        if (!kelasData || kelasData.length === 0) {
          throw new Error("Data kelas tidak ditemukan.");
        } else {
          setListPic(listPicData);
          formDataRef.current = { ...formDataRef.current, ...kelasData[0] };
        }
      } catch (error) {
        setIsError({
          error: true,
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (withID) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [withID]);

  const handleAdd = async (e) => {
    e.preventDefault();
  
    // Log data form sebelum validasi
    console.log("Form data before validation:", formDataRef.current);
  
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
  
    // Log hasil validasi
    console.log("Validation Errors:", validationErrors);
  
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});
  
      try {
        const params = {
          idKelas: formDataRef.current.idKelas || "",
          query : formDataRef.current.query || "",
          nama: formDataRef.current.nama || "",
          idPic: formDataRef.current.idPic || "",
          status: formDataRef.current.status || "Aktif",
          modifby: 1,
        };
  
        // Log parameter yang akan dikirim ke API
        console.log("Submitting data with params:", params);
  
        const data = await UseFetch(API_LINK + "MasterKelas/EditKelas", params);
  
        // Log respons dari API
        console.log("API response:", data);
  
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data Kelas.");
        } else {
          SweetAlert("Sukses", "Data Kelas berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        console.error("Error:", error);
        setIsError({
          error: true,
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Validation failed. Aborting data submission.");
    }
  };
  
  
    
  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Kelas
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="nama"
                  label="Kelas"
                  isRequired
                  value={formDataRef.current.nama}
                  onChange={handleInputChange}
                  errorMessage={errors.nama}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="idPic"
                  label="Nama PIC"
                  arrData={listPic}
                  isRequired
                  value={formDataRef.current.idPic}
                  onChange={handleInputChange}
                  errorMessage={errors.idPic}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="BATAL"
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN"
          />
        </div>
      </form>
    </>
  );
}
