export default function Icon({
  type = "Reguler",
  name,
  cssClass = "",
  ...props
}) {
  const iconClass =
    "fi fi-" + (type === "Bold" ? "b" : "r") + "r-" + name + " " + cssClass;

  return <i className={iconClass} {...props}></i>;
}
