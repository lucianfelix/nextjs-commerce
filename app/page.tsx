import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import Footer from 'components/layout/footer';
import { Suspense } from 'react';

export const runtime = 'edge';
export const dynamic = 'force-static';
// export const revalidate = false;
// export const fetchCache = 'auto'
export const fetchCache = 'only-cache';
export const preferredRegion = 'auto';

export const metadata = {
  description: 'High-performance ecommerce store built with Next.js, Vercel.',
  openGraph: {
    type: 'website'
  }
};

export const revalidate = 3600;

export default async function HomePage() {
  return (
    <>
      <ThreeItemGrid />
      <Suspense>
        <Carousel />
        <Suspense>
          <Footer />
        </Suspense>
      </Suspense>
    </>
  );
}
