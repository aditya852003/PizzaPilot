import type { MenuItem } from '@/lib/types';

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export const CATEGORIZED_MENU: MenuCategory[] = [
  {
    title: 'Veg Pizzas',
    items: [
      {
        id: 'margherita',
        name: 'Margherita',
        description: 'Classic delight with 100% real mozzarella cheese',
        price: 250,
        image: 'margherita-pizza',
        imageHint: 'margherita pizza',
        category: 'Veg Pizzas'
      },
      {
        id: 'veggie-supreme',
        name: 'Veggie Supreme',
        description: 'A garden-fresh delight with assorted veggies',
        price: 350,
        image: 'veggie-pizza',
        imageHint: 'veggie pizza',
        category: 'Veg Pizzas'
      },
      {
        id: 'paneer-tikka-pizza',
        name: 'Paneer Tikka Pizza',
        description: 'Spicy paneer tikka, onions, and capsicum on a cheesy crust.',
        price: 375,
        image: 'paneer-tikka-pizza',
        imageHint: 'paneer pizza',
        category: 'Veg Pizzas'
      },
      {
        id: 'farmhouse-pizza',
        name: 'Farmhouse Pizza',
        description: 'A medley of bell peppers, onions, tomatoes, and mushrooms.',
        price: 360,
        image: 'farmhouse-pizza',
        imageHint: 'farmhouse pizza',
        category: 'Veg Pizzas'
      }
    ],
  },
  {
    title: 'Non-Veg Pizzas',
    items: [
      {
        id: 'pepperoni',
        name: 'Pepperoni',
        description: 'A classic with zesty pepperoni and mozzarella',
        price: 400,
        image: 'pepperoni-pizza',
        imageHint: 'pepperoni pizza',
        category: 'Non-Veg Pizzas'
      },
      {
        id: 'hawaiian',
        name: 'Hawaiian',
        description: 'A tropical treat with ham, pineapple, and cheese',
        price: 420,
        image: 'hawaiian-pizza',
        imageHint: 'hawaiian pizza',
        category: 'Non-Veg Pizzas'
      },
      {
        id: 'chicken-supreme-pizza',
        name: 'Chicken Supreme',
        description: 'Grilled chicken, onions, bell peppers, and olives.',
        price: 450,
        image: 'chicken-supreme-pizza',
        imageHint: 'chicken pizza',
        category: 'Non-Veg Pizzas'
      },
      {
        id: 'bbq-chicken-pizza',
        name: 'BBQ Chicken Pizza',
        description: 'Smoky BBQ chicken, red onions, and cilantro.',
        price: 460,
        image: 'bbq-chicken-pizza',
        imageHint: 'bbq pizza',
        category: 'Non-Veg Pizzas'
      },
    ]
  },
  {
    title: 'Sides',
    items: [
      {
        id: 'garlic-bread',
        name: 'Garlic Bread',
        description: 'Warm and toasty garlic bread sticks',
        price: 150,
        image: 'garlic-bread',
        imageHint: 'garlic bread',
        category: 'Sides'
      },
      {
        id: 'cheese-garlic-bread',
        name: 'Cheese Garlic Bread',
        description: 'Garlic bread with a generous layer of melted cheese.',
        price: 180,
        image: 'cheese-garlic-bread',
        imageHint: 'cheesy bread',
        category: 'Sides'
      },
      {
        id: 'potato-wedges',
        name: 'Potato Wedges',
        description: 'Crispy, seasoned potato wedges.',
        price: 120,
        image: 'potato-wedges',
        imageHint: 'potato wedges',
        category: 'Sides'
      },
      {
        id: 'chicken-wings',
        name: 'BBQ Chicken Wings',
        description: 'Juicy chicken wings tossed in BBQ sauce.',
        price: 250,
        image: 'chicken-wings',
        imageHint: 'chicken wings',
        category: 'Sides'
      },
    ]
  },
  {
    title: 'Beverages',
    items: [
      {
        id: 'coke',
        name: 'Coca-Cola',
        description: 'A refreshing can of coke',
        price: 60,
        image: 'coke-can',
        imageHint: 'coca-cola can',
        category: 'Beverages'
      },
      {
        id: 'iced-tea',
        name: 'Iced Tea',
        description: 'Freshly brewed and chilled lemon iced tea.',
        price: 100,
        image: 'iced-tea',
        imageHint: 'iced tea',
        category: 'Beverages'
      },
      {
        id: 'mineral-water',
        name: 'Mineral Water',
        description: 'A bottle of pure mineral water.',
        price: 40,
        image: 'mineral-water',
        imageHint: 'water bottle',
        category: 'Beverages'
      }
    ]
  },
  {
    title: 'Desserts',
    items: [
      {
        id: 'choco-lava-cake',
        name: 'Choco Lava Cake',
        description: 'Decadent chocolate lava cake',
        price: 120,
        image: 'choco-lava-cake',
        imageHint: 'lava cake',
        category: 'Desserts'
      },
      {
        id: 'fudge-brownie',
        name: 'Fudge Brownie',
        description: 'Rich chocolate brownie with nuts.',
        price: 110,
        image: 'fudge-brownie',
        imageHint: 'chocolate brownie',
        category: 'Desserts'
      }
    ]
  },
  {
    title: 'Dips & Add-ons',
    items: [
      {
        id: 'extra-cheese',
        name: 'Extra Cheese',
        description: 'Double the cheesy goodness',
        price: 80,
        image: 'extra-cheese',
        imageHint: 'cheese topping',
        category: 'Dips & Add-ons'
      },
      {
        id: 'cheesy-dip',
        name: 'Cheesy Dip',
        description: 'A creamy, cheesy dip for your sides.',
        price: 40,
        image: 'cheesy-dip',
        imageHint: 'cheese dip',
        category: 'Dips & Add-ons'
      },
      {
        id: 'jalapenos',
        name: 'Jalapenos',
        description: 'Spicy sliced jalapenos to add a kick.',
        price: 50,
        image: 'jalapenos',
        imageHint: 'jalapeno peppers',
        category: 'Dips & Add-ons'
      }
    ]
  }
];

export const ALL_MENU_ITEMS: MenuItem[] = CATEGORIZED_MENU.flatMap(category => category.items);
