
import { Restaurant } from './types';

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'boketto',
    name: 'Boketto',
    cuisine: 'Healthy Fusion',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200',
    description: 'Mindful eating meets exquisite flavors.',
    menu: [
      {
        id: 'p1',
        name: 'Grilled Paneer Tikka',
        description: 'Tender paneer cubes marinated in heirloom spices and grilled over charcoal.',
        price: 240,
        category: 'High Protein',
        image: 'https://images.unsplash.com/photo-1567184109171-969977ec308f?q=80&w=400',
        kcal: 634,
        macros: { protein: 25, carb: 13, fat: 52 },
        tags: ['Rich Calcium', 'Gluten Free'],
        isVegetarian: true,
        isBestSeller: true
      },
      {
        id: 'p2',
        name: 'Quinoa Buddha Bowl',
        description: 'Organic white quinoa, roasted chickpeas, avocado, kale, and lemon tahini dressing.',
        price: 320,
        category: 'Low Kcal',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400',
        kcal: 412,
        macros: { protein: 18, carb: 45, fat: 12 },
        tags: ['High Fiber', 'Vegan'],
        isVegetarian: true,
        isGlutenFree: true
      },
      {
        id: 'p3',
        name: 'Avocado Chicken Salad',
        description: 'Lean grilled chicken breast with Hass avocado, pumpkin seeds, and mixed citrus greens.',
        price: 380,
        category: 'High Protein',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
        kcal: 520,
        macros: { protein: 42, carb: 8, fat: 28 },
        tags: ['Keto Friendly'],
        isGlutenFree: true
      },
      {
        id: 'p4',
        name: 'Zucchini Zoodles',
        description: 'Spiralized zucchini with walnut pesto, cherry tomatoes, and vegan parmesan.',
        price: 290,
        category: 'Vegan',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=400',
        kcal: 280,
        macros: { protein: 12, carb: 14, fat: 22 },
        tags: ['Low Carb', 'Vegan'],
        isVegetarian: true,
        isGlutenFree: true
      }
    ]
  }
];
