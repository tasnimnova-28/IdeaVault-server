
const { getAuth } = require('firebase-admin/auth')
const firebaseApp = require('../firebaseAdmin')

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Unauthorized access. Please login first.',
      })
    }

    const token = authHeader.split(' ')[1]

    // Verify the Firebase ID token
    const decodedToken = await getAuth(firebaseApp).verifyIdToken(token)

    // Store verified user information for protected routes
    req.user = decodedToken

    next()
  } catch (error) {
    console.error('Token verification failed:', error.message)

    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
    })
  }
}

module.exports = verifyToken
