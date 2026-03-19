export interface simpleBlogCard {
  title: string;
  slug: any;
  author: string;
  publishedAt: Date;
  mainImage: {
    asset: {
      _id: string;
      url: string;
    };
    alt: string;
  };
}
