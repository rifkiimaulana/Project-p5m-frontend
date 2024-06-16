import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterPelangganDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    kodePelanggan: "",
    namaPelanggan: "",
    alamatPelanggan: "",
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
    statusPelanggan: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterPelanggan/DetailPelanggan",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data pelanggan.");
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
          Detail Data Pelanggan
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-3">
              <Label
                forLabel="kodePelanggan"
                title="Kode Pelanggan"
                data={formDataRef.current.kodePelanggan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="namaPelanggan"
                title="Nama Pelanggan"
                data={formDataRef.current.namaPelanggan}
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="alamatPelanggan"
                title="Alamat Pelanggan"
                data={formDataRef.current.alamatPelanggan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="nomorTeleponPelanggan"
                title="Nomor HP/Telepon"
                data={formDataRef.current.nomorTeleponPelanggan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="faxPelanggan"
                title="Nomor Fax"
                data={formDataRef.current.faxPelanggan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="emailPelanggan"
                title="Email"
                data={formDataRef.current.emailPelanggan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="nomorNPWPPelanggan"
                title="Nomor NPWP"
                data={formDataRef.current.nomorNPWPPelanggan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="kontakPersonPenagihan"
                title="Contact Person Penagihan"
                data={formDataRef.current.kontakPersonPenagihan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="emailPenagihan"
                title="Email Penagihan"
                data={formDataRef.current.emailPenagihan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="kontakPersonPajak"
                title="Contact Person Pajak"
                data={formDataRef.current.kontakPersonPajak}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="emailPajak"
                title="Email Pajak"
                data={formDataRef.current.emailPajak}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="berkasNPWPPelanggan"
                title="Berkas NPWP"
                data={
                  formDataRef.current.berkasNPWPPelanggan.replace("-", "") ===
                  "" ? (
                    "-"
                  ) : (
                    <a
                      href={FILE_LINK + formDataRef.current.berkasNPWPPelanggan}
                      className="text-decoration-none"
                      target="_blank"
                    >
                      Unduh berkas
                    </a>
                  )
                }
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="berkasSPPKPPelanggan"
                title="Berkas SPPKP"
                data={
                  formDataRef.current.berkasSPPKPPelanggan.replace("-", "") ===
                  "" ? (
                    "-"
                  ) : (
                    <a
                      href={
                        FILE_LINK + formDataRef.current.berkasSPPKPPelanggan
                      }
                      className="text-decoration-none"
                      target="_blank"
                    >
                      Unduh berkas
                    </a>
                  )
                }
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="berkasSKTPelanggan"
                title="Berkas SKT"
                data={
                  formDataRef.current.berkasSKTPelanggan.replace("-", "") ===
                  "" ? (
                    "-"
                  ) : (
                    <a
                      href={FILE_LINK + formDataRef.current.berkasSKTPelanggan}
                      className="text-decoration-none"
                      target="_blank"
                    >
                      Unduh berkas
                    </a>
                  )
                }
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="berkasLainPelanggan"
                title="Berkas Lainnya"
                data={
                  formDataRef.current.berkasLainPelanggan.replace("-", "") ===
                  "" ? (
                    "-"
                  ) : (
                    <a
                      href={FILE_LINK + formDataRef.current.berkasLainPelanggan}
                      className="text-decoration-none"
                      target="_blank"
                    >
                      Unduh berkas
                    </a>
                  )
                }
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="statusPelanggan"
                title="Status"
                data={formDataRef.current.statusPelanggan}
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
