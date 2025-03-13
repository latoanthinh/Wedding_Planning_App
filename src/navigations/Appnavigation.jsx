import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { GuestStackNavigation, StackNavigation } from './StackNavigation'


import { AppContext } from '../AppContext'
const Appnavigation = () => {
  const { user } = useContext(AppContext)

  return (
    <NavigationContainer>
      {
        user ? <StackNavigation /> : <GuestStackNavigation />
      }
    </NavigationContainer>
  )
}

export default Appnavigation