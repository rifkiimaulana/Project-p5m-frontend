import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterProsesDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    namaProses: "",
    //modul: "",
    deskripsi: "",
    statusProses: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "MasterProses/DetailProses", {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data proses.");
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
          Detail Data Proses
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-3">
              <Label
                forLabel="namaProses"
                title="Nama Kelas"
                data={formDataRef.current.namaProses}
              />
            </div>
            {/* <div className="col-lg-3">
              <Label
                forLabel="modul"
                title="Modul"
                data={
                  formDataRef.current.modul.replace("-", "") === "" ? (
                    "-"
                  ) : (
                    <a
                      href={FILE_LINK + formDataRef.current.modul}
                      className="text-decoration-none"
                      target="_blank"
                    >
                      Unduh berkas
                    </a>
                  )
                }
              />
            </div> */}
            {/* <div className="col-lg-6">
              <Label
                forLabel="deskripsi"
                title="Deskripsi"
                data={formDataRef.current.deskripsi}
              />
            </div> */}
            <div className="col-lg-3">
              <Label
                forLabel="statusProses"
                title="Status"
                data={formDataRef.current.statusProses}
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
