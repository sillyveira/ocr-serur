import Image from "next/image";

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-b from-red-50 to-red-100 shadow-sm z-10 py-4">
      <div className="flex justify-center">
        <Image
          src="/logo_serur.svg"
          alt="SERUR"
          width={120}
          height={48}
          className="h-12 md:h-16"
        />
      </div>
    </header>
  );
}

export default Header;
