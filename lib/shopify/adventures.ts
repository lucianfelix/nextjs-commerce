import { AdventureClient } from '../cf/adventures';
import { Cart } from './types';

import { Money, Product, ProductVariant, SEO, Image, ProductOption } from './types';

const baseImagePath = 'https://publish-p64257-e147834-cmstg.adobeaemcloud.com/';

import { cache } from 'react';

export const revalidate = 43200;

export const getAllAdventures = cache(async () => {
  const client: AdventureClient = AdventureClient.fromEnv();
  //time the call
  const start = Date.now();
  const res = await client.getAllAdventures();
  const end = Date.now();
  console.log(`getAllAdventures took ${end - start} ms`);
  const adventures = res?.data?.adventureList?.items || [];
  return adventures;
});

export const getAdventureByName = cache(async (name: string) => {
  const client: AdventureClient = AdventureClient.fromEnv();
  //time the call
  const start = Date.now();
  const res = await client.getAdventureByPath(name);
  const end = Date.now();
  console.log(`getAdventureByPath(${name}) took ${end - start} ms`);
  const adventure = res?.data?.adventureByPath?.item || [];
  return adventure;
});

export async function getStaticCart(): Promise<Cart> {
  const mockShopifyProduct = (await getAdventureProducts())[0] as Product;
  const mockCartItem = {
    id: 'item1',
    quantity: 1,
    cost: {
      totalAmount: {
        amount: '100.00',
        currencyCode: 'USD'
      }
    },
    merchandise: {
      id: 'merchandise1',
      title: 'WKND Adventure',
      selectedOptions: [
        {
          name: 'Duration',
          value: 'Normal'
        }
      ],
      product: mockShopifyProduct
    }
  };

  const cart = {
    id: 'cart1',
    checkoutUrl: 'https://example.com/checkout',
    cost: {
      subtotalAmount: {
        amount: '90.00',
        currencyCode: 'USD'
      },
      totalAmount: {
        amount: '100.00',
        currencyCode: 'USD'
      },
      totalTaxAmount: {
        amount: '10.00',
        currencyCode: 'USD'
      }
    },
    lines: [mockCartItem],
    totalQuantity: 1
  };

  return cart;
}

export function transformToProduct(adventure: any): Product {
  const id = adventure._path; // Assuming the _path is unique enough to serve as an ID
  const handle = id.split('/').pop() || ''; // Extracting the last part of the _path
  const priceParts = adventure.price.split(' ');

  const price: Money = {
    amount: priceParts[0].substring(1), // Removing the dollar sign
    currencyCode: priceParts[1]
  };

  const variant: ProductVariant = {
    id,
    title: adventure.title,
    availableForSale: true, // We're assuming that all adventures are available for sale
    selectedOptions: [
      { name: 'Stay Duration', value: 'Normal' },
      { name: 'Group Size', value: 'Normal' }
    ],
    price
  };

  const groupSizeValues = ['Small', 'Normal', 'Large'];
  const durationValues = ['Short', 'Normal', 'Extended Stay'];

  const variants: ProductVariant[] = [];

  const groupSizeProductOption = {
    id: 'groupSizeProductOption',
    name: 'Group Size',
    values: ['Small', 'Normal', 'Large']
  };

  const durationProductOption = {
    id: 'durationProductOption',
    name: 'Stay Duration',
    values: ['Short', 'Normal', 'Extended Stay']
  };

  groupSizeValues.forEach((groupSize) => {
    durationValues.forEach((duration) => {
      variants.push({
        id: `${id}-${groupSize}-${duration}-variant`,
        title: `${groupSize} / ${duration}`,
        availableForSale: true, // We're assuming that all adventures are available for sale
        selectedOptions: [
          { name: 'Group Size', value: groupSize },
          { name: 'Stay Duration', value: duration }
        ],
        price: {
          amount:
            priceParts[0].substring(1) +
            (groupSize === 'Small' ? -100 : groupSize === 'Large' ? 600 : 0) +
            (duration === 'Short' ? -100 : duration === 'Extended Stay' ? 700 : 0),
          currencyCode: priceParts[1]
        }
      });
    });
  });

  const product: Product = {
    id,
    handle,
    availableForSale: true,
    title: adventure.title,
    description: adventure.description.html,
    descriptionHtml: adventure.itinerary.html,
    options: [groupSizeProductOption, durationProductOption],
    priceRange: {
      maxVariantPrice: price,
      minVariantPrice: price
    },
    featuredImage: {
      url: baseImagePath + adventure.primaryImage._path,
      // originalSrc: adventure.primaryImage._path,
      altText: adventure.title,
      width: adventure.primaryImage.width,
      height: adventure.primaryImage.height
    },
    images: [],
    seo: {
      title: adventure.title,
      description: adventure.description.html
    },
    tags: [],
    variants: variants,
    updatedAt: new Date().toISOString()
  };

  product.variants.push(variant);
  product.images.push(product.featuredImage);

  return product;
}

