const { NavLink, useNavigate } = ReactRouterDOM
const { useState } = React
import { userService } from '../services/user.service.js'
import { LoginSignup } from './LoginSignup.jsx'

export function AppHeader() {
    const [user, setUser] = useState(userService.getLoggedInUser())
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const navigate = useNavigate()

    function onLogout() {
        userService.logout()
            .then(() => {
                setUser(null)
                navigate('/')
            })
    }

    return (
        <header className="app-header main-content single-row">
            <h1>Miss Bug</h1>
            <nav className="flex align-center gap">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/bug">Bugs</NavLink>
                <NavLink to="/about">About</NavLink>
                {user && <NavLink to="/user">Profile</NavLink>}

                {!user && (
                    <button onClick={() => setIsAuthModalOpen(true)}>Login / Signup</button>
                )}

                {user && (
                    <span>
                        Hello, <NavLink to={`/user/${user._id}`}>{user.fullname}</NavLink>
                        <button onClick={onLogout}>Logout</button>
                    </span>
                )}
            </nav>

            {isAuthModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
                    <div className="modal-content" onClick={(ev) => ev.stopPropagation()}>
                        <button className="close-btn" onClick={() => setIsAuthModalOpen(false)}>X</button>
                        <LoginSignup setUser={setUser} />
                    </div>
                </div>
            )}
        </header>
    )
}