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


const API_SERVER_URL = "http://localhost:5000/api";

const isAdmin = (user: User | null): boolean => {
    return user?.role === 'admin';
};

const isHost = (user: User | null): boolean => {
    return user?.role === 'hotelOwner';
};

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_SERVER_URL}/auth/login`, {
          email,
          password,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const token = response.data.token;
        if (token) {
            localStorage.setItem('token', token);
        }
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error('Login error:', error.response.data); // Xem thông tin trả về từ server
            return error.response.data; // Trả về phản hồi lỗi thay vì `null`
        }
        console.error('Unexpected error:', error.message);
        return { success: false, message: 'Unexpected error occurred' };
    }
};

export const getCustomers = async (): Promise<User[]> => {
    try {
        const response = await axios.get<User[]>(`${API_SERVER_URL}/users/all`);
        return response.data;
    } catch (error) {
        // Kiểm tra chi tiết lỗi
        if (axios.isAxiosError(error)) {
            console.error('Failed to fetch customers:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        return [];
    }
};


export const addCustomer = async (adminUser: User | null, customer: { name: string; email: string; password: string; role: string; }): Promise<User> => {
    try {
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Not authorized to add new users');
        }

        const { name, email, password, role } = customer;
        const newUser = { name, email, password, role };
    
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authorized, no token');
        }

        const response = await axios.post<User>(`${API_SERVER_URL}/users/adduser`, newUser, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Failed to add customer:', error.response?.data || error.message);
        throw error;
    }
};


export const updateCustomer = async (adminUser: User | null, id: string, customer: Partial<User>): Promise<User> => {
    try {
        // Kiểm tra xem adminUser có phải là admin không
        if (!adminUser || adminUser.role !== 'admin') {
            throw new Error('Unauthorized: Only admin can update customer');
        }
        console.log(id);

        const token = localStorage.getItem('token');
        const response = await axios.patch<User>(`${API_SERVER_URL}/users/updateuser/${id}`, customer, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        console.log(response.data);

        return response.data;
    } catch (error) {
        console.error('Failed to update customer:', error);
        throw error;
    }
};


export const updateHotelByHost = async (id: string, data: Record<string, any>): Promise<void> => {
    try {
        const token = localStorage.getItem('token');

        await axios.put(`${API_SERVER_URL}/hotels/update/${id}`, JSON.stringify(data), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Failed to update hotel information:', error);
        throw error;
    }
};


export const getAllHotel = async (): Promise<any> => {
    try {
        // Lấy ownerId từ user (giả sử user có trường _id hoặc id chứa thông tin chủ khách sạn)
        const response = await axios.get(`${API_SERVER_URL}/hotels/all`); 
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch hotel information:', error);
        throw error;
    }
};

export const getHotelByHost = async (id: String): Promise<any> => {
    try {
        // Lấy ownerId từ user (giả sử user có trường _id hoặc id chứa thông tin chủ khách sạn)
        const response = await axios.get(`${API_SERVER_URL}/hotels/owner/${id}`); // Thay `user._id` với thông tin thực tế trong hệ thống của bạn
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch hotel information:', error);
        throw error;
    }
};

export const getBookings = async (id: String): Promise<Booking[]> => {
    try {
        // Gọi API với hotelId từ user
        const response = await axios.get<Booking[]>(`${API_SERVER_URL}/reservations/booking/${id}`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return [];
    }
};

export const getBookingsByUser = async (id: String): Promise<Booking[]> => {
    try {
        // Gọi API với hotelId từ user
        const response = await axios.get<Booking[]>(`${API_SERVER_URL}/reservations/bookinguser/${id}`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return [];
    }
};

export const getBookingsByHotelId = async (user: User | null): Promise<Booking[]> => {
    if (!user) {
        throw new Error('User is not authenticated.');
    }

    try {
        // Gọi API với hotelId từ user
        const hotelId = localStorage.getItem('hotelId');
        console.log(hotelId);
        const response = await axios.get<Booking[]>(`${API_SERVER_URL}/reservations/booking/${hotelId}`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return [];
    }
};

export const getBooking = async (id: String): Promise<Booking[]> => {
    try {
        // Gọi API với hotelId từ user
        const response = await axios.get<Booking[]>(`${API_SERVER_URL}/reservations/bookingid/${id}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return [];
    }
};

