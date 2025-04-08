import { authService } from "../services/authService.js"

export function requiredAuth(req, res, next) {
    const { loginToken } = req.cookies
    const loggedinUser = authService.validateToken(loginToken)
    if (!loggedinUser) return res.status(401).send('Not Authenticated!!!!')
    req.loggedinUser = loggedinUser
    console.log('Required Auth!')
    next()
}
