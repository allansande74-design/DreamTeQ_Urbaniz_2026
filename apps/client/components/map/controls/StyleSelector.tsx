"use client";

type Props = {
  value: string;
  onChange: (style: string) => void;
};

export default function StyleSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 999,
        padding: 8,
        borderRadius: 6
      }}
    >
      <option value="Streets">?? Streets</option>
      <option value="Bright">? Bright</option>
    </select>
  );
}
