// Magkaibang site ang frontend at backend sa production, kaya sameSite none
const cookieFlags = () => {
    const isProduction = String(process.env.NODE_ENV).toLowerCase() === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    }
}

const sendToken = (user, statusCode, res) => {

    // Create Jwt token
    const token = user.getJwtToken();

    // Options for cookie
    const options = {
        expires: new Date(
            Date.now() + (process.env.COOKIE_EXPIRES_TIME || 7) * 24 * 60 * 60 * 1000
        ),
        ...cookieFlags(),
    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user
    })

}

module.exports = sendToken;
module.exports.cookieFlags = cookieFlags;
