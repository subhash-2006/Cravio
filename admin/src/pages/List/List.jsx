import React, { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const List = ({ url }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchList = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${url}/api/food/list`)
      if (response.data.success) {
        setList(response.data.data || [])
      } else {
        toast.error("Failed to fetch food list")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error connecting to server")
    } finally {
      setLoading(false)
    }
  }

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId })
      if (response.data.success) {
        toast.success("Item removed successfully!")
        await fetchList()
      } else {
        toast.error(response.data.message || "Failed to remove item")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error removing item")
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className='list add flex-col'>
      <h2>All Food Items</h2>

      {loading ? (
        <p style={{ padding: "20px", color: "#666" }}>Loading food items...</p>
      ) : list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#888" }}>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>🍽️ No food items added yet</p>
          <p style={{ fontSize: "14px" }}>Use the "Add Items" page to add food items to the store.</p>
        </div>
      ) : (
        <div className='list-table'>
          <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Action</b>
          </div>
          {list.map((item, index) => {
            const imgSrc = item.image?.startsWith("http") ? item.image : `${url}/images/${item.image}`;
            return (
              <div key={index} className='list-table-format'>
                <img src={imgSrc} alt={item.name} onError={(e) => { e.target.style.display = 'none'; }} />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>${item.price}</p>
                <button onClick={() => removeFood(item._id)} className='delete-btn'>
                  🗑️ Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default List
