// app/navigation/StackNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar } from 'react-native';
import Tabs from '../index';
import Login from '../login';
import BusinessDetails from '../sections/BusinessDetails';
import EventCalendar from '../sections/EventCalendar';
import Review from '../sections/Review';
import SubmitReview from '../sections/SubmitReview';
import Ureviews from '../sections/Ureviews';
import Signup from '../signup';


export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Tabs: { username: string };  
  Profile: undefined;
  EventCalendar: undefined;
   Marketplace: undefined;
   Ureviews: { username: string };
  BusinessDetails: { name: string;
    image: string;
    address: string;
    username: string;};
  Review: {
    name: string;
    image: any;
    address: string;
    username: string;
  };
  SubmitReview: {
    name: string;
    image: any;
    address: string;
    username: string;
  };
};


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <>
      {/* 👇 Status bar visible across all screens */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content" // or 'light-content' if you're using dark background
      />

      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="EventCalendar" component={EventCalendar} />
        <Stack.Screen
          name="BusinessDetails"
          component={BusinessDetails}
          options={({ route }) => ({
            headerShown: true,
            title: route.params.name,
          })}
        />
        <Stack.Screen
          name="Review"
          component={Review}
          options={{ headerShown: true, title: 'Write a Review' }}
        />
        
        <Stack.Screen
          name="SubmitReview"
          component={SubmitReview}
          options={{
            headerShown: true,
            title: 'Submit a Review',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: 'black',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            
          }}
        />
         <Stack.Screen
    name="Ureviews"
    component={Ureviews}
    options={{
      headerShown: true,
      title: 'Reviews',
    }}
  />
        
      </Stack.Navigator>
    </>
  );
}
