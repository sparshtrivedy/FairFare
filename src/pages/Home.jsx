import React, {useContext, useEffect} from 'react'
import { AuthContext } from '../App'
import { collection, getDocs } from "firebase/firestore"; 
import { db } from '../firebase-config';

const Home = () => {
  const { userEmail } = useContext(AuthContext);

  useEffect(() => {
    const getEvents = async () => {
      const querySnapshot = await getDocs(collection(db, "events"));
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data().email}`);
      });
    }
    getEvents();
  }, []);

  return (
    <h1>Welcome, {userEmail}</h1>
    
  )
}

export default Home