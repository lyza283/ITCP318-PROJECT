const { cert, getApps, initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')

function getFirebaseAdminAuth() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId) {
        throw new Error('FIREBASE_PROJECT_ID is not configured.');
    }

    const appName = 'guhitspace-firebase-auth';
    const options = { projectId };
    if (clientEmail && privateKey) {
        options.credential = cert({ projectId, clientEmail, privateKey });
    }
    const app = getApps().find(existingApp => existingApp.name === appName)
        || initializeApp(options, appName);

    return getAuth(app);
}

module.exports = getFirebaseAdminAuth;
