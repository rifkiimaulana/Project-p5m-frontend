import Button from "./Button";

export default function Paging({
  pageSize,
  pageCurrent,
  totalData,
  navigation,
}) {
  function generatePageButton(pageSize, pageCurrent, totalData) {
    let totalPage = Math.ceil(totalData / pageSize);
    let segmentPage = Math.ceil(pageCurrent / 10);
    let maxSegmentPage = Math.ceil(totalPage / 10);
    let endPage = segmentPage * 10 > totalPage ? totalPage : segmentPage * 10;
    let pageButton = [];

    if (totalPage > 10 && pageCurrent > 10) {
      pageButton.push(
        <Button
          key={"PageForwardPrev"}
          label="<<"
          classType="light border"
          onClick={() => navigation(1)}
        />
      );
      pageButton.push(
        <Button
          key={"PagePrev"}
          label="..."
          classType="light border"
          onClick={() => navigation((segmentPage - 1) * 10)}
        />
      );
    }
    for (let i = 1 + (segmentPage - 1) * 10; i <= endPage; i++) {
      pageButton.push(
        <Button
          key={"Page" + i}
          label={i}
          classType={pageCurrent === i ? "primary" : "light border"}
          onClick={() => navigation(i)}
        />
      );
    }
    if (totalPage > 10 && segmentPage < maxSegmentPage) {
      pageButton.push(
        <Button
          key={"PageNext"}
          label="..."
          classType="light border"
          onClick={() => navigation(segmentPage * 10 + 1)}
        />
      );
      pageButton.push(
        <Button
          key={"PageForwardNext"}
          label=">>"
          classType="light border"
          onClick={() => navigation(totalPage)}
        />
      );
    }

    return pageButton;
  }

  return (
    <div>
      <div className="input-group">
        {generatePageButton(pageSize, pageCurrent, totalData)}
      </div>
    </div>
  );
}
