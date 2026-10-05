import type { TreklySelectOption } from './TreklySelect';

export type TreklyPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const TREKLY_PRIORITY_OPTIONS: TreklySelectOption<TreklyPriority>[] = [
  { value: 'LOW', label: 'Low', indicatorClassName: 'bg-[#8fb69a]' },
  { value: 'MEDIUM', label: 'Medium', indicatorClassName: 'bg-[#ffc93c]' },
  { value: 'HIGH', label: 'High', indicatorClassName: 'bg-[#f29a63]' },
  { value: 'URGENT', label: 'Urgent', indicatorClassName: 'bg-[#d87878]' },
];
