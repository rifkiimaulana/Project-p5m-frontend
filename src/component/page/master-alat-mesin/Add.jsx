import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const listJenisAlatMesin = [
  { Value: "Alat", Text: "Alat" },
  { Value: "Mesin", Text: "Mesin" },
  { Value: "Perangkat Lunak", Text: "Perangkat Lunak" },
  { Value: "Lainnya", Text: "Lainnya" },
];

export default function MasterAlatMesinAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    namaAlatMesin: "",
    jenis: "",
    gambarAlatMesin: "",
    deskripsi: "",
  });

  const fileGambarRef = useRef(null);

  const userSchema = object({
    namaAlatMesin: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    jenis: string().required("harus dipilih"),
    gambarAlatMesin: string(),
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

      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileGambarRef.current).then(
            (data) => (formDataRef.current["gambarAlatMesin"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterAlatMesin/CreateAlatMesin",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data alat/mesin."
          );
        } else {
          SweetAlert("Sukses", "Data alat/mesin berhasil disimpan", "success");
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
            Tambah Data Alat/Mesin Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="namaAlatMesin"
                  label="Nama Alat/Mesin"
                  isRequired
                  value={formDataRef.current.namaAlatMesin}
                  onChange={handleInputChange}
                  errorMessage={errors.namaAlatMesin}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="jenis"
                  label="Jenis"
                  arrData={listJenisAlatMesin}
                  isRequired
                  value={formDataRef.current.jenis}
                  onChange={handleInputChange}
                  errorMessage={errors.jenis}
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  forInput="gambarAlatMesin"
                  label="Gambar Alat/Mesin (.pdf, .jpg, .png)"
                  formatFile=".pdf,.jpg,.png"
                  ref={fileGambarRef}
                  onChange={() =>
                    handleFileChange(fileGambarRef, "pdf,jpg,png")
                  }
                  errorMessage={errors.gambarAlatMesin}
                />
              </div>
              <div className="col-lg-12">
                <Input
                  type="textarea"
                  forInput="deskripsi"
                  label="Spesifikasi"
                  value={formDataRef.current.deskripsi}
                  onChange={handleInputChange}
                  errorMessage={errors.deskripsi}
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
