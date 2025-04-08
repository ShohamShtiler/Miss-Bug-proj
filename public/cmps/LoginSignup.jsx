import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { userService } from '../services/user.service.js'
import { LoginForm } from './LoginForm.jsx'


const { useState } = React


export function LoginSignup({ setUser }) {
    const [isSignup, setIsSignUp] = useState(false)


    function onLogin(credentials) {
        isSignup ? signup(credentials) : login(credentials)
    }


    function login(credentials) {
        userService.login(credentials)
            .then(user => setUser(user))
            .then(() => {
                showSuccessMsg('Logged in successfully')
            })
            .catch(err => {
                console.log('err', err)
                showErrorMsg('Oops try again')
            })
    }


    function signup(credentials) {
        userService.signup(credentials)
            .then(setUser)
            .then(() => {
                showSuccessMsg('Signed in successfully')
            })
            .catch(err => {
                showErrorMsg('Oops try again')
            })
    }


    return (
        <section className="login">
            <LoginForm onLogin={onLogin} isSignup={isSignup} />
            <div className="btns">
                <a href="#" onClick={() => setIsSignUp(prev => !prev)}>
                    {isSignup ? 'Already a member? Login' : ' New user? Sign up here'}
                </a>
            </div>
        </section>
    )
}
