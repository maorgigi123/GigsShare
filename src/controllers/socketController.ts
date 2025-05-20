import { Socket } from 'socket.io';
import User from '../models/User';


export const handleDisconnect = (socket: Socket) => {
  console.log(`Client disconnected: ${socket.id}`);
};



export const handleUpdateLocation = async (socket: Socket, data: any) => {
  console.log('📍 Received location:', data);

  const user = socket.user; // מגיע מה־middleware של auth
  if (!user || !user.id) {
    console.warn('❌ No user on socket');
    return;
  }

  const { location } = data;
  if (
    !location ||
    typeof location.latitude !== 'number' ||
    typeof location.longitude !== 'number'
  ) {
    console.warn('❌ Invalid location data');
    return;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $set: {
          location: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
          },
        },
      },
      { new: true }
    );

    if (updatedUser) {
      console.log(`✅ Updated location for user ${updatedUser.username}`);
    } else {
      console.warn(`⚠️ User not found: ${user.id}`);
    }
  } catch (err) {
    console.error('❌ Error updating location:', err);
  }
};

