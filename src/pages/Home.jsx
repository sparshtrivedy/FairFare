import React, {useContext} from 'react'
import { AuthContext } from '../App'

const Home = () => {
  const { userEmail } = useContext(AuthContext)

  return (
    <h1>Welcome, {userEmail}</h1>
    
  )
}

export default Home