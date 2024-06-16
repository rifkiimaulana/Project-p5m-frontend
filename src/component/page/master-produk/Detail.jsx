import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterProdukDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    kodeProduk: "",
    namaProduk: "",
    jenisProduk: "",
    gambarProduk: "",
    spesifikasi: "",
    statusProduk: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "MasterProduk/DetailProduk", {
          id: withID,
        });

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

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Data Produk
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
              <Label
                forLabel="namaProduk"
                title="Nama Produk"
                data={formDataRef.current.namaProduk}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="jenisProduk"
                title="Jenis"
                data={formDataRef.current.jenisProduk}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="gambarProduk"
                title="Gambar Produk"
                data={
                  formDataRef.current.gambarProduk.replace("-", "") === "" ? (
                    "-"
                  ) : (
                    <a
                      href={FILE_LINK + formDataRef.current.gambarProduk}
                      className="text-decoration-none"
                      target="_blank"
                    >
                      Unduh berkas
                    </a>
                  )
                }
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="spesifikasi"
                title="Spesifikasi"
                data={formDataRef.current.spesifikasi}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="statusProduk"
                title="Status"
                data={formDataRef.current.statusProduk}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="float-end my-4 mx-1">
        <Button
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
