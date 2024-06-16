import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import Swal from 'sweetalert2';

const initialData = [
  {
    Key: null,
    No: null,
    "Username": null,
    "Nama PIC": null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Username] asc", Text: "Username Pic [↑]" },
  { Value: "[Username] desc", Text: "Username Pic [↓]" },
  { Value: "[Nama Pic] asc", Text: "Nama Pic [↑]" },
  { Value: "[Nama Pic] desc", Text: "Nama Pic [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterPicIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Username] asc",
    status: "Aktif",
  });

  const searchQuery = useRef("");
  const searchFilterSort = useRef("[Username] asc");
  const searchFilterStatus = useRef("Aktif");

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sort: searchFilterSort.current.value,
      status: searchFilterStatus.current.value,
    }));
  }

  function handleSetStatus(id) {
    // Tampilkan pesan konfirmasi dengan SweetAlert
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda tidak akan dapat mengembalikan ini!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        setIsError(false);
        UseFetch(API_LINK + "MasterPic/SetStatusPic", {
          idPic: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              // Tampilkan pesan sukses dengan SweetAlert
              Swal.fire(
                "Sukses",
                "Status data pic berhasil diubah menjadi " + data[0].Status,
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }
  
  
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      
      try {
        const data = await UseFetch(API_LINK + "MasterPic/GetDataPic", currentFilter);
  
        //console.log(data); 
  
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setCurrentData(initialData);
        } else if (typeof data === "string" && data === "ERROR") {
          setIsError(true);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Aksi: ["Toggle", "Detail", "Edit"],   //ini juga "Toggle" ganti jadi Delete
            //Aksi: ["Delete", "Detail", "Edit"],   //ini juga "Toggle" ganti jadi Delete
            Alignment: ["center", "left", "left", "center"],
          }));
          setCurrentData(formattedData);
        }
      } catch (error) {
        console.error("Fetch error: ", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentFilter]);
  

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data pic."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Button
              iconName="add"
              classType="success"
              label="Tambah"
              onClick={() => onChangePage("add")}
            />
            <Input
              ref={searchQuery}
              forInput="pencarianPic"
              placeholder="Cari"
            />
            <Button
              iconName="search"
              classType="primary px-4"
              title="Cari"
              onClick={handleSearch}
            />
            <Filter>
              <DropDown
                ref={searchFilterSort}
                forInput="ddUrut"
                label="Urut Berdasarkan"
                type="none"
                arrData={dataFilterSort}
                defaultValue="[Nama Pic] asc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="none"
                arrData={dataFilterStatus}
                defaultValue="Aktif"
              />
            </Filter>
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                //ini on-Toggle diubah jadi onDelete
                onToggle={handleSetStatus}
                onDetail={onChangePage}
                onEdit={onChangePage}
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData.length > 0 ? currentData[0].Count : 0}
                navigation={handleSetCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}