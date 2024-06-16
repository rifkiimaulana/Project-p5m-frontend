import { useEffect, useRef, useState } from "react";
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

export default function MasterPelangganAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listProvinsi, setListProvinsi] = useState({});
  const [listKabupaten, setListKabupaten] = useState({});
  const [listKecamatan, setListKecamatan] = useState({});
  const [listKelurahan, setListKelurahan] = useState({});

  const formDataRef = useRef({
    namaPelanggan: "",
    alamatPelanggan: "",
    provinsiPelanggan: "",
    kabupatenPelanggan: "",
    kecamatanPelanggan: "",
    kelurahanPelanggan: "",
    nomorTeleponPelanggan: "",
    faxPelanggan: "",
    emailPelanggan: "",
    nomorNPWPPelanggan: "",
    kontakPersonPenagihan: "",
    emailPenagihan: "",
    kontakPersonPajak: "",
    emailPajak: "",
    berkasNPWPPelanggan: "",
    berkasSPPKPPelanggan: "",
    berkasSKTPelanggan: "",
    berkasLainPelanggan: "",
  });

  const fileNPWPRef = useRef(null);
  const fileSPPKPRef = useRef(null);
  const fileSKTRef = useRef(null);
  const fileLainRef = useRef(null);

  const userSchema = object({
    namaPelanggan: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    alamatPelanggan: string().required("harus diisi"),
    provinsiPelanggan: string(),
    kabupatenPelanggan: string(),
    kecamatanPelanggan: string(),
    kelurahanPelanggan: string(),
    nomorTeleponPelanggan: string()
      .max(15, "maksimum 15 karakter")
      .required("harus diisi"),
    faxPelanggan: string().max(15, "maksimum 15 karakter"),
    emailPelanggan: string()
      .max(100, "maksimum 100 karakter")
      .email("format email tidak valid")
      .required("harus diisi"),
    nomorNPWPPelanggan: string().max(30, "maksimum 30 karakter"),
    kontakPersonPenagihan: string().max(100, "maksimum 100 karakter"),
    emailPenagihan: string()
      .max(100, "maksimum 100 karakter")
      .email("format email tidak valid"),
    kontakPersonPajak: string().max(100, "maksimum 100 karakter"),
    emailPajak: string()
      .max(100, "maksimum 100 karakter")
      .email("format email tidak valid"),
    berkasNPWPPelanggan: string(),
    berkasSPPKPPelanggan: string(),
    berkasSKTPelanggan: string(),
    berkasLainPelanggan: string(),
  });

  const fetchDataByEndpointAndParams = async (
    endpoint,
    params,
    setter,
    errorMessage
  ) => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") {
        throw new Error(errorMessage);
      } else {
        setter(data);
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setter({});
    }
  };

  // MENGAMBIL DAFTAR PROVINSI -- BEGIN
  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListProvinsi",
      {},
      setListProvinsi,
      "Terjadi kesalahan: Gagal mengambil daftar provinsi."
    );
  }, []);
  // MENGAMBIL DAFTAR PROVINSI -- END

  // MENGAMBIL DAFTAR KABUPATEN/KOTA -- BEGIN
  useEffect(() => {
    if (formDataRef.current["provinsiPelanggan"]) {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetListKabupaten",
        { provinsi: formDataRef.current["provinsiPelanggan"] },
        setListKabupaten,
        "Terjadi kesalahan: Gagal mengambil daftar kabupaten/kota."
      );
      setListKecamatan({});
      setListKelurahan({});
    }
  }, [formDataRef.current["provinsiPelanggan"]]);
  // MENGAMBIL DAFTAR KABUPATEN/KOTA -- END

  // MENGAMBIL DAFTAR KECAMATAN -- BEGIN
  useEffect(() => {
    if (formDataRef.current["kabupatenPelanggan"]) {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetListKecamatan",
        {
          provinsi: formDataRef.current["provinsiPelanggan"],
          kabupaten: formDataRef.current["kabupatenPelanggan"],
        },
        setListKecamatan,
        "Terjadi kesalahan: Gagal mengambil daftar kecamatan."
      );
      setListKelurahan({});
    }
  }, [formDataRef.current["kabupatenPelanggan"]]);
  // MENGAMBIL DAFTAR KECAMATAN -- END

  // MENGAMBIL DAFTAR KELURAHAN -- BEGIN
  useEffect(() => {
    if (formDataRef.current["kecamatanPelanggan"]) {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetListKelurahan",
        {
          provinsi: formDataRef.current["provinsiPelanggan"],
          kabupaten: formDataRef.current["kabupatenPelanggan"],
          kecamatan: formDataRef.current["kecamatanPelanggan"],
        },
        setListKelurahan,
        "Terjadi kesalahan: Gagal mengambil daftar kelurahan."
      );
    }
  }, [formDataRef.current["kecamatanPelanggan"]]);
  // MENGAMBIL DAFTAR KELURAHAN -- END

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

      const fileInputs = [
        { ref: fileNPWPRef, key: "berkasNPWPPelanggan" },
        { ref: fileSPPKPRef, key: "berkasSPPKPPelanggan" },
        { ref: fileSKTRef, key: "berkasSKTPelanggan" },
        { ref: fileLainRef, key: "berkasLainPelanggan" },
      ];

      fileInputs.forEach((fileInput) => {
        if (fileInput.ref.current.files.length > 0) {
          uploadPromises.push(
            UploadFile(fileInput.ref.current).then(
              (data) => (formDataRef.current[fileInput.key] = data.Hasil)
            )
          );
        }
      });

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterPelanggan/CreatePelanggan",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data pelanggan.");
        } else {
          SweetAlert("Sukses", "Data pelanggan berhasil disimpan", "success");
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
            Tambah Data Pelanggan Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="namaPelanggan"
                  label="Nama Pelanggan"
                  isRequired
                  value={formDataRef.current.namaPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.namaPelanggan}
                />
              </div>
              <div className="col-lg-9">
                <Input
                  type="text"
                  forInput="alamatPelanggan"
                  label="Alamat"
                  isRequired
                  value={formDataRef.current.alamatPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.alamatPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="provinsiPelanggan"
                  label="Provinsi"
                  arrData={listProvinsi}
                  value={formDataRef.current.provinsiPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.provinsiPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="kabupatenPelanggan"
                  label="Kabupaten/Kota"
                  arrData={listKabupaten}
                  value={formDataRef.current.kabupatenPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.kabupatenPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="kecamatanPelanggan"
                  label="Kecamatan"
                  arrData={listKecamatan}
                  value={formDataRef.current.kecamatanPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.kecamatanPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="kelurahanPelanggan"
                  label="Kelurahan/Desa"
                  arrData={listKelurahan}
                  value={formDataRef.current.kelurahanPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.kelurahanPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="nomorTeleponPelanggan"
                  label="Nomor HP/Telepon"
                  isRequired
                  value={formDataRef.current.nomorTeleponPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.nomorTeleponPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="faxPelanggan"
                  label="Nomor Fax"
                  value={formDataRef.current.faxPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.faxPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="email"
                  forInput="emailPelanggan"
                  label="Email"
                  isRequired
                  value={formDataRef.current.emailPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.emailPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="nomorNPWPPelanggan"
                  label="Nomor NPWP"
                  value={formDataRef.current.nomorNPWPPelanggan}
                  onChange={handleInputChange}
                  errorMessage={errors.nomorNPWPPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="kontakPersonPenagihan"
                  label="Contact Person Penagihan"
                  value={formDataRef.current.kontakPersonPenagihan}
                  onChange={handleInputChange}
                  errorMessage={errors.kontakPersonPenagihan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="email"
                  forInput="emailPenagihan"
                  label="Email Penagihan"
                  value={formDataRef.current.emailPenagihan}
                  onChange={handleInputChange}
                  errorMessage={errors.emailPenagihan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="kontakPersonPajak"
                  label="Contact Person Pajak"
                  value={formDataRef.current.kontakPersonPajak}
                  onChange={handleInputChange}
                  errorMessage={errors.kontakPersonPajak}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="email"
                  forInput="emailPajak"
                  label="Email Pajak"
                  value={formDataRef.current.emailPajak}
                  onChange={handleInputChange}
                  errorMessage={errors.emailPajak}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="berkasNPWPPelanggan"
                  label="Berkas NPWP (.pdf, .jpg, .png)"
                  formatFile=".pdf,.jpg,.png"
                  ref={fileNPWPRef}
                  onChange={() => handleFileChange(fileNPWPRef, "pdf,jpg,png")}
                  errorMessage={errors.berkasNPWPPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="berkasSPPKPPelanggan"
                  label="Berkas SPPKP (.pdf, .jpg, .png)"
                  formatFile=".pdf,.jpg,.png"
                  ref={fileSPPKPRef}
                  onChange={() => handleFileChange(fileSPPKPRef, "pdf,jpg,png")}
                  errorMessage={errors.berkasSPPKPPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="berkasSKTPelanggan"
                  label="Berkas SKT (.pdf, .jpg, .png)"
                  formatFile=".pdf,.jpg,.png"
                  ref={fileSKTRef}
                  onChange={() => handleFileChange(fileSKTRef, "pdf,jpg,png")}
                  errorMessage={errors.berkasSKTPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="berkasLainPelanggan"
                  label="Berkas Lainnya (.pdf, .jpg, .png, .zip)"
                  formatFile=".pdf,.jpg,.png,.zip"
                  ref={fileLainRef}
                  onChange={() =>
                    handleFileChange(fileLainRef, "pdf,jpg,png,zip")
                  }
                  errorMessage={errors.berkasLainPelanggan}
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
