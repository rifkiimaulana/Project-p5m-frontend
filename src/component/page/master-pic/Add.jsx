import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterPICAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    username: "",
    namaPic: "",
  });

  const userSchema = object({
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

  const handleAdd = async (e) => {
    e.preventDefault();
  
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
  
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});
  
      try {
        const params = {
          username: formDataRef.current.username || "",
          namaPic: formDataRef.current.namaPic || "",
          status: formDataRef.current.status || "Aktif",
          created_by: 1, // Ganti dengan ID user yang melakukan input jika ada
        };
  
        // Log parameter yang akan dikirim ke API
        console.log("Submitting data with params:", params);
  
        const data = await UseFetch(API_LINK + "MasterPic/CreatePic", params);
        console.log("Response data: ", data); // Tambahkan logging di sini
  
        if (Array.isArray(data) && data[0]?.hasil.startsWith("ERROR")) {
          let errorMessage = "";
          
          switch (data[0].hasil) {
            case "ERROR: Username sudah ada":
              errorMessage = "Username sudah ada.";
              break;
            case "ERROR: Nama PIC sudah ada":
              errorMessage = "Nama PIC sudah ada.";
              break;
            default:
              errorMessage = "Terjadi kesalahan.";
          }
  
          SweetAlert("Gagal", errorMessage, "error");
        } else {
          SweetAlert("Sukses", "Data PIC berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        console.error("Error:", error);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
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
            Tambah Data PIC Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
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
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="namaPic"
                  label="Nama PIC"
                  isRequired
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
