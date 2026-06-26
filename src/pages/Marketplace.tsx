import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

interface Product {
  id: number
  title: string
  description: string
  price: number
  image_url: string
  category: string
  creator_id: string
}

const categories = ['All', 'T-Shirts', 'Hoodies', 'Caps', 'Bags', 'Accessories']

const Marketplace = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [selectedCategory, search, products])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (!error) setProducts(data || [])
    setIsLoading(false)
  }

  const filterProducts = () => {
    let result = products

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory)
    }

    if (search) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFiltered(result)
  }

  return (
    <div className="marketplace">

      {/* HEADER */}
      <div className="marketplace-header">
        <h1>Marketplace</h1>
        <p>Discover unique designs from South African creators</p>
      </div>

      {/* FILTERS */}
      <div className="marketplace-filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS GRID */}
      {isLoading ? (
        <div className="loading">Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No products found. Check back soon!</p>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map(product => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="product-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} />
                ) : (
                  <div className="image-placeholder">👕</div>
                )}
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">R{product.price}</span>
                  <button className="btn-add-cart">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Marketplace