import Image from "next/image";

type ImageComponentProps = {
  value: {
    url: string;
    alt?: string;
  };
};

const ImageComponent = ({ value }: ImageComponentProps) => {
  return <Image src={value.url} width={1920} height={1080} alt={value.alt || "Image"} className="rounded-md" />;
};

export default ImageComponent;
