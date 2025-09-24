import Header from "./header"
import AboutMe from "./aboutme"
import Quote from "./quote"
import Spotify from "./spotify"
import ContactMe from "./contactme"
import Photo from "./photo"
import Footer from "./footer"
import Loader from "./loading"
import TerminalPortfolio from "./projects"

export default function HomeScreen(){
    return (
        <div className="grid h-screen min-h-[700px] grid-cols-12 grid-rows-10 gap-4 p-4 max-lg:h-auto max-lg:grid-rows-none max-lg:py-6 transition-all duration-300 ease-in-out">
            <Loader />
            <div className="col-span-full row-span-1"><Header /></div>
            <div className="col-span-8 row-span-9 grid grid-cols-subgrid grid-rows-subgrid max-lg:col-span-full max-lg:grid-rows-none max-lg:gap-4">
            <div className="col-span-5 row-span-5 min-h-[288px] max-lg:col-span-8 max-md:col-span-full"><Quote /></div>
            <div className="col-span-3 row-span-5 max-lg:col-span-4 max-md:col-span-full"><Photo /></div>
            <div className="col-span-2 row-span-5 min-w-[200px] max-lg:col-span-3 max-md:col-span-full"><Spotify /></div>
            <div className="col-span-4 row-span-5 min-w-[300px] max-lg:col-span-6 max-md:col-span-full"><AboutMe /></div>
            <div className="col-span-2 row-span-5 max-lg:col-span-6 max-md:col-span-full"><ContactMe /></div>
            </div>
            <div className="col-span-4 row-span-9 grid grid-cols-subgrid grid-rows-subgrid max-lg:col-span-full max-lg:grid-rows-none max-lg:gap-4">
            <div className="col-span-4 row-span-8 max-lg:col-span-full"><TerminalPortfolio /></div>
            <div className="col-span-4 row-span-1 min-h-[50px] max-lg:col-span-full"><Footer /></div> 
            </div>
        </div>
    )
}