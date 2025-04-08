export const userService = {
    login,
    signup,
    logout,
    getLoggedInUser,
    query,
    get,
    remove,
    getEmptyCredentials,
}


const STORAGE_KEY_LOGGEDIN_USER = 'loggedInUser'


function login({ username, password }) {
    return axios.post('/api/auth/login', { username, password })
        .then(res => res.data)
        .then(user => {
            _setLoggedinUser(user)
            return user
        })
}


function signup(credentials) {
    return axios.post('/api/auth/signup', credentials)
        .then(res => res.data)
        .then(user => {
            _setLoggedinUser(user)
            return user
        })
}


function logout() {
    return axios.post('/api/auth/logout').then(() => {
        sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
    })
}


function getLoggedInUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
}


function query() {
    return axios.get('/api/user').then(res => res.data)
}


function get(userId) {
    return axios.get('/api/user/' + userId)
        .then(res => res.data)
        .catch(err => console.log(err))
}


function remove(userId) {
    return axios.delete('/api/user/' + userId)
}


function getEmptyCredentials() {
    return {
        username: '',
        password: '',
        fullname: '',
    }
}


function _setLoggedinUser(user) {
    const userToSave = {
        _id: user._id,
        fullname: user.fullname,
        isAdmin: user.isAdmin,
    }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(userToSave))
    return userToSave
}