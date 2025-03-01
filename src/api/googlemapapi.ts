const GOOGLE_MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api';
const API_KEY = 'AIzaSyCu3JLuJq9PAE6GcLrrsQkT6V3og5oYlWk';


export const getGoogleMapsEmbedUrl = (latitude: number, longitude: number, apiKey: string) => {
    return `${GOOGLE_MAPS_API_BASE_URL}/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
  };
  