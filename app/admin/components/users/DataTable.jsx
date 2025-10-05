import EmptyState from './EmptyState';

export default function DataTable({ data, columns, emptyMessage }) {
    if (!data || data.length === 0) {
        return <EmptyState message={emptyMessage} />;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm shadow-lg">
            <table className="w-full text-sm text-gray-300">
                {/* Table Head */}
                <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-900/80">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-4 py-3 text-left font-medium text-gray-400 tracking-wide ${column.center ? "text-center" : ""
                                    }`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={item.id || index}
                            className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={`px-4 py-3 ${column.center ? "text-center" : "text-left"
                                        }`}
                                >
                                    {column.render ? column.render(item) : item[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}