import {
    Hotel,
    Room,
    Review,
    User,
    Availability,
    Amenities,
    Booking,
    PaymentMethod,
    Promotion,
    Policy,
} from '../types/data';
import axios from 'axios';

const API_BASE_URL = "http://localhost:4000";

const isAdmin = (user: User | null): boolean => {
    return user?.role === 'admin';
};

const isHost = (user: User | null): boolean => {
    return user?.role === 'host';
};

export const login = async (email: string, password: string): Promise<User | null> => {
    try {
        const response = await axios.get<User[]>(`${API_BASE_URL}/users`, {
            params: { email, password },
        });
        const user = response.data[0];
        return user || null;
    } catch (error) {
        console.error('Login failed:', error);
        return null;
    }
};

export const getCustomers = async (): Promise<User[]> => {
    try {
        const response = await axios.get<User[]>(`${API_BASE_URL}/users`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch customers:', error);
        return [];
    }
};

export const getHost = async (): Promise<User[]> => { 
    try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        const users = response.data; 

        const hosts: User[] = []; 
        for (const user of users) {
            if (user.role === 'host') {
                hosts.push(user);
            }
        }

        return hosts; 
    } catch (error) {
        console.error('Failed to fetch hosts:', error);
        return [];
    }
};

const generateRandomHotelId = (): string => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000); 
    return `H${randomDigits}`; 
};

