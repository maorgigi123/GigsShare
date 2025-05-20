import admin from 'firebase-admin';
import path from 'path';

const serviceAccount = require(path.resolve(__dirname, './gigs-share-firebase-adminsdk-fbsvc-3eee613dc3.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const sendPushNotification = async (fcmToken: string, title: string, body: string) => {
    const image = "https://res.cloudinary.com/dsmozgxrb/image/upload/v1747316390/listings/123123/t7zny2dkquwnthufs6fb.jpg"
  const message = {
  token: fcmToken,
  notification: {
    title,
    body,
    image: image
  },
      data: {
      type: 'chat',
      chatId: 'abc123',
      senderName: 'Maor',
      customPayload: 'hello from server',
    },
  android: {
    notification: {
      imageUrl: image,
      sound: 'default',
      channelId: 'default',
    },
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
        badge: 1,
        alert: {
          title,
          body,
        },
      },
      'fcm_options': {
        image: image
      },
    },
  },
};


  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};
