// file: app/admin/components/StatsCard.tsx

type Props = {
  title: string;
  value: number;
};

export default function StatsCard({ title, value }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}