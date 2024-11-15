const [filters, setFilters] = useState({
  price: [0, 500], 
  capacity: null,
  status: null,
});
const [tempFilters, setTempFilters] = useState({
  price: [0, 500],
  capacity: null,
  status: null,
});
const [filterVisible, setFilterVisible] = useState(false);
const [maxPrice, setMaxPrice] = useState(500); 
useEffect(() => {
  const fetchRooms = async () => {
    if (user && user.hotelId) {
      const rooms = await getRoomsByHotelId(user);
      setRoomData(rooms);
      const maxPriceInData = rooms.reduce((max, room) => Math.max(max, room.price), 0);
      setMaxPrice(maxPriceInData);
      
      setFilters((prevFilters) => ({ ...prevFilters, price: [0, maxPriceInData] }));
      setTempFilters((prevTempFilters) => ({ ...prevTempFilters, price: [0, maxPriceInData] }));
    }
  };
  fetchRooms();
}, [user]);

const handleResetFilter = () => {
  setTempFilters({
    price: [0, maxPrice],  
    capacity: null,
    status: null,
  });
};

const applyFilters = () => {
  setFilters(tempFilters);
  setFilterVisible(false);
};

const filteredRoomData = roomData.filter((room) => {
  const { price, capacity, status } = filters;
  return (
    (price ? room.price >= price[0] && room.price <= price[1] : true) &&
    (capacity ? room.capacity === capacity : true) &&
    (status ? room.status === status : true)
  );
});

const filterMenu = (
  <Menu>
    <div className="filter-title">Filter Rooms</div>

    <Menu.Item key="status">
      <div className="filter-section">
        <div className="filter-label">Status</div>
        <Select
          value={tempFilters.status}
          onChange={(value) => setTempFilters({ ...tempFilters, status: value })}
          placeholder="Select Status"
          style={{ width: '100%' }}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value="Allow">Allow</Option>
          <Option value="Hidden">Hidden</Option>
          <Option value="ROO">ROO</Option>
        </Select>
      </div>
    </Menu.Item>

    <Menu.Item key="price">
      <div className="filter-section">
        <div className="filter-label">Price Range</div>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div>{tempFilters.price[0]}</div>
          <Slider
            range
            value={tempFilters.price}
            onChange={(value) => setTempFilters({ ...tempFilters, price: value })}
            min={0}
            max={maxPrice} 
            style={{ flex: 1, margin: '0 10px' }}
            onClick={(e) => e.stopPropagation()}
          />
          <div>{tempFilters.price[1]}</div>
        </div>
      </div>
    </Menu.Item>

    <Menu.Item key="capacity">
      <div className="filter-section">
        <div className="filter-label">Capacity</div>
        <Input
          value={tempFilters.capacity}
          onChange={(e) => setTempFilters({ ...tempFilters, capacity: parseInt(e.target.value) || null })}
          placeholder="Enter Capacity"
          style={{ width: '100%' }}
          type="number"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </Menu.Item>

    <Menu.Item key="filter-buttons">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Button onClick={handleResetFilter}>Reset</Button>
        <Button type="primary" onClick={applyFilters}>Apply Filter</Button>
      </div>
    </Menu.Item>
  </Menu>
);
