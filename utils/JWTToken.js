// Creates and send token and save token in cookie
const sendToken = async (user, statusCode, res) => {

    // Create JWT Token
    const token = user.getJWTToken()

    // Cookie Options
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token
    })
}


module.exports = sendToken