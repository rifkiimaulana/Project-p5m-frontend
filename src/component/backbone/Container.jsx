import ContentBody from "./ContentBody";
import ContentTitle from "./ContentTitle";

export default function Container({ children }) {
  return (
    <div className="flex-fill p-3 d-flex flex-column responsiveContainer">
      <ContentTitle />
      <ContentBody>{children}</ContentBody>
    </div>
  );
}
