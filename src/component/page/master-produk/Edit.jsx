import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Label from "../../part/Label";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const listJenisProduk = [
  { Value: "Part", Text: "Part" },
  { Value: "Unit", Text: "Unit" },
  { Value: "Konstruksi", Text: "Konstruksi" },
  { Value: "Mass Production", Text: "Mass Production" },
  { Value: "Lainnya", Text: "Lainnya" },
];

export default function MasterProdukEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    idProduk: "",
    kodeProduk: "",
    namaProduk: "",
    jenisProduk: "",
    gambarProduk: "",
    spesifikasi: "",
  });

  const fileGambarRef = useRef(null);

  const userSchema = object({
    idProduk: string(),
    kodeProduk: string(),
    namaProduk: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    jenisProduk: string().required("harus dipilih"),
    gambarProduk: string(),
    spesifikasi: string(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterProduk/GetDataProdukById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data produk.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
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
    };

    fetchData();
  }, []);

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
            (data) => (formDataRef.current["gambarProduk"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterProduk/EditProduk",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data produk.");
        } else {
          SweetAlert("Sukses", "Data produk berhasil disimpan", "success");
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
            Ubah Data Produk
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Label
                  forLabel="kodeProduk"
                  title="Kode Produk"
                  data={formDataRef.current.kodeProduk}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="namaProduk"
                  label="Nama Produk"
                  isRequired
                  value={formDataRef.current.namaProduk}
                  onChange={handleInputChange}
                  errorMessage={errors.namaProduk}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="jenisProduk"
                  label="Jenis Produk"
                  arrData={listJenisProduk}
                  isRequired
                  value={formDataRef.current.jenisProduk}
                  onChange={handleInputChange}
                  errorMessage={errors.jenisProduk}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="gambarProduk"
                  label="Gambar Produk (.pdf, .jpg, .png)"
                  formatFile=".pdf,.jpg,.png"
                  ref={fileGambarRef}
                  onChange={() =>
                    handleFileChange(fileGambarRef, "pdf,jpg,png")
                  }
                  errorMessage={errors.gambarProduk}
                  hasExisting={formDataRef.current.gambarProduk}
                />
              </div>
              <div className="col-lg-12">
                <Input
                  type="textarea"
                  forInput="spesifikasi"
                  label="Spesifikasi"
                  value={formDataRef.current.spesifikasi}
                  onChange={handleInputChange}
                  errorMessage={errors.spesifikasi}
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