export const getUserById = async (userId: string): Promise<User | null> => {
    try {
        const response = await axios.get<User>(`${API_BASE_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
};

export const addCustomer = async (adminUser: User | null, customer: Omit<User, 'userId'>): Promise<User> => {
    try {
        const newUserId = generateRandomHotelId(); 
        let newCustomer = { ...customer, userId: newUserId };

        if (customer.role === 'host') {
            const newhotelId = generateRandomHotelId(); 

            newCustomer = { ...newCustomer, hotelId: newhotelId }; 

            const hotelData = {
                id: newhotelId,
                hotelId: newhotelId,
                userId: newUserId, 
                name: "",
                location: {
                    country: "",
                    city: "",
                    address: "",
                    latitude: "",
                    longitude: ""
                },
                facilities: [],
                images: []
            };


            await axios.post(`${API_BASE_URL}/hotels`, hotelData);
        }

        const response = await axios.post<User>(`${API_BASE_URL}/users`, newCustomer);
        
        return response.data;
    } catch (error) {
        console.error('Failed to add customer:', error);
        throw error;
    }
};


export const updateCustomer = async (adminUser: User | null, id: string, customer: Partial<User>): Promise<User> => {
    try {
        const response = await axios.patch<User>(`${API_BASE_URL}/users/${id}`, customer);
        return response.data;
    } catch (error) {
        console.error('Failed to update customer:', error);
        throw error;
    }
};

export const deleteCustomer = async (adminUser: User | null, userId: string): Promise<void> => {
    try {

        const userResponse = await axios.get<User>(`${API_BASE_URL}/users/${userId}`);
        const user = userResponse.data;

        if (user.role === 'host' && user.hotelId) {

            const hotelsResponse = await axios.get(`${API_BASE_URL}/hotels?hotelId=${user.hotelId}`);
            const hotels = hotelsResponse.data;


            for (const hotel of hotels) {
                await axios.delete(`${API_BASE_URL}/hotels/${hotel.id}`);
            }
        }

        await axios.delete(`${API_BASE_URL}/users/${userId}`);
    } catch (error) {
        console.error('Failed to delete customer:', error);
        throw error;
    }
};

export const updateHotelByHost = async (user: User | null, hotelData: any): Promise<void> => {
    if (!user) {
        throw new Error('User is not authenticated.');
    }
    if (!isHost(user)) {
        throw new Error('Access denied: Host only.');
    }

    try {
        await axios.patch(`${API_BASE_URL}/hotels/${user.hotelId}`, hotelData);
    } catch (error) {
        console.error('Failed to update hotel information:', error);
        throw error;
    }
};

export const getHotelByHost = async (user: User | null): Promise<any> => {
    if (!user) {
        throw new Error('User is not authenticated.');
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/hotels/${user.hotelId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch hotel information:', error);
        throw error;
    }
};

export const getBookingsByHotelId = async (user: User | null): Promise<Booking[]> => {
    if (!user) {
        throw new Error('User is not authenticated.');
    }

    if (!user.hotelId) {
        throw new Error('User does not have an associated hotel ID.');
    }

    if (!isHost(user)) {
        throw new Error('Access denied: User is not a host.');
    }

    try {
        const response = await axios.get<Booking[]>(`${API_BASE_URL}/booking`, {
            params: { hotelId: user.hotelId },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return [];
    }
};

export const addBooking = async (user: User | null, booking: Omit<Booking, 'bookingId'>): Promise<Booking> => {
    if (!user || !isHost(user)) {
        throw new Error('Access denied: User is not a host.');
    }

    try {
        const rooms = await getRoomsByHotelId(user);
        
        const roomToUpdate: Room | undefined = rooms.find(room => room.id === booking.roomId);

        if (!roomToUpdate) {
            throw new Error('Room not found');
        }

        const bookedQuantity = 1; 
        const newAvailable = roomToUpdate.available - bookedQuantity;

        if (newAvailable < 0) {
            throw new Error('No available rooms for booking');
        }

        const updatedRoomResponse = await updateRoom(user, roomToUpdate.id, { available: newAvailable });

        console.log(`Room ID: ${roomToUpdate.id}, New Available Count: ${newAvailable}`);
        
        if (newAvailable === 0) {
            await updateRoom(user, roomToUpdate.id, { status: 'ROO' });
            console.log(`Room ID: ${roomToUpdate.id} status updated to 'ROO'`);
        }

        const bookingWithHotelId = { ...booking, hotelId: user.hotelId };

        const response = await axios.post<Booking>(`${API_BASE_URL}/booking`, bookingWithHotelId);
        console.log('Booking added successfully:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('Failed to add booking:', error);
        throw error;
    }
};



export const updateBooking = async (user: User | null, bookingId: string, booking: Partial<Booking>): Promise<Booking> => {
    if (!user || !isHost(user)) {
        throw new Error('Access denied: User is not a host.');
    }

    try {
        const response = await axios.patch<Booking>(`${API_BASE_URL}/booking/${bookingId}`, booking);
        return response.data;
    } catch (error) {
        console.error('Failed to update booking:', error);
        throw error;
    }
};

export const deleteBooking = async (user: User | null, bookingId: string): Promise<void> => {
    if (!user || !isHost(user)) {
        throw new Error('Access denied: User is not a host.');
    }

    try {
        const bookingToDelete = await getBookingById(bookingId); 

        if (!bookingToDelete) {
            throw new Error('Booking not found');
        }

        const rooms = await getRoomsByHotelId(user);
        const roomToUpdate: Room | undefined = rooms.find(room => room.id === bookingToDelete.roomId);

        if (!roomToUpdate) {
            throw new Error('Room not found for the booking');
        }

        if (roomToUpdate.available === 0) {
            await updateRoom(user, roomToUpdate.id, { status: 'Allow' });
        }

        await axios.delete(`${API_BASE_URL}/booking/${bookingId}`);

        const newAvailable = roomToUpdate.available + 1; 
        await updateRoom(user, roomToUpdate.id, { available: newAvailable });

    } catch (error) {
        console.error('Failed to delete booking:', error);
        throw error;
    }
};


const getBookingById = async (bookingId: string): Promise<Booking | null> => {
    try {
        const response = await axios.get<Booking>(`${API_BASE_URL}/booking/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch booking:', error);
        return null;
    }
};


export const getRoomsByHotelId = async (user: User | null): Promise<Room[]> => {
    if (!user || !user.hotelId || !isHost(user)) {
        throw new Error('Access denied or invalid hotel ID');
    }
    try {
        const response = await axios.get<Room[]>(`${API_BASE_URL}/rooms`, {
            params: { hotelId: user.hotelId },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch rooms:', error);
        return [];
    }
};

export const addRoom = async (user: User | null, room: Omit<Room, 'id' | 'available'>): Promise<Room> => {
    if (!user || !isHost(user)) {
        throw new Error('Access denied: User is not a host.');
    }

    const price: number = Number(room.price);
    const capacity: number = Number(room.capacity);
    const quantity: number = Number(room.quantity);
    const available: number = quantity > 0 ? quantity : 0; 

    const status = quantity === 0 ? 'ROO' : room.status;

    const roomWithHotelIdAndAvailability = { 
        ...room, 
        hotelId: user.hotelId, 
        price,         
        capacity,       
        quantity,       
        available,      
        status 
    };

    try {
        const response = await axios.post<Room>(`${API_BASE_URL}/rooms`, roomWithHotelIdAndAvailability);
        return response.data;
    } catch (error) {
        console.error('Failed to add room:', error);
        throw error;
    }
};


export const updateRoom = async (user: User | null, roomId: string, room: Partial<Room>): Promise<Room> => {
    if (!user || !isHost(user)) {
        throw new Error('Access denied: User is not a host.');
    }

    try {
        const currentRoomResponse = await axios.get<Room>(`${API_BASE_URL}/rooms/${roomId}`);
        const currentRoom = currentRoomResponse.data;

        let updatedAvailable = currentRoom.available;

        if (room.available !== undefined) {
            updatedAvailable = room.available;

            if (updatedAvailable < 0) {
                throw new Error('Invalid input: Available rooms cannot be negative.');
            }
        }

        let updatedStatus = room.status ?? currentRoom.status;  
        if (updatedAvailable === 0) {
            updatedStatus = 'ROO'; 
        }

        const updatedRoom = { ...room, available: updatedAvailable, status: updatedStatus };

        const response = await axios.patch<Room>(`${API_BASE_URL}/rooms/${roomId}`, updatedRoom);
        return response.data;
    } catch (error) {
        console.error('Failed to update room:', error.message);
        throw error;
    }
};

export const deleteRoom = async (user: User | null, roomId: string): Promise<void> => {
    if (!user || !isHost(user)) {
        throw new Error('Access denied: User is not a host.');
    }

    try {
        await axios.delete(`${API_BASE_URL}/rooms/${roomId}`);
    } catch (error) {
        console.error('Failed to delete room:', error);
        throw error;
    }
};

export const getRoomTypeByBookingId = async (user: User | null, bookingId: string): Promise<string | null> => {
    if (!user || !isHost(user)) {
        throw new Error('Access denied: User is not a host.');
    }

    try {
        const bookingResponse = await axios.get<Booking>(`${API_BASE_URL}/booking/${bookingId}`);
        const booking = bookingResponse.data;

        const roomId = booking.roomId;
        if (!roomId) {
            throw new Error('Room ID not found in the booking.');
        }

        const roomResponse = await axios.get<Room>(`${API_BASE_URL}/rooms/${roomId}`);
        const room = roomResponse.data;

        return room.type || null;
    } catch (error) {
        console.error('Failed to fetch room type:', error);
        throw error;
    }
};

export const getTotalAndAvailableRooms = async (user: User | null): Promise<{ totalRooms: number; availableRooms: number }> => {
    if (!user || !user.hotelId || !isHost(user)) {
        throw new Error('Access denied or invalid hotel ID');
    }
    try {
        const response = await axios.get<Room[]>(`${API_BASE_URL}/rooms`, {
            params: { hotelId: user.hotelId },
        });

        const rooms = response.data;

        const totalRooms = rooms.reduce((total, room) => total + room.quantity, 0);
        const availableRooms = rooms.reduce((total, room) => {
            return room.status === 'Allow' ? total + room.available : total;
        }, 0);

        return { totalRooms, availableRooms };
    } catch (error) {
        console.error('Failed to fetch rooms:', error);
        return { totalRooms: 0, availableRooms: 0 };
    }
};

export const getTotalUsers = async (): Promise<number> => {
    try {
        const customers = await getCustomers();
        const users = customers.filter(user => user.role === 'user');
        return users.length;
    } catch (error) {
        console.error('Failed to fetch total users:', error);
        return 0;
    }
};

export const getTotalCustomers = async (): Promise<number> => {
    try {
        const customers = await getCustomers();
        const totalCustomers = customers.filter(user => user.role !== 'admin'); 
        return totalCustomers.length;
    } catch (error) {
        console.error('Failed to fetch total customers:', error);
        return 0;
    }
};

export const getTotalHosts = async (): Promise<number> => {
    try {
        const customers = await getCustomers();
        const totalHosts = customers.filter(user => user.role === 'host'); 
        return totalHosts.length;
    } catch (error) {
        console.error('Failed to fetch total hosts:', error);
        return 0;
    }
};

export const getPromotionsByHotelId = async (user: User | null): Promise<any[]> => {
    if (!user || !user.hotelId) {
        throw new Error('Access denied: User does not have an associated hotel ID.');
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/promotion`, {
            params: { hotelId: user.hotelId },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch promotions:', error);
        throw error;
    }
};

export const addPromotion = async (user: User | null, promotion: Omit<any, 'id'>): Promise<any> => {
    if (!user || !user.hotelId) {
        throw new Error('Access denied: User does not have an associated hotel ID.');
    }

    try {
        const promotionWithHotelId = { ...promotion, hotelId: user.hotelId };
        const response = await axios.post(`${API_BASE_URL}/promotion`, promotionWithHotelId);
        return response.data; 
    } catch (error) {
        console.error('Failed to add promotion:', error);
        throw error;
    }
};

export const updatePromotion = async (user: User | null, promotionId: string, promotion: Partial<any>): Promise<any> => {
    if (!user || !user.hotelId) {
        throw new Error('Access denied: User does not have an associated hotel ID.');
    }

    try {
        const response = await axios.patch(`${API_BASE_URL}/promotion/${promotionId}`, promotion);
        return response.data; 
    } catch (error) {
        console.error('Failed to update promotion:', error);
        throw error;
    }
};

export const deletePromotion = async (user: User | null, promotionId: string): Promise<void> => {
    if (!user || !user.hotelId) {
        throw new Error('Access denied: User does not have an associated hotel ID.');
    }

    try {
        await axios.delete(`${API_BASE_URL}/promotion/${promotionId}`);
    } catch (error) {
        console.error('Failed to delete promotion:', error);
        throw error;
    }
};


export const updateMaintenanceMode = async (isMaintenance) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/settings/1`, { maintenanceMode: isMaintenance });
      return response.data;
    } catch (error) {
      console.error("Failed to update maintenance mode:", error);
      throw error;
    }
  };
  
  export const getMaintenanceMode = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/1`);
      return response.data.maintenanceMode; 
    } catch (error) {
      console.error("Failed to fetch maintenance mode:", error);
      throw error; 
    }
  };