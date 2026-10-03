import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon } from "lucide-react"
import { assets } from "../../assets/assets"
import { NavLink } from "react-router-dom"

const AdminLinks = [
    {
        name: "Dashboard",
        link: "/admin",
        icon: <LayoutDashboardIcon className="w-5 h-5" />
    },
    {
        name: "Add Shows",
        link: "/admin/add-shows",
        icon: <PlusSquareIcon className="w-5 h-5" />
    },
    {
        name: "List Shows",
        link: "/admin/list-shows",
        icon: <ListIcon />

    },
    {
        name: "List Bookings",
        link: "/admin/list-bookings",
        icon: <ListCollapseIcon />
    }
]


export default function AdminSideBar ()
{

    const user = {
        firstName: "John",
        lastName: "Doe",
        image: assets.profile
    }


    return (
        <div className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm">

            <img src={ user.image } alt="User" className="w-9 h-9 md:h-14 md:w-14 rounded-full mx-auto object-cover" />

            <p className="mt-2 text-base max-md:hidden">{ user.firstName } { user.lastName }</p>

            <div className="w-full">
                {
                    AdminLinks.map( ( link, index ) => (
                        <NavLink to={ link.link } end key={ index } className={ ( { isActive } ) => `relative flex items-center max-md:justify-center gap-2 w-full py-2.5 md:pl-10 first:mt-6 text-gray-400 ${ isActive && 'bg-primary/15 text-primary group-hover:text-primary' }` }>
                            {
                                ( { isActive } ) => (
                                    <>
                                        { link.icon }
                                        <p className="max-md:hidden">{ link.name }</p>
                                        <span className={ `w-1.5 h-10 rounded-l right-0 absolute ${ isActive && 'bg-primary' }` }></span>
                                    </>
                                )
                            }
                        </NavLink>
                    ) )
                }

            </div>

        </div>
    )
}
