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

export default function MasterKelasAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listPic, setListPic] = useState([]);

  const formDataRef = useRef({
    idPic: "",
    nama: "",
  });

  const userSchema = object({
    nama: string().max(100, "maksimum 100 karakter").required("harus diisi"),
    idPic: string().required("harus diisi"),
  });

  const fetchDataByEndpointAndParams = async (
    endpoint,
    params,
    setter,
    errorMessage
  ) => {
    setIsError({ error: false, message: "" }); // Reset isError state
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") {
        throw new Error(errorMessage);
      } else {
        setter(data);
      }
    } catch (error) {
      setIsError({ error: true, message: error.message });
      setter([]);
    }
  };

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "MasterPic/GetListPic",
      {},
      setListPic,
      "Terjadi kesalahan: Gagal mengambil daftar PIC."
    );
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

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" }); // Reset isError state
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "MasterKelas/CreateKelas",
          formDataRef.current
        );

        console.log("Response data: ", data); // Tambahkan logging di sini

        if (Array.isArray(data) && data[0]?.hasil === "ERROR") {
          SweetAlert("Gagal", "Kelas sudah ada.", "error");
        }else {
          SweetAlert("Sukses", "Data Kelas berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {/* {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )} */}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Tambah Data Kelas Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
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
              <div className="col-lg-6">
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
