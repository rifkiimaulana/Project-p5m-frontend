import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterOperatorAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listOperator, setListOperator] = useState({});

  const formDataRef = useRef({
    namaOperator: "",
    tanggal: "", // Tambahkan inputan tanggal di sini
  });

  const userSchema = object({
    namaOperator: string().required("harus dipilih"),
    tanggal: string().required("harus diisi"), // Validasi untuk tanggal
  });

  // MENGAMBIL DAFTAR KARYAWAN -- BEGIN
  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "Utilities/GetListKaryawan", {});

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar karyawan."
          );
        } else {
          setListOperator(data);
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setListOperator({});
      }
    };

    fetchData();
  }, []);
  // MENGAMBIL DAFTAR KARYAWAN -- END

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
        const data = await UseFetch(
          API_LINK + "MasterOperator/CreateOperator",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data operator.");
        } else {
          if (data[0].hasil === "OK") {
            SweetAlert("Sukses", "Data operator berhasil disimpan", "success");
            onChangePage("index");
          } else {
            SweetAlert(
              "Gagal",
              "Nama karyawan tersebut sudah pernah dimasukkan sebagai operator sebelumnya",
              "error"
            );
          }
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
            Tambah Data p5m
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <DropDown
                  forInput="namaOperator"
                  label="id p5m"
                  arrData={listOperator}
                  isRequired
                  value={formDataRef.current.namaOperator}
                  onChange={handleInputChange}
                  errorMessage={errors.namaOperator}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="namaOperator"
                  label="Nim Mahasiwa"
                  arrData={listOperator}
                  isRequired
                  value={formDataRef.current.namaOperator}
                  onChange={handleInputChange}
                  errorMessage={errors.namaOperator}
                />
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label htmlFor="tanggal">Tanggal</label>
                  <input
                    type="date"
                    className="form-control"
                    id="tanggal"
                    name="tanggal"
                    value={formDataRef.current.tanggal}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.tanggal && (
                    <div className="invalid-feedback">{errors.tanggal}</div>
                  )}
                </div>
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