export const updateGuest = async (id: string, guestInfo: any): Promise<any> => {
    try {
      const response = await axios.put(`${API_SERVER_URL}/reservations/bookings/${id}/guests`, guestInfo);
      return response.data;
    } catch (error) {
      console.error('Failed to update guest:', error);
      throw error;
    }
  };
  


export const getRoomsByHotelId = async (user: User | null): Promise<Room[]> => {
    const hotelId = localStorage.getItem('hotelId');
    // console.log(hotelId);   
    // console.log(`${API_SERVER_URL}/rooms/room/${hotelId}`);
    try {
        const response = await axios.get<Room[]>(`${API_SERVER_URL}/rooms/room/${hotelId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch rooms:', error);
        return [];
    }
};

export const addRoom = async (
    user: User | null,
    room: Omit<Room, 'id' | 'available'> & {
        roomNumber: string;
        roomType: string;
        startDate: string;
        endDate: string;
        files?: File[];
        amenities?: []; 
    }
): Promise<Room> => {
    if (!user || !isHost(user)) {
        throw new Error('Access denied: User is not a host.');
    }
    
    const hotelId = localStorage.getItem('hotelId');
    const token = localStorage.getItem('token');

    if (!hotelId || !token) {
        throw new Error('Hotel ID or token is missing.');
    }

    const startDate = new Date(room.startDate);
    const endDate = new Date(room.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
        throw new Error('Invalid dates: startDate must be before endDate.');
    }

    try {
        const formData = new FormData();
        formData.append('roomNumber', room.roomNumber);
        formData.append('roomType', room.roomType);
        formData.append('price', String(room.price));
        formData.append('capacity', String(room.capacity));
        formData.append('startDate', room.startDate);
        formData.append('endDate', room.endDate);
        formData.append('hotelId', hotelId);

        // Thêm danh sách amenities
        formData.append('amenities', JSON.stringify(room.amenities));
        // Thêm file ảnh/video
        if (room.files && room.files.length > 0) {
            room.files.forEach(file => {
                formData.append(`files`, file, file.name);
            });
        }

        const response = await axios.post<Room>(
            `${API_SERVER_URL}/rooms/hotels/${hotelId}/rooms`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

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
        const token = localStorage.getItem('token');

        const response = await axios.put<Room>(`${API_SERVER_URL}/rooms/update/${roomId}`, room, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Failed to update room:', error.message);
        } else {
            console.error('Failed to update room:', error);
        }
        throw error;
    }
};


export const getTotalUsers = async (): Promise<number> => {
    try {
        const customers = await getCustomers();
        const users = customers.filter(user => user.role === 'customer');
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
        const totalHosts = customers.filter(user => user.role === 'hotelOwner'); 
        return totalHosts.length;
    } catch (error) {
        console.error('Failed to fetch total hosts:', error);
        return 0;
    }
};


export const getRatingByRoomId = async (id: String): Promise<any[]> => {
    try {
        const response = await axios.get(`${API_SERVER_URL}/reviews/review/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch promotions:', error);
        throw error;
    }
};

export const getOrderByHotelId = async () => {
    const hotelId = localStorage.getItem('hotelId');
    try {
        // Lấy ownerId từ user (giả sử user có trường _id hoặc id chứa thông tin chủ khách sạn)
        const response = await axios.get(`${API_SERVER_URL}/orders/order/${hotelId}`); // Thay `user._id` với thông tin thực tế trong hệ thống của bạn
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch hotel information:', error);
        throw error;
    }
}

export const backupData = async () => {
    try {
        const response = await axios.post(`${API_SERVER_URL}/systems/backup`);
        return response.data; // Trả về thông tin file backup từ server
    } catch (error) {
        console.error('Failed to perform backup:', error);
        throw error;
    }
};


export const restoreData = async () => {
    try {
        const response = await axios.post(`${API_SERVER_URL}/systems/restore`);
        return response.data; // Trả về thông tin kết quả từ server
    } catch (error) {
        console.error('Failed to restore data:', error);
        throw error;
    }
};

export const deleteMedia = async (roomId: string, fileName: any) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_SERVER_URL}/rooms/rooms/${roomId}/media/${fileName}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Updated media:', response.data.media);
        return response.data;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

