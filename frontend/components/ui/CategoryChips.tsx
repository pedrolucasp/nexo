import { Chip, ChipRow } from '@/components/ui/Chip';

export type CategoryOption<T extends string = string> = {
  label: string;
  value: T;
  icon: React.ReactNode;
  color?: string;
  iconBackground?: string;
};

type Props<T extends string = string> = {
  options: CategoryOption<T>[];
  active: T | null;
  onChange: (value: T) => void;
};

export function CategoryChips<T extends string = string>({
  options,
  active,
  onChange,
}: Props<T>) {
  return (
    <ChipRow>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          icon={option.icon}
          color={option.color}
          colorBackground={option.iconBackground}
          active={option.value === active}
          onPress={() => onChange(option.value)}
        />
      ))}
    </ChipRow>
  );
}
