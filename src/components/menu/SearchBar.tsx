type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="ub-search">
      <input
        type="text"
        value={value}
        placeholder="Search dishes..."
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