export const addMedia = async (roomId: string, files: File[]) => {
    const formData = new FormData();
    const hotelId = localStorage.getItem('hotelId')
    formData.append('hotelId', hotelId);
    files.forEach((file: File) => formData.append('files', file));
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${API_SERVER_URL}/rooms/rooms/${roomId}/media`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Updated media:', response.data.media);
        return response; 
    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }

};

export const signup = async (userData: any) => {
    try {
        console.log(userData);
      const response = await axios.post(`${API_SERVER_URL}/auth/register-hotel`, userData);
      return response.data; 
    } catch (error) {
        console.error(error);
        throw error;
    }
  };


  export const sendVerificationCode = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.post(`${API_SERVER_URL}/auth/send-verification-code`, { email });
      return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
  };
  

  export const verifyEmail = async (params: { email: string; code: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.post(`${API_SERVER_URL}/auth/verify-email`, params);
      return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
  };

  export const resetpassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.post(`${API_SERVER_URL}/auth/reset-password`, { email });
      return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
  };


export const getCustomerTransactions = async (userId: String) => {
    try {
        if (!userId) {
            throw new Error("userId is required");
        }

        // Gửi yêu cầu GET đến API
        const response = await axios.post(`${API_SERVER_URL}/transaction/customer`, { userId
        });

        // Kiểm tra nếu API trả về thành công
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error('Error fetching transactions:', response.data.message);
            return [];
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getTransaction = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_SERVER_URL}/transaction/admin`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data; // Trả về thông tin file backup từ server
    } catch (error) {
        console.error('Failed to perform backup:', error);
        throw error;
    }
}

export const getTransactionbyHost = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_SERVER_URL}/transaction/host`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data; // Trả về thông tin file backup từ server
    } catch (error) {
        console.error('Failed to perform backup:', error);
        throw error;
    }
}

export const updateBookDates = async (roomId: String, checkInDate: String, checkOutDate:String) => {
    try {
      // Define the API endpoint

      const token = localStorage.getItem('token');
      // Send a PUT request to the backend
      const response = await axios.put(`${API_SERVER_URL}/reservations/addbook/${roomId}`, {
        checkInDate,
        checkOutDate,
      }, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
      }
    );
    console.log(response.data);
    return response.data;
    } catch (error) {
        console.error('Failed to perform backup:', error);
        throw error;
    }
  };

export const updateRoomAvailableDate = async (roomId: String, checkInDate: String, checkOutDate:String) => {
    try {
      // Define the API endpoint

      const token = localStorage.getItem('token');
      // Send a PUT request to the backend
      const response = await axios.put(`${API_SERVER_URL}/rooms/updatedates/${roomId}`, {
        checkInDate,
        checkOutDate,
      }, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
      }
    );
    console.log(response.data);
    return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
  };


  export const deleteMediaHotel = async (hotelId: string, fileName: any) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_SERVER_URL}/hotels/hotels/${hotelId}/media/${fileName}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Updated media:', response.data.media);
        return response.data;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

export const addMediaHotel = async (hotelId: string, files: File[]) => {
    const formData = new FormData();
    formData.append('hotelId', hotelId);
    files.forEach((file: File) => formData.append('files', file));
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${API_SERVER_URL}/hotels/hotels/${hotelId}/media`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Updated media:', response.data.media);
        return response; 
    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }

};
