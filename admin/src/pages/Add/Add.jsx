import React, { useState, useRef } from 'react'
import './Add.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Add = ({ url }) => {
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad"
  })

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    if (!image) {
      toast.error("Please upload an image for the food item!")
      return
    }

    if (!data.name.trim()) {
      toast.error("Please enter the food name!")
      return
    }

    if (!data.price || Number(data.price) <= 0) {
      toast.error("Please enter a valid price!")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", data.name.trim())
      formData.append("description", data.description.trim())
      formData.append("price", Number(data.price))
      formData.append("category", data.category)
      formData.append("image", image)

      const response = await axios.post(`${url}/api/food/add`, formData)
      if (response.data.success) {
        setData({ name: "", description: "", price: "", category: "Salad" })
        setImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        toast.success(response.data.message || "Food item added successfully!")
      } else {
        toast.error(response.data.message || "Failed to add food item.")
      }
    } catch (error) {
      console.error("Error adding food:", error)
      const errorMsg = error.response?.data?.message || error.message || "Network error. Is backend running?"
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='add'>
      <h2>Add New Food Item</h2>
      <form className='flex-col' onSubmit={onSubmitHandler}>

        {/* Image Upload */}
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image" style={{ cursor: "pointer" }}>
            <div className="upload-box">
              {image
                ? <img src={URL.createObjectURL(image)} alt="preview" />
                : (
                  <div className="upload-placeholder">
                    <span>📷</span>
                    <p>Click to upload</p>
                  </div>
                )
              }
            </div>
          </label>
          <input
            ref={fileInputRef}
            onChange={onImageChange}
            type="file"
            id="image"
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        {/* Name */}
        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name='name'
            placeholder='Enter food name'
            required
          />
        </div>

        {/* Description */}
        <div className="add-product-desc flex-col">
          <p>Product Description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name='description'
            rows={4}
            placeholder='Write a short description...'
            required
          />
        </div>

        {/* Category & Price */}
        <div className="add-category-price">
          <div className="flex-col">
            <p>Category</p>
            <select onChange={onChangeHandler} name='category' value={data.category}>
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Price ($)</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              min="0.1"
              step="0.01"
              name='price'
              placeholder='e.g. 12'
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "ADDING ITEM..." : "ADD FOOD ITEM"}
        </button>
      </form>
    </div>
  )
}

export default Add
