export interface Fruit {
  id: number;
  name: string;
  type: string;
  price: number;
  image: string;
  description: string;
}

export interface CartItem {
  fruit: Fruit;
  quantity: number;
}
