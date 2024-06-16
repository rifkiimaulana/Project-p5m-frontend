import { useRef, useState } from "react";
import { object, string } from "yup";
import Cookies from "js-cookie";
import { API_LINK, APPLICATION_NAME } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { encryptId } from "../../util/Encryptor";
import logo from "../../../assets/IMG_Logo.png";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Modal from "../../part/Modal";

export default function Login() {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listRole, setListRole] = useState([]);

  const formDataRef = useRef({
    username: "",
    password: "",
  });

  const modalRef = useRef();

  const userSchema = object({
    username: string().max(50, "maksimum 50 karakter").required("harus diisi"),
    password: string().required("harus diisi"),
  });

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
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "Utilities/Login",
          formDataRef.current
        );

        if (data === "ERROR")
          throw new Error("Terjadi kesalahan: Gagal melakukan autentikasi.");
        else if (data.Status && data.Status === "LOGIN FAILED")
          throw new Error("Nama akun atau kata sandi salah.");
        else {
          setListRole(data);
          modalRef.current.open();
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

  function handleLoginWithRole(role, nama, peran) {
    const userInfo = {
      username: formDataRef.current.username,
      role: role,
      nama: nama,
      peran: peran,
    };
    let user = encryptId(JSON.stringify(userInfo));
    Cookies.set("activeUser", user, { expires: 1 });
    window.location.href = "/";
  }

  if (Cookies.get("activeUser")) window.location.href = "/";
  else {
    return (
      <>
        {isLoading && <Loading />}
        {isError.error && (
          <div className="flex-fill m-3">
            <Alert type="danger" message={isError.message} />
          </div>
        )}
        <Modal title="Pilih Peran" ref={modalRef} size="small">
          <div className="list-group">
            {listRole.map((value, index) => {
              return (
                <button
                  key={index}
                  type="button"
                  className="list-group-item list-group-item-action"
                  aria-current="true"
                  onClick={() =>
                    handleLoginWithRole(value.RoleID, value.Nama, value.Role)
                  }
                >
                  Login sebagai {value.Role}
                </button>
              );
            })}
          </div>
        </Modal>
        <form onSubmit={handleAdd}>
          <div
            className="container-fluid d-flex justify-content-center align-items-center"
            style={{ height: "70vh" }}
          >
            <div
              className="card w-50"
              style={{ minWidth: "360px", maxWidth: "500px" }}
            >
              <div className="card-body p-4 text-center">
                <img
                  src={logo}
                  alt="Logo AstraTech"
                  className="w-100 px-4 py-4"
                />
                <p className="lead fw-medium fs-5 text-nowrap">
                  {APPLICATION_NAME.toUpperCase()}
                </p>
                <div style={{ textAlign: "left" }}>
                  <div className="py-2 px-1">
                    <Input
                      type="text"
                      forInput="username"
                      placeholder="Nama Akun"
                      isRequired
                      value={formDataRef.current.username}
                      onChange={handleInputChange}
                      errorMessage={errors.username}
                    />
                  </div>
                  <div className="py-2 px-1">
                    <Input
                      type="password"
                      forInput="password"
                      placeholder="Kata Sandi"
                      isRequired
                      value={formDataRef.current.password}
                      onChange={handleInputChange}
                      errorMessage={errors.password}
                    />
                  </div>
                  <Button
                    classType="primary my-3 w-100"
                    type="submit"
                    label="MASUK"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="fixed-bottom p-3 text-center bg-white">
            Copyright &copy; 2024 - PSI Politeknik Astra
          </div>
        </form>
      </>
    );
  }
}
