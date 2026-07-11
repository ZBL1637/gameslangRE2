import React from 'react';
import './AccessibleChartTable.scss';

export interface AccessibleChartRow {
  id: string;
  label: string;
  values: string[];
}

interface AccessibleChartTableProps {
  title: string;
  columns: string[];
  rows: AccessibleChartRow[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export const AccessibleChartTable: React.FC<AccessibleChartTableProps> = ({
  title,
  columns,
  rows,
  selectedId,
  onSelect,
}) => (
  <details className="chart-data-table">
    <summary>查看{title}数据表</summary>
    <div className="chart-table-scroll" tabIndex={0}>
      <table>
        <caption>{title}（游戏化示意）</caption>
        <thead>
          <tr>
            <th scope="col">项目</th>
            {columns.map(column => <th scope="col" key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <th scope="row">
                {onSelect ? (
                  <button
                    type="button"
                    aria-pressed={selectedId === row.id}
                    onClick={() => onSelect(row.id)}
                  >
                    {row.label}
                  </button>
                ) : row.label}
              </th>
              {row.values.map((value, index) => <td key={`${row.id}-${columns[index]}`}>{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
);
