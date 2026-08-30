import React, { useContext, useState, useEffect } from 'react'
import './SearchModal.css'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'

const SearchModal = ({ setShowSearch }) => {
  const { food_list, url } = useContext(StoreContext)
  const [searchQuery, setSearchQuery] = useState('')

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearch(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setShowSearch])

  // Filter items (case-insensitive partial match)
  const queryTrimmed = searchQuery.trim()
  const filteredFood = queryTrimmed === ''
    ? []
    : food_list.filter(item =>
        item.name.toLowerCase().includes(queryTrimmed.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(queryTrimmed.toLowerCase()))
      )

  const getImageSrc = (image) => {
    if (typeof image === 'string' && !image.startsWith('/src') && !image.startsWith('data:') && !image.includes('/')) {
      return `${url}/images/${image}`
    }
    return image
  }

  const handleResultClick = (item) => {
    setShowSearch(false)
    const element = document.getElementById('food-display') || document.getElementById('explore-menu')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="search-modal-backdrop" onClick={() => setShowSearch(false)}>
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <img src={assets.search_icon} alt="search" className="search-icon-img" />
            <input
              type="text"
              placeholder="Search for delicious food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          <button className="close-search-btn" onClick={() => setShowSearch(false)}>✕</button>
        </div>

        {queryTrimmed !== '' && (
          <div className="search-modal-content">
            {filteredFood.length === 0 ? (
              <div className="no-food-found">
                <p>No food found</p>
              </div>
            ) : (
              <div className="search-results-list">
                {filteredFood.map((item) => (
                  <div
                    key={item._id}
                    className="search-result-row"
                    onClick={() => handleResultClick(item)}
                  >
                    <img
                      src={getImageSrc(item.image)}
                      alt={item.name}
                      className="search-result-img"
                    />
                    <span className="search-result-name">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchModal
