import { useRef, useState } from "react";
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

export default function MasterProsesAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    namaProses: "",
    modul: "",
    deskripsi: "",
  });

  const fileModulRef = useRef(null);

  const userSchema = object({
    namaProses: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    modul: string(),
    deskripsi: string(),
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

  const handleFileChange = async (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
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

      const uploadPromises = [];

      if (fileModulRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileModulRef.current).then(
            (data) => (formDataRef.current["modul"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterProses/CreateProses",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data proses.");
        } else {
          SweetAlert("Sukses", "Data proses berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
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
            Tambah Data Kelas Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-12">
                <Input
                  type="text"
                  forInput="namaProses"
                  label="Nama Kelas"
                  isRequired
                  value={formDataRef.current.namaProses}
                  onChange={handleInputChange}
                  errorMessage={errors.namaProses}
                />
              </div>
              {/* <div className="col-lg-3">
                <FileUpload
                  forInput="modul"
                  label="Modul (.pdf, .zip)"
                  formatFile=".pdf,.zip"
                  ref={fileModulRef}
                  onChange={() => handleFileChange(fileModulRef, "pdf,zip")}
                  errorMessage={errors.modul}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="deskripsi"
                  label="Deskripsi"
                  value={formDataRef.current.deskripsi}
                  onChange={handleInputChange}
                  errorMessage={errors.deskripsi}
                />
              </div> */}
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
