import { Injectable, signal, computed } from '@angular/core';
import { Fruit } from '../models/fruit';

@Injectable({
  providedIn: 'root',
})
export class FruitService {
  private readonly fruits = signal<Fruit[]>([
    // Pome Fruits
    { id: 1, name: 'Apple', type: 'Pome', price: 2.99, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2uj38?w=300&h=300&fit=crop', description: 'Crispy and sweet red apples' },
    { id: 2, name: 'Pear', type: 'Pome', price: 2.79, image: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=300&h=300&fit=crop', description: 'Juicy and tender pears' },

    // Tropical Fruits
    { id: 3, name: 'Banana', type: 'Tropical', price: 1.49, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', description: 'Fresh yellow bananas' },
    { id: 4, name: 'Mango', type: 'Tropical', price: 3.49, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop', description: 'Sweet and ripe mangoes' },
    { id: 5, name: 'Pineapple', type: 'Tropical', price: 4.49, image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&h=300&fit=crop', description: 'Fresh tropical pineapple' },
    { id: 6, name: 'Kiwi', type: 'Tropical', price: 2.79, image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=300&h=300&fit=crop', description: 'Tangy green kiwis' },
    { id: 7, name: 'Papaya', type: 'Tropical', price: 3.99, image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=300&h=300&fit=crop', description: 'Soft and sweet papaya' },
    { id: 8, name: 'Coconut', type: 'Tropical', price: 3.49, image: 'https://images.unsplash.com/photo-1580984969071-a8da8c6f0659?w=300&h=300&fit=crop', description: 'Fresh tropical coconut' },
    { id: 9, name: 'Passion Fruit', type: 'Tropical', price: 5.49, image: 'https://images.unsplash.com/photo-1604495772376-9657f0035eb5?w=300&h=300&fit=crop', description: 'Exotic and tangy passion fruit' },
    { id: 10, name: 'Dragon Fruit', type: 'Tropical', price: 5.99, image: 'https://images.unsplash.com/photo-1527325678964-54b2641845e9?w=300&h=300&fit=crop', description: 'Vibrant and mildly sweet dragon fruit' },
    { id: 11, name: 'Guava', type: 'Tropical', price: 3.29, image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=300&h=300&fit=crop', description: 'Aromatic and crunchy guava' },

    // Berry Fruits
    { id: 12, name: 'Strawberry', type: 'Berry', price: 4.99, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop', description: 'Juicy red strawberries' },
    { id: 13, name: 'Blueberry', type: 'Berry', price: 5.99, image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300&h=300&fit=crop', description: 'Plump and fresh blueberries' },
    { id: 14, name: 'Grapes', type: 'Berry', price: 3.99, image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300&h=300&fit=crop', description: 'Sweet seedless grapes' },
    { id: 15, name: 'Raspberry', type: 'Berry', price: 5.49, image: 'https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?w=300&h=300&fit=crop', description: 'Delicate and tart raspberries' },
    { id: 16, name: 'Blackberry', type: 'Berry', price: 5.79, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=300&fit=crop', description: 'Dark and juicy blackberries' },
    { id: 17, name: 'Cranberry', type: 'Berry', price: 4.29, image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=300&h=300&fit=crop', description: 'Tart and tangy cranberries' },

    // Citrus Fruits
    { id: 18, name: 'Orange', type: 'Citrus', price: 2.49, image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop', description: 'Tangy and juicy oranges' },
    { id: 19, name: 'Lemon', type: 'Citrus', price: 1.99, image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300&h=300&fit=crop', description: 'Zesty fresh lemons' },
    { id: 20, name: 'Lime', type: 'Citrus', price: 1.79, image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300&h=300&fit=crop', description: 'Fresh tangy limes' },
    { id: 21, name: 'Grapefruit', type: 'Citrus', price: 2.99, image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=300&h=300&fit=crop', description: 'Bittersweet pink grapefruit' },

    // Melon
    { id: 22, name: 'Watermelon', type: 'Melon', price: 6.99, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop', description: 'Refreshing sweet watermelon' },
    { id: 23, name: 'Cantaloupe', type: 'Melon', price: 4.99, image: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=300&h=300&fit=crop', description: 'Sweet and fragrant cantaloupe' },
    { id: 24, name: 'Honeydew', type: 'Melon', price: 5.49, image: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=300&h=300&fit=crop', description: 'Smooth and sweet honeydew melon' },

    // Stone Fruits
    { id: 25, name: 'Peach', type: 'Stone', price: 3.29, image: 'https://images.unsplash.com/photo-1629226182927-35e8f0744ac3?w=300&h=300&fit=crop', description: 'Soft and sweet peaches' },
    { id: 26, name: 'Cherry', type: 'Stone', price: 6.49, image: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=300&h=300&fit=crop', description: 'Deep red sweet cherries' },
    { id: 27, name: 'Plum', type: 'Stone', price: 3.49, image: 'https://images.unsplash.com/photo-1605282003000-02fcba8dd1b1?w=300&h=300&fit=crop', description: 'Purple and juicy plums' },
    { id: 28, name: 'Apricot', type: 'Stone', price: 4.29, image: 'https://images.unsplash.com/photo-1592681814168-6df0fa93161b?w=300&h=300&fit=crop', description: 'Golden and velvety apricots' },

    // Leafy Vegetables
    { id: 29, name: 'Spinach', type: 'Leafy Vegetable', price: 2.49, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop', description: 'Fresh and nutritious spinach leaves' },
    { id: 30, name: 'Lettuce', type: 'Leafy Vegetable', price: 1.99, image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop', description: 'Crispy iceberg lettuce' },
    { id: 31, name: 'Kale', type: 'Leafy Vegetable', price: 2.99, image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=300&h=300&fit=crop', description: 'Nutrient-rich curly kale' },
    { id: 32, name: 'Cabbage', type: 'Leafy Vegetable', price: 1.79, image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300&h=300&fit=crop', description: 'Fresh green cabbage head' },

    // Root Vegetables
    { id: 33, name: 'Carrot', type: 'Root Vegetable', price: 1.49, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop', description: 'Crunchy orange carrots' },
    { id: 34, name: 'Potato', type: 'Root Vegetable', price: 1.29, image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber40?w=300&h=300&fit=crop', description: 'Versatile fresh potatoes' },
    { id: 35, name: 'Onion', type: 'Root Vegetable', price: 0.99, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop', description: 'Pungent and flavorful onions' },
    { id: 36, name: 'Beetroot', type: 'Root Vegetable', price: 2.49, image: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=300&h=300&fit=crop', description: 'Earthy and vibrant beetroot' },
    { id: 37, name: 'Radish', type: 'Root Vegetable', price: 1.49, image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=300&h=300&fit=crop', description: 'Peppery fresh radishes' },
    { id: 38, name: 'Ginger', type: 'Root Vegetable', price: 3.99, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=300&fit=crop', description: 'Aromatic fresh ginger root' },
    { id: 39, name: 'Sweet Potato', type: 'Root Vegetable', price: 1.99, image: 'https://images.unsplash.com/photo-1596097635092-6e7e9e1f5b78?w=300&h=300&fit=crop', description: 'Sweet and starchy sweet potatoes' },

    // Gourd & Squash
    { id: 40, name: 'Cucumber', type: 'Gourd & Squash', price: 1.29, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&h=300&fit=crop', description: 'Cool and refreshing cucumbers' },
    { id: 41, name: 'Pumpkin', type: 'Gourd & Squash', price: 3.99, image: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=300&h=300&fit=crop', description: 'Bright orange pumpkin' },
    { id: 42, name: 'Zucchini', type: 'Gourd & Squash', price: 2.29, image: 'https://images.unsplash.com/photo-1563252722-6434563a985d?w=300&h=300&fit=crop', description: 'Tender green zucchini' },
    { id: 43, name: 'Bitter Gourd', type: 'Gourd & Squash', price: 2.49, image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=300&h=300&fit=crop', description: 'Healthful bitter gourd' },
    { id: 44, name: 'Bottle Gourd', type: 'Gourd & Squash', price: 1.99, image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=300&h=300&fit=crop', description: 'Light and mild bottle gourd' },

    // Nightshade Vegetables
    { id: 45, name: 'Tomato', type: 'Nightshade', price: 1.99, image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300&h=300&fit=crop', description: 'Ripe red tomatoes' },
    { id: 46, name: 'Bell Pepper', type: 'Nightshade', price: 2.99, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&h=300&fit=crop', description: 'Colorful and crunchy bell peppers' },
    { id: 47, name: 'Eggplant', type: 'Nightshade', price: 2.49, image: 'https://images.unsplash.com/photo-1528826007177-f38517ce9a8c?w=300&h=300&fit=crop', description: 'Glossy purple eggplant' },
    { id: 48, name: 'Chili Pepper', type: 'Nightshade', price: 1.99, image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=300&h=300&fit=crop', description: 'Hot and spicy chili peppers' },

    // Cruciferous Vegetables
    { id: 49, name: 'Broccoli', type: 'Cruciferous', price: 2.99, image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300&h=300&fit=crop', description: 'Nutrient-packed broccoli florets' },
    { id: 50, name: 'Cauliflower', type: 'Cruciferous', price: 2.79, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2uj38?w=300&h=300&fit=crop', description: 'Fresh white cauliflower' },
    { id: 51, name: 'Brussels Sprouts', type: 'Cruciferous', price: 3.49, image: 'https://images.unsplash.com/photo-1438118907704-7718ee9a191a?w=300&h=300&fit=crop', description: 'Mini cabbage-like Brussels sprouts' },

    // Legume Vegetables
    { id: 52, name: 'Green Beans', type: 'Legume', price: 2.49, image: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae9a0a0?w=300&h=300&fit=crop', description: 'Tender and fresh green beans' },
    { id: 53, name: 'Peas', type: 'Legume', price: 2.99, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop', description: 'Sweet green peas' },
    { id: 54, name: 'Okra', type: 'Legume', price: 2.29, image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=300&h=300&fit=crop', description: 'Fresh green okra pods' },
    { id: 55, name: 'Corn', type: 'Legume', price: 1.49, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop', description: 'Sweet and golden corn on the cob' },

    // Allium Vegetables
    { id: 56, name: 'Garlic', type: 'Allium', price: 1.99, image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2a85?w=300&h=300&fit=crop', description: 'Pungent and aromatic garlic bulbs' },
    { id: 57, name: 'Spring Onion', type: 'Allium', price: 1.49, image: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=300&h=300&fit=crop', description: 'Mild and fresh spring onions' },
    { id: 58, name: 'Leek', type: 'Allium', price: 2.29, image: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=300&h=300&fit=crop', description: 'Subtle and versatile leeks' },

    // Mushrooms
    { id: 59, name: 'Button Mushroom', type: 'Mushroom', price: 3.49, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop', description: 'Mild and tender button mushrooms' },
    { id: 60, name: 'Shiitake Mushroom', type: 'Mushroom', price: 5.99, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop', description: 'Rich and earthy shiitake mushrooms' },
  ]);

  readonly allFruits = this.fruits.asReadonly();

  readonly types = computed(() => {
    const all = this.fruits();
    return ['All', ...new Set(all.map(f => f.type))];
  });

  search(query: string, type: string): Fruit[] {
    let results = this.fruits();
    if (type && type !== 'All') {
      results = results.filter(f => f.type === type);
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
      );
    }
    return results;
  }
}
