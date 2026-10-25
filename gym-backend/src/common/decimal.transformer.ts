import { ValueTransformer } from 'typeorm';

// Postgres returns decimal columns as strings ("80.5"). Keep them as numbers in the API.
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null) => (value === null || value === undefined ? value : Number(value)),
};
