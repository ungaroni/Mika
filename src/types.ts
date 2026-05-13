export type Gift = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  buy_link: string | null;
  note: string | null;
  claimed_by: string | null;
  created_at: string;
};

export type GiftInput = Omit<Gift, 'id' | 'created_at'>;
