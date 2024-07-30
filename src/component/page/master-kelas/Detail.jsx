import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";  // Menghapus FILE_LINK karena tidak digunakan
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterKelasDetail({ onChangePage, withID }) {
    const [isError, setIsError] = useState({ error: false, message: "" });
    const [isLoading, setIsLoading] = useState(true);
  
    const formDataRef = useRef({
      idKelas: "",
      nama: "",
      namaPic: "",
    });
  
    useEffect(() => {
      const fetchData = async () => {
        setIsError((prevError) => ({ ...prevError, error: false }));
  
        try {
          const data = await UseFetch(API_LINK + "MasterKelas/DetailKelas", {
            id: withID,
          });
  
          if (data === "ERROR" || data.length === 0) {
            throw new Error("Terjadi kesalahan: Gagal mengambil data Kelas.");
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
        {/* {isError.error && (
          <div className="flex-fill">
            <Alert type="danger" message={isError.message} />
          </div>
        )} */}
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Detail Data Kelas
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
              <Label
                  forLabel="nama"
                  title="Kelas"
                  data={formDataRef.current.nama}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="namaPic"
                  title="Nama PIC"
                  data={formDataRef.current.namaPic}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="statusPic"
                  title="Status"
                  data={formDataRef.current.status}
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
