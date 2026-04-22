export interface Order {
  id: string;
  date: string;
  total: number;
  status?: string;
  customer?: string;
}

