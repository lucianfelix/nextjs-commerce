// @ts-ignore
import {
  Cart,
  Collection,
  Connection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyCart,
  ShopifyCollection,
  ShopifyCollectionsOperation,
  ShopifyProduct
} from './types';
import { getProductByHandle, getProductsByKeyword, getStaticCart } from './adventures';
import {
  collections,
  europeCollection,
  pages,
  summerCollection,
  winterCollection
} from '../cf/adventures';

const HIDDEN_PRODUCT_TAG = 'hidden';

export const createCart = async (): Promise<Cart> => {
  return reshapeCart(await getStaticCart());
};

export const addToCart = async (
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> => {
  return reshapeCart(await getStaticCart());
};

export const removeFromCart = async (cartId: string, lineIds: string[]): Promise<Cart> => {
  return reshapeCart(await getStaticCart());
};

export const updateCart = async (
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> => {
  return reshapeCart(await getStaticCart());
};

export const getCart = async (cartId: string): Promise<Cart | undefined> => {
  return reshapeCart(await getStaticCart());
};

export const getCollection = async (handle: string) => {
  return reshapeCollection(collections.find((collection) => collection.handle === handle));
};

export const getCollectionProducts = async ({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> => {
  return await getProductsByKeyword(collection);
};

export async function getCollections(): Promise<Collection[]> {
  const adventureCollections = [winterCollection, summerCollection, europeCollection];
  const collections = [
    {
      handle: '',
      title: 'All',
      description: 'All products',
      seo: {
        title: 'All',
        description: 'All products'
      },
      path: '/search/',
      updatedAt: new Date().toISOString()
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(adventureCollections).filter(
      (collection) => !collection.handle.startsWith('hidden')
    )
  ];

  return collections;
}

export const getMenu = async (handle: string) => {
  const items = [
    {
      title: 'All',
      path: '/'
    },
    {
      title: 'Summer',
      path: '/search/summer-collection'
    },
    {
      title: 'Winter',
      path: '/search/winter-collection'
    },
    {
      title: 'Europe',
      path: '/search/europe-collection'
    }
  ];
  return items;
};

export const getFooterMenu = async (handle: string) => {
  const items = [
    {
      title: 'Home',
      path: '/'
    },
    {
      title: 'About',
      path: '/about'
    },
    {
      title: 'Terms & Conditions',
      path: '/tc'
    },
    {
      title: 'Shipping & Return Policy',
      path: '/sr'
    },
    {
      title: 'Privacy Policy',
      path: '/pp'
    },
    {
      title: 'FAQ',
      path: '/faq'
    }
  ];
  return items;
};

export const getPage = async (handle: string) => {
  return pages.find((page) => page.handle === handle);
};

export const getPages = async (): Promise<Page[]> => {
  return pages;
};

export const getProduct = async (handle: string) => {
  return reshapeProduct(await getProductByHandle(handle), false);
};

export const getProductRecommendations = async (productId: string): Promise<Product[]> => {
  return reshapeProducts([
    (await getProductByHandle('climbing-new-zealand')) as Product,
    (await getProductByHandle('ski-touring-mont-blanc')) as Product,
    (await getProductByHandle('downhill-skiing-wyoming')) as Product,
    (await getProductByHandle('cycling-tuscany')) as Product
  ]);
};

export const getProducts = async ({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> => {
  return reshapeProducts(await getProductsByKeyword(query));
};

const reshapeCart = (cart: Cart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: '0.0',
      currencyCode: 'USD'
    };
  }

  return {
    ...cart,
    lines: cart.lines
  };
};

const reshapeCollection = (collection: ShopifyCollection | undefined): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Image[], productTitle: string) => {
  const flattened = images;

  // @ts-ignore
  return flattened.map((image) => {
    // @ts-ignore
    const filename = image.url.match(/.*\/(.*)\..*/)[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`
    };
  });
};

const reshapeProduct = (product: Product | undefined, filterHiddenProducts: boolean = true) => {
  // if (!product || (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))) {
  if (!product) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: variants
  };
};

const reshapeProducts = (products: Product[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};