// export const adventureProducts: Product[] = adventures.map(transformToProduct) as Product[];

export async function getAdventureProducts() {
  const adventures = await getAllAdventures();
  const products = adventures.map(transformToProduct) as Product[];
  return products;
}

export async function getProductByHandle(handle: string) {
  const cfPath = `/content/dam/aem-demo-assets/en/adventures/${handle}/${handle}`;
  const adventureProduct = await getAdventureByName(cfPath);
  return transformToProduct(adventureProduct);
}

export async function getProductsByKeyword(keyword: string | undefined) {
  const adventureProducts = await getAdventureProducts();
  //if keyword is empty, return all products
  if (!keyword || keyword === undefined) {
    return adventureProducts;
  }

  keyword = keyword || '';

  if (keyword.includes('all')) {
    return adventureProducts;
  }

  if (keyword.includes('hidden-homepage-featured-items')) {
    // @ts-ignore
    return [
      adventureProducts[0] as Product,
      adventureProducts[3] as Product,
      adventureProducts[4] as Product
    ];
  }

  if (keyword.includes('hidden-homepage-carousel')) {
    // @ts-ignore
    return [
      adventureProducts[4] as Product,
      adventureProducts[5] as Product,
      adventureProducts[6] as Product,
      adventureProducts[7] as Product,
      adventureProducts[8] as Product
    ];
  }

  //if keyword contains a dash, split it into an array of words, and use the first word
  if (keyword.includes('-')) {
    // @ts-ignore
    keyword = keyword.split('-')[0];
  }

  keyword = keyword || '';
  keyword = keyword.toLowerCase();

  if (keyword.includes('winter')) {
    return adventureProducts.filter(
      (product) =>
        product.title.toLowerCase().includes('ski') ||
        product.title.toLowerCase().includes('winter')
    );
  }

  if (keyword.includes('summer')) {
    return adventureProducts.filter(
      (product) =>
        product.title.toLowerCase().includes('surf') ||
        product.title.toLowerCase().includes('climbing') ||
        product.title.toLowerCase().includes('summer') ||
        product.title.toLowerCase().includes('hiking') ||
        product.title.toLowerCase().includes('camping') ||
        product.title.toLowerCase().includes('rafting') ||
        product.title.toLowerCase().includes('tasting') ||
        product.title.toLowerCase().includes('cycling') ||
        product.title.toLowerCase().includes('gastro') ||
        product.title.toLowerCase().includes('backpacking')
    );
  }

  if (keyword.includes('europe')) {
    return adventureProducts.filter(
      (product) =>
        product.title.toLowerCase().includes('tuscany') ||
        product.title.toLowerCase().includes('marais') ||
        product.title.toLowerCase().includes('basel') ||
        product.title.toLowerCase().includes('mont')
    );
  }

  return adventureProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(<string>keyword) ||
      product.description.toLowerCase().includes(<string>keyword)
  );
}
