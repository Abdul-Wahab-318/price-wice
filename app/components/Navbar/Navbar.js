import Image from "next/image"
export default function Navbar() {
  return (
    <header className='py-8'>
        <div className="container">
            <nav className="flex items-center gap-4">
                <Image src={'/images/logo-temp.png'} width={40} height={40} alt="logo" />
                <h1 className="gradient-text intro_title text-3xl pl-0">Price Wice</h1>
            </nav>
        </div>
    </header>
  )
}
