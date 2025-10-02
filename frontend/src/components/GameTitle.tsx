export default function GameTitle({ title }: { title: string }) {
  return (
    <h2 className="text-xl font-bold truncate">{title}</h2>
  );
}
