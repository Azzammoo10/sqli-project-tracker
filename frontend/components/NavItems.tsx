import {Link, NavLink} from "react-router";
import {sidebarItems} from "~/constants";
import {cn} from "~/lib/utils";

const NavItems = ({handleClick} : { handleClick?: () => void }) => {
    const azzam = {
        name: 'Azzam',
        username: 'azzam.cp-IT2989',
        imageUrl : 'assets/images/azzam.jpg',
    }
    const aya = {
        name: 'Ouahi',
        username: 'aya.cp-IT2989',
        imageUrl : 'assets/images/aya.jpeg',
    }
    return (
        <section className="nav-items flex flex-col items-center justify-start">
            <Link to="/" className="link-logo flex flex-col items-center gap-2 py-6 border-b border-light-100">
                <img
                    src="/assets/images/SQLI-LOGO.png"
                    alt="Logo"
                    className="h-12 w-auto object-contain"
                />
            </Link>

            <div className="container">
                <nav>
                    {sidebarItems.map(({id, href,icon,label}) => (
                        <NavLink to={href} key={id}>
                            {({ isActive } : {isActive: boolean}) => (
                                <div className={cn('group nav-item', {
                                    'bg-purple-700 !text-white': isActive
                                })} onClick={handleClick}>
                                    <img
                                        src={icon}
                                        alt={label}
                                        className={`w-5 h-5 group-hover:brightness-0 group-hover:invert ${isActive ? 'brightness-0 invert' : ''}`}

                                    />
                                    {label}
                                </div>

                            )}
                        </NavLink>
                    ))}
                </nav>

                <footer className="nav-footer">
                    <img src={azzam?.imageUrl || '/assets/images/azzam.jpg'} alt="aya"/>
                    <article>
                        <h2>{azzam.name}</h2>
                        <p>{azzam.username}</p>
                    </article>
                    <button onClick={() => {
                        alert(`${azzam.name} has been logged out`);
                    }}
                            className="cursor-pointer"
                    >
                        <img src="/assets/icons/logout.svg" alt="Logout" className="size-6" />

                    </button>
                </footer>
            </div>
        </section>

    );
};
export default NavItems;
