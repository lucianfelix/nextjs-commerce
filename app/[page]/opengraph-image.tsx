import OpengraphImage from 'components/opengraph-image';
import { getPage } from 'lib/shopify';
import { Page } from '../../lib/shopify/types';

export const runtime = 'edge';

export default async function Image({ params }: { params: { page: string } }) {
  const page = (await getPage(params.page)) as Page;
  const title = page.seo?.title || page.title;

  return await OpengraphImage({ title });
}
