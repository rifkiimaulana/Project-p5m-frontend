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
import Table from "../../part/Table";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const inisialisasiDataProduk = [
  {
    Key: null,
    No: null,
    "Nama Produk/Jasa": null,
    Jumlah: null,
    Count: 0,
  },
];

const listJenisPermintaan = [
  { Value: "Internal", Text: "Internal" },
  { Value: "Eksternal", Text: "Eksternal" },
];

const listJenisKomersial = [
  { Value: "Komersial", Text: "Komersial" },
  { Value: "Non-Komersial", Text: "Non-Komersial" },
];

export default function PermintaanPelangganAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listPelanggan, setListPelanggan] = useState({});
  const [listProduk, setListProduk] = useState({});
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);

  const formDataRef = useRef({
    nomorPermintaan: "",
    namaPelanggan: "",
    tanggalPermintaan: "",
    jenisPermintaan: "",
    jenisKomersial: "",
    kontakPelanggan: "",
    noHPPelanggan: "",
    emailPelanggan: "",
    berkasPenawaran: "",
    berkasGambar: "",
    berkasLainnya: "",
    estimasiPenawaran: "",
    keterangan: "",
  });

  const filePenawaranRef = useRef(null);
  const fileGambarRef = useRef(null);
  const fileLainRef = useRef(null);
  const namaProdukRef = useRef(null);
  const jumlahProdukRef = useRef(null);

  const userSchema = object({
    nomorPermintaan: string()
      .max(50, "maksimum 50 karakter")
      .required("harus diisi"),
    namaPelanggan: string().required("harus dipilih"),
    tanggalPermintaan: string().required("harus diisi"),
    jenisPermintaan: string().required("harus dipilih"),
    jenisKomersial: string().required("harus dipilih"),
    kontakPelanggan: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    noHPPelanggan: string()
      .max(15, "maksimum 15 karakter")
      .required("harus diisi"),
    emailPelanggan: string()
      .max(100, "maksimum 100 karakter")
      .email("format email tidak valid"),
    berkasPenawaran: string(),
    berkasGambar: string(),
    berkasLainnya: string(),
    estimasiPenawaran: string().required("harus diisi"),
    keterangan: string(),
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

  // MENGAMBIL DAFTAR PELANGGAN -- BEGIN
  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "MasterPelanggan/GetListPelanggan",
      {},
      setListPelanggan,
      "Terjadi kesalahan: Gagal mengambil daftar pelanggan."
    );
  }, []);
  // MENGAMBIL DAFTAR PELANGGAN -- END

  // MENGAMBIL DAFTAR PRODUK -- BEGIN
  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "MasterProduk/GetListProduk",
      {},
      setListProduk,
      "Terjadi kesalahan: Gagal mengambil daftar produk."
    );
  }, []);
  // MENGAMBIL DAFTAR PRODUK -- END

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);

    if (name === "jenisPermintaan") {
      if (value === "Eksternal" || value === "") {
        formDataRef.current["jenisKomersial"] = "Komersial";
        document
          .getElementById("divJenisKomersial")
          .classList.add("visually-hidden");
      } else {
        formDataRef.current["jenisKomersial"] = "";
        document
          .getElementById("divJenisKomersial")
          .classList.remove("visually-hidden");
      }
    }

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
        { ref: filePenawaranRef, key: "berkasPenawaran" },
        { ref: fileGambarRef, key: "berkasGambar" },
        { ref: fileLainRef, key: "berkasLainnya" },
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
          API_LINK + "PermintaanPelanggan/CreatePermintaanPelanggan",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data permintaan pelanggan."
          );
        } else {
          const currentID = data[0].hasil;

          await Promise.all(
            dataProduk.map(async (produk) => {
              const { Key, Jumlah } = produk;
              const produkToSent = { ID: currentID, Key, Jumlah };
              const produkHasil = await UseFetch(
                API_LINK +
                  "PermintaanPelanggan/CreatePermintaanPelangganProduk",
                produkToSent
              );
              if (produkHasil === "ERROR") {
                throw new Error(
                  "Terjadi kesalahan: Gagal menyimpan data produk."
                );
              }
            })
          );

          SweetAlert(
            "Sukses",
            "Data permintaan pelanggan berhasil disimpan",
            "success"
          );
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

  function handleAddProduk() {
    if (
      namaProdukRef.current.value !== "" &&
      jumlahProdukRef.current.value !== "" &&
      !isNaN(jumlahProdukRef.current.value)
    ) {
      const idProduk = namaProdukRef.current.value;
      const namaProduk = namaProdukRef.current.selectedOptions[0].textContent;
      const jumlahProduk = jumlahProdukRef.current.value;
      namaProdukRef.current.selectedIndex = 0;
      jumlahProdukRef.current.value = "";

      const existingProdukIndex = dataProduk.findIndex(
        (item) => item.Key === idProduk
      );

      if (existingProdukIndex !== -1) {
        setDataProduk((prevData) => {
          const newData = [...prevData];
          newData[existingProdukIndex] = {
            ...newData[existingProdukIndex],
            Jumlah:
              newData[existingProdukIndex].Jumlah + parseInt(jumlahProduk),
          };
          return newData;
        });
      } else {
        const count = dataProduk[0].Key === null ? 1 : dataProduk.length + 1;
        const produkBaru = {
          Key: idProduk,
          No: count,
          "Nama Produk/Jasa": namaProduk,
          Jumlah: parseInt(jumlahProduk),
          Count: count,
          Aksi: ["Delete"],
          Alignment: ["center", "left", "center", "center"],
        };

        setDataProduk((prevData) => {
          if (prevData[0].Key === null) prevData = [];
          return [...prevData, produkBaru];
        });
      }
    }
  }

  function handleDeleteProduk(id) {
    setDataProduk((prevData) => {
      const newData = prevData
        .filter((produk) => produk.Key !== id)
        .map((produk, idx) => {
          return { ...produk, No: idx + 1, Count: idx + 1 };
        });
      if (newData.length === 0) return inisialisasiDataProduk;
      else return newData;
    });
  }

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
            Tambah Permintaan Pelanggan Baru
          </div>
          <div className="card-body p-3">
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header bg-light fw-bold">
                    Data Permintaan Pelanggan
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-3">
                        <Input
                          type="text"
                          forInput="nomorPermintaan"
                          label="Nomor Permintaan"
                          isRequired
                          value={formDataRef.current.nomorPermintaan}
                          onChange={handleInputChange}
                          errorMessage={errors.nomorPermintaan}
                        />
                      </div>
                      <div className="col-lg-3">
                        <DropDown
                          forInput="namaPelanggan"
                          label="Nama Pelanggan"
                          arrData={listPelanggan}
                          isRequired
                          value={formDataRef.current.namaPelanggan}
                          onChange={handleInputChange}
                          errorMessage={errors.namaPelanggan}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="date"
                          forInput="tanggalPermintaan"
                          label="Tanggal Permintaan"
                          isRequired
                          value={formDataRef.current.tanggalPermintaan}
                          onChange={handleInputChange}
                          errorMessage={errors.tanggalPermintaan}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="date"
                          forInput="estimasiPenawaran"
                          label="Estimasi Penawaran"
                          isRequired
                          value={formDataRef.current.estimasiPenawaran}
                          onChange={handleInputChange}
                          errorMessage={errors.estimasiPenawaran}
                        />
                      </div>
                      <div className="col-lg-3">
                        <DropDown
                          forInput="jenisPermintaan"
                          label="Jenis Permintaan"
                          arrData={listJenisPermintaan}
                          isRequired
                          value={formDataRef.current.jenisPermintaan}
                          onChange={handleInputChange}
                          errorMessage={errors.jenisPermintaan}
                        />
                      </div>
                      <div
                        className="col-lg-3 visually-hidden"
                        id="divJenisKomersial"
                      >
                        <DropDown
                          forInput="jenisKomersial"
                          label="Jenis Komersial"
                          arrData={listJenisKomersial}
                          isRequired
                          value={formDataRef.current.jenisKomersial}
                          onChange={handleInputChange}
                          errorMessage={errors.jenisKomersial}
                        />
                      </div>
                      <div className="col-lg-6">
                        <Input
                          type="text"
                          forInput="keterangan"
                          label="Keterangan"
                          value={formDataRef.current.keterangan}
                          onChange={handleInputChange}
                          errorMessage={errors.keterangan}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <Input
                          type="text"
                          forInput="kontakPelanggan"
                          label="Kontak Pelanggan"
                          isRequired
                          value={formDataRef.current.kontakPelanggan}
                          onChange={handleInputChange}
                          errorMessage={errors.kontakPelanggan}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="text"
                          forInput="noHPPelanggan"
                          label="Nomor HP Pelanggan"
                          isRequired
                          value={formDataRef.current.noHPPelanggan}
                          onChange={handleInputChange}
                          errorMessage={errors.noHPPelanggan}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="text"
                          forInput="emailPelanggan"
                          label="Email Pelanggan"
                          value={formDataRef.current.emailPelanggan}
                          onChange={handleInputChange}
                          errorMessage={errors.emailPelanggan}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-light fw-bold">
                    Data Berkas Pendukung
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-4">
                        <FileUpload
                          forInput="berkasPenawaran"
                          label="Berkas Penawaran (.jpg, .png, .pdf, .zip)"
                          formatFile=".jpg,.png,.pdf,.zip"
                          ref={filePenawaranRef}
                          onChange={() =>
                            handleFileChange(
                              filePenawaranRef,
                              "jpg,png,pdf,zip"
                            )
                          }
                          errorMessage={errors.berkasPenawaran}
                        />
                      </div>
                      <div className="col-lg-4">
                        <FileUpload
                          forInput="berkasGambar"
                          label="Berkas Gambar (.jpg, .png, .pdf, .zip)"
                          formatFile=".jpg,.png,.pdf,.zip"
                          ref={fileGambarRef}
                          onChange={() =>
                            handleFileChange(fileGambarRef, "jpg,png,pdf,zip")
                          }
                          errorMessage={errors.berkasGambar}
                        />
                      </div>
                      <div className="col-lg-4">
                        <FileUpload
                          forInput="berkasLainnya"
                          label="Berkas Lainnya (.jpg, .png, .pdf, .zip)"
                          formatFile=".jpg,.png,.pdf,.zip"
                          ref={fileLainRef}
                          onChange={() =>
                            handleFileChange(fileLainRef, "jpg,png,pdf,zip")
                          }
                          errorMessage={errors.berkasLainnya}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-light fw-bold">
                    Daftar Permintaan Produk/Jasa
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-8">
                        <DropDown
                          forInput="namaProduk"
                          label="Nama Produk/Jasa"
                          showLabel={false}
                          arrData={listProduk}
                          ref={namaProdukRef}
                        />
                      </div>
                      <div className="col-lg-2 pb-2">
                        <Input
                          type="number"
                          forInput="jumlahProduk"
                          ref={jumlahProdukRef}
                          placeholder="Jumlah"
                        />
                      </div>
                      <div className="col-lg-2">
                        <Button
                          classType="success w-100"
                          iconName="add"
                          label="TAMBAH"
                          onClick={handleAddProduk}
                        />
                      </div>
                      <div className="col-lg-12">
                        <Table
                          data={dataProduk}
                          onDelete={handleDeleteProduk}
                        />
                      </div>
                    </div>
                  </div>
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
