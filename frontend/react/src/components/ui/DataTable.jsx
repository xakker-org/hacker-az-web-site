import "./DataTable.css";

export default function DataTable({ columns = [], data = [], rowKey, highlightRow, onRowClick, sortKey, onSort }) {
  return (
    <div className="dt-wrap">
      <table className="dt">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align || "left" }}
                className={`${col.sortable ? "dt-sortable" : ""}${sortKey === col.key ? " is-sorted" : ""}`}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <span className="dt-th">
                  {col.header}
                  {col.sortable && <span className="dt-sort-mark">↕</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr><td colSpan={columns.length} className="dt-empty">No data</td></tr>
          )}
          {data.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row, i) : i}
              className={highlightRow && highlightRow(row, i) ? "is-me" : ""}
              onClick={onRowClick ? () => onRowClick(row, i) : undefined}
              style={onRowClick ? { cursor: "pointer" } : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || "left" }}>
                  {col.render ? col.render(row, i) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
