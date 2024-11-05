export const mockData = [
  { key: '1', id: 'C001', username: 'customer1', name: 'John Doe', email: 'johndoe@gmail.com', phoneNumber: '+888888888', password: 'customer123', role: 'customer' },
  { key: '2', id: 'C002', username: 'customer2', name: 'Jane Smith', email: 'janesmith@gmail.com', phoneNumber: '+999999999', password: 'customer123', role: 'customer' },
  { key: '3', id: 'C003', username: 'customer3', name: 'Sam Wilson', email: 'samwilson@gmail.com', phoneNumber: '+555555555', password: 'customer123', role: 'customer' },
  { key: '4', id: 'H002', username: 'host2', name: 'Peter Parker', email: 'peterparker@gmail.com', phoneNumber: '+777777777', password: 'host123', role: 'host' },
  { key: '5', id: 'H001', username: 'host1', name: 'Gordon Ramsay', email: 'gordonramsay@gmail.com', phoneNumber: '+666666666', password: 'host123', role: 'host' },
  { key: '6', id: 'admin', username: 'admin', name: 'Admin User', email: 'admin@gmail.com', phoneNumber: '+111111111', password: 'admin123', role: 'admin' }
];

if (!localStorage.getItem('mockData')) {
  localStorage.setItem('mockData', JSON.stringify(mockData));
}
