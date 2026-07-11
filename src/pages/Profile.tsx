import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url: string
}

const Profile = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/login')
      return
    }
    fetchProfile(session.user.id)
  }

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        email: data.email || ''
      })
      setAvatarPreview(data.avatar_url || '')
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setIsUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${profile.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      setAvatarPreview(urlData.publicUrl)

      await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', profile.id)
    }

    setIsUploading(false)
  }

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
      })
      .eq('id', profile.id)

    if (!error) {
      setSuccessMessage('✅ Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }

    setIsSaving(false)
  }

  if (isLoading) return <div className="loading">Loading profile...</div>

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account details</p>
        </div>
      </div>

      {successMessage && (
        <div className="success-toast">{successMessage}</div>
      )}

      <div className="profile-container">

        {/* AVATAR SECTION */}
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="profile-avatar" />
            ) : (
              <div className="avatar-placeholder">
                {formData.full_name?.charAt(0)?.toUpperCase() || '👤'}
              </div>
            )}
          </div>

          <label className="avatar-upload-btn">
            {isUploading ? 'Uploading...' : '📷 Change Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </label>

          <div className="profile-role-badge">
            <span className={`status-badge ${profile?.role === 'admin' ? 'active' : 'processing'}`}>
              {profile?.role}
            </span>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="profile-details">
          <h2>Account Details</h2>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
            <small style={{ color: '#a0b4c8', fontSize: '12px' }}>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              value={profile?.role || ''}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile