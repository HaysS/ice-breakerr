import React, {Component} from 'react';
import { NavigationActions } from 'react-navigation'
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity, 
  Dimensions,
  InteractionManager,
  Icon,
  ScrollView,
  Alert,
  WebView,
} from 'react-native';

import * as FirebaseAPI from '../modules/firebaseAPI'

import firebase from 'firebase'

const {height, width} = Dimensions.get('window');

export default class BuyPicturesScreen extends React.Component {
  state = {
    user: this.props.navigation.state.params.user, 
    profile: this.props.navigation.state.params.profile,
  }

  componentWillMount() {
    this._mounted = false
  }

  componentDidMount() {
    //Set this true so no warning appears if component unmounts during process
    this._mounted = true
  }

  componentWillUnmount() {
    this._mounted = false;

    //User data in state will not have paid profiles, so we return the user from db
    FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
      this.props.navigation.state.params.cb(user)
    })
  }

  render() {    
    return(
      <WebView
        source={{uri: 'https://ice-breaker-server.herokuapp.com/pay', method: "POST", 
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileFirstName: this.state.profile.name.split(' ')[0],
          userUid: this.state.user.uid,
          profileUid: this.state.profile.uid,
        })}}
        style={{flex: 1}}
      />
    )
  }
}
        

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height:height,
    width:width,
    backgroundColor: '#f7fbff',
  },  
  headerContainer: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  titleContainer: {
    backgroundColor:'#f7fbff',
  },
  bioContainer: {
    flex: 1,
    width: width,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  bio: {
    flex: 1,
    width: width,
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingBottom: 40,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize:18,
    color: '#565656',
    textAlign: 'left',
    backgroundColor: 'white',
  },
  text: {
    color: '#565656',
    fontSize: 48,
    textAlign: 'left'
  },
  name: {
    color: '#2B2B2B',
    fontSize: 24,
    marginTop: 5,
    marginBottom: 1,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  age: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 16,
    marginTop: 2,
    marginBottom: 3,
    color: 'gray',
  },
  title: {
    fontSize:16,
    color: 'black',
    textAlign: 'left',
    fontWeight: 'bold',
    paddingTop: 15,
    paddingBottom: 5,
    paddingLeft: 20,
  },
  subtitle: {
    fontSize:15,
    color: 'gray',
    textAlign: 'left'
  },
  gender: {
    fontSize:16,
    color: 'gray',
    textAlign: 'left',
    marginBottom: 5,
  },
  chatButtonContainer: {
    flex: 1,
    height: height/10, 
    justifyContent: 'flex-end', 
    alignItems: 'center'
  },
  chatButton: {
    width: width,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: 'green',
    borderColor: 'lightgrey', 
    borderTopWidth: 3, 
  },
  unmatchButton: {
    width: width,
    marginTop: 100,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: 'gray',
    borderColor: 'lightgrey', 
    borderTopWidth: 3, 
  },
  reportButton: {
    width: width,
    marginTop: 100,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: 'lightgrey',
    borderColor: 'lightgrey', 
    borderTopWidth: 3, 
  },
});
