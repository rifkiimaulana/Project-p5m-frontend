import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { separator } from "../../util/Formatting";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Label from "../../part/Label";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterKelasAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listProses, setListProses] = useState({});
  const [hargaLama, setHargaLama] = useState("-");

  const formDataRef = useRef({
    namaProses: "",
    hargaBaru: "",
  });

  const userSchema = object({
    namaProses: string().required("harus dipilih"),
    hargaBaru: string()
      .max(13, "maksimum harga 9.999.999.999")
      .required("harus diisi"),
  });

  // MENGAMBIL DAFTAR PROSES -- BEGIN
  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterProses/GetListProses",
          {}
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar proses.");
        } else {
          setListProses(data);
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setListProses({});
      }
    };

    fetchData();
  }, []);
  // MENGAMBIL DAFTAR PROSES -- END

  // MENGAMBIL HARGA LAMA BERDASARKAN PROSES YANG DIPILIH -- BEGIN
  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterKursProses/GetHargaLamaByProses",
          { namaProses: formDataRef.current["namaProses"] }
        );

        if (data === "ERROR" || data.length === 0) {
          setHargaLama("-");
        } else {
          setHargaLama(separator(data[0].hargaLama));
        }
      } catch {
        setHargaLama("-");
      }
    };

    fetchData();
  }, [formDataRef.current["namaProses"]]);
  // MENGAMBIL HARGA LAMA BERDASARKAN PROSES YANG DIPILIH -- END

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);

    if (name === "hargaBaru") formDataRef.current[name] = separator(value);
    else formDataRef.current[name] = value;
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
          API_LINK + "MasterKursProses/CreateKursProses",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data kurs proses."
          );
        } else {
          SweetAlert("Sukses", "Data kurs proses berhasil disimpan", "success");
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
            Tambah Data Kurs Proses Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <DropDown
                  forInput="namaProses"
                  label="Nama Proses"
                  arrData={listProses}
                  isRequired
                  value={formDataRef.current.namaProses}
                  onChange={handleInputChange}
                  errorMessage={errors.namaProses}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="hargaBaru"
                  label="Harga Baru (Rp.)"
                  isRequired
                  value={formDataRef.current.hargaBaru}
                  onChange={handleInputChange}
                  errorMessage={errors.hargaBaru}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="hargaLama"
                  title="Harga Lama (Rp.)"
                  data={hargaLama}
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
