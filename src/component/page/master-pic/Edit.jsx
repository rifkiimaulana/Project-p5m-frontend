import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Label from "../../part/Label";

export default function MasterPicEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    idPic: "",
    username: "",
    namaPic: "",
  });


  const userSchema = object({
    idPic: string(),
    username: string()
      .max(100, "maksimum 50 karakter")
      .required("harus diisi"),
    namaPic: string()
    .max(100, "maksimum 100 karakter")
    .required("harus diisi"),
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

      try {
        const data = await UseFetch(API_LINK + "MasterPic/GetDataPicById", { id: withID });

        if (data === "ERROR" || !data || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data PIC.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
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


  //fungsi untuk ubah
  const handleAdd = async (e) => {
  e.preventDefault();

  // Validasi input form
  const validationErrors = await validateAllInputs(
    formDataRef.current,
    userSchema,
    setErrors
  );

  // Jika tidak ada kesalahan validasi, lanjutkan
  if (Object.values(validationErrors).every((error) => !error)) {
    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));
    setErrors({});

    try {
      // Menyiapkan parameter untuk API
      const params = {
        idPic: formDataRef.current.idPic || "", 
        query: formDataRef.current.query || "", 
        username: formDataRef.current.username || "", 
        namaPic: formDataRef.current.namaPic || "", 
        status: formDataRef.current.status || "Aktif", 
        modifby: 1, 
      };

      // Panggil API dengan parameter yang disiapkan
      const data = await UseFetch(API_LINK + "MasterPic/EditPic", params);

      // Periksa respons dari API
      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal menyimpan data PIC.");
      } else {
        // Tampilkan pesan sukses
        SweetAlert("Sukses", "Data PIC berhasil diubah", "success");
        onChangePage("index");
      }
    } catch (error) {
      // Tangani kesalahan dan tampilkan pesan kesalahan
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      // Set isLoading ke false setelah operasi selesai
      setIsLoading(false);
    }
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
            Ubah Data PIC
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="username"
                  label="Username"
                  isRequired
                  value={formDataRef.current.username}
                  onChange={handleInputChange}
                  errorMessage={errors.username}
              />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="namaPic"
                  label="Nama PIC"
                  value={formDataRef.current.namaPic}
                  onChange={handleInputChange}
                  errorMessage={errors.namaPic}
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
