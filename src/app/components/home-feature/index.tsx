import Image, { StaticImageData } from "next/image";



function HomeFeature({image, title, subtitle}: {image: string | StaticImageData, title: string, subtitle: string}) {
  return (
    <div className="p-6 text-center space-y-4 shadow-md bg-white rounded-lg">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <Image
          src={image}
          alt="Múltiplos Formatos"
          width={24}
          height={24}
        />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}

export default HomeFeature;
